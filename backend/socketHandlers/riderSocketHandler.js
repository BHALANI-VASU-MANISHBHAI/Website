import OrderModel from '../models/orderModel.js';
import UserModel from '../models/userModel.js';

export const handleRiderSockets = (socket, io) => {
  socket.on("joinRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} joined riderRoom`);
    socket.join("riderRoom");
  });

  socket.on("leaveRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} left riderRoom`);
    socket.leave("riderRoom");
  });

  socket.on("joinSingleRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} joined single room`);
    socket.join(`riderRoom-${riderId}`);
  });

  socket.on("leaveSingleRiderRoom", (riderId) => {
    console.log(`Rider ${riderId} left single room`);
    socket.leave(`riderRoom-${riderId}`);
  });

  socket.on('riderOrderResponse', async ({ orderId, riderId, accepted }) => {
    if (accepted) {
      console.log(`✅ Rider ${riderId} accepted order ${orderId}`);
      await OrderModel.findByIdAndUpdate(orderId, {
        riderId,
        status: "assigned"
      });
      await UserModel.findByIdAndUpdate(riderId, {
        riderStatus: "busy"
      });
    } else {
      console.log(`❌ Rider ${riderId} rejected order ${orderId}`);
      await UserModel.findByIdAndUpdate(riderId, {
        riderStatus: "available"
      });

      // Optional: Retry logic here
    }
  });
};
