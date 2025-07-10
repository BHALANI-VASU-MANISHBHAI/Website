import express from "express";
import {
  getMostSellingProductsByRange,
  getTotalCustomers,
  getOrdersByRange,
} from "../controllers/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/totalCustomers", getTotalCustomers);
dashboardRouter.get("/getOrdersByRange", getOrdersByRange);
dashboardRouter.get(
  "/getMostSellingProductsByRange",
  getMostSellingProductsByRange
);

export default dashboardRouter;
