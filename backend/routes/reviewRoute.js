import express from "express";
import {
  addReview,
  deleteReview,
  getReviews,
  updateReview,
} from "../controllers/reviewController.js";
import restrictToRole from "../middleware/restrictToRole.js";

const reviewRouter = express.Router();


//Review Routes
reviewRouter.post("/add", restrictToRole('user'), addReview); // Add a review
reviewRouter.get("/get/:productId",  getReviews); // Get reviews for a product
reviewRouter.put("/update", restrictToRole('user'), updateReview); // Update a review
reviewRouter.delete("/delete/:reviewId", restrictToRole('user'), deleteReview); // Delete a review

export default reviewRouter;
