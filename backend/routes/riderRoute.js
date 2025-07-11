import express from "express";

import {
  assignRider,
  createRiderCODOrder,
  getAllRiders,
  getAllRidersOrder,
  GetcurrentRiderOrder,
  getOnlineTotalRider,
  getRiderCODHistory,
  riderAcceptedOrder,
  riderAcceptOrder,
  submitRiderCOD,
  updateRiderLocation,
  verifyRiderCODPayment,
} from "../controllers/RiderController.js";
import adminAuth from "../middleware/adminAuth.js";
import restrictToRoles from "../middleware/restrictToRole.js";
const riderRouter = express.Router();

riderRouter.get("/all", getAllRiders);
riderRouter.get(
  "/currentOrder",
  restrictToRoles("rider"),
  GetcurrentRiderOrder
);
riderRouter.get("/acceptedOrder", restrictToRoles("rider"), riderAcceptedOrder);
riderRouter.get("/AllriderOrders", adminAuth, getAllRidersOrder);
riderRouter.get("/submitCOD", restrictToRoles("rider"), submitRiderCOD);
riderRouter.get("/online-riderCount", adminAuth, getOnlineTotalRider);
riderRouter.get(
  "/riderCODHistory",
  restrictToRoles("rider", "admin"),
  getRiderCODHistory
);

riderRouter.post(
  "/assign",
  assignRider
);
riderRouter.post("/acceptOrder", restrictToRoles("rider"), riderAcceptOrder);
riderRouter.post(
  "/createRiderCODOrder",
  restrictToRoles("rider"),
  createRiderCODOrder
); // Assuming this is for creating a COD order by the rider
riderRouter.post(
  "/verifyRiderCODPayment",
  restrictToRoles("rider"),
  verifyRiderCODPayment
); // Assuming this is for verifying the COD payment by the rider
riderRouter.put(
  "/update-location",
  restrictToRoles("rider"),
  updateRiderLocation
);

export default riderRouter;
