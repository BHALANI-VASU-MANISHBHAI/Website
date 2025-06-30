import UserModel from "../models/userModel.js";
import OrderModel from "../models/orderModel.js";
import haversine from 'haversine-distance';
import { Heap } from 'heap-js';

const findAllRidersByShortestTrip = async (deliveryLat, deliveryLng, pickupLat, pickupLng) => {
  const availableRiders = await UserModel.find({ 
    role: "rider", 
    riderStatus: "available" 
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
    const riders = await UserModel.find({ role: "rider", available: true }).lean();
    return res.status(200).json({ success: true, riders });
  } catch (error) {
    console.error("Error fetching riders:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const updateRiderStatus = async (req, res) => {
  const { riderId, status } = req.body;
  try {
    const rider = await UserModel.findByIdAndUpdate(
      riderId,
      { riderStatus: status },
      { new: true }
    );
    
    if (!rider) {
      return res.status(404).json({ 
        success: false, 
        message: "Rider not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Rider status updated to ${status}` 
    });
  } catch (error) {
    console.error("Error updating rider status:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

async function waitForRiderResponse(riderId, orderId, timeout = 30000) {
  const startTime = Date.now();
  const POLL_INTERVAL = 1000;
  
  try {
    while (Date.now() - startTime < timeout) {
      const order = await OrderModel.findById(orderId).select("status riderId").lean();
      if (!order) return { accepted: false, reason: "order_not_found" };
      if (order.status === "Out for delivery") {
        if (order.riderId?.toString() === riderId.toString()) {
          return { accepted: true };
        }
        return { accepted: false, reason: "taken_by_other" };
      }
      
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    
    return { accepted: false, reason: "timeout" };
  } catch (error) {
    console.error("Error in waitForRiderResponse:", error);
    return { accepted: false, reason: "error" };
  }
}


const riderAcceptOrder = async (req, res) => {
  try {
    const { orderId,riderAmount } = req.body;
    const userId = req.userId;
      console.log("Rider accepting order:", orderId, "by userId:", userId);
    const [rider, order] = await Promise.all([
      UserModel.findById(userId),
      OrderModel.findById(orderId)
    ]);

    if (!rider) {
      return res.status(404).json({ 
        success: false, 
        message: "Rider not found" 
      });
    }

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    if (order.riderId && !order.riderId.equals(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Order already assigned to another rider" 
      });
    }
    
const distanceFromPickUpLocation = 5;
const distanceFromDeliveryLocation = 10;


    
order.earning.amount = riderAmount || 0; // Default to 0 if not provided
    await Promise.all([
      UserModel.findByIdAndUpdate(userId, { riderStatus: "busy" }),
      OrderModel.findByIdAndUpdate(orderId, {
        riderId: userId,
        status: "Out for delivery",
        expiresAt: null,
        distanceFromDeliveryLocation,
        distanceFromPickUpLocation,
        earning: {
          amount: riderAmount || 0, // Default to 0 if not provided
          collected: 0 // Initially set to 0, can be updated later
        }
      })
    ]);

    return res.status(200).json({ 
      success: true, 
      message: "Order accepted" 
    });

  } catch (error) {
    console.error("Error accepting order:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const assignRider = async (req, res) => {
  try {
    const { deliveryLat, deliveryLng, pickupLat, pickupLng, orderId } = req.body;

    if (!deliveryLat || !deliveryLng || !pickupLat || !pickupLng || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: "All coordinates and orderId are required" 
      });
    }

    // Check if order is already assigned
    const existingOrder = await OrderModel.findById(orderId);
    
  

if (!existingOrder) {
  return res.status(404).json({
    success: false,
    message: "Order not found"
  });
}

if (existingOrder.riderId) {
  return res.status(400).json({
    success: false,
    message: "Order already assigned to a rider"
  });
}


    // Reset order state before assignment
    await OrderModel.findByIdAndUpdate(orderId, {
      riderId: null,
      expiresAt: null
    });

    const riders = await findAllRidersByShortestTrip(
      deliveryLat, deliveryLng, pickupLat, pickupLng
    );
    
    if (!riders || riders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No available riders found" 
      });
    }

    const io = req.app.get("io");
    let assignedRider = null;
const distanceFromPickUpLocation = 5;
const distanceFromDeliveryLocation = 10;


let riderAmount = 0;

if((distanceFromDeliveryLocation + distanceFromPickUpLocation) < 3){
  riderAmount = 40;
} else if((distanceFromDeliveryLocation + distanceFromPickUpLocation) < 20){
  riderAmount = 60;
} else if((distanceFromDeliveryLocation + distanceFromPickUpLocation) < 50){
  riderAmount = 80;
} else {
  riderAmount = 100;
}

await OrderModel.findByIdAndUpdate(orderId, {riderAmount: riderAmount});

    for (const rider of riders) {
      try {
        // Set expiration for this rider's response window
        await OrderModel.findByIdAndUpdate(orderId, {
          expiresAt: new Date(Date.now() + 30000),
        });
        console.log(`Notifying rider ${rider._id} for order ${orderId}`);
        console.log(`Rider Name: ${rider.name}, Phone: ${rider.phone}`);
        // Notify rider

            


        io.to(`riderRoom-${rider._id}`).emit("newOrder", { 
          existingOrder,
          pickupLocation: { lat: pickupLat, lng: pickupLng },
          deliveryLocation: { lat: deliveryLat, lng: deliveryLng },
          expiresAt: new Date(Date.now() + 30000),
          riderAmount: riderAmount,
        });
        console.log(`Rider ${rider._id} notified for order ${orderId}`);
        // Update rider status
        // await UserModel.findByIdAndUpdate(rider._id, {
        //   riderStatus: "notified"
        // });

        // Wait for response
        const response = await waitForRiderResponse(rider._id, orderId);
        console.log(`Rider ${rider._id} response:`, response);
        if (response.accepted) {
          assignedRider = rider;
          break;
        }

        if (response.reason === "taken_by_other") {
          break; // Exit loop immediately if taken by another rider
        }

        console.log(`Rider ${rider._id} didn't accept (reason: ${response.reason})`);
      } catch (error) {
        console.error(`Error processing rider ${rider._id}:`, error);
      }
    }

    if (assignedRider) {
      return res.status(200).json({ 
        success: true, 
        message: "Rider assigned", 
        rider: { 
          _id: assignedRider._id, 
          name: assignedRider.name,
          phone: assignedRider.phone 
        } 
      });
    }

    // Cleanup if no rider accepted
    await OrderModel.findByIdAndUpdate(orderId, {
      riderId: null,
      expiresAt: null
    });
    
    return res.status(404).json({ 
      success: false, 
      message: "No rider accepted the order" 
    });

  } catch (error) {
    console.error("Error assigning rider:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const updateRiderLocation = async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.userId;

  try {
    await UserModel.findByIdAndUpdate(
      userId,
      {
        location: {
          lat,
          lng,
          updatedAt: new Date()
        }
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

    const order = await OrderModel.findOne({ riderId: userId, isActive: true }).lean();
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
  
  try{
    // fisrts find the order by riderId
    const userId = req.userId;
    console.log("IN RIDERACCEPTEDORDER USERID:", userId);
    const orders = await OrderModel.find({ riderId: userId, isActive: false,status:"Delivered" }).lean();

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

  }catch(error){
    console.error("Error in riderAcceptedOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }

}

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

    console.log("Rider earnings orders:", orders);
    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No delivered orders found in the given date range",
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


export {
  getAllRiders,
  assignRider,
  updateRiderLocation,
  updateRiderStatus,
  riderAcceptOrder,
  GetcurrentRiderOrder,
  riderAcceptedOrder,
riderEarningByRange  
};