import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import reviewHandler from "../socketHandlers/reviewHandler.js";
import productHandler from "../socketHandlers/productHandler.js";
// Post a review
const addReview = async (req, res) => {
  try {
    const io = req.app.get("io"); // ✅ Get io instance
    const userId = req.userId;
    const { productId, rating, comment } = req.body;

    const order = await Order.findOne({
      userId,
      "items._id": productId,
    });

    if (!order) {
      return res.json({
        success: false,
        message: "You can only review products from your orders.",
      });
    }

    const reviewData = new Review({
      productId,
      userId,
      rating,
      comment,
    });
    const product = await Product.findById(productId);

    // Change product rating
    product.totalRating = product.totalRating + rating;
    product.totalReviews = product.totalReviews + 1;
    await product.save();

    const newReview = await Review.create(reviewData);
    await newReview.save();

    // Only notify users viewing this product
    // req.app
    //   .get("io")
    //   .to(productId.toString())
    //   .emit("reviewAdded", { productId });
    reviewHandler(
      io,
      productId.toString(),
      {
        data: { productId },
      },
      "review:add"
    );
    // Emit product update event
    // io.emit("productUpdated", {
    //   productId: productId,
    //   updatedFields: {
    //     totalRating: product.totalRating,
    //     totalReviews: product.totalReviews,
    //   },
    //   message: "Product rating updated after new review",
    // });

    productHandler(
      io,
      null,
      {
        data: {
          productId: productId,
          updatedFields: {
            totalRating: product.totalRating,
            totalReviews: product.totalReviews,
          },
          message: "Product rating updated after new review",
        },
      },
      "product:updated"
    )
    return res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// Get reviews for a product
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId }).populate(
      "userId",
      "name email profilePhoto"
    );

    return res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const io = req.app.get("io"); // ✅ Get io instance

    const { rating, comment, reviewId, productId } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(reviewId);

    const OldRating = updatedReview.rating;
    updatedReview.rating = rating;
    updatedReview.comment = comment;

    const Myreview = await updatedReview.save();

    req.app
      .get("io")
      .to(updatedReview.productId.toString())
      .emit("reviewUpdated", { productId: updatedReview.productId });
    // Update product rating

    reviewHandler(
      io,
      updatedReview.productId.toString(),
      {
        data: { productId: updatedReview.productId },
      },
      "review:update"
    );

    const product = await Product.findById(updatedReview.productId);

    product.totalRating = product.totalRating + rating - OldRating;
    product.totalReviews = product.totalReviews; // Total reviews remain the same
    const updatedProduct = await product.save();

    // req.app.get("io").emit("productUpdated", {
    //   productId: updatedReview.productId,
    //   updatedFields: {
    //     totalRating: updatedProduct.totalRating,
    //     totalReviews: updatedProduct.totalReviews,
    //   },
    //   message: "Product rating updated after review update",
    // });

    productHandler(
      io,
      null,
      {
        data: {
          productId: updatedReview.productId,
          updatedFields: {
            totalRating: updatedProduct.totalRating,
            totalReviews: updatedProduct.totalReviews,
          },
          message: "Product rating updated after review update",
        },
      },
      "product:updated"
    );
    return res.json({ success: true, message: "Review updated successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    let updatedProduct;
    const io = req.app.get("io"); // ✅ Get io instance
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }
    const product = await Product.findById(review.productId);
    if (product) {
      product.totalRating -= review.rating;
      product.totalReviews -= 1;
      updatedProduct = await product.save();
    }

    // req.app.get("io").emit("productUpdated", {
    //   productId: review.productId,
    //   updatedFields: {
    //     totalRating: updatedProduct.totalRating,
    //     totalReviews: updatedProduct.totalReviews,
    //   },
    //   message: "Product rating updated after review deletion",
    // });
    productHandler(
      io,
      null,
      {
        data: {
          productId: review.productId,
          updatedFields: {
            totalRating: updatedProduct.totalRating,
            totalReviews: updatedProduct.totalReviews,
          },
          message: "Product rating updated after review deletion",
        },
      },
      "product:updated"
    );

    // Emit socket event to notify users about the review deletion
    // req.app
    //   .get("io")
    //   .to(review.productId.toString())
    //   .emit("reviewDeleted", { productId: review.productId });
    reviewHandler(
      io,
      review.productId.toString(),
      {
        data: { productId: review.productId },
      },
      "review:delete"
    );
    return res.json({ success: true, message: "Review deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

export { addReview, getReviews, updateReview, deleteReview };
