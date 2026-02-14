// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// --------------------------------------------------
// 🔹 Register or Login (Password based)
// --------------------------------------------------
export const registerOrLogin = async (req, res) => {
  try {
    let { name, phone, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Normalize phone number
    phone = phone.replace(/\D/g, "");

    let user = await User.findOne({ phone });

    // 🟢 Register New User
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        name: name.trim(),
        phone,
        password: hashedPassword,
      });

      const token = generateToken(user._id);
      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
        },
      });
    }

    // 🔐 Existing User Login
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user._id);
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Register/Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Quick Login (Phone only)
// --------------------------------------------------
export const quickLogin = async (req, res) => {
  try {
    let { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    phone = phone.replace(/\D/g, "");

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "Phone not registered. Please sign up." });
    }

    const token = generateToken(user._id);
    return res.json({
      success: true,
      message: "Quick login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Quick Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Get Profile (Protected)
// --------------------------------------------------
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -savedProperties");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GetMe Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Logout User
// --------------------------------------------------
export const logoutUser = async (req, res) => {
  try {
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 OTP Support (Optional Fallback for Testing)
// --------------------------------------------------
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        message: "This number is already registered. Please use Quick Login.",
      });
    }

    // Demo purpose only
    return res.json({
      message: "OTP sent successfully (test mode)",
      otp: "1111",
    });
  } catch (err) {
    console.error("Send OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, name, otp } = req.body;
    if (!phone || !otp)
      return res.status(400).json({ message: "Phone & OTP are required" });

    if (otp !== "1111") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: name?.trim() || `User-${phone}`,
        phone,
        password: await bcrypt.hash("default@123", 10),
      });
    }

    const token = generateToken(user._id);
    return res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// --------------------------------------------------
// 🔹 Update User Name (Protected Route)
// --------------------------------------------------
export const updateUserName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name.trim();
    await user.save();

    res.json({
      success: true,
      message: "Name updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Update Name Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

