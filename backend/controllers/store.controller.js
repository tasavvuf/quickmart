const mongoose = require("mongoose");
const Store = require("../models/Store.model");
const Product = require("../models/Product.model");

const getAllStores = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        message: "Latitude and Longitude are required",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        message: "Invalid coordinates",
      });
    }

    const stores = await Store.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },

          distanceField: "distance",

          spherical: true,
          //max distace should be 10000 meters that is 10 km
          maxDistance: 10000,
        },
      },

      {
        $match: {
          isOpen: true,
          isVerifiedByAdmin: true,
        },
      },

      {
        $lookup: {
          from: "products",

          localField: "_id",

          foreignField: "store",

          as: "products",
        },
      },

      {
        $addFields: {
          products: {
            $filter: {
              input: "$products",
              as: "product",
              cond: {
                $and: [
                  {
                    $eq: ["$$product.featured", true],
                  },
                  {
                    $ne: ["$$product.status", "inactive"],
                  },
                  {
                    $gt: ["$$product.stock", 0],
                  },
                ],
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(storeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store = await Store.findById(storeId).lean();

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const products = await Product.find({
      store: storeId,
      status: { $ne: "inactive" },
    })
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      store: { ...store, products },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const parseStorePayload = (store) => {
  if (!store) {
    return {};
  }

  if (typeof store === "string") {
    try {
      return JSON.parse(store);
    } catch {
      return {};
    }
  }

  return store;
};

const requiredVendorStoreFields = [
  ["shopName", "Shop name is required"],
  ["businessType", "Business type is required"],
  ["address.street", "Street address is required"],
  ["address.area", "Area/locality is required"],
  ["address.pincode", "Pincode is required"],
  ["address.city", "City is required"],
  ["address.state", "State is required"],
];

const getValueAtPath = (source, path) => {
  return path.split(".").reduce((current, key) => current?.[key], source);
};

const validateVendorStorePayload = (storePayload) => {
  for (const [path, message] of requiredVendorStoreFields) {
    if (!getValueAtPath(storePayload, path)?.toString().trim()) {
      return message;
    }
  }

  return null;
};

const createStoreForVendor = async ({
  user,
  store,
  userLocation,
  storePhoto,
}) => {
  const storePayload = parseStorePayload(store);
  const validationMessage = validateVendorStorePayload(storePayload);

  if (validationMessage) {
    const error = new Error(validationMessage);
    error.statusCode = 400;
    throw error;
  }

  const address = {
    street: storePayload.address.street,
    area: storePayload.address.area,
    pincode: storePayload.address.pincode,
    city: storePayload.address.city,
    state: storePayload.address.state,
    landmark: storePayload.address.landmark || "",
  };

  return Store.create({
    owner: user._id,
    name: storePayload.shopName,
    description: storePayload.shopDescription || "",
    category: storePayload.businessType,
    logo: storePhoto?.url || "",
    banner: storePhoto?.url || "",
    storePhoto: storePhoto || null,
    gstNumber: storePayload.gstNumber || "",
    emergencyContact: storePayload.emergencyContact || "",
    address,
    location: {
      type: "Point",
      coordinates: [userLocation.lng, userLocation.lat],
    },
    isVerifiedByAdmin: false,
    isOpen: true,
    rating: 0,
  });
};

const haversineKm = (coords1, coords2) => {
  if (!coords1 || !coords2 || coords1.length < 2 || coords2.length < 2)
    return null;
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
};

const searchStoresAndProducts = async (req, res) => {
  try {
    const { q, lat, lng } = req.query;

    if (!q || !q.trim()) {
      return res.status(200).json({
        success: true,
        query: "",
        products: [],
        stores: [],
        count: { products: 0, stores: 0 },
      });
    }

    const queryStr = q.trim();
    const searchRegex = new RegExp(queryStr, "i");
    const userCoords =
      lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))
        ? [Number(lng), Number(lat)]
        : null;

    // 1. Search Products (across ALL products in DB)
    const matchingProducts = await Product.find({
      status: { $ne: "inactive" },
      stock: { $gt: 0 },
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
      ],
    })
      .populate({
        path: "store",
        select:
          "name category location address logo isOpen isVerifiedByAdmin rating totalReviews",
      })
      .lean();

    const products = matchingProducts
      .filter((p) => p.store && p.store.isOpen && p.store.isVerifiedByAdmin)
      .map((p) => {
        const storeCoords = p.store.location?.coordinates;
        const distance =
          userCoords && storeCoords
            ? haversineKm(userCoords, storeCoords)
            : null;
        return {
          ...p,
          store: {
            ...p.store,
            distance,
          },
        };
      });

    // 2. Search Stores
    const matchingStores = await Store.find({
      isOpen: true,
      isVerifiedByAdmin: true,
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { "address.city": searchRegex },
        { "address.area": searchRegex },
        { "address.street": searchRegex },
      ],
    }).lean();

    const stores = await Promise.all(
      matchingStores.map(async (s) => {
        const storeProducts = await Product.find({
          store: s._id,
          status: { $ne: "inactive" },
          stock: { $gt: 0 },
        })
          .limit(10)
          .lean();

        const storeCoords = s.location?.coordinates;
        const distance =
          userCoords && storeCoords
            ? haversineKm(userCoords, storeCoords)
            : null;

        return {
          ...s,
          products: storeProducts,
          distance,
        };
      }),
    );

    res.status(200).json({
      success: true,
      query: queryStr,
      products,
      stores,
      count: {
        products: products.length,
        stores: stores.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  searchStoresAndProducts,
  createStoreForVendor,
  parseStorePayload,
  validateVendorStorePayload,
};
