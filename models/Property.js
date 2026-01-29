import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"],
      required: true,
    },

    propertyPreference: {
      type: String,
      enum: ["Sale", "Rent"],
      required: true,
    },

    title: { type: String, required: true },

    // ✅ PRICE AS STRING (VERY IMPORTANT)
    price: { type: String, required: true },

    contact: { type: String, required: true },

   location: { type: String, required: true },

    mapLocation: {
      lat: Number,
      lng: Number,
      link: String,
    },


    state: { type: String, required: true },
    district: { type: String, required: true },

    landmark: { type: String },

    // ✅ PROPERTY SIZE (NEW)
    propertySize: { type: String }, // "1200"
    propertyUnit: {
      type: String,
      enum: ["sqft", "cent", "acre"],
      default: "sqft",
    },

    bedrooms: { type: String, default: "0" },
    bathrooms: { type: String, default: "0" },
    kitchen: { type: String, default: "0" },

    // ✅ KEEP OLD FIELD NAME
    amenities: { type: String },

    construction: { type: String },

    images: [{ type: String }],

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// 🔥 Clear mongoose cache (IMPORTANT)
mongoose.models = {};

export default mongoose.model("Property", propertySchema);

// import mongoose from "mongoose";

// const propertySchema = new mongoose.Schema(
//   {
//     category: {
//       type: String,
//       enum: ["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"],
//       required: true,
//     },

//     // 🏡 Sale or Rent
//     propertyPreference: {
//       type: String,
//       enum: ["Sale", "Rent"],
//       required: true,
//     },

//     title: { type: String, required: true },
//     price: { type: String, required: true },
//     contact: { type: String, required: true },

//     location: { type: String, required: true },
//     mapLocation: { type: String },
//     state: { type: String, required: true },
//     district: { type: String },
//     subDistrict: { type: String },
//     landmark: { type: String },

//     sqft: { type: Number },
//     bedrooms: { type: String, default: "0" },
//     bathrooms: { type: String, default: "0" },
//     kitchen: { type: String, default: "0" },
//     amenities: { type: String },
//     interior: { type: String },
//     construction: { type: String },

//     images: [{ type: String }],

//     owner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // 🧹 Force model rebuild to clear cached schema
// mongoose.models = {};
// export default mongoose.model("Property", propertySchema);

// // import mongoose from "mongoose";

// // const propertySchema = new mongoose.Schema(
// //   {
// //     category: {
// //       type: String,
// //       enum: ["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"],
// //       required: true,
// //     },
// //     propertyPreference: {
// //       type: String,
// //       enum: ["Sale", "Rent"],
// //       required: true,
// //     },
// //     title: { type: String, required: true },
// //     price: { type: Number, required: true },
// //     contact: { type: String, required: true },
// //     location: { type: String, required: true },
// //     mapLocation: { type: String },
// //     state: { type: String, required: true },
// //     district: { type: String },
// //     subDistrict: { type: String },
// //     landmark: { type: String },
// //     sqft: { type: Number },
// //     bedrooms: { type: String, default: "0" },
// //     bathrooms: { type: String, default: "0" },
// //     kitchen: { type: String, default: "0" },
// //     amenities: { type: String },
// //     interior: { type: String },
// //     construction: { type: String },
// //     images: [{ type: String }],
// //     owner: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true,
// //     },
// //   },
// //   { timestamps: true }
// // );

// // delete mongoose.models.Property;
// // export default mongoose.model("Property", propertySchema);


// // // import mongoose from "mongoose";

// // // const propertySchema = new mongoose.Schema(
// // //   {
// // //     category: {
// // //       type: String,
// // //       enum: ["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"],
// // //       required: true,
// // //     },
// // //     title: { type: String, required: true },
// // //     price: { type: Number, required: true },
// // //     contact: { type: String, required: true },

// // //     // Address-related
// // //     location: { type: String, required: true },
// // //     mapLocation: { type: String },
// // //     state: { type: String, required: true },
// // //     district: { type: String },
// // //     subDistrict: { type: String },
// // //     landmark: { type: String },

// // //     // Property details
// // //     sqft: { type: Number },
// // //     bedrooms: { type: String, default: "0" },
// // //     bathrooms: { type: String, default: "0" },
// // //     kitchen: { type: String, default: "0" },
// // //     amenities: { type: String },
// // //     interior: { type: String },
// // //     construction: { type: String },

// // //     // Media (Base64)
// // //     images: [{ type: String }], // Base64 strings stored directly

// // //     owner: {
// // //       type: mongoose.Schema.Types.ObjectId,
// // //       ref: "User",
// // //       required: true,
// // //     },
// // //   },
// // //   { timestamps: true }
// // // );

// // // export default mongoose.model("Property", propertySchema);

// // // import mongoose from "mongoose";

// // // const propertySchema = new mongoose.Schema(
// // //   {
// // //     category: {
// // //       type: String,
// // //       enum: ["House", "Apartment", "Office", "Land", "Sites", "Godown", "Factory"],
// // //       required: true,
// // //     },
// // //     title: { type: String, required: true },
// // //     price: { type: Number, required: true },
// // //     contact: { type: String, required: true },

// // //     // Address-related
// // //     location: { type: String, required: true }, // full address
// // //     mapLocation: { type: String },              // Google Maps link or coordinates
// // //     state: { type: String, required: true },    // dropdown
// // //     district: { type: String, required: true }, // dropdown
// // //     subDistrict: { type: String },              // dropdown
// // //     landmark: { type: String },                 // nearby place

// // //     // Property details
// // //     sqft: { type: Number },                     // size in sqft
// // //     bedrooms: { type: String, default: "1" },   // dropdown
// // //     bathrooms: { type: String, default: "1" },  // dropdown
// // //     kitchen: { type: String, default: "Yes" },  // dropdown
// // //     amenities: { type: String },                // comma-separated
// // //     interior: { type: String },                 // description
// // //     construction: { type: String },             // description

// // //     // Media
// // //     images: [{ type: String }], // store image URLs

// // //     // Owner reference
// // //     owner: {
// // //       type: mongoose.Schema.Types.ObjectId,
// // //       ref: "User",
// // //       required: true,
// // //     },
// // //   },
// // //   { timestamps: true }
// // // );

// // // export default mongoose.model("Property", propertySchema);
