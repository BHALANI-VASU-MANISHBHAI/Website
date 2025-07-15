import crypto from "crypto";
import mongoose from "mongoose";
import razorpayInstance from "../config/razorPay.js";
import orderModel from "../models/orderModel.js";
import Product from "../models/productModel.js";
import UserModel from "../models/userModel.js";
import orderHandler from "../socketHandlers/orderHandler.js";
import productHandler from "../socketHandlers/productHandler.js";
import stockHandler from "../socketHandlers/stockHandler.js";

const placeOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const io = req.app.get("io"); // ✅ Get io instance
    const userId = req.userId;

    const { items, amount, address } = req.body;

    if (!userId || !items || !amount || !address) {
      await session.abortTransaction();
      return res.json({ success: false, message: "All fields are required" });
    }

    // ✅ 1. First validate stock availability
    for (const item of items) {
      const product = await Product.findById(item._id).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.json({
          success: false,
          message: `Product ${item._id} not found`,
        });
      }

      const sizeStock = product.stock.find((s) => s.size === item.size);
      if (!sizeStock || sizeStock.quantity < item.quantity) {
        await session.abortTransaction();
        return res.json({
          success: false,
          message: `Insufficient stock for size ${item.size} (Available: ${
            sizeStock?.quantity || 0
          }, Requested: ${item.quantity})`,
        });
      }
    }

    // ✅ 2. Create order
    const orderData = {
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "COD",
      payment: {
        method: "cod",
        razorpay_order_id: null,
        razorpay_payment_id: null,
        razorpay_signature: null,
      },
      date: new Date(),
    };

    const newOrder = await orderModel.create([orderData], { session });

    // ✅ 3. Clear Cart
    await UserModel.findByIdAndUpdate(userId, { cartData: {} }, { session });

    // ✅ 4. Update Total Sales and decrease stock
    for (const item of items) {
      // Update total sales and bestseller status
      const product = await Product.findById(item._id).session(session);
      const updatedSales = product.totalSales + item.quantity;

      await Product.findByIdAndUpdate(
        item._id,
        {
          $inc: { totalSales: item.quantity },
          bestseller: updatedSales >= 50 ? true : product.bestseller,
        },
        { session }
      );

      // Decrease stock - now we know this will succeed because we pre-validated
      const updateResult = await Product.findOneAndUpdate(
        { _id: item._id, "stock.size": item.size },
        { $inc: { "stock.$.quantity": -item.quantity } },
        { session }
      );

      if (!updateResult) {
        // This shouldn't happen because we pre-validated, but just in case
        await session.abortTransaction();
        return res.json({
          success: false,
          message: `Failed to update stock for product ${item._id}`,
        });
      }
    }

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    // ✅ Emit Order Placed Event to Admin Room
    // req.app
    //   .get("io")
    //   .to("adminRoom")
    //   .emit("orderPlaced", { orderId: newOrder[0]._id, userId });
    console.log("Order placed successfully:", newOrder[0]._id);
    orderHandler(
      io,
      "adminRoom",
      {
        data: { orderId: newOrder[0]._id, userId },
      },
      "order:placed"
    );

    // req.app.get("io").emit("stockUpdated", {
    //   productId: items[0]._id,
    //   size: items[0].size,
    //   quantitySold: items[0].quantity,
    // });

    stockHandler(
      io,
      null,
      {
        data: {
          productId: items[0]._id,
          size: items[0].size,
          quantitySold: items[0].quantity,
        },
      },
      "stock:updated"
    );
    productHandler(
      io,
      null,
      {
        data: {
          productId: items[0]._id,
          size: items[0].size,
          quantitySold: items[0].quantity,
        },
      },
      "product:bestseller:updated"
    );
    // ✅ Emit Order Placed Event to User Room
    return res.json({ success: true, message: "Order placed successfully" });
  } catch (err) {
    console.error("Order placement error:", err);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: err.message });
  }
};

