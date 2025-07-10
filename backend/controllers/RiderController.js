import UserModel from "../models/userModel.js";
import OrderModel from "../models/orderModel.js";
import haversine from "haversine-distance";
import { Heap } from "heap-js";
import crypto from "crypto";
import razorpayInstance from "../config/razorPay.js";
import RiderCODHistory from "../models/riderPaymentHistory.js";
import { redisClient } from "../config/redisClient.js";
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

const updateRiderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const riderId = req.userId;
    const rider = await UserModel.findByIdAndUpdate(
      riderId,
      { riderStatus: status },
      { new: true }
    );

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Rider status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating rider status:", error);
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

// const assignRider = async (req, res) => {
//   try {
//     const { deliveryLat, deliveryLng, pickupLat, pickupLng, orderId } =
//       req.body;
//     console.log(
//       "Assigning rider with data:",
//       `Delivery (${deliveryLat}, ${deliveryLng}), Pickup (${pickupLat}, ${pickupLng}), Order ID: ${orderId}`
//     );

//     //get all packed orders
//     const packedOrders = await OrderModel.find({
//       status: "Packing",
//       isActive: true,
//       isAssigning: false,
//       riderId: null,
//     }).select("_id ");

//     for (const order of packedOrders) {
//       console.log("Processing packed order:", order._id);
//       const existingOrder = await OrderModel.findById(order._id);
//       const deliveryLat = existingOrder.deliveryLocation.lat;
//       const deliveryLng = existingOrder.deliveryLocation.lng;
//       const pickupLat = existingOrder.pickUpLocation.lat;
//       const pickupLng = existingOrder.pickUpLocation.lng;
//       const orderId = existingOrder._id;

//       console.log("Packed Orders:", packedOrders);
//       // console.log("Finding The riders PAkcend Order:", testOrder);
//       if (!deliveryLat || !deliveryLng || !pickupLat || !pickupLng || !orderId) {
//         return res.status(400).json({
//           success: false,
//           message: "All coordinates and orderId are required",
//         });
//       }

//       console.log("Existing order:", existingOrder);
//       if (!existingOrder) {
//         return res.status(404).json({
//           success: false,
//           message: "Order not found",
//         });
//       }

//       if (existingOrder.riderId) {
//         return res.status(400).json({
//           success: false,
//           message: "Order already assigned to a rider",
//         });
//       }

//       // Reset order state before assignment
//       await OrderModel.findByIdAndUpdate(orderId, {
//         riderId: null,
//         expiresAt: null,
//         isAssigning: true, // Indicate that we are in the process of assigning a rider
//       });

//       const riders = await findAllRidersByShortestTrip(
//         deliveryLat,
//         deliveryLng,
//         pickupLat,
//         pickupLng
//       );

//       if (!riders || riders.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: "No available riders found",
//         });
//       }

//       const io = req.app.get("io");
//       let assignedRider = null;
//       const distanceFromPickUpLocation = 5;
//       const distanceFromDeliveryLocation = 10;

//       let riderAmount = 0;

//       if (distanceFromDeliveryLocation + distanceFromPickUpLocation < 3) {
//         riderAmount = 40;
//       } else if (distanceFromDeliveryLocation + distanceFromPickUpLocation < 20) {
//         riderAmount = 60;
//       } else if (distanceFromDeliveryLocation + distanceFromPickUpLocation < 50) {
//         riderAmount = 80;
//       } else {
//         riderAmount = 100;
//       }

//       await OrderModel.findByIdAndUpdate(orderId, { riderAmount: riderAmount });

//       for (const rider of riders) {
//         try {
//           // Set expiration for this rider's response window
//           await OrderModel.findByIdAndUpdate(orderId, {
//             expiresAt: new Date(Date.now() + 30000),
//           });
//           io.to(`riderRoom-${rider._id}`).emit("newOrder", {
//             existingOrder,
//             pickupLocation: { lat: pickupLat, lng: pickupLng },
//             deliveryLocation: { lat: deliveryLat, lng: deliveryLng },
//             expiresAt: new Date(Date.now() + 30000),
//             riderAmount: riderAmount,
//           });

