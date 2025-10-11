import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    savedProperties: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    ],
  },
  { timestamps: true }
);

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🧠 Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);

// // without the OTP 
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     phone: { type: String, required: true, unique: true },
//     password: { type: String },
//     savedProperties: [
//       { type: mongoose.Schema.Types.ObjectId, ref: "Property" }
//     ],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     phone: { type: String, required: true, unique: true },
//     otp: { type: String }, // Temporary OTP
//     otpExpires: { type: Date }, // OTP expiry time
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);

// // import mongoose from "mongoose";
// // import bcrypt from "bcryptjs";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: { type: String, required: true },
// //     phone: { type: String, required: true, unique: true },
// //     password: { type: String, required: true },
// //   },
// //   { timestamps: true }
// // );

// // // Encrypt password before save
// // userSchema.pre("save", async function (next) {
// //   if (!this.isModified("password")) return next();
// //   const salt = await bcrypt.genSalt(10);
// //   this.password = await bcrypt.hash(this.password, salt);
// //   next();
// // });

// // // Match password
// // userSchema.methods.matchPassword = async function (enteredPassword) {
// //   return await bcrypt.compare(enteredPassword, this.password);
// // };

// // export default mongoose.model("User", userSchema);
