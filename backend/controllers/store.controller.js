const mongoose = require('mongoose');
const Store = require('../models/Store.model');
const Product = require('../models/Product.model');

const getAllStores = async (req, res) => {

    try {

        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                message: "Latitude and Longitude are required"
            });
        }

        const latitude = Number(lat);
        const longitude = Number(lng);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                message: "Invalid coordinates"
            });
        }

        const stores = await Store.aggregate([

            {
                $geoNear: {

                    near: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },

                    distanceField: "distance",

                    spherical: true,

                    maxDistance: 100000

                }
            },

            {
                $match: {

                    isOpen: true,
                    isVerifiedByAdmin: true

                }
            },

            {
                $lookup: {

                    from: "products",

                    localField: "_id",

                    foreignField: "store",

                    as: "products"

                }

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
                                        $eq: [
                                            "$$product.featured",
                                            true
                                        ]
                                    },
                                    {
                                        $ne: [
                                            "$$product.status",
                                            "inactive"
                                        ]
                                    },
                                    {
                                        $gt: [
                                            "$$product.stock",
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stores
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

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

  if (typeof store === 'string') {
    try {
      return JSON.parse(store);
    } catch {
      return {};
    }
  }

  return store;
};

const requiredVendorStoreFields = [
  ['shopName', 'Shop name is required'],
  ['businessType', 'Business type is required'],
  ['address.street', 'Street address is required'],
  ['address.area', 'Area/locality is required'],
  ['address.pincode', 'Pincode is required'],
  ['address.city', 'City is required'],
  ['address.state', 'State is required']
];

const getValueAtPath = (source, path) => {
  return path.split('.').reduce((current, key) => current?.[key], source);
};

const validateVendorStorePayload = (storePayload) => {
  for (const [path, message] of requiredVendorStoreFields) {
    if (!getValueAtPath(storePayload, path)?.toString().trim()) {
      return message;
    }
  }

  return null;
};

const createStoreForVendor = async ({ user, store, userLocation, storePhoto }) => {
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
    landmark: storePayload.address.landmark || ''
  };

  return Store.create({
    owner: user._id,
    name: storePayload.shopName,
    description: storePayload.shopDescription || '',
    category: storePayload.businessType,
    logo: storePhoto?.url || '',
    banner: storePhoto?.url || '',
    storePhoto: storePhoto || null,
    gstNumber: storePayload.gstNumber || '',
    emergencyContact: storePayload.emergencyContact || '',
    address,
    location: {
      type: "Point",
      coordinates: [userLocation.lng, userLocation.lat]
    },
    isVerifiedByAdmin: false,
    isOpen: true,
    rating: 0
  });
};

module.exports = {
  getAllStores,
  getStoreById,
  createStoreForVendor,
  parseStorePayload,
  validateVendorStorePayload
};
