
// controllers/propertyController.js
import Property from "../models/Property.js";
import User from "../models/User.js";

// --------------------------------------------------
// 🔹 Add Property (Base64 images included)
// --------------------------------------------------
export const addProperty = async (req, res) => {
  try {
    const { category, title, price, contact, location, state, district, images } = req.body;

    if (!category || !title || !price || !contact || !location || !state || !district) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newProperty = new Property({
      ...req.body,
      owner: req.user._id,
      images, // ✅ array of Base64 strings
    });

    const saved = await newProperty.save();
    res.status(201).json({
      message: "Property added successfully",
      property: {
        id: saved._id,
        title: saved.title,
        price: saved.price,
        location: saved.location,
        state: saved.state,
        district: saved.district,
        category: saved.category,
      },
    });
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Get All Properties (Lightweight List)
// --------------------------------------------------
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find()
//       .select("title price category location state district owner createdAt")
//       .populate("owner", "name phone");
//     res.json(properties);
//   } catch (error) {
//     console.error("Get Properties Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const getProperties = async (req, res) => {
  try {
    // Select basic info + only first image
    const properties = await Property.find()
      .select("title price category location state district owner images createdAt")
      .populate("owner", "name phone");

    // Send only the first image from images array
    const lightProps = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      location: p.location,
      state: p.state,
      district: p.district,
      owner: p.owner,
      createdAt: p.createdAt,
      thumbnail: p.images?.length > 0 ? p.images[0] : null,
    }));

    res.json(lightProps);
  } catch (error) {
    console.error("Get Properties Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Get Property by ID (Full details with images)
// --------------------------------------------------
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("owner", "name phone");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (error) {
    console.error("Get Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Update Property
// --------------------------------------------------
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }  

    Object.assign(property, req.body);
    const updated = await property.save();
    res.json({ message: "Property updated successfully", property: updated });
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
  console.log("Update Property Request Body:", req.body);
  console.log("Property ID:", req.params.id);
};

// --------------------------------------------------
// 🔹 Delete Property
// --------------------------------------------------
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.deleteOne();
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Save / Unsave Property for User
// --------------------------------------------------
export const saveProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.savedProperties.includes(req.params.id)) {
      user.savedProperties.push(req.params.id);
      await user.save();
    }
    res.json({ message: "Property saved successfully" });
  } catch (error) {
    console.error("Save Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unsaveProperty = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.savedProperties = user.savedProperties.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();
    res.json({ message: "Property unsaved successfully" });
  } catch (error) {
    console.error("Unsave Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Get Saved Properties (User’s favorites)
// --------------------------------------------------
// export const getSavedProperties = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id).populate({
//       path: "savedProperties",
//       select: "title price category location state district",
//     });
//     res.json(user.savedProperties);
//   } catch (error) {
//     console.error("Get Saved Properties Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// --------------------------------------------------
// 🔹 Get Saved Properties (User’s Favorites with Thumbnail)
// --------------------------------------------------
export const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedProperties",
      select:
        "title price category location state district images bedrooms bathrooms kitchen sqft mapLocation createdAt",
    });

    // ✅ Return lightweight object with only one Base64 image (thumbnail)
    const savedList = user.savedProperties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      location: p.location,
      state: p.state,
      district: p.district,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      kitchen: p.kitchen,
      sqft: p.sqft,
      mapLocation: p.mapLocation,
      thumbnail: p.images?.length > 0 ? p.images[0] : null, // ✅ first Base64 image only
    }));

    res.json(savedList);
  } catch (error) {
    console.error("Get Saved Properties Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// --------------------------------------------------
// 🔹 Get My Properties (Owned by current user)
// --------------------------------------------------
// export const getMyProperties = async (req, res) => {
//   try {
//     const properties = await Property.find({ owner: req.user._id }).select(
//       "title price category location state district createdAt"
//     );
//     res.json(properties);
//   } catch (error) {
//     console.error("Get My Properties Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// --------------------------------------------------
// 🔹 Get My Listed Properties (With Thumbnail)
// --------------------------------------------------
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .select(
        "title price category location state district bedrooms bathrooms kitchen sqft images mapLocation createdAt"
      )
      .populate("owner", "name phone");

    // ✅ Return lightweight list with only one Base64 thumbnail
    const listedProps = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      location: p.location,
      state: p.state,
      district: p.district,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      kitchen: p.kitchen,
      sqft: p.sqft,
      mapLocation: p.mapLocation,
      thumbnail: p.images?.length > 0 ? p.images[0] : null,
    }));

    res.json(listedProps);
  } catch (error) {
    console.error("Get My Properties Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// import Property from "../models/Property.js";
// import User from "../models/User.js";

// // Add property (with Base64 images)
// export const addProperty = async (req, res) => {
//   try {
//     const { category, title, price, contact, location, state, district, images } = req.body;

//     if (!category || !title || !price || !contact || !location || !state || !district) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const newProperty = new Property({
//       ...req.body,
//       owner: req.user._id,
//       images, // array of base64 strings
//     });

//     const saved = await newProperty.save();
//     res.status(201).json(saved);
//   } catch (error) {
//     console.error("Error adding property:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get all properties
// export const getProperties = async (req, res) => {
//   try {
//     const properties = await Property.find().populate("owner", "name phone");
//     res.json(properties);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get property by ID
// export const getPropertyById = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id).populate("owner", "name phone");
//     if (!property) return res.status(404).json({ message: "Property not found" });
//     res.json(property);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update property
// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);

//     if (!property) return res.status(404).json({ message: "Not found" });
//     if (property.owner.toString() !== req.user._id.toString())
//       return res.status(403).json({ message: "Not authorized" });

//     Object.assign(property, req.body);
//     const updated = await property.save();
//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Delete property
// export const deleteProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property) return res.status(404).json({ message: "Not found" });

//     if (property.owner.toString() !== req.user._id.toString())
//       return res.status(403).json({ message: "Not authorized" });

//     await property.deleteOne();
//     res.json({ message: "Property deleted" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Save property
// export const saveProperty = async (req, res) => {
//   const user = await User.findById(req.user._id);
//   if (!user.savedProperties.includes(req.params.id)) {
//     user.savedProperties.push(req.params.id);
//     await user.save();
//   }
//   res.json({ message: "Property saved" });
// };

// // Unsave property
// export const unsaveProperty = async (req, res) => {
//   const user = await User.findById(req.user._id);
//   user.savedProperties = user.savedProperties.filter(
//     (id) => id.toString() !== req.params.id
//   );
//   await user.save();
//   res.json({ message: "Property unsaved" });
// };

// // Get saved properties
// export const getSavedProperties = async (req, res) => {
//   const user = await User.findById(req.user._id).populate("savedProperties");
//   res.json(user.savedProperties);
// };

// // Get my properties
// export const getMyProperties = async (req, res) => {
//   const properties = await Property.find({ owner: req.user._id });
//   res.json(properties);
// };

// // import Property from "../models/Property.js";
// // import User from "../models/User.js";

// // export const addProperty = async (req, res) => {
// //   try {
// //     const {
// //       category,
// //       title,
// //       price,
// //       contact,
// //       location,
// //       mapLocation,
// //       state,
// //       district,
// //       subDistrict,
// //       landmark,
// //       sqft,
// //       bedrooms,
// //       bathrooms,
// //       kitchen,
// //       amenities,
// //       interior,
// //       construction,
// //       images,
// //     } = req.body;

// //     if (!title || !price || !contact || !location || !category || !state || !district) {
// //       return res.status(400).json({
// //         error:
// //           "Missing required fields: title, price, contact, location, category, state, district",
// //       });
// //     }

// //     const property = new Property({
// //       category,
// //       title,
// //       price,
// //       contact,
// //       location,
// //       mapLocation: mapLocation || "",
// //       state,
// //       district,
// //       subDistrict: subDistrict || "",
// //       landmark: landmark || "",
// //       sqft: sqft || null,
// //       bedrooms: bedrooms || "1",
// //       bathrooms: bathrooms || "1",
// //       kitchen: kitchen || "Yes",
// //       amenities: amenities || "",
// //       interior: interior || "",
// //       construction: construction || "",
// //       images: images || [],
// //       owner: req.user._id,
// //     });

// //     await property.save();
// //     res.status(201).json({ success: true, message: "Property added", property });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // // 📌 Get all or filtered properties
// // export const getProperties = async (req, res) => {
// //   try {
// //     const {
// //       category,
// //       minPrice,
// //       maxPrice,
// //       minSize,
// //       maxSize,
// //       state,
// //       district,
// //       subDistrict,
// //       bedrooms,
// //       bathrooms,
// //       kitchen,
// //     } = req.query;

// //     const query = {};

// //     if (category && category !== "All") {
// //       query.category = { $regex: new RegExp(category, "i") };
// //     }

// //     if (state) query.state = state;
// //     if (district) query.district = district;
// //     if (subDistrict) query.subDistrict = subDistrict;

// //     // ✅ Numeric range filters
// //     if (minPrice || maxPrice)
// //       query.price = {
// //         ...(minPrice ? { $gte: parseInt(minPrice) } : {}),
// //         ...(maxPrice ? { $lte: parseInt(maxPrice) } : {}),
// //       };

// //     if (minSize || maxSize)
// //       query.sqft = {
// //         ...(minSize ? { $gte: parseInt(minSize) } : {}),
// //         ...(maxSize ? { $lte: parseInt(maxSize) } : {}),
// //       };

// //     if (bedrooms) query.bedrooms = bedrooms;
// //     if (bathrooms) query.bathrooms = bathrooms;
// //     if (kitchen) query.kitchen = { $regex: new RegExp(kitchen, "i") };

// //     const properties = await Property.find(query).populate("owner", "name phone");
// //     res.json(properties);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };
// // // // ➕ Add new property
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       category,
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation,
// // //       state,
// // //       district,
// // //       subDistrict,
// // //       landmark,
// // //       sqft,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       interior,
// // //       construction,
// // //       images,
// // //     } = req.body;

// // //     if (!title || !price || !contact || !location || !category || !state || !district) {
// // //       return res.status(400).json({
// // //         error: "Missing required fields: title, price, contact, location, category, state, district",
// // //       });
// // //     }

// // //     const property = new Property({
// // //       category,
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation: mapLocation || "",
// // //       state,
// // //       district,
// // //       subDistrict: subDistrict || "",
// // //       landmark: landmark || "",
// // //       sqft: sqft || null,
// // //       bedrooms: bedrooms || "1",
// // //       bathrooms: bathrooms || "1",
// // //       kitchen: kitchen || "Yes",
// // //       amenities: amenities || "",
// // //       interior: interior || "",
// // //       construction: construction || "",
// // //       images: images || [],
// // //       owner: req.user._id,
// // //     });

// // //     await property.save();
// // //     res.status(201).json({ success: true, message: "Property added successfully", property });
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Server error: " + err.message });
// // //   }
// // // };

// // // // 📌 Get all or filtered properties
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const { type } = req.query; // ?type=Godown
// // //     const query = {};

// // //     if (type && type !== "All") {
// // //       query.category = { $regex: new RegExp(`^${type}$`, "i") }; // ✅ Case-insensitive match
// // //     }

// // //     const properties = await Property.find(query).populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // 📌 Get property by ID
// // export const getPropertyById = async (req, res) => {
// //   try {
// //     const property = await Property.findById(req.params.id).populate("owner", "name phone");
// //     if (!property) return res.status(404).json({ error: "Not found" });
// //     res.json(property);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // // ⭐ Save property
// // export const saveProperty = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     if (!user.savedProperties.includes(req.params.id)) {
// //       user.savedProperties.push(req.params.id);
// //       await user.save();
// //     }
// //     res.json({ message: "Saved" });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // ❌ Unsave property
// // export const unsaveProperty = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id);
// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     user.savedProperties = user.savedProperties.filter(
// //       (p) => p.toString() !== req.params.id
// //     );
// //     await user.save();
// //     res.json({ message: "Removed from saved" });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // 📌 Get saved properties
// // export const getSavedProperties = async (req, res) => {
// //   try {
// //     const user = await User.findById(req.user._id).populate("savedProperties");
// //     res.json(user.savedProperties);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // 👤 Get my properties
// // export const getMyProperties = async (req, res) => {
// //   try {
// //     const properties = await Property.find({ owner: req.user._id }).populate("owner", "name phone");
// //     res.json(properties);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // ✏️ Update property
// // export const updateProperty = async (req, res) => {
// //   try {
// //     const property = await Property.findById(req.params.id);
// //     if (!property) return res.status(404).json({ error: "Property not found" });
// //     if (property.owner.toString() !== req.user._id.toString()) {
// //       return res.status(401).json({ error: "Not authorized" });
// //     }

// //     Object.assign(property, req.body);
// //     await property.save();
// //     res.json({ success: true, property });
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // // ❌ Delete property
// // export const deleteProperty = async (req, res) => {
// //   try {
// //     const property = await Property.findById(req.params.id);
// //     if (!property) return res.status(404).json({ message: "Property not found" });
// //     if (property.owner.toString() !== req.user._id.toString()) {
// //       return res.status(401).json({ message: "Not authorized" });
// //     }

// //     await property.deleteOne();
// //     res.json({ message: "Property deleted successfully" });
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // // import Property from "../models/Property.js";
// // // import User from "../models/User.js";

// // // // ➕ Add new property
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       category,
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation,
// // //       state,
// // //       district,
// // //       subDistrict,
// // //       landmark,
// // //       sqft,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       interior,
// // //       construction,
// // //       images,
// // //     } = req.body;

// // //     // Validation
// // //     if (!title || !price || !contact || !location || !category || !state || !district) {
// // //       return res.status(400).json({
// // //         error: "Missing required fields: title, price, contact, location, category, state, district",
// // //       });
// // //     }

// // //     const property = new Property({
// // //       category,
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation: mapLocation || "",
// // //       state,
// // //       district,
// // //       subDistrict: subDistrict || "",
// // //       landmark: landmark || "",
// // //       sqft: sqft || null,
// // //       bedrooms: bedrooms || "1",
// // //       bathrooms: bathrooms || "1",
// // //       kitchen: kitchen || "Yes",
// // //       amenities: amenities || "",
// // //       interior: interior || "",
// // //       construction: construction || "",
// // //       images: images || [],
// // //       owner: req.user._id, // from protect middleware
// // //     });

// // //     await property.save();

// // //     res.status(201).json({
// // //       success: true,
// // //       message: "Property added successfully",
// // //       property,
// // //     });
// // //   } catch (err) {
// // //     console.error("Add property error:", err.message);
// // //     res.status(500).json({ error: "Server error: " + err.message });
// // //   }
// // // };

// // // // 📌 Get all properties
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find().populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // 📌 Get property by ID
// // // export const getPropertyById = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id).populate("owner", "name phone");
// // //     if (!property) return res.status(404).json({ error: "Not found" });
// // //     res.json(property);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // ⭐ Save property
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     if (!user.savedProperties.includes(req.params.id)) {
// // //       user.savedProperties.push(req.params.id);
// // //       await user.save();
// // //     }
// // //     res.json({ message: "Saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ❌ Unsave property
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );
// // //     await user.save();
// // //     res.json({ message: "Removed from saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 📌 Get saved properties
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");
// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 👤 Get my properties
// // // export const getMyProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find({ owner: req.user._id }).populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ✏️ Update property
// // // export const updateProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) {
// // //       return res.status(404).json({ error: "Property not found" });
// // //     }

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ error: "Not authorized to update this property" });
// // //     }

