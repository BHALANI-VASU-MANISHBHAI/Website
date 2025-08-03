import express from "express";
import {
  getMostSellingProductsByRange,
  getOrdersByRange,
  getTotalCustomers,
  getDataByDateRange,
} from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/totalCustomers", getTotalCustomers);
dashboardRouter.get("/getOrdersByRange", getOrdersByRange);
dashboardRouter.get(
  "/getMostSellingProductsByRange",
  getMostSellingProductsByRange
);
dashboardRouter.get("/getDataByDateRange", getDataByDateRange);

export default dashboardRouter;
