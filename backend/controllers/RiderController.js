import crypto from "crypto";
import haversine from "haversine-distance";
import { Heap } from "heap-js";
import razorpayInstance from "../config/razorPay.js";
import { redisClient } from "../config/redisClient.js";
import OrderModel from "../models/orderModel.js";
import RiderCODHistory from "../models/riderPaymentHistory.js";
import UserModel from "../models/userModel.js";
const findAllRidersByShortestTrip = async (
  deliveryLat,
  deliveryLng,
  pickupLat,
  pickupLng
) => {
  const availableRiders = await UserModel.find({
    role: "rider",
    riderStatus: "available",
  }).lean();

  if (!availableRiders || availableRiders.length === 0) {
    console.log("No available riders found");
    return null;
  }

  const pq = new Heap((a, b) => a.distance - b.distance);

  for (const rider of availableRiders) {
    if (!rider.location) continue;

    const distancePickupToDelivery = haversine(
      { lat: deliveryLat, lng: deliveryLng },
      { lat: pickupLat, lng: pickupLng }
    );

    const distanceToPickup = haversine(
      { lat: rider.location.lat, lng: rider.location.lng },
      { lat: pickupLat, lng: pickupLng }
    );

    const totalDistance = distanceToPickup + distancePickupToDelivery;
    pq.push({ rider, totalDistance });
  }

  const sortedRiders = [];
  while (pq.size() > 0) {
    sortedRiders.push(pq.pop().rider);
  }

  return sortedRiders;
};