// // //     // Update only provided fields
// // //     Object.assign(property, {
// // //       category: req.body.category ?? property.category,
// // //       title: req.body.title ?? property.title,
// // //       price: req.body.price ?? property.price,
// // //       contact: req.body.contact ?? property.contact,
// // //       location: req.body.location ?? property.location,
// // //       mapLocation: req.body.mapLocation ?? property.mapLocation,
// // //       state: req.body.state ?? property.state,
// // //       district: req.body.district ?? property.district,
// // //       subDistrict: req.body.subDistrict ?? property.subDistrict,
// // //       landmark: req.body.landmark ?? property.landmark,
// // //       sqft: req.body.sqft ?? property.sqft,
// // //       bedrooms: req.body.bedrooms ?? property.bedrooms,
// // //       bathrooms: req.body.bathrooms ?? property.bathrooms,
// // //       kitchen: req.body.kitchen ?? property.kitchen,
// // //       amenities: req.body.amenities ?? property.amenities,
// // //       interior: req.body.interior ?? property.interior,
// // //       construction: req.body.construction ?? property.construction,
// // //       images: req.body.images ?? property.images,
// // //     });

// // //     await property.save();

// // //     res.json({ success: true, property });
// // //   } catch (err) {
// // //     console.error("Update Property Error:", err.message);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // ❌ Delete property
// // // export const deleteProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) {
// // //       return res.status(404).json({ message: "Property not found" });
// // //     }

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ message: "Not authorized" });
// // //     }

