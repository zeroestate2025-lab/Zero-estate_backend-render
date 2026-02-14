// controllers/propertyController.js
import Property from "../models/Property.js";
import User from "../models/User.js";

// --------------------------------------------------
// 🔹 Add Property (includes propertyPreference + Base64 images)
// --------------------------------------------------
export const addProperty = async (req, res) => {
  try {
    const {
      category,
      propertyPreference,
      title,
      price,
      contact,
      location,
      mapLocation,
      state,
      district,
      landmark,
      propertySize,
      propertyUnit,
      bedrooms,
      bathrooms,
      kitchen,
      amenities,        // ✅ SAME FIELD
      construction,
      images,
    } = req.body;

    if (
      !category ||
      !propertyPreference ||
      !title ||
      !price ||
      !contact ||
      !location ||
      !state ||
      !district
    ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const newProperty = new Property({
      category,
      propertyPreference,
      title,
      price,           // ✅ string like "2 crore"
      contact,
      location,
      mapLocation,
      state,
      district,
      landmark,
      propertySize,
      propertyUnit,
      bedrooms,
      bathrooms,
      kitchen,
      amenities,       // ✅ SAME FIELD
      construction,
      images,
      owner: req.user._id,
    });

    const saved = await newProperty.save();

    res.status(201).json({
      message: "Property added successfully",
      property: saved,
    });
  } catch (error) {
    console.error("Add Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const addProperty = async (req, res) => {
//   console.log("🔥 req.body.propertyPreference:", req.body.propertyPreference);
//  console.log("🧩 Schema fields:", Object.keys(Property.schema.paths));

//   try {
//     const {
//       category,
//       propertyPreference,
//       title,
//       price,
//       contact,
//       location,
//       state,
//       district,
//       images,
//     } = req.body;

//     if (
//       !category ||
//       !propertyPreference ||
//       !title ||
//       !price ||
//       !contact ||
//       !location ||
//       !state ||
//       !district
//     ) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     const newProperty = new Property({
//       ...req.body,
//       owner: req.user._id,
//       images,
//     });

//     const saved = await newProperty.save();

  
//     res.status(201).json({
//       message: "Property added successfully",
//       property: {
//         id: saved._id,
//         title: saved.title,
//         price: saved.price,
//         location: saved.location,
//         state: saved.state,
//         district: saved.district,
//         category: saved.category,
//         propertyPreference: saved.propertyPreference,
//       },
//       consoleLog: `💾 Saved property: ${saved}`, // 👈 debug log
//     });
//   } catch (error) {
//     console.error("Error adding property:", error);
//     res.status(500).json({ message: "Server error" });
//   }
//   console.log("Schema keys:", Object.keys(Property.schema.paths));

// };

// --------------------------------------------------
// 🔹 Get All Properties (Lightweight List with Filter Support)
// --------------------------------------------------
export const getProperties = async (req, res) => {
  try {
    const { type } = req.query; // optional query like ?type=Rent or ?type=Sale
    let filter = {};

    if (type && ["Sale", "Rent"].includes(type)) {
      filter.propertyPreference = type;
    }

    const properties = await Property.find(filter)
      .select(
        "title price category propertyPreference location state district owner images createdAt"
      )
      .populate("owner", "name phone");

    // Send only lightweight list with thumbnail
    const lightProps = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      propertyPreference: p.propertyPreference,
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
// 🔹 Get Property by ID (Full details)
// --------------------------------------------------
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      "owner",
      "name phone"
    );
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    res.json(property);
  } catch (error) {
    console.error("Get Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Update Property (including preference)
// // --------------------------------------------------
// export const updateProperty = async (req, res) => {
//   try {
//     const property = await Property.findById(req.params.id);
//     if (!property)
//       return res.status(404).json({ message: "Property not found" });

//     if (property.owner.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     Object.assign(property, req.body);
//     const updated = await property.save();

//     res.json({
//       message: "Property updated successfully",
//       property: updated,
//     });
//   } catch (error) {
//     console.error("Update Property Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
//   console.log("Update Property Request Body:", req.body);
//   console.log("Property ID:", req.params.id);
// };
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedFields = [
      "category",
      "propertyPreference",
      "title",
      "price",
      "contact",
      "location",
      "mapLocation",
      "state",
      "district",
      "landmark",
      "propertySize",
      "propertyUnit",
      "bedrooms",
      "bathrooms",
      "kitchen",
      "amenities",      // ✅ SAME FIELD
      "construction",
      "images",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        property[field] = req.body[field];
      }
    });

    const updated = await property.save();

    res.json({
      message: "Property updated successfully",
      property: updated,
    });
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Delete Property
// --------------------------------------------------
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

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
// 🔹 Save / Unsave Property
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
// 🔹 Get Saved Properties (User Favorites with Thumbnail + Preference)
// --------------------------------------------------
export const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedProperties",
      select:
        "title price category propertyPreference location state district images bedrooms bathrooms kitchen sqft mapLocation createdAt",
    });

    const savedList = user.savedProperties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      propertyPreference: p.propertyPreference,
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

    res.json(savedList);
  } catch (error) {
    console.error("Get Saved Properties Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------------------------------------
// 🔹 Get My Properties (Owned by logged-in user)
// --------------------------------------------------
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .select(
        "title price category propertyPreference location state district bedrooms bathrooms kitchen sqft images mapLocation createdAt"
      )
      .populate("owner", "name phone");

    const listedProps = properties.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      category: p.category,
      propertyPreference: p.propertyPreference,
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

