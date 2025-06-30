import express from 'express';
import {    placeOrder,
    placeOrderRazorpay,
    allOrders,
    userOrders,
    updatedStatus,
    verifyOrderRazorpay,
    cancelOrderItem,cancelAllOrders,
}  from '../controllers/orderControllers.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';
import  restrictToRole  from '../middleware/restrictToRole.js';

const orderRouter = express.Router();


//Admin Features

orderRouter.post('/list',adminAuth, allOrders); //get all orders for admin
orderRouter.post('/status', adminAuth, updatedStatus); //update order status

//Payment Features
orderRouter.post('/place',restrictToRole('user'), placeOrder); 
orderRouter.post('/razorpay',restrictToRole('user'), placeOrderRazorpay);
orderRouter.post('/verify-order-razorpay',restrictToRole('user'), verifyOrderRazorpay); //create razorpay order


//User Features
orderRouter.post('/userorders', restrictToRole('user'), userOrders); //get user orders
orderRouter.post('/cancel', restrictToRole('user'), cancelOrderItem); //cancel order
orderRouter.post('/cancelAll', restrictToRole('user'), cancelAllOrders); //cancel all orders


export default orderRouter;