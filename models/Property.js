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