// // //     await property.deleteOne();
// // //     res.json({ message: "Property deleted successfully" });
// // //   } catch (err) {
// // //     console.error("Delete Property Error:", err.message);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // import Property from "../models/Property.js";
// // // import User from "../models/User.js";

// // // // ➕ Add new property
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       title,
// // //       price,
// // //       location,
// // //       mapLocation,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       contact,
// // //       category,
// // //       images,
// // //     } = req.body;

// // //     if (!title || !price || !contact || !location || !category) {
// // //       return res.status(400).json({
// // //         error: "Missing required fields: title, price, contact, location, category",
// // //       });
// // //     }

// // //     const property = new Property({
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       category,
// // //       mapLocation: mapLocation || "",
// // //       bedrooms: bedrooms || 0,
// // //       bathrooms: bathrooms || 0,
// // //       kitchen: kitchen || "No",
// // //       amenities: amenities || "",
// // //       images: images || [],
// // //       owner: req.user._id, // from protect middleware
// // //     });

// // //     await property.save();

// // //     res.status(201).json({
// // //       success: true,
// // //       message: "Property added successfully",
// // //       property,
// // //     });
// // //   } catch (err) {
// // //     console.error("Add property error:", err.message);
// // //     res.status(500).json({ error: "Server error: " + err.message });
// // //   }
// // // };

