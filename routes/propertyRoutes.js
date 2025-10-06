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

// CRUD
router.post("/add", protect, addProperty);
router.get("/", getProperties);
router.get("/:id", getPropertyById);

// Save/unsave
router.post("/:id/save", protect, saveProperty);
router.delete("/:id/save", protect, unsaveProperty);
router.get("/user/saved", protect, getSavedProperties);

// My properties
router.get("/my/list", protect, getMyProperties);

// Update/Delete
router.put("/:id", protect, updateProperty);
router.delete("/:id", protect, deleteProperty);

export default router;


// import express from "express";
// import {
//   addProperty,
//   getProperties,
//   getPropertyById,
//   saveProperty,
//   unsaveProperty,
//   getSavedProperties,
//   getMyProperties,
// } from "../controllers/propertyController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/add", protect, addProperty);
// router.get("/", getProperties);
// router.get("/:id", getPropertyById);

// router.post("/:id/save", protect, saveProperty);
// router.delete("/:id/save", protect, unsaveProperty);
// router.get("/user/saved", protect, getSavedProperties);
// // Get all properties created by logged-in user
// router.get("/my", protect, getMyProperties);


// export default router;
