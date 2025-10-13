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

// // controllers/authController.js
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import generateToken from "../utils/generateToken.js";

// // --------------------------------------------------
// // 🔹 Register or Login with Password
// // --------------------------------------------------
// export const registerOrLogin = async (req, res) => {
//   try {
//     let { name, phone, password } = req.body; // ✅ use let, not const

//     if (!name || !phone || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // ✅ Normalize phone number (remove +, -, spaces, etc.)
//     phone = phone.replace(/\D/g, "");

//     let user = await User.findOne({ phone });

//     // 🟢 Register new user
//     if (!user) {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       user = await User.create({
//         name: name.trim(),
//         phone,
//         password: hashedPassword,
//       });

//       const token = generateToken(user._id);

//       return res.status(201).json({
//         message: "User registered successfully",
//         token,
//         user: {
//           id: user._id,
//           name: user.name,
//           phone: user.phone,
//         },
//       });
//     }

//     // 🔐 Existing user login
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid password" });
//     }

//     const token = generateToken(user._id);
//     return res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//       },
//     });
//   } catch (err) {
//     console.error("Register/Login Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // --------------------------------------------------
// // 🔹 Quick Login (Phone only, no password)
// // --------------------------------------------------
// export const quickLogin = async (req, res) => {
//   try {
//     let { phone } = req.body; // ✅ use let

//     if (!phone) {
//       return res.status(400).json({ message: "Phone number is required" });
//     }

//     phone = phone.replace(/\D/g, ""); // ✅ safe now

//     const user = await User.findOne({ phone });
//     if (!user) {
//       return res.status(404).json({ message: "Phone not registered. Please sign up." });
//     }

//     const token = generateToken(user._id);
//     return res.json({
//       success: true,
//       message: "Quick login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//       },
//     });
//   } catch (err) {
//     console.error("Quick Login Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// // export const registerOrLogin = async (req, res) => {
// //   try {
// //     const { name, phone, password } = req.body;

// //     if (!name || !phone || !password) {
// //       return res.status(400).json({ message: "All fields are required" });
// //     }

// //     // ✅ Normalize phone number (remove spaces, +, -, etc.)
// //     phone = phone.replace(/\D/g, ""); // keep only digits

// //     let user = await User.findOne({ phone });

// //     // 🟢 New User → Register
// //     if (!user) {
// //       const hashedPassword = await bcrypt.hash(password, 10);
// //       user = await User.create({
// //          name: name.trim(),
// //         phone,
// //         password: hashedPassword,
// //       });

// //       const token = generateToken(user._id);

// //       return res.status(201).json({
// //         message: "User registered successfully",
// //         token,
// //         user: {
// //           id: user._id,
// //           name: user.name,
// //           phone: user.phone,
// //         },
// //       });
// //     }

// //     // 🔐 Existing User → Login
// //     const isMatch = await bcrypt.compare(password, user.password);
// //     if (!isMatch) {
// //       return res.status(401).json({ message: "Invalid password" });
// //     }

// //     const token = generateToken(user._id);
// //     return res.json({
// //       message: "Login successful",
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         phone: user.phone,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Register/Login Error:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // --------------------------------------------------
// // // 🔹 Quick Login (Phone only, no password)
// // // --------------------------------------------------
// // export const quickLogin = async (req, res) => {
// //   try {
// //     const { phone } = req.body;

// //     if (!phone) {
// //       return res.status(400).json({ message: "Phone number is required" });
// //     }


// //       // ✅ Normalize phone number
// //     phone = phone.replace(/\D/g, "");


// //     const user = await User.findOne({ phone });

// //     if (!user) {
// //       return res
// //         .status(404)
// //         .json({ message: "Phone not registered. Please sign up." });
// //     }

// //     const token = generateToken(user._id);

// //     return res.json({
// //       success: true,
// //       message: "Quick login successful",
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         phone: user.phone,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Quick Login Error:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // --------------------------------------------------
// // 🔹 Get Profile (Protected Route)
// // --------------------------------------------------
// export const getMe = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       id: req.user._id,
//       name: req.user.name,
//       phone: req.user.phone,
//       avatar: req.user.avatar || null,
//     });
//   } catch (err) {
//     console.error("GetMe Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // --------------------------------------------------
// // 🔹 Logout User
// // --------------------------------------------------
// export const logoutUser = async (req, res) => {
//   try {
//     return res.json({ message: "Logged out successfully" });
//   } catch (err) {
//     console.error("Logout Error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // --------------------------------------------------
// // 🔹 Legacy: Keep OTP endpoints (optional dummy support)
// // --------------------------------------------------
// export const sendOtp = async (req, res) => {
//   try {
//     const { phone } = req.body;