// // // // 📌 Get all properties
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find().populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // 📌 Get property by ID
// // // export const getPropertyById = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id).populate("owner", "name phone");
// // //     if (!property) return res.status(404).json({ error: "Not found" });
// // //     res.json(property);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // ⭐ Save property
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     if (!user.savedProperties.includes(req.params.id)) {
// // //       user.savedProperties.push(req.params.id);
// // //       await user.save();
// // //     }
// // //     res.json({ message: "Saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ❌ Unsave property
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );
// // //     await user.save();
// // //     res.json({ message: "Removed from saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 📌 Get saved properties
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");
// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 👤 Get my properties
// // // export const getMyProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find({ owner: req.user._id }).populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ✏️ Update property
// // // export const updateProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) {
// // //       return res.status(404).json({ error: "Property not found" });
// // //     }

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ error: "Not authorized to update this property" });
// // //     }

// // //     Object.assign(property, req.body);
// // //     await property.save();

// // //     res.json({ success: true, property });
// // //   } catch (err) {
// // //     console.error("Update Property Error:", err.message);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // ❌ Delete property
// // // export const deleteProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) {
// // //       return res.status(404).json({ message: "Property not found" });
// // //     }

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ message: "Not authorized" });
// // //     }

// // //     await property.deleteOne();
// // //     res.json({ message: "Property deleted successfully" });
// // //   } catch (err) {
// // //     console.error("Delete Property Error:", err.message);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // import Property from "../models/Property.js";
// // // import User from "../models/User.js";

