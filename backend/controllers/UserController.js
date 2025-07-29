import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import validator from "validator";
import {
  default as userModel,
  default as UserModel,
} from "../models/userModel.js";
import riderHandler from "../socketHandlers/riderHandler.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createdToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password, role, cartData } = req.body;
    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and role are required",
      });
    }

    const user = await userModel.findOne({ email, role, authType: "local" });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found with the provided credentials",
      });
    }

    // add new cart data to user that store in local storage
    if (cartData) {
      // we want to add to prev  means not direct changed
      user.cartData = {
        ...user.cartData,
        ...cartData,
      };
      

      await userModel.findByIdAndUpdate(user._id, {
        cartData: user.cartData,
      });
      console.log("Cart data updated in database");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = createdToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      token,
      role: user.role,
      userId: user._id, // Often useful to return user ID
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

// route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, cartData } = req.body;

    const exist = await userModel.findOne({ email });
    if (exist) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validate email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // Default to 'user' if no role is provided
      cartData: cartData || {}, // Initialize with empty object if no cartData is provided
    });

    const user = await newUser.save();

    const token = createdToken(user._id, user.role);

    req.app
      .get("io")
      .emit("customerAdded", { userId: user._id, name: user.name });

    res.json({ success: true, token, role: user.role });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// route for admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (
    email == process.env.ADMIN_EMAIL &&
    password == process.env.ADMIN_PASSWORD
  ) {
    const token = createdToken(email + password, "admin");
    return res.status(200).json({ success: true, token, role: "admin" });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid credentials" });
  }
};

// Get user data by Id
const getUserById = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    return res.json({ success: false, message: err.message });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profileImage = req.file;

    const {
      firstName,
      lastName,
      email,
      phone,
      gender,
      dateOfBirth,
      vehicleNumber,
      available,
      isChangePassword,
      oldPassword,
      newPassword,
    } = req.body;

    console.log("req.body in UpdateProfile:", req.body);

    // 1. Find User (make sure password is selected if needed)
    const user = await userModel.findById(userId).select("+password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Handle password change if requested
    if (isChangePassword === "true") {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old and new passwords are required",
        });
      }

      // If user logged in with Google, they may not have a password
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "Password change not allowed for Google login users",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 8 characters",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // 3. Prepare update data
    const updateData = {
      firstName,
      lastName,
      email,
      phone,
      gender,
      vehicleNumber: vehicleNumber || "",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      available: available === "true",
      riderStatus: available === "true" ? "available" : "offline",
    };

    // 4. Upload profile image to Cloudinary
    if (profileImage) {
      const result = await cloudinary.uploader.upload(profileImage.path, {
        resource_type: "image",
        folder: "profilePhotos",
      });
      updateData.profilePhoto = result.secure_url;
     
    }

    // 5. Update user document
    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    // Save password change if done
    if (isChangePassword === "true") {
      await user.save();
    }
    const io = req.app.get("io");
    // 6. Emit socket update
    // req.app.get("io").emit("riderProfileUpdated", {
    //   riderId: updatedUser._id,
    //   updatedFields: {
    //     firstName: updatedUser.firstName,
    //     lastName: updatedUser.lastName,
    //     phone: updatedUser.phone,
    //     profilePhoto: updatedUser.profilePhoto,
    //     available: updatedUser.available,
    //     riderStatus: updatedUser.riderStatus,
    //   },
    // });
    riderHandler(
      io,
      "riderRoom",
      {
        data: {
          riderId: updatedUser._id,
          updatedFields: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phone: updatedUser.phone,
            profilePhoto: updatedUser.profilePhoto,
            available: updatedUser.available,
            riderStatus: updatedUser.riderStatus,
          },
        },
      },
      "rider:profile:updated"
    );
    // Emit to admin room
    riderHandler(
      io,
      "adminRoom",
      {
        data: {
          riderId: updatedUser._id,
          updatedFields: {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            phone: updatedUser.phone,
            profilePhoto: updatedUser.profilePhoto,
            available: updatedUser.available,
            riderStatus: updatedUser.riderStatus,
          },
        },
      },
      "rider:profile:updated"
    );
    return res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { token, role, cartData } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // 🔍 Check if any user with this email exists
    let user = await userModel.findOne({ email });

    if (user) {
      // 🚫 Prevent login if role mismatch

      if (user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `This email is already registered as a ${user.role}. Please log in with the correct role.`,
        });
      }

      if (user.authType !== "google") {
        return res.json({
          success: false,
          message:
            "This account is not linked with Google. Please use email/password login.",
        });
      }

      // ✅ If no googleId yet, link it now (first-time Google login)
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      const cartDatas = {
        ...user.cartData,
        ...cartData,
      };
      // Update cartData if provided
      if (cartData) {
        user.cartData = cartDatas;
        await userModel.findByIdAndUpdate(user._id, {
          cartData: user.cartData,
        });
      }
    } else {
      // 🆕 New user creation
      user = new userModel({
        name,
        email,
        profilePhoto: picture,
        googleId,
        role,
        authType: "google",
        cartData: cartData || {}, // Initialize with empty object if no cartData is provided
      });
      await user.save();
    }

    const jwtToken = createdToken(user._id, user.role);

    // 👥 Notify via socket (optional)
    req.app.get("io").emit("customerAdded", {
      userId: user._id,
      name: user.name,
    });

    res.json({
      success: true,
      token: jwtToken,
      role: user.role,
      user,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

const getTotalCustomers = async (req, res) => {
  try {
    const totalCustomers = await UserModel.countDocuments({ role: "user" });

    res.json({ success: true, totalCustomers });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching customers." });
  }
};

export {
  adminLogin,
  getTotalCustomers,
  getUserById,
  googleAuth,
  loginUser,
  registerUser,
  UpdateProfile,
};
