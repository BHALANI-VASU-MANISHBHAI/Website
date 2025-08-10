import axios from "axios";
import bcrypt from "bcrypt";
import OrderModel from "../models/orderModel.js";
import OTP from "../models/otpModel.js";
import UserModel from "../models/userModel.js";
import { sendOtpEmail } from "../services/emailService.js";
import orderHandler from "../socketHandlers/orderHandler.js";
const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;
async function storeOTP(req, res) {
  try {
    const { email, role } = req.body;
    console.log("Storing OTP for email:", email, "Role:", role);
    // Check if user exists
    const user = await UserModel.findOne({ email, role });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    if (user.authType === "google") {
      return res.json({
        success: false,
        message: "Password reset not allowed for Google-authenticated accounts",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB (remove old OTPs for this email first)
    await OTP.deleteMany({ email });
    const otpDoc = new OTP({ email, otp });
    await otpDoc.save();
    console.log("OTP stored in database:", otp);
    // Send OTP email
    await sendOtpEmail(email, otp);
    console.log("OTP sent to email:", email);
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Failed to send OTP" });
  }
}

async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    console.log("Verifying OTP for email:", email);
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });
    console.log("Received OTP:", otp);
    console.log("Received email:", email);
    // Find OTP in DB
    const otpDoc = await OTP.findOne({ email, otp });
    if (!otpDoc) return res.status(400).json({ message: "Invalid OTP" });

    const isExpired = Date.now() - otpDoc.createdAt.getTime() > 10 * 60 * 1000;
    if (isExpired) {
      await OTP.deleteOne({ _id: otpDoc._id }); // Remove expired OTP
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid
    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Failed to verify OTP" });
  }
}
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.json({
        success: false,
        message: "Email and new password are required",
      });
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 🛑 Prevent resetting password for Google-authenticated users
    if (user.authType === "google") {
      return res.json({
        success: false,
        message: "Password reset not allowed for Google-authenticated accounts",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.updatedAt = new Date();
    user.tokenVersion += 1; // Increment token version for security
    await user.save();
    if (user.role === "user") {
      req.app.get("io").to(user._id.toString()).emit("user:password:reset", {
        userId: user._id,
        message: "Password reset successfully",
      });
    } else if (user.role === "rider") {
      console.log("Emitting password reset event to rider room");
      req.app
        .get("io")
        .to(`riderRoom-${user._id}`)
        .emit("rider:password:reset", {
          userId: user._id,
          message: "Password reset successfully",
        });
    }
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

const PhoneSentOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res
      .status(400)
      .json({ success: false, message: "Phone number required" });

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${phone}/AUTOGEN`
    );
    if (response.data.Status === "Success") {
      return res.json({ success: true, sessionId: response.data.Details });
    } else {
      return res.json({ success: false, message: "Failed to send OTP" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const verifyPhoneOTP = async (req, res) => {
  const { sessionId, otp } = req.body;
  if (!sessionId || !otp)
    return res.status(400).json({ success: false, message: "Invalid data" });

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`
    );
    if (response.data.Status === "Success") {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: "OTP verification failed" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const sendDeliveryOtp = async (req, res) => {
  const { orderId } = req.body;
  console.log("Sending delivery OTP for order:", orderId);
  const order = await OrderModel.findById(orderId);
  if (!order)
    return res.status(404).json({ success: false, message: "Order not found" });

  const customerEmail = order.address.email;
  if (!customerEmail)
    return res
      .status(400)
      .json({ success: false, message: "No customer email found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp);
  order.deliveryOtp = otp;
  order.otpExpiresAt = Date.now() + 10 * 60 * 1000;

  await order.save();

  try {
    await sendOtpEmail(customerEmail, otp);
    return res
      .status(200)
      .json({ success: true, message: "OTP sent to customer's email" });
  } catch (err) {
    console.error("Email error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;

    if (!orderId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID and OTP are required" });
    }

    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const isExpired = Date.now() > order.otpExpiresAt;

    if (isExpired) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // Update order
    order.status = "Delivered";
    order.isActive = false;
    order.deliveryOtp = null;
    order.otpExpiresAt = null;
    order.earning.collected = order.amount;
    order.paymentStatus = "success";
    order.cancelledBy = null;
    order.riderCodCollectedAt = new Date();
    const updatedOrder = await order.save();

    // Update rider status
    await UserModel.findByIdAndUpdate(order.riderId, {
      riderStatus: "available",
    });

    // Emit event to the rider's room
    const io = req.app.get("io");
    // io.to(`riderRoom-${order.riderId}`).emit("order:delivered", {
    //   orderId: updatedOrder._id,
    //   order: updatedOrder,
    //   message: "Order marked as delivered",
    // });

    // io.to(`riderRoom-${order.riderId}`).emit("CollectedCOD", {
    //   orderId: updatedOrder._id,
    //   order: updatedOrder,
    //   message: "COD collected successfully",
    // });
    // io.to("adminRoom").emit("orderDelivered", {
    //   orderId: updatedOrder._id,
    //   order: updatedOrder,
    //   message: "Order marked as delivered",
    // });
    // io.emit("orderStatusUpdated", {
    //   orderId: updatedOrder._id,
    //   status: "Delivered",
    //   message: "Order marked as delivered",
    // });
    orderHandler(
      io,
      `riderRoom-${order.riderId}`,
      {
        data: {
          orderId: updatedOrder._id,
          order: updatedOrder,
          message: "Order marked as delivered",
        },
      },
      "order:delivered"
    );
    orderHandler(
      io,
      null,
      {
        data: { orderId: updatedOrder._id, status: "Delivered" },
      },
      "order:status:update"
    );
    orderHandler(
      io,
      "adminRoom",
      {
        data: {
          orderId: updatedOrder._id,
          order: updatedOrder,
          message: "Order marked as delivered",
        },
      },
      "order:delivered"
    );
    return res.status(200).json({
      success: true,
      message: "OTP verified, order marked as delivered",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error verifying delivery OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

export {
  PhoneSentOTP,
  resetPassword,
  sendDeliveryOtp,
  storeOTP,
  verifyDeliveryOtp,
  verifyOTP,
  verifyPhoneOTP,
};
