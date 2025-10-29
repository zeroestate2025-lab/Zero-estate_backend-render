import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// Serve uploaded files statically from /uploads
// NOTE: we previously served /uploads when files were written to disk.
// Now images are stored in MongoDB as base64 strings, so static serving of
// an uploads folder is not required. If you later store files on disk or S3,
// add appropriate static middleware or CDN links.

// ✅ Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

// ✅ Root Route for health check or browser visit
app.get("/", (req, res) => {
  res.send("🚀 Zero Estate Backend is live and running successfully!");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// import express from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import cors from "cors";
// import authRoutes from "./routes/authRoutes.js";
// import propertyRoutes from "./routes/propertyRoutes.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// // app.use(express.json({ limit: "10mb" })); // handles Base64 image uploads
// app.use(express.json({ limit: "100mb" }));
// app.use(express.urlencoded({ limit: "100mb", extended: true }));

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Error:", err));

// app.use("/api/auth", authRoutes);
// app.use("/api/properties", propertyRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// // without OTP 
// import express from "express";
// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import authRoutes from "./routes/authRoutes.js";
// import propertyRoutes from "./routes/propertyRoutes.js";

// dotenv.config();

// const app = express();
// app.use(express.json());

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err.message);
//     process.exit(1);
//   });

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/properties", propertyRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running on http://localhost:${PORT}`)
// );


// // import express from "express";
// // import dotenv from "dotenv";
// // import cors from "cors";
// // import connectDB from "./config/db.js";
// // import authRoutes from "./routes/authRoutes.js";
// // import propertyRoutes from "./routes/propertyRoutes.js";
// // import { errorHandler } from "./middleware/errorHandler.js";

// // dotenv.config();
// // connectDB();

// // const app = express();

// // // Middleware
// // app.use(cors());
// // app.use(express.json());
// // app.use("/uploads", express.static("uploads"));

// // // Routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/properties", propertyRoutes);

// // // Error Handler
// // app.use(errorHandler);

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
