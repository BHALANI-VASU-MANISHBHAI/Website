import mongoose from "mongoose";

const DailyStatsSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // e.g., "2025-08-01"
    day: { type: String }, // e.g., "Thu"

    Profit: { type: Number, default: 0 },
    RiderProfit: { type: Number, default: 0 },
    Cost: { type: Number, default: 0 },
    RiderCost: { type: Number, default: 0 },

    totalOrders: {
      type: Object,
      default: {
        total: 0,
        delivered: 0,
        cancelled: 0,
        outForDelivery: 0,
        packing: 0,
        shipped: 0,
        returned: 0,
      },
    },

    totalCODCollected: {
      type: Number,
      default: 0,
    },

    totalOnlineOrders: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Optional: adds createdAt and updatedAt fields
  }
);

const DailyStats = mongoose.model("DailyStats", DailyStatsSchema);
export default DailyStats;