const getAllRiders = async (req, res) => {
  try {
    const riders = await UserModel.find({
      role: "rider",
      available: true,
    }).lean();
    return res.status(200).json({ success: true, riders });
  } catch (error) {
    console.error("Error fetching riders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



async function waitForRiderResponse(io, riderId, orderId, timeout = 30000) {
  const startTime = Date.now();
  const POLL_INTERVAL = 1000;
  try {
    while (Date.now() - startTime < timeout) {
      const order = await OrderModel.findById(orderId)
        .select("status riderId riderStatus")
        .lean();

      if (!order) return { accepted: false, reason: "order_not_found" };
      if (order.status === "Shipped") {
        if (order.riderId?.toString() === riderId.toString()) {
          return { accepted: true };
        } else if (
          order.riderId &&
          order.riderId.toString() !== riderId.toString() &&
          order.riderStatus === "busy"
        ) {
          await UserModel.findByIdAndUpdate(riderId, {
            riderStatus: "available",
          });
          return { accepted: false, reason: "Cancelled" };
        }
        return { accepted: false, reason: "taken_by_other" };
      }

      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
    }

    return { accepted: false, reason: "timeout" };
  } catch (error) {
    console.error("Error in waitForRiderResponse:", error);
    return { accepted: false, reason: "error" };
  }
}

const riderAcceptOrder = async (req, res) => {
  try {
    const { orderId, distanceFromPickUpLocation,
      distanceFromDeliveryLocation
     } = req.body;
    const userId = req.userId;
    const [rider, order] = await Promise.all([
      UserModel.findById(userId),
      OrderModel.findById(orderId),
    ]);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.riderId && !order.riderId.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: "Order already assigned to another rider",
      });
    }



    console.log("Distance from Pickup Location:", distanceFromPickUpLocation);
    console.log(
      "Distance from Delivery Location:",
      distanceFromDeliveryLocation
    );
    await Promise.all([
      UserModel.findByIdAndUpdate(userId, {
        riderStatus: "busy",
      }),
      OrderModel.findByIdAndUpdate(orderId, {
        riderId: userId,
        status: "Shipped",
        expiresAt: null,
        distanceFromDeliveryLocation,
        distanceFromPickUpLocation,
        acceptedTime: new Date(), // Set the time when the order was accepted
        isActive: true, // Mark order as inactive after acceptance
      }),
    ]);
    const updatedOrder = await OrderModel.findById(orderId).populate(
      "riderId",
      "name phone email riderStatus codMarkedDone earning cod codSubmittedMoney"
    );

    const io = req.app.get("io");
    io.to(`adminRoom`).emit("acceptedOrder", {
      order: updatedOrder,
      message: "Order accepted by rider",
    });

    io.emit("orderStatusUpdated", {
      orderId: updatedOrder._id,
      status: "Shipped",
      message: "Order status updated to Shipped",
    });

    io.to(`riderRoom-${userId}`).emit("orderAccepted", {
      order: updatedOrder,
      message: "Order accepted successfully",
    });
    return res.status(200).json({
      success: true,
      message: "Order accepted",
    });
  } catch (error) {
    console.error("Error accepting order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateRiderLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.userId;

  try {
    req.app.get("io").emit("hello", {
      message: "Hello from GetcurrentRiderOrder",
    });
    await UserModel.findByIdAndUpdate(
      userId,
      {
        location: {
          lat,
          lng,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
    res.status(200).json({ message: "Location updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update location" });
  }
};

const GetcurrentRiderOrder = async (req, res) => {
  try {
    const userId = req.userId;
    console.log("Current rider userId:", userId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const order = await OrderModel.findOne({
      riderId: userId,
      isActive: true,
    }).populate(
      "riderId",
      "name phone email riderStatus codMarkedDone earning cod codSubmittedMoney"
    ).lean();

    console.log("Current rider order:", order);

    if (!order) {
      return res.status(200).json({
        success: true,
        order: null, // ✅ So frontend can distinguish gracefully
        message: "No active order",
      });
    }

    const rider = await UserModel.findById(userId).select("name phone").lean();
    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        rider: {
          name: rider.name,
          phone: rider.phone,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching current rider order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const riderAcceptedOrder = async (req, res) => {
  try {
    // fisrts find the order by riderId
    const userId = req.userId;
    const orders = await OrderModel.find({
      riderId: userId,
      isActive: false,
      status: "Delivered",
    });

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No accepted order found for this rider",
      });
    }

    // If order found, return it
    return res.status(200).json({
      success: true,
      orders: orders,
      message: "Accepted orders fetched successfully",
    });
  } catch (error) {
    console.error("Error in riderAcceptedOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getAllRidersOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await OrderModel.find({
      isActive: false,
      riderId: { $ne: null },
    })
      .populate(
        "riderId",
        "name phone email riderStatus codMarkedDone earning cod codSubmittedMoney"
      )
      .lean();

    console.log("Orders for rider:", orders);
    if (!orders || orders.length === 0) {
      return res.json({
        success: false,
        message: "No orders found for this rider",
      });
    }
    console.log("Fetched all riders length:", orders.length);
    return res.status(200).json({
      success: true,
      orders: orders,
      message: "All riders orders fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching all riders orders:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



const getOnlineTotalRider = async (req, res) => {
  try {
    const io = req.app.get("io"); // ✅ Get io from app context
    const sockets = await io.in("riderRoom").allSockets(); // ✅ Count sockets in "riderRoom"
    res.json({ success: true, onlineRiders: sockets.size });
  } catch (error) {
    console.error("Error getting online riders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch online rider count",
    });
  }
};

const submitRiderCOD = async (req, res) => {
  try {
    const { amount } = req.body;

    const riderId = req.userId;
    console.log("Rider ID:", riderId);
    if (!amount || amount < 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const rider = await UserModel.findById(riderId);
    if (!rider) {
      return res.status(404).json({ error: "Rider not found" });
    }

    rider.codSubmittedMoney += amount;
    rider.codLastSubmittedAt = new Date();
    rider.codMarkedDone = true;

    await rider.save();

    res
      .status(200)
      .json({ success: true, message: "COD submitted successfully" });
  } catch (err) {
    console.log("Error in submitRiderCOD:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const createRiderCODOrder = async (req, res) => {
  const { amount } = req.body;
  const riderId = req.userId;

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid COD amount" });
  }

  try {
    const shortId = riderId.toString().slice(-6); // for 40-char receipt limit
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `cod_${Date.now()}_${shortId}`,
    });

    res.status(200).json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: "Razorpay error" });
  }
};

const verifyRiderCODPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } =
    req.body;
  const riderId = req.userId;

  console.log("🔐 Payment Verification Details:");
  console.log({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    amount,
    riderId,
  });

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Razorpay signature" });
  }

  try {
    const io = req.app.get("io");
    if (!riderId) {
      return res
        .status(400)
        .json({ success: false, message: "Rider ID missing" });
    }

    // Step 1: Update codSubmittedMoney in user
    const updatedRider = await UserModel.findByIdAndUpdate(
      riderId,
      { $inc: { codSubmittedMoney: amount } },
      { new: true }
    );
    const allRiderOrders = await OrderModel.find({
      riderId,
      isActive: false,
      status: "Delivered",
      isCodSubmitted: false,
    }).lean();
    await RiderCODHistory.create({
      riderId,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      verified: true, // already default, optional
    });
    console.log("✅ COD Amount Updated:", updatedRider.codSubmittedMoney);

    //currently we are not updating the codMarkedDone field, but you can uncomment the below line if needed

    for (const order of allRiderOrders) {
      await OrderModel.findByIdAndUpdate(order._id, {
        isCodSubmitted: true, // Mark this order as COD submitted
      });
    }
    io.to("adminRoom").emit("codSubmitted", {
      riderId,
      amount,
      message: "Rider COD payment verified",
    });
    // io.to("riderRoom-" + riderId).emit(

    return res
      .status(200)
      .json({ success: true, message: "COD Payment Verified" });
  } catch (err) {
    console.error("❌ Error saving COD amount:", err);
    res.status(500).json({ success: false, message: "DB update failed" });
  }
};

const getRiderCODHistory = async (req, res) => {
  try {
    const riderId = req.userId;
    console.log("Fetching COD history for rider:", riderId);

    const RiderOrders = await OrderModel.find({
      riderId,
      isActive: false,
      status: "Delivered",
    })
      .populate(
        "riderId",
        "name phone email codSubmittedMoney codMarkedDone codLastSubmittedAt "
      )
      .lean();

    if (!RiderOrders || RiderOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No delivered orders found for this rider",
      });
    }

    // console.log("All delivered orders for rider:", allRiderOrders.length);

    res.status(200).json({ success: true, RiderOrders });
  } catch (error) {
    console.error("Error fetching COD history:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
async function assignSingleOrder(order, io) {
  try {
    const existingOrder = await OrderModel.findById(order._id);
    const deliveryLat = existingOrder.deliveryLocation.lat;
    const deliveryLng = existingOrder.deliveryLocation.lng;
    const pickupLat = existingOrder.pickUpLocation.lat;
    const pickupLng = existingOrder.pickUpLocation.lng;
    const orderId = existingOrder._id;

    if (!deliveryLat || !deliveryLng || !pickupLat || !pickupLng || !orderId) {
      return {
        success: false,
        message: "All coordinates and orderId are required",
      };
    }

    if (!existingOrder || existingOrder.riderId) {
      return { success: false, message: "Invalid or already assigned order" };
    }

    await OrderModel.findByIdAndUpdate(orderId, {
      riderId: null,
      expiresAt: null,
      isAssigning: true,
    });

    const riders = await findAllRidersByShortestTrip(
      deliveryLat,
      deliveryLng,
      pickupLat,
      pickupLng
    );

    if (!riders || riders.length === 0) {
      return { success: false, message: "No available riders found" };
    }

    const distanceFromPickUpLocation = 5;
    const distanceFromDeliveryLocation = 10;
    const totalDistance =
      distanceFromDeliveryLocation + distanceFromPickUpLocation;
    let riderAmount = 0;
    let BaseCharge = 10;
    if (totalDistance < 3) {
      riderAmount = BaseCharge + 5 * totalDistance;
    } else if (totalDistance < 20) {
      riderAmount = BaseCharge + 10 * totalDistance;
    } else if (totalDistance < 50) {
      riderAmount = BaseCharge + 15 * totalDistance;
    } else {
      riderAmount = BaseCharge + 20 * totalDistance;
    }

    await OrderModel.findByIdAndUpdate(orderId, {
      earning: {
        amount: riderAmount, // Default to 0 if not provided
        collected: 0, // Initially set to 0, can be updated later
      },
    });

    for (const rider of riders) {
      const lockKey = `rider-lock-${rider._id}`;
      const lock = await redisClient.set(lockKey, "locked", {
        EX: 30,
        NX: true,
      });
      if (!lock) continue; // Rider is already locked by another assignment

      try {
        await OrderModel.findByIdAndUpdate(orderId, {
          expiresAt: new Date(Date.now() + 30000),
        });
        const ORDER = await OrderModel.findById(orderId)
          .populate(
            "riderId",
            "name phone email riderStatus codMarkedDone earning cod codSubmittedMoney"
          )
          .lean();
        console.log("Emitting new order to rider:", existingOrder);
        const payload = {
          ORDER,
        };

        io.to(`riderRoom-${rider._id}`).emit("newOrder", payload);

        const response = await waitForRiderResponse(io, rider._id, orderId);
        if (response.accepted) {
          return {
            success: true,
            rider: {
              _id: rider._id,
              name: rider.name,
              phone: rider.phone,
            },
          };
        }

        if (response.reason === "taken_by_other") {
          await OrderModel.findByIdAndUpdate(orderId, {
            expiresAt: null,
            isAssigning: false,
          });
          await UserModel.findByIdAndUpdate(rider._id, {
            riderStatus: "available",
          });
          break;
        }
      } catch (error) {
        console.error(`Error processing rider ${rider._id}:`, error);
      } finally {
        await redisClient.del(lockKey); // Always release lock
      }
    }

    await OrderModel.findByIdAndUpdate(orderId, {
      riderId: null,
      expiresAt: null,
      isAssigning: false,
      status: "Packing",
      riderAmount: 0,
    });

    return { success: false, message: "No rider accepted the order" };
  } catch (error) {
    console.error("Error in assignSingleOrder:", error);
    return { success: false, message: "Internal error" };
  }
}

const assignRider = async (req, res) => {
  try {
    const io = req.app.get("io");

    // Get initial packed orders
    let packedOrders = await OrderModel.find({
      status: "Packing",
      isActive: true,
      isAssigning: false,
      riderId: null,
    });

    const MAX_RETRIES = 3;
    let attempt = 0;
    let assigned = [];

    while (packedOrders.length > 0 && attempt < MAX_RETRIES) {
      console.log(
        `Attempt ${attempt + 1} - Orders to assign: ${packedOrders.length}`
      );

      const results = await Promise.all(
        packedOrders.map((order) => assignSingleOrder(order, io))
      );
      console.log("Results from assignment attempt:", results);
      const newlyAssigned = results
        .map((result, index) => (result?.success ? packedOrders[index] : null))
        .filter((order) => order !== null);
      console.log("Newly assigned orders:", newlyAssigned.length);
      assigned.push(...newlyAssigned);

      // Filter unassigned for next attempt
      packedOrders = packedOrders.filter((_, i) => !results[i]?.success);
      console.log(
        `Remaining unassigned orders after attempt ${attempt + 1}: ${
          packedOrders.length
        }`
      );
      attempt++;
    }

    if (assigned.length > 0) {
      return res.status(200).json({
        success: true,
        assignedCount: assigned.length,
        message: "Riders assigned (after retries)",
      });
    }

    return res.status(404).json({
      success: false,
      message: "No riders accepted any order after retries",
    });
  } catch (error) {
    console.error("Error in assignRider:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  assignRider, createRiderCODOrder, getAllRiders, getAllRidersOrder, GetcurrentRiderOrder, getOnlineTotalRider, getRiderCODHistory, riderAcceptedOrder, riderAcceptOrder, submitRiderCOD, updateRiderLocation, verifyRiderCODPayment
};

