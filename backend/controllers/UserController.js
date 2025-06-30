import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from 'cloudinary';
import { OAuth2Client } from 'google-auth-library';
import UserModel from "../models/userModel.js";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createdToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await userModel.findOne({ email  });

        if (!user) {
            return res.json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createdToken(user._id, user.role);
            return res.status(200).json({ success: true, token, role: user.role });
        } else {
            return res.json({ success: false, message: "Invalid credentials" });
        }

    } catch (err) {
        console.log(err);
        return res.json({ success: false, message: err.message });
    }
};

// route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password ,role} = req.body;
        console.log("Received registration data:",req.body);
        console.log("Registering user:", { name, email, password });
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
        });

        const user = await newUser.save();

        const token = createdToken(user._id, user.role);

            req.app.get('io').emit('customerAdded', { userId: user._id, name: user.name });
         
        res.json({ success: true, token, role: user.role });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// route for admin login
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {
        const token = createdToken(email + password, "admin");
        return res.status(200).json({ success: true, token, role: "admin" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
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
        console.log("User ID:", userId);
        const { firstName, lastName, email, phone, gender , dateOfBirth, vehicleNumber ,available } = req.body;
        console.log("Update Profile Data:",req.body);
    
        let updateData = {
            firstName,
            lastName,
            email,
            phone,
            gender,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            vehicleNumber : vehicleNumber || "",
            available: available === 'true', // Convert string to boolean
            riderStatus: (available === 'true' ? "available" : "offline") // Set status based on availability
        };
        console.log("Update Profile Data:", updateData);
        console.log("Profile Image:", profileImage);
        if (profileImage) {
            const result = await cloudinary.uploader.upload(profileImage.path, { resource_type: 'image' });
            updateData.profilePhoto = result.secure_url;
            console.log("Image uploaded to Cloudinary:", result.secure_url);
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });

        console.log("Updated User:", updatedUser);
        res.json({ success: true, user: updatedUser });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        console.log("Google Auth Token:", token);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub } = payload;

        let user = await userModel.findOne({ email });
        if (!user) {
            user = new userModel({
                name,
                email,
                profilePhoto: picture,
                googleId: sub,
                role: "user",
            });
            await user.save();
        }

        const jwtToken = createdToken(user._id, user.role);

        req.app.get('io').emit('customerAdded', { userId: user._id, name: user.name });
        res.json({ success: true, token: jwtToken, role: user.role, user });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Google authentication failed" });
    }
};


const getTotalCustomers = async (req, res) => {
    try {
        const totalCustomers = await UserModel.countDocuments({ role: "user" });

        res.json({ success: true, totalCustomers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error fetching customers.' });
    }
};

export { loginUser, registerUser, adminLogin, getUserById, UpdateProfile, googleAuth 
    , getTotalCustomers
};