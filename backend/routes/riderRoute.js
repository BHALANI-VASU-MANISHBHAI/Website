import express from "express";

import {
  getAllRiders,
  assignRider,
  updateRiderLocation,
  updateRiderStatus,
  riderAcceptOrder,
  GetcurrentRiderOrder,
  riderAcceptedOrder,
  riderEarningByRange,
  getAllRidersOrder,
  getOrderStatusCounts,
  getOnlineTotalRider,
  submitRiderCOD,
  getRiderCODamount,
  createRiderCODOrder,
  verifyRiderCODPayment,
  getRiderCODHistory,
} from "../controllers/RiderController.js";
import restrictToRoles from "../middleware/restrictToRole.js";
import adminAuth from "../middleware/adminAuth.js";
const riderRouter = express.Router();

riderRouter.get("/all", getAllRiders);
riderRouter.get(
  "/currentOrder",
  restrictToRoles("rider"),
  GetcurrentRiderOrder
);
riderRouter.get("/acceptedOrder", restrictToRoles("rider"), riderAcceptedOrder); // Assuming this is for getting the accepted order by the rider
riderRouter.get("/earning", restrictToRoles("rider"), riderEarningByRange); // Assuming this is for getting the earnings of the rider
riderRouter.get("/AllriderOrders", adminAuth, getAllRidersOrder);
riderRouter.get("/submitCOD", restrictToRoles("rider"), submitRiderCOD); // Assuming this is for submitting COD by the rider
riderRouter.get("/riderCODamount", restrictToRoles("rider"), getRiderCODamount); // Assuming this is for getting the COD amount by the rider
riderRouter.get("/online-riderCount", adminAuth, getOnlineTotalRider); // Assuming this is for getting online riders
riderRouter.get(
  "/riderCODHistory",
  restrictToRoles("rider", "admin"),
  getRiderCODHistory
);
riderRouter.get("/:OrderStatus", adminAuth, getOrderStatusCounts); // Assuming this is for getting orders by status
// Assuming this is for getting the COD history of the rider
riderRouter.post("/assign",
    (req, res, next) => {
      console.log("Assigning rider with request body:", req.body);
      next();
    }
,
  assignRider);
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
riderRouter.put(
  "/update-riderStatus",
  restrictToRoles("rider"),
  updateRiderStatus
);

export default riderRouter;
