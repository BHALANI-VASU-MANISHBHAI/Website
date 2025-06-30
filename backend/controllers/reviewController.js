import Review from "../models/reviewModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// Post a review
const addReview = async (req, res) => {
  try {
    const io = req.app.get('io'); // ✅ Get io instance
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
    console.log("reviewData", reviewData);
    const product = await Product.findById(productId);

    // Change product rating
    product.totalRating = product.totalRating + rating;
    product.totalReviews = product.totalReviews + 1;
    await product.save();

    const newReview = await Review.create(reviewData);
    await newReview.save();

    // Only notify users viewing this product
req.app.get('io').to(productId.toString()).emit('reviewAdded', { productId });


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

    const reviews = await Review.find({ productId }).populate('userId', 'name email profilePhoto');

    return res.json({ success: true, reviews });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const io = req.app.get('io'); // ✅ Get io instance

    const { rating, comment, reviewId, productId } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(reviewId, {
      rating,
      comment
    }, { new: true });

    console.log("updatedReview", updatedReview);
    // ✅ Emit socket event to update product reviews
    console.log("productId", updatedReview.productId.toString());
req.app.get('io').to(updatedReview.productId.toString()).emit('reviewUpdated', { productId:updatedReview.productId });

    return res.json({ success: true, message: 'Review updated successfully' });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: err.message });
  }
};

export {
  addReview,
  getReviews,
  updateReview
}
