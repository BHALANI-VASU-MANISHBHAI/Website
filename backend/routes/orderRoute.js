import express from "express";
import {
  allOrders,
  cancelAllOrders,
  cancelOrderItem,
  placeOrder,
  placeOrderRazorpay,
  updatedStatus,
  userOrders,
  verifyOrderRazorpay,
  singleorder,
} from "../controllers/orderControllers.js";
import adminAuth from "../middleware/adminAuth.js";
import restrictToRole from "../middleware/restrictToRole.js";

const orderRouter = express.Router();

//Admin Features

orderRouter.post("/list", restrictToRole('admin'), allOrders); //get all orders for admin
orderRouter.post("/status", restrictToRole("admin","rider"), updatedStatus); //update order status

//Payment Features
orderRouter.post("/place", restrictToRole("user"), placeOrder);
orderRouter.post("/razorpay", restrictToRole("user"), placeOrderRazorpay);
orderRouter.post(
  "/verify-order-razorpay",
  restrictToRole("user"),
  verifyOrderRazorpay
); //create razorpay order

//User Features
orderRouter.get("/:orderId", restrictToRole("user"), singleorder); //get single order by id
orderRouter.post("/userorders", restrictToRole("user"), userOrders); //get user orders
orderRouter.post("/cancel", restrictToRole("user"), cancelOrderItem); //cancel order
orderRouter.post("/cancelAll", restrictToRole("user"), cancelAllOrders); //cancel all orders

export default orderRouter;
