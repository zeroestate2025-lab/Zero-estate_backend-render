import express from "express";
import {
  registerOrLogin,
  quickLogin,
  getMe,
  logoutUser,
  updateUserProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Password-based routes
router.post("/register", registerOrLogin); // combined signup/login
router.post("/quick-login", quickLogin);
router.get("/me", protect, getMe);
router.post("/logout", protect, logoutUser);

router.put("/update-profile", protect, updateUserProfile);


export default router;
