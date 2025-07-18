import express from "express";
// import { addSubscriber,getAllSubscribers } from "../controllers/subscriberController.js";
import { addSubscriber, checkSubscriber } from "../controllers/subscriberController.js";
const SubscriberRoute = express.Router();

SubscriberRoute.post("/addsubscribe", addSubscriber);
// SubscriberRoute.get("/getallsubscriber", getAllSubscribers);

SubscriberRoute.post("/checksubscriber", checkSubscriber);

export default SubscriberRoute;
