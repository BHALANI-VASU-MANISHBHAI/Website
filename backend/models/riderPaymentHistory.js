import mongoose from "mongoose";

const riderCODHistorySchema = new mongoose.Schema({
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  razorpay_order_id: String,
  razorpay_payment_id: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: true
  }
});

const RiderCODHistory = mongoose.model("RiderCODHistory", riderCODHistorySchema);
export default RiderCODHistory;