//     if (!phone) {
//       return res.status(400).json({ message: "Phone is required" });
//     }

//     const existingUser = await User.findOne({ phone });
//     if (existingUser) {
//       return res.status(400).json({
//         message: "This number is already registered. Please use Quick Login.",
//       });
//     }

//     return res.json({
//       message: "OTP sent successfully (testing only)",
//       otp: "1111",
//     });
//   } catch (err) {
//     console.error("Send OTP Error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // --------------------------------------------------
// // 🔹 Legacy: Verify OTP (test fallback)
// // --------------------------------------------------
// export const verifyOtp = async (req, res) => {
//   try {
//     const { phone, name, otp } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({ message: "Phone & OTP are required" });
//     }

//     if (otp !== "1111") {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     let user = await User.findOne({ phone });

//     if (!user) {
//       user = await User.create({
//         name: name?.trim() || `User-${phone}`,
//         phone,
//         password: await bcrypt.hash("default@123", 10),
//       });
//     }

//     const token = generateToken(user._id);

//     return res.json({
//       message: "OTP verified successfully",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         phone: user.phone,
//       },
//     });
//   } catch (err) {
//     console.error("Verify OTP Error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


// // // controllers/authController.js
// // import User from "../models/User.js";
// // import generateToken from "../utils/generateToken.js";

// // // ---------------- SEND OTP ----------------
// // export const sendOtp = async (req, res) => {
// //   try {
// //     const { phone } = req.body;

// //     if (!phone) {
// //       return res.status(400).json({ message: "Phone is required" });
// //     }

// //     // 🚫 Check if user already exists
// //     const existingUser = await User.findOne({ phone });
// //     if (existingUser) {
// //       return res.status(400).json({
// //         message: "This number is already registered. Please use Quick Login.",
// //       });
// //     }

// //     // ✅ Otherwise send OTP
// //     return res.json({
// //       message: "OTP sent successfully",
// //       otp: "1111", // fixed for testing
// //     });
// //   } catch (err) {
// //     console.error("Send OTP Error:", err);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // export const sendOtp = async (req, res) => {
// // //   try {
// // //     const { phone } = req.body;

// // //     if (!phone) {
// // //       return res.status(400).json({ message: "Phone is required" });
// // //     }

// // //     // Dummy OTP (hardcoded for testing)
// // //     return res.json({
// // //       message: "OTP sent successfully",
// // //       otp: "1111", // ⚠️ test only
// // //     });
// // //   } catch (err) {
// // //     console.error("Send OTP Error:", err);
// // //     return res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // ---------------- VERIFY OTP ----------------
// // // ---------------- VERIFY OTP ----------------
// // export const verifyOtp = async (req, res) => {
// //   try {
// //     const { phone, name, otp } = req.body;

// //     if (!phone || !otp) {
// //       return res.status(400).json({ message: "Phone & OTP are required" });
// //     }

// //     // ✅ OTP check (static 1111 for now)
// //     if (otp !== "1111") {
// //       return res.status(400).json({ message: "Invalid OTP" });
// //     }

// //     // 🔹 Check if user already exists
// //     let user = await User.findOne({ phone });

// //     if (user) {
// //       // 🚫 If user exists, block registration and tell them to use Quick Login
// //       return res.status(400).json({
// //         message: "This number is already registered. Please use Quick Login.",
// //       });
// //     }

// //     // ✅ If new number, create user
// //     user = await User.create({
// //       name: name?.trim() || `User-${phone}`,
// //       phone,
// //       password: "dummy", // schema requirement
// //     });

// //     const token = generateToken(user._id);

// //     return res.json({
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         phone: user.phone,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Verify OTP Error:", err);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // export const verifyOtp = async (req, res) => {
// // //   try {
// // //     const { phone, name, otp } = req.body;

// // //     if (!phone || !otp) {
// // //       return res.status(400).json({ message: "Phone & OTP are required" });
// // //     }

// // //     // ✅ Check OTP (dummy for now)
// // //     if (otp !== "1111") {
// // //       return res.status(400).json({ message: "Invalid OTP" });
// // //     }

// // //     // ✅ Find or create user
// // //     let user = await User.findOne({ phone });

// // //     if (user) {
// // //       if (name && user.name !== name) {
// // //         user.name = name;
// // //         await user.save();
// // //       }
// // //     } else {
// // //       user = await User.create({
// // //         name: name || `User-${phone}`,
// // //         phone,
// // //         password: "dummy", // schema requirement
// // //       });
// // //     }