const placeOrderRazorpay = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.userId;

    const { items, amount, address } = req.body.orderData;

    if (!userId || !items || !amount || !address) {
      await session.abortTransaction();
      return res.json({ success: false, message: "All fields are required" });
    }

    // ✅ 1. Validate stock
    for (const item of items) {
      const product = await Product.findById(item._id).session(session);
      if (!product) {
        await session.abortTransaction();
        return res.json({
          success: false,
          message: `Product ${item._id} not found`,
        });
      }

      const sizeStock = product.stock.find((s) => s.size === item.size);
      if (!sizeStock || sizeStock.quantity < item.quantity) {
        await session.abortTransaction();
        return res.json({
          success: false,
          message: `Insufficient stock for size ${item.size} (Available: ${
            sizeStock?.quantity || 0
          }, Requested: ${item.quantity})`,
        });
      }
    }

    // ✅ 2. Create Razorpay Order
    const receipt = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const options = {
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt,
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    if (!razorpayOrder) {
      await session.abortTransaction();
      return res
        .status(500)
        .json({ success: false, message: "Razorpay order creation failed" });
    }

    // ✅ 3. Create Local Order (Pending Payment)
    const orderData = {
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentStatus: "pending",
      paymentMethod: "Online",
      payment: {
        method: "razorpay",
        razorpay_order_id: razorpayOrder.id,
        razorpay_payment_id: null,
        razorpay_signature: null,
      },
      date: new Date(),
    };

    const newOrder = await orderModel.create([orderData], { session });

    // ✅ 4. Commit Transaction (Stock will be deducted after payment success)
    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      orderData: newOrder[0],
      message: "Razorpay order created successfully. Proceed to payment.",
    });
  } catch (err) {
    console.error("Razorpay Order Placement Error:", err);
    await session.abortTransaction();
    session.endSession();
    return res
      .status(500)
      .json({ success: false, message: "Server error in Razorpay order" });
  }
};

const verifyOrderRazorpay = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }
    console.log("Payment verified successfully");
    const newOrder = new orderModel({
      ...orderData,
      payment: {
        method: "razorpay",
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      status: "Order Placed",
      paymentStatus: "success",
      paymentMethod: "Razorpay",
      date: orderData.date || new Date(),
      userId: req.userId,
    });

    await newOrder.save();
    const io = req.app.get("io"); // ✅ Get io instance
    orderData.items.forEach((item) => {
      // req.app
      //   .get("io")
      //   .to("stockRoom")
      //   .emit("stockUpdated", {
      //     productId: item._id,
      //     size: item.size,
      //     quantitySold: item.quantity,
      //   });
      stockHandler(
        io,
        "stockRoom",
        {
          data: {
            productId: item._id,
            size: item.size,
            quantitySold: item.quantity,
          },
        },
        "stock:updated"
      );
    });

    res
      .status(200)
      .json({ success: true, message: "Payment verified and order placed" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};

//ALL Orders Data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({
        status: { $ne: "Cancelled" }, // Exclude cancelled orders
      })
      .sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: err.message });
  }
};

//User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel
      .find({
        userId,
        status: { $ne: "Cancelled" }, // Exclude cancelled orders
      })
      .populate("riderId", "location.lat location.lng")
      .sort({ date: -1 });

    // here we take the each rider id and then use poplate for location
    // const allorder = await Promise.all(
    //   orders.map(async (order) => {
    //     const riderID = order.riderId;
    //     if (riderID) {

    res.json({ success: true, orders });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: err.message });
  }
};

const updatedStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const io = req.app.get("io"); // ✅ Get io instance
    // Update status and get updated order in one step
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } // returns updated document
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    console.log("Updated order:", updatedOrder.status);
    if (updatedOrder.status === "Packing") {
      // Notify admin when order is packed
      // req.app.get("io").to("adminRoom").emit("orderPacked", {
      //   orderId: updatedOrder._id,
      //   status: "Packing",
      //   message: "Order is ready to assign a rider",
      // });

      orderHandler(
        io,
        "adminRoom",
        {
          data: {
            orderId: updatedOrder._id,
            status: "Packing",
            message: "Order is ready to assign a rider",
          },
        },
        "order:packed"
      );
    }
    // if it is deliverd then update the quantity
    if (updatedOrder.status == "Delivered") {
      // req.app
      //   .get("io")
      //   .to("riderRoom")
      //   .emit("orderPacked", { orderId: updatedOrder._id });
      orderHandler(
        io,
        "riderRoom",
        {
          data: { orderId: updatedOrder._id },
        },
        "order:packed"
      );
    }

    console.log("Updated order status to:", status);
    console.log("Order ID (user ID for socket):", updatedOrder.userId);

    orderHandler(
      req.app.get("io"),
      null,
      {
        data: { orderId: updatedOrder._id, status },
      },
      "order:status:update"
    );

    res.json({ success: true, message: "Order status updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
const cancelOrderItem = async (req, res) => {
  try {
    const { orderId, itemId, size, reason } = req.body;

    // Step 1: Fetch the exact item to be deleted using minimal fetch
    const order = await orderModel.findOne(
      {
        _id: orderId,
        userId: req.userId,
        "items._id": itemId,
        "items.size": size,
      },
      { "items.$": 1, amount: 1 }
    );

    if (!order || order.items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order or item not found" });
    }

    const itemToDelete = order.items[0];
    const deduction = itemToDelete.price * itemToDelete.quantity;

    // Step 2: Remove the item and update the amount atomically
    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, userId: req.userId },
      {
        $pull: { items: { _id: itemId, size: size } },
        $inc: { amount: -deduction },
        $set: {
          cancelledBy: "user",
          cancelledAt: new Date(),
          cancellationReason: reason || "",
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found during update" });
    }

    // ✅ Step 3: Restore Stock and Update Sales
    await Product.findOneAndUpdate(
      { _id: itemId, "stock.size": size },
      {
        $inc: {
          totalSales: -itemToDelete.quantity,
          "stock.$.quantity": itemToDelete.quantity,
        },
      }
    );

    // ✅ Step 4: If all items are removed, cancel the order
    if (updatedOrder.items.length === 0) {
      updatedOrder.status = "Cancelled";
      await updatedOrder.save();
    }
    const io = req.app.get("io"); // ✅ Get io instance

    // ✅ Emit Order Cancel Event
    // req.app
    //   .get("io")
    //   .to("adminRoom")
    //   .emit("orderCancelled", {
    //     orderId: updatedOrder._id,
    //     userId: req.userId,
    //   });

    orderHandler(
      io,
      "adminRoom",
      {
        data: { orderId: updatedOrder._id, userId: req.userId },
      },
      "order:cancelled"
    );
    // req.app
    //   .get("io")
    //   .to(req.userId.toString())
    //   .emit("orderCancelled", { orderId, itemId });
    orderHandler(
      io,
      req.userId.toString(),
      {
        data: { orderId, itemId },
      },
      "order:cancelled"
    );
    // req.app
    //   .get("io")
    //   .to("stockRoom")
    //   .emit("stockUpdated", {
    //     productId: itemId,
    //     size,
    //     quantitySold: -itemToDelete.quantity,
    //   });

    stockHandler(
      io,
      "stockRoom",
      {
        data: {
          productId: itemId,
          size,
          quantitySold: -itemToDelete.quantity,
        },
      },
      "stock:updated"
    );

    return res.json({ success: true, message: "Item cancelled successfully" });
  } catch (error) {
    console.error("Cancel order item error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const cancelAllOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const io = req.app.get("io"); // ✅ Get io instance
    // Find all active orders for the user
    const orders = await orderModel.find({
      userId,
      status: { $ne: "Cancelled" },
    });

    if (orders.length === 0) {
      return res.json({ success: false, message: "No active orders found" });
    }

    for (const order of orders) {
      // Restore stock and update sales for each item
      for (const item of order.items) {
        await Product.findOneAndUpdate(
          { _id: item._id, "stock.size": item.size },
          {
            $inc: {
              totalSales: -item.quantity,
              "stock.$.quantity": item.quantity,
            },
          }
        );

        // // ✅ Emit stock update for each item
        // req.app
        //   .get("io")
        //   .to("stockRoom")
        //   .emit("stockUpdated", {
        //     productId: item._id,
        //     size: item.size,
        //     quantitySold: -item.quantity,
        //   });

        stockHandler(
          io,
          "stockRoom",
          {
            data: {
              productId: item._id,
              size: item.size,
              quantitySold: -item.quantity,
            },
          },
          "stock:updated"
        );
      }

      // Cancel the order
      await orderModel.findByIdAndUpdate(order._id, {
        status: "Cancelled",
        cancelledBy: "user",
        cancelledAt: new Date(),
      });

      // Emit order cancellation to admin
      // req.app
      //   .get("io")
      //   .to("adminRoom")
      //   .emit("orderCancelled", { orderId: order._id, userId });
      orderHandler(
        io,
        "adminRoom",
        {
          data: { orderId: order._id, userId },
        },
        "order:cancelled"
      );
    }

    // Emit bulk cancellation event
    // req.app
    //   .get("io")
    //   .to("adminRoom")
    //   .emit("AllOrderCancelled", {
    //     userId,
    //     message: "All orders cancelled by user",
    //   });

    orderHandler(
      io,
      "adminRoom",
      {
        data: {
          userId,
          message: "All orders cancelled by user",
        },
      },
      "order:all:cancelled"
    );

    res.json({ success: true, message: "All orders cancelled successfully" });
  } catch (error) {
    console.error("Cancel all orders error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
const singleorder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.userId;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await orderModel
      .findOne({ _id: orderId, userId })
      .populate("riderId", "location.lat location.lng");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("Error fetching single order:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export {
  allOrders,
  cancelAllOrders,
  cancelOrderItem,
  placeOrder,
  placeOrderRazorpay,
  singleorder,
  updatedStatus,
  userOrders,
  verifyOrderRazorpay,
};
