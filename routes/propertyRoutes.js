import express from "express";
import {
  addProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  saveProperty,
  unsaveProperty,
  getSavedProperties,
  getMyProperties,
} from "../controllers/propertyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, addProperty);
router.get("/", getProperties);
router.get("/:id", getPropertyById);

router.post("/:id/save", protect, saveProperty);
router.delete("/:id/save", protect, unsaveProperty);
router.get("/user/saved", protect, getSavedProperties);
router.get("/my/list", protect, getMyProperties);

router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;