// // // // ➕ Add new property
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       title,
// // //       price,
// // //       location,
// // //       mapLocation,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       contact,
// // //       category,
// // //       images,
// // //     } = req.body;

// // //     // ✅ Validation: check required fields
// // //     if (!title || !price || !contact || !location || !category) {
// // //       return res.status(400).json({
// // //         error: "Missing required fields: title, price, contact, location, category",
// // //       });
// // //     }

// // //     // ✅ Save property with logged-in user as owner
// // //     const property = new Property({
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       category,
// // //       mapLocation: mapLocation || "",
// // //       bedrooms: bedrooms || 0,
// // //       bathrooms: bathrooms || 0,
// // //       kitchen: kitchen || "No",
// // //       amenities: amenities || "",
// // //       images: images || [],
// // //       owner: req.user._id, // comes from protect middleware
// // //     });

// // //     await property.save();

// // //     res.status(201).json({
// // //       success: true,
// // //       message: "Property added successfully",
// // //       property,
// // //     });
// // //   } catch (err) {
// // //     console.error("Add property error:", err.message);
// // //     res.status(500).json({ error: "Server error: " + err.message });
// // //   }
// // // };

// // // // // ➕ Add new property
// // // // export const addProperty = async (req, res) => {
// // // //   try {
// // // //     const {
// // // //       title,
// // // //       price,
// // // //       location,
// // // //       mapLocation,
// // // //       bedrooms,
// // // //       bathrooms,
// // // //       kitchen,
// // // //       amenities,
// // // //       contact,
// // // //       category,
// // // //       images,
// // // //     } = req.body;

