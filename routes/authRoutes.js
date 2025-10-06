import express from "express";
import {
  sendOtp,
  verifyOtp,
  quickLogin,
  getMe,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/quick-login", quickLogin);   // 🚀 new: login directly if phone exists
router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

export default router;

// // withput OTP verifications

// import express from "express";
// import { sendOtp, verifyOtp, getMe } from "../controllers/authController.js";
// import { protect } from "../middleware/authMiddleware.js";
// import { logoutUser } from "../controllers/authController.js";

// const router = express.Router();

// // ❌ Wrong: router.post("/api/auth/send-otp", sendOtp);
// // ✅ Correct: only define relative paths
// router.post("/send-otp", sendOtp);      
// router.post("/verify-otp", verifyOtp);  
// router.get("/me", protect, getMe);      
// router.post("/logout", protect, logoutUser);

// export default router;



// import express from "express";
// import { sendOtp, verifyOtp } from "../controllers/authController.js";

// const router = express.Router();

// router.post("/send-otp", sendOtp);     // send OTP to user
// router.post("/verify-otp", verifyOtp); // verify OTP & login

// export default router;
