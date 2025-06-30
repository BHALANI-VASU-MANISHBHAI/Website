import mongoose from "mongoose";
import { type } from "os";

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
    originalPrice:{
      type: Number
    },
  discount:{
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  bestseller: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Number,
    default: Date.now(),
  },
  // 👉 New fields for ratings
  totalSales: {
    type: Number,
    default: 0,
  },
  stock: [
  {
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0
    }
  }
]
,
  totalRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const ProductModel = mongoose.models.product || mongoose.model("Product", productSchema);

export default ProductModel;