// // // //     // ✅ Save property with logged-in user as owner
// // // //     const property = new Property({
// // // //       title,
// // // //       price,
// // // //       contact, // use owner's contact
// // // //       location,
// // // //       category,
// // // //       mapLocation,
// // // //       bedrooms,
// // // //       bathrooms,
// // // //       kitchen,
// // // //       amenities,
// // // //       images,
// // // //       owner: req.user._id,
// // // //     });

// // // //     await property.save();
// // // //     res.status(201).json(property);
// // // //   } catch (err) {
// // // //     res.status(500).json({ error: err.message });
// // // //   }
// // // // };

// // // // 📌 Get all properties
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find().populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // 📌 Get property by ID
// // // export const getPropertyById = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id).populate(
// // //       "owner",
// // //       "name phone"
// // //     );
// // //     if (!property) return res.status(404).json({ error: "Not found" });
// // //     res.json(property);
// // //   } catch (err) {
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // ⭐ Save property
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     if (!user.savedProperties.includes(req.params.id)) {
// // //       user.savedProperties.push(req.params.id);
// // //       await user.save();
// // //     }
// // //     res.json({ message: "Saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ❌ Unsave property
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);
// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );
// // //     await user.save();
// // //     res.json({ message: "Removed from saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 📌 Get saved properties
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");
// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // 👤 Get my properties
// // // export const getMyProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find({ owner: req.user._id }).populate(
// // //       "owner",
// // //       "name phone"
// // //     );
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // update property (only owner)
// // // // Update Property
// // // export const updateProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);

// // //     if (!property) {
// // //       return res.status(404).json({ error: "Property not found" });
// // //     }

// // //     // ✅ Only owner can update
// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ error: "Not authorized to update this property" });
// // //     }

// // //     Object.assign(property, req.body); // update fields
// // //     await property.save();

// // //     res.json({ success: true, property });
// // //   } catch (err) {
// // //     console.error("Update Property Error:", err.message);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // Delete Property
// // // // ❌ Delete Property
// // // export const deleteProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);

// // //     if (!property) {
// // //       return res.status(404).json({ message: "Property not found" });
// // //     }

// // //     // ✅ Ensure only the owner can delete
// // //     if (property.user.toString() !== req.user._id.toString()) {
// // //       return res.status(401).json({ message: "Not authorized" });
// // //     }

// // //     await property.deleteOne();

// // //     res.json({ message: "Property deleted successfully" });
// // //   } catch (err) {
// // //     console.error("Delete Property Error:", err.message);
// // //     res.status(500).json({ message: "Server error" });
// // //   }
// // // };

// // // import Property from "../models/Property.js";
// // // import User from "../models/User.js";


// // // // --------------------- ADD PROPERTY ---------------------
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       title,
// // //       price,
// // //       location,
// // //       mapLocation,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       images,
// // //     } = req.body;

// // //     const property = new Property({
// // //       ...req.body,
// // //       owner: req.user._id, // ✅ logged-in user is always the owner
// // //     });

// // //     await property.save();
// // //     res.status(201).json({
// // //       message: "Property added successfully",
// // //       property,
// // //     });
// // //   } catch (err) {
// // //     console.error("ADD PROPERTY ERROR:", err);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // --------------------- GET ALL PROPERTIES ---------------------
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find().populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     console.error("GET PROPERTIES ERROR:", err);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // --------------------- GET PROPERTY BY ID ---------------------
// // // export const getPropertyById = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id).populate(
// // //       "owner",
// // //       "name phone"
// // //     );

// // //     if (!property) {
// // //       return res.status(404).json({ error: "Property not found" });
// // //     }

// // //     res.json(property);
// // //   } catch (err) {
// // //     console.error("GET PROPERTY ERROR:", err);
// // //     res.status(500).json({ error: err.message });
// // //   }
// // // };

// // // // --------------------- SAVE PROPERTY ---------------------
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     if (!user.savedProperties.includes(req.params.id)) {
// // //       user.savedProperties.push(req.params.id);
// // //       await user.save();
// // //     }

// // //     res.json({ message: "Property saved successfully" });
// // //   } catch (err) {
// // //     console.error("SAVE PROPERTY ERROR:", err);
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // --------------------- UNSAVE PROPERTY ---------------------
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );

// // //     await user.save();

