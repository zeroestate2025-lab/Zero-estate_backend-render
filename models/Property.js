import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["House", "Apartment", "Office", "Land"], // dropdown
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    contact: { type: String, required: true },

    // Address-related
    location: { type: String, required: true }, // full address
    mapLocation: { type: String },              // Google Maps link or coordinates
    state: { type: String, required: true },    // dropdown
    district: { type: String, required: true }, // dropdown
    subDistrict: { type: String },              // dropdown
    landmark: { type: String },                 // nearby place

    // Property details
    sqft: { type: Number },                     // size in sqft
    bedrooms: { type: String, default: "1" },   // dropdown
    bathrooms: { type: String, default: "1" },  // dropdown
    kitchen: { type: String, default: "Yes" },  // dropdown
    amenities: { type: String },                // comma-separated
    interior: { type: String },                 // description
    construction: { type: String },             // description

    // Media
    images: [{ type: String }], // store image URLs

    // Owner reference
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Property", propertySchema);
