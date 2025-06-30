import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      default: "",
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    vehicleNumber: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    address: {
      type: String,
      default: "",
    },
    cartData: {
      type: Object,
      default: {},
    },
    profilePhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/drezv2fgf/image/upload/v1748439973/Profile_avatar_placeholder_large_px5gio.png",
    },
    role: {
      type: String,
      enum: ["user", "admin", "rider"],
      default: "user",
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    available: {
      type: Boolean,
      default: false,
    },
    riderStatus: {
      type: String,
      enum: ["notified", "assigned", "busy", "offline","available"],
      default: "available",
    },
  },
  { minimize: false, timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export default UserModel;
