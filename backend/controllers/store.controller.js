const Store = require('../models/Store.model');

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
      ...userLocation,
      address: `${address.street}, ${address.area}, ${address.city}, ${address.state} ${address.pincode}`,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    },
    isVerifiedByAdmin: false,
    isOpen: true,
    rating: 0
  });
};

module.exports = {
  createStoreForVendor,
  parseStorePayload,
  validateVendorStorePayload
};
