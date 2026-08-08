const userModel = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const {
  uploadProfilePhoto,
  uploadStorePhoto,
  uploadDeliveryDocument,
} = require("../services/imagekit.service.js");
const {
  createStoreForVendor,
  parseStorePayload,
  validateVendorStorePayload,
} = require("./store.controller.js");

const parseLocation = (location) => {
  if (!location) {
    return { lat: 22.2904, lng: 70.7915 };
  }
  console.log(location);
  if (typeof location === "string") {
    try {
      JSON.parse(location);
      return JSON.parse(location);
    } catch {
      return { lat: 22.2904, lng: 70.7915 };
    }
  }

  return location;
};

const formatUserResponse = (user, requestingUser = null) => {
  const addresses = user.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const selectedAddr =
    addresses.find((a) => String(a._id) === String(user.selectedAddressId)) ||
    defaultAddr;

  const response = {
    _id: user._id,
    userName: user.userName,
    name: user.name,
    phoneNumber: user.phoneNumber,
    email: user.email,
    location: user.location,
    address: user.address,
    addresses: user.addresses || [],
    selectedAddressId:
      user.selectedAddressId || (selectedAddr ? String(selectedAddr._id) : null),
    currentDeliveryAddress: selectedAddr,
    defaultAddress: defaultAddr,
    profilePhoto: user.profilePhoto,
    role: user.role,
  };

  // Include delivery partner profile for deliveryPartner role
  if (user.role === "deliveryPartner" && user.deliveryPartnerProfile) {
    const profile = user.deliveryPartnerProfile.toObject
      ? user.deliveryPartnerProfile.toObject()
      : { ...user.deliveryPartnerProfile };

    // Documents are only visible to admin
    const isAdmin = requestingUser && requestingUser.role === "admin";
    if (!isAdmin) {
      delete profile.documents;
    }

    response.deliveryPartnerProfile = profile;
  }

  return response;
};

const PUBLIC_AUTH_ROLES = ["user", "vendor", "deliveryPartner"];

const normalizeAuthRole = (role = "user") => {
  const input = String(role || "user").trim();
  const lower = input.toLowerCase();

  if (lower === "deliverypartner") return "deliveryPartner";
  if (lower === "vendor") return "vendor";
  if (lower === "user") return "user";
  if (lower === "admin") return "admin";
  return null;
};

const getRoleMismatchMessage = (actualRole, requestedRole) => {
  if (requestedRole === "vendor" && actualRole !== "vendor") {
    return "Only vendor accounts can login from the vendor login page";
  }

  if (requestedRole === "deliveryPartner" && actualRole !== "deliveryPartner") {
    return "Only delivery partner accounts can login from the delivery partner portal";
  }

  if (requestedRole === "user" && actualRole !== "user") {
    return "Customer login page is restricted to customer accounts";
  }

  return `This login page is only for ${requestedRole} accounts`;
};

