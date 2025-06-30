import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  items: { 
    type: Array, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  address: { 
    type: Object, 
    required: true 
  },
  status: {
    type: String,
    enum: ['Order Placed', 'Shipped', 'Delivered', 'Cancelled', 'Out for delivery', 'Packing'],
    default: 'Order Placed',
    required: true
  },
  paymentMethod: { 
    type: String, 
    required: true 
  },
  payment: {
    method: { type: String },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String }
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  },
  date: { 
    type: Date, 
    required: true 
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'admin', 'system', null],
    default: null
  },
  deliveryCharge: {
    type: Number,
    default: 100
  },
 riderId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User", // because rider is in UserModel
  default: null
},
expiresAt: {
  type: Date,
  default: null // only set when assigning rider or pushing notification.
},
isActive: {
  type: Boolean,
  default: true // true if order is active, false if cancelled or completed
}
,
pickUpLocation: {
  type: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  default: {
    lat: 21.1676,
    lng: 72.8149
  }
},
pickUpAddress: {
  type: Object,
  default: {
  street: "Swaminarayan",
  city: "Surat",
  state: "Gujarat",
  pincode: "121212",
  country: "India"
  }
},
distanceFromPickUpLocation: {
  type: Number,
  default: 0 // in kilometers, can be updated later
},
distanceFromDeliveryLocation: {
  type: Number,
  default: 0 // in kilometers, can be updated later
},
otpExpiresAt: {
  type: Date,
  default: null // only set when sending delivery OTP
},
deliveryOtp : {
  type: String
},
earning: {
  amount: { type: Number, default: 0 }, // What the rider earned for this delivery
  collected: { type: Number, default: 0 }, // If COD, what rider collected from customer
}

}, { minimize: false, timestamps: true });

// ✅ Add this: Compound index on paymentStatus and status
orderSchema.index({ paymentStatus: 1, status: 1 });

const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