// // //     const token = generateToken(user._id);

// // //     return res.json({
// // //       success: true,
// // //       token,
// // //       user: {
// // //         id: user._id,
// // //         name: user.name,
// // //         phone: user.phone,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("Verify OTP Error:", err);
// // //     return res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // ---------------- QUICK LOGIN (No OTP) ----------------
// // export const quickLogin = async (req, res) => {
// //   try {
// //     const { phone } = req.body;

// //     if (!phone) {
// //       return res.status(400).json({ message: "Phone number is required" });
// //     }

// //     const user = await User.findOne({ phone });
// //     if (!user) {
// //       return res.status(404).json({ message: "Phone not registered. Please sign up." });
// //     }

// //     const token = generateToken(user._id);

// //     return res.json({
// //       success: true,
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         phone: user.phone,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Quick Login Error:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // ---------------- GET PROFILE ----------------
// // export const getMe = async (req, res) => {
// //   try {
// //     if (!req.user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     res.json({
// //       id: req.user._id,
// //       name: req.user.name,
// //       phone: req.user.phone,
// //       avatar: req.user.avatar || null,
// //     });
// //   } catch (err) {
// //     console.error("GetMe Error:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // ---------------- LOGOUT ----------------
// // export const logoutUser = async (req, res) => {
// //   try {
// //     return res.json({ message: "Logged out successfully" });
// //   } catch (err) {
// //     console.error("Logout Error:", err);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // // controllers/authController.js
// // // import User from "../models/User.js";
// // // import generateToken from "../utils/generateToken.js";

// // // // ---------------- SEND OTP ----------------
// // // // For now we just simulate sending a fixed OTP (1111)
// // // export const sendOtp = async (req, res) => {
// // //   try {
// // //     const { phone } = req.body;

// // //     if (!phone) {
// // //       return res.status(400).json({ message: "Phone is required" });
// // //     }

// // //     // Just return OTP — no DB changes yet
// // //     return res.json({
// // //       message: "OTP sent successfully",
// // //       otp: "1111", // fixed OTP for testing
// // //     });
// // //   } catch (err) {
// // //     console.error("Send OTP Error:", err);
// // //     return res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // // ---------------- VERIFY OTP ----------------
// // // // Handles login & registration
// // // export const verifyOtp = async (req, res) => {
// // //   try {
// // //     const { phone, name, otp } = req.body;

// // //     if (!phone || !otp) {
// // //       return res.status(400).json({ message: "Phone & OTP are required" });
// // //     }

// // //     // Check OTP
// // //     if (otp !== "1111") {
// // //       return res.status(400).json({ message: "Invalid OTP" });
// // //     }

// // //     // Find user
// // //     let user = await User.findOne({ phone });

// // //     // if (user) {
// // //     //   // ✅ Update name if provided and not empty
// // //     //   if (name && name.trim() && user.name !== name) {
// // //     //     user.name = name.trim();
// // //     //     await user.save();
// // //     //   }
// // //     // } else {
// // //     //   // ✅ Create new user with provided name (fallback = phone number, not "Unknown")
// // //     //   user = await User.create({
// // //     //     name: name?.trim() || `User-${phone}`, // fallback better than "Unknown"
// // //     //     phone,
// // //     //     password: "dummy", // because schema requires it
// // //     //   });
// // //     // }
// // //         if (user) {
// // //       // If name is provided and user still has "Unknown" or a different name → update
// // //       if (name && user.name !== name) {
// // //         user.name = name;
// // //         await user.save();
// // //       }
// // //     } else {
// // //       // Create new user
// // //       user = await User.create({
// // //         name: name || "Unknown",   // <<-- ⚠️ fallback
// // //         phone,
// // //         password: "dummy",
// // //       });
// // //     }

// // //     // Generate JWT token
// // //     const token = generateToken(user._id);

// // //     return res.json({
// // //       token,
// // //       user: {
// // //         id: user._id,
// // //         name: user.name,
// // //         phone: user.phone,
// // //       },
// // //     });
// // //   } catch (err) {
// // //     console.error("Verify OTP Error:", err);
// // //     return res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // // ---------------- GET PROFILE ----------------
// // // // ---------------- GET PROFILE ----------------
// // // export const getMe = async (req, res) => {
// // //   try {
// // //     if (!req.user) {
// // //       return res.status(404).json({ message: "User not found" });
// // //     }