//           // Notify rider
//           io.to(`riderRoom-${rider._id}`).emit("newOrder", {
//             existingOrder,
//             pickupLocation: { lat: pickupLat, lng: pickupLng },
//             deliveryLocation: { lat: deliveryLat, lng: deliveryLng },
//             expiresAt: new Date(Date.now() + 30000),
//             riderAmount: riderAmount,
//           });
//           // Update rider status
//           // await UserModel.findByIdAndUpdate(rider._id, {
//           //   riderStatus: "notified",
//           // });

//           // Wait for response
//           const response = await waitForRiderResponse(req.app.get("io"),
//             rider._id, orderId);
//           console.log(`Rider ${rider._id} response:`, response);
//           if (response.accepted) {
//             assignedRider = rider;
//             break;
//           }

//           if (response.reason === "taken_by_other") {
//             await OrderModel.findByIdAndUpdate(orderId, {
//               expiresAt: null,
//               isAssigning: false, // Reset assignment state
//             });
//             await UserModel.findByIdAndUpdate(rider._id, {
//               riderStatus: "available",
//             });
//             break; // Exit loop immediately if taken by another rider
//           }
//         } catch (error) {
//           console.error(`Error processing rider ${rider._id}:`, error);
//         }
//       }

//       if (assignedRider) {
//         return res.status(200).json({
//           success: true,
//           message: "Rider assigned",
//           rider: {
//             _id: assignedRider._id,
//             name: assignedRider.name,
//             phone: assignedRider.phone,
//           },
//         });
//       }

//       // Cleanup if no rider accepted
//       await OrderModel.findByIdAndUpdate(orderId, {
//         riderId: null,
//         expiresAt: null,
//         isAssigning: false, // Reset assignment state
//         status: "Packing", // Reset order status
//         riderAmount: 0, // Reset rider amount
//       });
//     }

//     return res.status(404).json({
//       success: false,
//       message: "No rider accepted the order",
//     });
//   } catch (error) {
//     console.error("Error assigning rider:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

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

const riderEarningByRange = async (req, res) => {
  try {
    const userId = req.userId;
    let { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    // Parse dates and set time boundaries
    startDate = new Date(startDate);
    startDate.setHours(0, 0, 0, 0);

    endDate = new Date(endDate);
    endDate.setHours(23, 59, 59, 999);

    // Fetch delivered and inactive orders in date range
    const orders = await OrderModel.find({
      riderId: userId,
      status: "Delivered",
      isActive: false,
      updatedAt: { $gte: startDate, $lte: endDate },
    }).select("earning");

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        totalEarnings: 0,
        message: "No delivered orders in selected range",
      });
    }

    // Calculate total earnings
    const totalEarnings = orders.reduce(
      (acc, order) => acc + (order.earning?.amount || 0),
      0
    );

    return res.status(200).json({
      success: true,
      totalEarnings,
      message: "Earnings fetched successfully",
    });
  } catch (error) {
    console.error("Error in riderEarningByRange:", error);
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

const getOrderStatusCounts = async (req, res) => {
  try {
    const { OrderStatus } = req.params;
    const orderCounts = await OrderModel.aggregate([
      {
        $match: {
          status: OrderStatus,
          isActive: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    if (!orderCounts || orderCounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this status",
      });
    }

    console.log("Order counts:", orderCounts);
    return res.status(200).json({
      success: true,
      orderCounts: orderCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      message: "Order status counts fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching order status counts:", error);
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

const getRiderCODamount = async (req, res) => {
  try {
    const riderId = req.userId;
    console.log("Rider ID:", riderId);
    const rider = await UserModel.findById(riderId)
      .select("codSubmittedMoney codLastSubmittedAt codMarkedDone")
      .lean();

    if (!rider) {
      return res
        .status(404)
        .json({ success: false, message: "Rider not found" });
    }

    return res.status(200).json({
      success: true,
      codSubmittedMoney: rider.codSubmittedMoney,
      codLastSubmittedAt: rider.codLastSubmittedAt,
      codMarkedDone: rider.codMarkedDone,
    });
  } catch (error) {
    console.error("Error fetching rider COD amount:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
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
  getAllRiders,
  assignRider,
  updateRiderLocation,
  updateRiderStatus,
  riderAcceptOrder,
  GetcurrentRiderOrder,
  riderAcceptedOrder,
  riderEarningByRange,
  getAllRidersOrder,
  getOrderStatusCounts,
  getOnlineTotalRider,
  submitRiderCOD,
  getRiderCODamount,
  createRiderCODOrder,
  verifyRiderCODPayment,
  getRiderCODHistory,
};