// // //     res.json({ message: "Property removed from saved" });
// // //   } catch (err) {
// // //     console.error("UNSAVE PROPERTY ERROR:", err);
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // --------------------- GET ALL SAVED ---------------------
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     console.error("GET SAVED PROPERTIES ERROR:", err);
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // --------------------- GET PROPERTIES BY LOGGED-IN USER ---------------------
// // // export const getMyProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find({ owner: req.user._id }).populate(
// // //       "owner",
// // //       "name phone"
// // //     );

// // //     res.json(properties);
// // //   } catch (err) {
// // //     console.error("GET MY PROPERTIES ERROR:", err);
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };


// // // // controllers/propertyController.js
// // // import Property from "../models/Property.js";
// // // import User from "../models/User.js";

// // // // ✅ Add new property
// // // export const addProperty = async (req, res) => {
// // //   try {
// // //     const {
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       interior,
// // //       construction,
// // //       images,
// // //       category, // 👈 House/Apartment/Office/Land
// // //     } = req.body;

// // //     const property = new Property({
// // //       title,
// // //       price,
// // //       contact,
// // //       location,
// // //       mapLocation,
// // //       bedrooms,
// // //       bathrooms,
// // //       kitchen,
// // //       amenities,
// // //       interior,
// // //       construction,
// // //       images,
// // //       category,
// // //       owner: req.user._id,
// // //     });

// // //     await property.save();
// // //     res.status(201).json({ message: "Property added successfully", property });
// // //   } catch (err) {
// // //     console.error("ADD PROPERTY ERROR:", err.message);
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // };

// // // // ✅ Get all properties
// // // export const getProperties = async (req, res) => {
// // //   try {
// // //     const properties = await Property.find().populate("owner", "name phone");
// // //     res.json(properties);
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // };

// // // // ✅ Get property by ID
// // // export const getPropertyById = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id).populate("owner", "name phone");
// // //     if (!property) return res.status(404).json({ error: "Property not found" });
// // //     res.json(property);
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // };

// // // // ✅ Update property (only owner)
// // // export const updateProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) return res.status(404).json({ error: "Property not found" });

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(403).json({ error: "Not authorized" });
// // //     }

// // //     const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, {
// // //       new: true,
// // //     });

// // //     res.json({ message: "Property updated", property: updatedProperty });
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // };

// // // // ✅ Delete property (only owner)
// // // export const deleteProperty = async (req, res) => {
// // //   try {
// // //     const property = await Property.findById(req.params.id);
// // //     if (!property) return res.status(404).json({ error: "Property not found" });

// // //     if (property.owner.toString() !== req.user._id.toString()) {
// // //       return res.status(403).json({ error: "Not authorized" });
// // //     }

// // //     await property.deleteOne();
// // //     res.json({ message: "Property deleted successfully" });
// // //   } catch (err) {
// // //     res.status(500).json({ error: "Server error" });
// // //   }
// // // };

// // // // Save a property
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     // If already saved
// // //     if (user.savedProperties.includes(req.params.id)) {
// // //       return res.status(400).json({ message: "Property already saved" });
// // //     }

// // //     user.savedProperties.push(req.params.id);
// // //     await user.save();  // ✅ Make sure to save

// // //     res.json({ message: "Property saved successfully", savedProperties: user.savedProperties });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // Unsave a property
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );

// // //     await user.save(); // ✅ Save back

// // //     res.json({ message: "Property removed from saved", savedProperties: user.savedProperties });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // Get all saved properties
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ✅ Save a property
// // // export const saveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //      // If already saved
// // //     if (user.savedProperties.includes(req.params.id)) {
// // //       return res.status(400).json({ message: "Property already saved" });
// // //     }

// // //     res.json({ message: "Property saved successfully" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ✅ Unsave a property
// // // export const unsaveProperty = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id);

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     user.savedProperties = user.savedProperties.filter(
// // //       (p) => p.toString() !== req.params.id
// // //     );

// // //     await user.save();

// // //     res.json({ message: "Property removed from saved" });
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };

// // // // ✅ Get all saved properties
// // // export const getSavedProperties = async (req, res) => {
// // //   try {
// // //     const user = await User.findById(req.user._id).populate("savedProperties");

// // //     if (!user) return res.status(404).json({ message: "User not found" });

// // //     res.json(user.savedProperties);
// // //   } catch (err) {
// // //     res.status(500).json({ message: err.message });
// // //   }
// // // };