// // //     res.json({
// // //       id: req.user._id,
// // //       name: req.user.name,
// // //       phone: req.user.phone,
// // //       avatar: req.user.avatar || null,
// // //     });
// // //   } catch (err) {
// // //     console.error("GetMe Error:", err);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // // logout 
// // // export const logoutUser = async (req, res) => {
// // //   try {
// // //     // Just respond success (frontend clears token)
// // //     return res.json({ message: "Logged out successfully" });
// // //   } catch (err) {
// // //     console.error("Logout Error:", err);
// // //     return res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // // export const getMe = async (req, res) => {
// // // //   try {
// // // //     const user = await User.findById(req.user.id).select("-password");

// // // //     if (!user) {
// // // //       return res.status(404).json({ message: "User not found" });
// // // //     }

// // // //     res.json(user);
// // // //   } catch (err) {
// // // //     console.error("GetMe Error:", err);
// // // //     return res.status(500).json({ message: "Server error" });
// // // //   }
// // // // };



// // // // // withoutOTP verfications
// // // // import User from "../models/User.js";
// // // // import generateToken from "../utils/generateToken.js";

// // // // // Send OTP (for now fixed as 1111)
// // // // export const sendOtp = async (req, res) => {
// // // //   try {
// // // //     const { phone, name } = req.body;

// // // //     // if user exists, keep it. If not, create
// // // //     let user = await User.findOne({ phone });
// // // //     if (!user) {
// // // //       user = await User.create({ name, phone });
// // // //     }

// // // //     // Instead of real SMS, just return fixed OTP
// // // //     return res.json({ message: "OTP sent successfully", otp: "1111" });
// // // //   } catch (err) {
// // // //     return res.status(500).json({ message: err.message });
// // // //   }
// // // // };

// // // // // Verify OTP (login)
// // // // export const verifyOtp = async (req, res) => {
// // // //   try {
// // // //     const { phone, otp } = req.body;

// // // //     if (otp !== "1111") {
// // // //       return res.status(400).json({ message: "Invalid OTP" });
// // // //     }

// // // //     const user = await User.findOne({ phone });
// // // //     if (!user) {
// // // //       return res.status(404).json({ message: "User not found" });
// // // //     }

// // // //     const token = generateToken(user._id);

// // // //     return res.json({
// // // //       _id: user._id,
// // // //       name: user.name,
// // // //       phone: user.phone,
// // // //       token,
// // // //     });
// // // //   } catch (err) {
// // // //     return res.status(500).json({ message: err.message });
// // // //   }
// // // // };

// // // // // Get user profile (with token)
// // // // export const getMe = async (req, res) => {
// // // //   const user = await User.findById(req.user.id);
// // // //   if (!user) {
// // // //     return res.status(404).json({ message: "User not found" });
// // // //   }
// // // //   res.json(user);
// // // // };

// // // // import User from "../models/User.js";
// // // // import generateToken from "../utils/generateToken.js";

// // // // // @desc Send OTP
// // // // export const sendOtp = async (req, res) => {
// // // //   const { phone, name } = req.body;

// // // //   // generate 4-digit OTP
// // // //   const otp = Math.floor(1000 + Math.random() * 9000).toString();
// // // //   const otpExpires = Date.now() + 5 * 60 * 1000; // 5 mins

// // // //   let user = await User.findOne({ phone });

// // // //   if (!user) {
// // // //     // if new user, create account
// // // //     user = await User.create({ name: name || "User", phone, otp, otpExpires });
// // // //   } else {
// // // //     user.otp = otp;
// // // //     user.otpExpires = otpExpires;
// // // //     await user.save();
// // // //   }

// // // //   // For now, just return OTP in response (in real app, send via SMS)
// // // //   console.log(`📩 OTP for ${phone}: ${otp}`);

// // // //   res.json({ message: "OTP sent successfully", otp }); // remove otp in production
// // // // };

// // // // // @desc Verify OTP & login
// // // // export const verifyOtp = async (req, res) => {
// // // //   const { phone, otp } = req.body;

// // // //   const user = await User.findOne({ phone });

// // // //   if (!user) return res.status(400).json({ message: "User not found" });

// // // //   if (user.otp !== otp || user.otpExpires < Date.now()) {
// // // //     return res.status(400).json({ message: "Invalid or expired OTP" });
// // // //   }

// // // //   // Clear OTP after successful login
// // // //   user.otp = null;
// // // //   user.otpExpires = null;
// // // //   await user.save();

// // // //   res.json({
// // // //     _id: user._id,
// // // //     name: user.name,
// // // //     phone: user.phone,
// // // //     token: generateToken(user._id),
// // // //   });
// // // // };