// @desc    Register User
// @access  Public
const regUser = async (req, res) => {
  try {
    const {
      userName,
      name,
      phoneNumber,
      email,
      password,
      location,
      address,
      role,
    } = req.body;
    const requestedRole = normalizeAuthRole(role);

    // Validate required fields
    if (!userName || !name || !phoneNumber || !email || !password) {
      return res
        .status(400)
        .json({
          message:
            "name, phoneNumber, userName, email, and password are required",
        });
    }

    if (!requestedRole) {
      return res
        .status(400)
        .json({ message: "Role must be user, vendor, or deliveryPartner" });
    }

    if (requestedRole === "vendor") {
      if (!req.body.store) {
        return res
          .status(400)
          .json({
            message: "Store details are required for vendor registration",
          });
      }
      const storeValidationMessage = validateVendorStorePayload(
        parseStorePayload(req.body.store),
      );

      if (storeValidationMessage) {
        return res.status(400).json({ message: storeValidationMessage });
      }
    }

    // Check if user already exists by email or username
    const existingUser = await userModel.findOne({
      $or: [{ email }, { userName }],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        return res
          .status(400)
          .json({ message: "User already exists with this email" });
      }
      if (existingUser.userName === userName) {
        return res
          .status(400)
          .json({ message: "User already exists with this username" });
      }
    }

    const parsedLocation = parseLocation(location);
    const { lat, lng } = parsedLocation;
    const initialAddressText = address || "Surat, Gujarat, India";

    const user = new userModel({
      userName,
      name,
      phoneNumber,
      email,
      password,
      role: requestedRole,
      location: { type: "Point", coordinates: [lng, lat] },
      address: initialAddressText,
      addresses: [
        {
          label: "Home",
          fullAddress: initialAddressText,
          street: initialAddressText,
          area: "General",
          city: "Surat",
          state: "Gujarat",
          pincode: "395007",
          location: { type: "Point", coordinates: [lng, lat] },
          isDefault: true,
        },
      ],
    });

    // Delivery partner profile setup
    if (requestedRole === "deliveryPartner") {
      const dpProfile = req.body.deliveryPartnerProfile;
      let parsedProfile = dpProfile;
      if (typeof dpProfile === "string") {
        try { parsedProfile = JSON.parse(dpProfile); } catch { parsedProfile = {}; }
      }
      parsedProfile = parsedProfile || {};

      user.deliveryPartnerProfile = {
        dateOfBirth: parsedProfile.dateOfBirth || "",
        emergencyContactName: parsedProfile.emergencyContactName || "",
        emergencyContactNumber: parsedProfile.emergencyContactNumber || "",
        currentAddress: parsedProfile.currentAddress || {},
        vehicleType: parsedProfile.vehicleType || "",
        vehicleNumber: parsedProfile.vehicleNumber || "",
        drivingLicenseNumber: parsedProfile.drivingLicenseNumber || "",
        vehicleModel: parsedProfile.vehicleModel || "",
        insuranceNumber: parsedProfile.insuranceNumber || "",
        isVerified: false,
        isAvailable: true,
        currentOrderId: null,
      };
    }

    if (user.addresses && user.addresses.length > 0) {
      user.selectedAddressId = String(user.addresses[0]._id);
    }

    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const storePhotoFile = req.files?.storePhoto?.[0];

    if ((requestedRole === "user" || requestedRole === "deliveryPartner") && profilePhotoFile) {
      user.profilePhoto = await uploadProfilePhoto(profilePhotoFile, user._id);
    }

    // Upload delivery partner documents
    if (requestedRole === "deliveryPartner" && req.files) {
      const docTypes = ["drivingLicense", "vehicleRC", "vehicleInsurance", "aadhaarCard", "panCard"];
      for (const docType of docTypes) {
        const docFile = req.files[docType]?.[0];
        if (docFile) {
          const uploaded = await uploadDeliveryDocument(docFile, user._id, docType);
          if (uploaded) {
            user.deliveryPartnerProfile.documents[docType] = uploaded;
          }
        }
      }
    }

    await user.save();

    let store = null;
    let storePhoto = null;

    if (requestedRole === "vendor") {
      try {
        storePhoto = await uploadStorePhoto(storePhotoFile, user._id);
        store = await createStoreForVendor({
          user,
          store: req.body.store,
          userLocation: parsedLocation,
          storePhoto,
        });
      } catch (storeError) {
        // Rollback the created user since store registration failed
        await userModel.findByIdAndDelete(user._id);
        throw storeError;
      }
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in cookies (httpOnly for security)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "user created and token generated in cookies",
      user: formatUserResponse(user),
      store,
      token,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Registration failed",
      error: error.message,
    });
  }
};

