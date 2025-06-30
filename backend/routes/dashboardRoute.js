
import express from 'express';
import {getMostSellingProductsByRange, getTotalRevenue, getTotalOrders,getTotalCustomers ,MostSellerToday,getTotalRevenueByRange,getProfitByRange,getCostByRange,getOrdersByRange} from '../controllers/dashboardController.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/totalRevenue', getTotalRevenue);
dashboardRouter.get('/totalOrders', getTotalOrders);
dashboardRouter.get('/totalCustomers', getTotalCustomers);
dashboardRouter.get('/mostSellerToday', MostSellerToday);
dashboardRouter.get('/totalRevenueByRange', getTotalRevenueByRange);
dashboardRouter.get('/getProfitByRange', getProfitByRange);
dashboardRouter.get('/getCostByRange', getCostByRange);
dashboardRouter.get('/getOrdersByRange', getOrdersByRange);
dashboardRouter.get('/getMostSellingProductsByRange', getMostSellingProductsByRange);
export default dashboardRouter;

