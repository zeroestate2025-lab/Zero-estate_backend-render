
import Property from "../models/Property.js";
import User from "../models/User.js";

// ➕ Add new property
export const addProperty = async (req, res) => {
  try {
    const {
      category,
      title,
      price,
      contact,
      location,
      mapLocation,
      state,
      district,
      subDistrict,
      landmark,
      sqft,
      bedrooms,
      bathrooms,
      kitchen,
      amenities,
      interior,
      construction,
      images,
    } = req.body;

    // Validation
    if (!title || !price || !contact || !location || !category || !state || !district) {
      return res.status(400).json({
        error: "Missing required fields: title, price, contact, location, category, state, district",
      });
    }

    const property = new Property({
      category,
      title,
      price,
      contact,
      location,
      mapLocation: mapLocation || "",
      state,
      district,
      subDistrict: subDistrict || "",
      landmark: landmark || "",
      sqft: sqft || null,
      bedrooms: bedrooms || "1",
      bathrooms: bathrooms || "1",
      kitchen: kitchen || "Yes",
      amenities: amenities || "",
      interior: interior || "",
      construction: construction || "",
      images: images || [],
      owner: req.user._id, // from protect middleware
    });

    await property.save();

    res.status(201).json({
      success: true,
      message: "Property added successfully",
      property,
    });
  } catch (err) {
    console.error("Add property error:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// 📌 Get all properties
export const getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate("owner", "name phone");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name phone");
    if (!property) return res.status(404).json({ error: "Not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ Save property
export const saveProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.savedProperties.includes(req.params.id)) {
      user.savedProperties.push(req.params.id);
      await user.save();
    }
    res.json({ message: "Saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Unsave property
export const unsaveProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.savedProperties = user.savedProperties.filter(
      (p) => p.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: "Removed from saved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get saved properties
export const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedProperties");
    res.json(user.savedProperties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👤 Get my properties
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).populate("owner", "name phone");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized to update this property" });
    }

    // Update only provided fields
    Object.assign(property, {
      category: req.body.category ?? property.category,
      title: req.body.title ?? property.title,
      price: req.body.price ?? property.price,
      contact: req.body.contact ?? property.contact,
      location: req.body.location ?? property.location,
      mapLocation: req.body.mapLocation ?? property.mapLocation,
      state: req.body.state ?? property.state,
      district: req.body.district ?? property.district,
      subDistrict: req.body.subDistrict ?? property.subDistrict,
      landmark: req.body.landmark ?? property.landmark,
      sqft: req.body.sqft ?? property.sqft,
      bedrooms: req.body.bedrooms ?? property.bedrooms,
      bathrooms: req.body.bathrooms ?? property.bathrooms,
      kitchen: req.body.kitchen ?? property.kitchen,
      amenities: req.body.amenities ?? property.amenities,
      interior: req.body.interior ?? property.interior,
      construction: req.body.construction ?? property.construction,
      images: req.body.images ?? property.images,
    });

    await property.save();

    res.json({ success: true, property });
  } catch (err) {
    console.error("Update Property Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("Delete Property Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// import Property from "../models/Property.js";
// import User from "../models/User.js";

// // ➕ Add new property
// export const addProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       location,
//       mapLocation,
//       bedrooms,
//       bathrooms,
//       kitchen,
//       amenities,
//       contact,
//       category,
//       images,
//     } = req.body;

//     if (!title || !price || !contact || !location || !category) {
//       return res.status(400).json({
//         error: "Missing required fields: title, price, contact, location, category",
//       });
//     }

//     const property = new Property({
//       title,
//       price,
//       contact,
//       location,
//       category,
//       mapLocation: mapLocation || "",
//       bedrooms: bedrooms || 0,
//       bathrooms: bathrooms || 0,
//       kitchen: kitchen || "No",
//       amenities: amenities || "",
//       images: images || [],
//       owner: req.user._id, // from protect middleware
//     });

//     await property.save();

//     res.status(201).json({
//       success: true,
//       message: "Property added successfully",
//       property,
//     });
//   } catch (err) {
//     console.error("Add property error:", err.message);
//     res.status(500).json({ error: "Server error: " + err.message });
//   }
// };

// // 📌 Get all properties
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate("owner", "name phone");
//     res.json(properties);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 📌 Get property by ID
// export const getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate("owner", "name phone");
//     if (!property) return res.status(404).json({ error: "Not found" });
//     res.json(property);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ⭐ Save property
// export const saveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.savedProperties.includes(req.params.id)) {
//       user.savedProperties.push(req.params.id);
//       await user.save();
//     }
//     res.json({ message: "Saved" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ❌ Unsave property
// export const unsaveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.savedProperties = user.savedProperties.filter(
//       (p) => p.toString() !== req.params.id
//     );
//     await user.save();
//     res.json({ message: "Removed from saved" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 📌 Get saved properties
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties");
//     res.json(user.savedProperties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 👤 Get my properties
// export const getMyProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ owner: req.user._id }).populate("owner", "name phone");
//     res.json(properties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✏️ Update property
// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ error: "Property not found" });
//     }

//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ error: "Not authorized to update this property" });
//     }

//     Object.assign(property, req.body);
//     await property.save();

//     res.json({ success: true, property });
//   } catch (err) {
//     console.error("Update Property Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // ❌ Delete property
// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     await property.deleteOne();
//     res.json({ message: "Property deleted successfully" });
//   } catch (err) {
//     console.error("Delete Property Error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// import Property from "../models/Property.js";
// import User from "../models/User.js";

// // ➕ Add new property
// export const addProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       location,
//       mapLocation,
//       bedrooms,
//       bathrooms,
//       kitchen,
//       amenities,
//       contact,
//       category,
//       images,
//     } = req.body;

//     // ✅ Validation: check required fields
//     if (!title || !price || !contact || !location || !category) {
//       return res.status(400).json({
//         error: "Missing required fields: title, price, contact, location, category",
//       });
//     }

//     // ✅ Save property with logged-in user as owner
//     const property = new Property({
//       title,
//       price,
//       contact,
//       location,
//       category,
//       mapLocation: mapLocation || "",
//       bedrooms: bedrooms || 0,
//       bathrooms: bathrooms || 0,
//       kitchen: kitchen || "No",
//       amenities: amenities || "",
//       images: images || [],
//       owner: req.user._id, // comes from protect middleware
//     });

//     await property.save();

//     res.status(201).json({
//       success: true,
//       message: "Property added successfully",
//       property,
//     });
//   } catch (err) {
//     console.error("Add property error:", err.message);
//     res.status(500).json({ error: "Server error: " + err.message });
//   }
// };

// // // ➕ Add new property
// // export const addProperty = async (req, res) => {
// //   try {
// //     const {
// //       title,
// //       price,
// //       location,
// //       mapLocation,
// //       bedrooms,
// //       bathrooms,
// //       kitchen,
// //       amenities,
// //       contact,
// //       category,
// //       images,
// //     } = req.body;

// //     // ✅ Save property with logged-in user as owner
// //     const property = new Property({
// //       title,
// //       price,
// //       contact, // use owner's contact
// //       location,
// //       category,
// //       mapLocation,
// //       bedrooms,
// //       bathrooms,
// //       kitchen,
// //       amenities,
// //       images,
// //       owner: req.user._id,
// //     });

// //     await property.save();
// //     res.status(201).json(property);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // 📌 Get all properties
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate("owner", "name phone");
//     res.json(properties);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 📌 Get property by ID
// export const getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate(
//       "owner",
//       "name phone"
//     );
//     if (!property) return res.status(404).json({ error: "Not found" });
//     res.json(property);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ⭐ Save property
// export const saveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.savedProperties.includes(req.params.id)) {
//       user.savedProperties.push(req.params.id);
//       await user.save();
//     }
//     res.json({ message: "Saved" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ❌ Unsave property
// export const unsaveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.savedProperties = user.savedProperties.filter(
//       (p) => p.toString() !== req.params.id
//     );
//     await user.save();
//     res.json({ message: "Removed from saved" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 📌 Get saved properties
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties");
//     res.json(user.savedProperties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 👤 Get my properties
// export const getMyProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ owner: req.user._id }).populate(
//       "owner",
//       "name phone"
//     );
//     res.json(properties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // update property (only owner)
// // Update Property
// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({ error: "Property not found" });
//     }

//     // ✅ Only owner can update
//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ error: "Not authorized to update this property" });
//     }

//     Object.assign(property, req.body); // update fields
//     await property.save();

//     res.json({ success: true, property });
//   } catch (err) {
//     console.error("Update Property Error:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete Property
// // ❌ Delete Property
// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     // ✅ Ensure only the owner can delete
//     if (property.user.toString() !== req.user._id.toString()) {
//       return res.status(401).json({ message: "Not authorized" });
//     }

//     await property.deleteOne();

//     res.json({ message: "Property deleted successfully" });
//   } catch (err) {
//     console.error("Delete Property Error:", err.message);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// import Property from "../models/Property.js";
// import User from "../models/User.js";


// // --------------------- ADD PROPERTY ---------------------
// export const addProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       location,
//       mapLocation,
//       bedrooms,
//       bathrooms,
//       kitchen,
//       amenities,
//       images,
//     } = req.body;

//     const property = new Property({
//       ...req.body,
//       owner: req.user._id, // ✅ logged-in user is always the owner
//     });

//     await property.save();
//     res.status(201).json({
//       message: "Property added successfully",
//       property,
//     });
//   } catch (err) {
//     console.error("ADD PROPERTY ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // --------------------- GET ALL PROPERTIES ---------------------
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate("owner", "name phone");
//     res.json(properties);
//   } catch (err) {
//     console.error("GET PROPERTIES ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // --------------------- GET PROPERTY BY ID ---------------------
// export const getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate(
//       "owner",
//       "name phone"
//     );

//     if (!property) {
//       return res.status(404).json({ error: "Property not found" });
//     }

//     res.json(property);
//   } catch (err) {
//     console.error("GET PROPERTY ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // --------------------- SAVE PROPERTY ---------------------
// export const saveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.savedProperties.includes(req.params.id)) {
//       user.savedProperties.push(req.params.id);
//       await user.save();
//     }

//     res.json({ message: "Property saved successfully" });
//   } catch (err) {
//     console.error("SAVE PROPERTY ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --------------------- UNSAVE PROPERTY ---------------------
// export const unsaveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.savedProperties = user.savedProperties.filter(
//       (p) => p.toString() !== req.params.id
//     );

//     await user.save();

//     res.json({ message: "Property removed from saved" });
//   } catch (err) {
//     console.error("UNSAVE PROPERTY ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --------------------- GET ALL SAVED ---------------------
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user.savedProperties);
//   } catch (err) {
//     console.error("GET SAVED PROPERTIES ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // --------------------- GET PROPERTIES BY LOGGED-IN USER ---------------------
// export const getMyProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ owner: req.user._id }).populate(
//       "owner",
//       "name phone"
//     );

//     res.json(properties);
//   } catch (err) {
//     console.error("GET MY PROPERTIES ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// // controllers/propertyController.js
// import Property from "../models/Property.js";
// import User from "../models/User.js";

// // ✅ Add new property
// export const addProperty = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       contact,
//       location,
//       mapLocation,
//       bedrooms,
//       bathrooms,
//       kitchen,
//       amenities,
//       interior,
//       construction,
//       images,
//       category, // 👈 House/Apartment/Office/Land
//     } = req.body;

//     const property = new Property({
//       title,
//       price,
//       contact,
//       location,
//       mapLocation,
//       bedrooms,
//       bathrooms,
//       kitchen,
//       amenities,
//       interior,
//       construction,
//       images,
//       category,
//       owner: req.user._id,
//     });

//     await property.save();
//     res.status(201).json({ message: "Property added successfully", property });
//   } catch (err) {
//     console.error("ADD PROPERTY ERROR:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Get all properties
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate("owner", "name phone");
//     res.json(properties);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Get property by ID
// export const getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate("owner", "name phone");
//     if (!property) return res.status(404).json({ error: "Property not found" });
//     res.json(property);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Update property (only owner)
// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) return res.status(404).json({ error: "Property not found" });

//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "Not authorized" });
//     }

//     const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });

//     res.json({ message: "Property updated", property: updatedProperty });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Delete property (only owner)
// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) return res.status(404).json({ error: "Property not found" });

//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "Not authorized" });
//     }

//     await property.deleteOne();
//     res.json({ message: "Property deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // Save a property
// export const saveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     // If already saved
//     if (user.savedProperties.includes(req.params.id)) {
//       return res.status(400).json({ message: "Property already saved" });
//     }

//     user.savedProperties.push(req.params.id);
//     await user.save();  // ✅ Make sure to save

//     res.json({ message: "Property saved successfully", savedProperties: user.savedProperties });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Unsave a property
// export const unsaveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.savedProperties = user.savedProperties.filter(
//       (p) => p.toString() !== req.params.id
//     );

//     await user.save(); // ✅ Save back

//     res.json({ message: "Property removed from saved", savedProperties: user.savedProperties });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get all saved properties
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user.savedProperties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Save a property
// export const saveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//      // If already saved
//     if (user.savedProperties.includes(req.params.id)) {
//       return res.status(400).json({ message: "Property already saved" });
//     }

//     res.json({ message: "Property saved successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Unsave a property
// export const unsaveProperty = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.savedProperties = user.savedProperties.filter(
//       (p) => p.toString() !== req.params.id
//     );

//     await user.save();

//     res.json({ message: "Property removed from saved" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Get all saved properties
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate("savedProperties");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user.savedProperties);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