// @desc    Login User
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, userName, password, role } = req.body;
    const requestedRole = normalizeAuthRole(role);

    // Validate required fields
    if (!password || (!email && !userName)) {
      return res
        .status(400)
        .json({ message: "email/userName and password are required" });
    }

    if (!requestedRole) {
      return res
        .status(400)
        .json({ message: "Role must be user, vendor, or deliveryPartner" });
    }

    // Find user by email or userName
    const user = await userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password (plain text for now - consider hashing in production)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.role !== requestedRole) {
      return res.status(403).json({
        message: getRoleMismatchMessage(user.role, requestedRole),
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: formatUserResponse(user),
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// @desc Get saved addresses
const getAddresses = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      addresses: user.addresses || [],
      selectedAddressId: user.selectedAddressId || null,
      formattedUser: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get addresses", error: err.message });
  }
};

// @desc Add address
const addAddress = async (req, res) => {
  try {
    const user = req.user;
    const { label, fullAddress, street, area, city, state, pincode, location, isDefault } = req.body;

    if (!fullAddress && !street) {
      return res.status(400).json({ message: "Address is required" });
    }

    let lat = location?.lat != null ? Number(location.lat) : 22.2904;
    let lng = location?.lng != null ? Number(location.lng) : 70.7915;

    const formattedFull = fullAddress || `${street || ""}, ${area || ""}, ${city || "Surat"}, ${state || "Gujarat"} - ${pincode || ""}`.replace(/^, |, $/g, "");

    const newAddressObj = {
      label: label || "Home",
      fullAddress: formattedFull,
      street: street || formattedFull,
      area: area || "",
      city: city || "Surat",
      state: state || "Gujarat",
      pincode: pincode || "",
      location: { type: "Point", coordinates: [lng, lat] },
      isDefault: Boolean(isDefault),
    };

    if (!user.addresses) user.addresses = [];

    // If marked default or if it's the user's first address
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
      newAddressObj.isDefault = true;
    }

    user.addresses.push(newAddressObj);
    const addedItem = user.addresses[user.addresses.length - 1];
    user.selectedAddressId = String(addedItem._id);
    user.address = formattedFull;
    user.location = { type: "Point", coordinates: [lng, lat] };

    await user.save();
    return res.status(201).json({
      message: "Address added successfully",
      user: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to add address", error: err.message });
  }
};

// @desc Update address
const updateAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.params;
    const { label, fullAddress, street, area, city, state, pincode, location, isDefault } = req.body;

    const target = user.addresses.id(addressId);
    if (!target) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((a) => {
        a.isDefault = false;
      });
      target.isDefault = true;
    }

    if (label !== undefined) target.label = label;
    if (street !== undefined) target.street = street;
    if (area !== undefined) target.area = area;
    if (city !== undefined) target.city = city;
    if (state !== undefined) target.state = state;
    if (pincode !== undefined) target.pincode = pincode;
    if (fullAddress !== undefined || street !== undefined || city !== undefined) {
      target.fullAddress =
        fullAddress ||
        `${target.street}, ${target.area}, ${target.city}, ${target.state} - ${target.pincode}`.replace(/^, |, $/g, "");
    }

    if (location?.lat != null && location?.lng != null) {
      target.location = {
        type: "Point",
        coordinates: [Number(location.lng), Number(location.lat)],
      };
    }

    await user.save();
    return res.json({
      message: "Address updated successfully",
      user: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update address", error: err.message });
  }
};

// @desc Set address as default
const setDefaultAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.params;

    const target = user.addresses.id(addressId);
    if (!target) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.forEach((a) => {
      a.isDefault = String(a._id) === String(addressId);
    });

    user.selectedAddressId = String(addressId);
    user.address = target.fullAddress;
    user.location = target.location;

    await user.save();
    return res.json({
      message: "Default address updated",
      user: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to set default address", error: err.message });
  }
};

// @desc Set selected address
const setSelectedAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.body;

    const target = user.addresses.id(addressId);
    if (!target) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.selectedAddressId = String(addressId);
    user.address = target.fullAddress;
    user.location = target.location;

    await user.save();
    return res.json({
      message: "Selected address updated",
      user: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to set selected address", error: err.message });
  }
};

// @desc Delete address
const deleteAddress = async (req, res) => {
  try {
    const user = req.user;
    const { addressId } = req.params;

    const target = user.addresses.id(addressId);
    if (!target) {
      return res.status(404).json({ message: "Address not found" });
    }

    target.deleteOne();

    if (String(user.selectedAddressId) === String(addressId)) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0] || null;
      user.selectedAddressId = defaultAddr ? String(defaultAddr._id) : null;
    }

    await user.save();
    return res.json({
      message: "Address deleted successfully",
      user: formatUserResponse(user),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete address", error: err.message });
  }
};

module.exports = {
  regUser,
  loginUser,
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  setSelectedAddress,
  deleteAddress,
  formatUserResponse,
};
