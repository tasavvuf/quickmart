const cartService = require('../services/cart.service');

const handleResult = (res, result, successStatus = 200) => {
  if (!result.success) {
    const errorCodeMap = {
      CART_NOT_FOUND: 404,
      PRODUCT_NOT_FOUND: 404,
      ITEM_NOT_FOUND: 404,
      DIFFERENT_STORE: 400,
      PRODUCT_ALREADY_IN_CART: 400,
      OUT_OF_STOCK: 400,
      QUANTITY_INVALID: 400,
      QUANTITY_MINIMUM: 400
    };
    const statusCode = errorCodeMap[result.code] || 400;
    return res.status(statusCode).json(result);
  }

  return res.status(successStatus).json(result);
};

// @desc    Get current cart
// @access  Private
exports.getCart = async (req, res) => {
  const userId = req.user._id;
  const result = await cartService.getCartByUserId(userId);
  return handleResult(res, result);
};

// @desc    Add item to cart
// @access  Private
exports.addItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ success: false, code: 'PRODUCT_ID_REQUIRED', message: 'Product ID is required' });
  }

  const result = await cartService.addToCart(userId, productId);
  return handleResult(res, result, 201);
};


// @desc    Remove item from cart
// @access  Private
exports.removeItem = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.removeFromCart(userId, productId);
  return handleResult(res, result);
};

// @desc    Clear entire cart
// @access  Private
exports.clearCart = async (req, res) => {
  const userId = req.user._id;

  const result = await cartService.clearCart(userId);
  return handleResult(res, result);
};

// @desc    Increase item quantity
// @access  Private
exports.increaseQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.increaseQuantity(userId, productId);
  return handleResult(res, result);
};

// @desc    Decrease item quantity
// @access  Private
exports.decreaseQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.decreaseQuantity(userId, productId);
  return handleResult(res, result);
};

exports.replaceCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await cartService.replaceCart(userId, productId);
  return handleResult(res, result);
};

const Order = require("../models/Order.model");
const Cart = require("../models/CartModel.model");

exports.checkout = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ userId: user._id })
      .populate("activeStore")
      .populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const storeId = cart.activeStore?._id || cart.activeStore;

    const Store = require("../models/Store.model");
    const storeObj = typeof cart.activeStore === "object" && cart.activeStore !== null
      ? cart.activeStore
      : await Store.findById(storeId);

    if (!storeObj) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }

    if (!storeObj.isOpen) {
      return res.status(400).json({
        success: false,
        message: `Store "${storeObj.name || 'Store'}" is currently closed. Orders cannot be placed right now.`,
      });
    }

    if (!storeObj.isVerifiedByAdmin) {
      return res.status(400).json({
        success: false,
        message: `Store "${storeObj.name || 'Store'}" is not verified by admin.`,
      });
    }

    const orderItems = cart.items.map((item) => {
      const p = item.product;
      const price = p?.price || 0;
      const qty = item.quantity;
      return {
        productId: p._id,
        productName: p?.name || "Product",
        productImage: p?.images?.[0] || p?.image || "",
        priceAtPurchase: price,
        quantity: qty,
        subtotal: price * qty,
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const deliveryFee = 30;
    const platformFee = 5;
    const discount = 0;
    const grandTotal = totalAmount + deliveryFee + platformFee - discount;

    let deliveryAddressPayload = req.body.deliveryAddress;
    if (!deliveryAddressPayload) {
      const addresses = user.addresses || [];
      const selected =
        addresses.find((a) => String(a._id) === String(user.selectedAddressId)) ||
        addresses.find((a) => a.isDefault) ||
        addresses[0];

      if (selected) {
        deliveryAddressPayload = {
          street: selected.street || selected.fullAddress,
          area: selected.area || "",
          city: selected.city || "Surat",
          state: selected.state || "Gujarat",
          pincode: selected.pincode || "",
          fullAddress: selected.fullAddress,
          customerName: user.name,
          phone: user.phoneNumber,
          location: selected.location,
        };
      } else {
        deliveryAddressPayload = {
          street: user.address,
          area: "",
          city: "Surat",
          state: "Gujarat",
          pincode: "395007",
          fullAddress: user.address || "Surat, Gujarat",
          customerName: user.name,
          phone: user.phoneNumber,
          location: user.location,
        };
      }
    }

    let coords = [70.7915, 22.2904];
    if (deliveryAddressPayload.location?.coordinates && Array.isArray(deliveryAddressPayload.location.coordinates)) {
      coords = deliveryAddressPayload.location.coordinates;
    } else if (
      deliveryAddressPayload.location?.lat != null &&
      deliveryAddressPayload.location?.lng != null
    ) {
      coords = [
        Number(deliveryAddressPayload.location.lng),
        Number(deliveryAddressPayload.location.lat),
      ];
    }

    // 🚨 10km Hyperlocal Delivery Radius Constraint
    if (storeObj.location?.coordinates && Array.isArray(storeObj.location.coordinates) && coords) {
      const [userLng, userLat] = coords;
      const [storeLng, storeLat] = storeObj.location.coordinates;

      if (userLat != null && userLng != null && storeLat != null && storeLng != null) {
        const toRad = (v) => (v * Math.PI) / 180;
        const R = 6371; // Earth's radius in km
        const dLat = toRad(storeLat - userLat);
        const dLng = toRad(storeLng - userLng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(userLat)) *
            Math.cos(toRad(storeLat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Number((R * c).toFixed(2));

        if (distanceKm > 10) {
          return res.status(400).json({
            success: false,
            message: `Delivery address is ${distanceKm}km away from "${storeObj.name || 'the store'}". Orders can only be placed within the 10km hyperlocal delivery radius.`,
          });
        }
      }
    }

    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await Order.create({
      customer: user._id,
      store: storeId,
      items: orderItems,
      totalAmount,
      deliveryFee,
      platformFee,
      discount,
      grandTotal,
      paymentType: "COD",
      paymentStatus: "PENDING",
      userStatus: "ACTIVE",
      vendorStatus: "PENDING",
      deliveryStatus: "WAITING",
      deliveryOtp,
      deliveryAddress: {
        street: deliveryAddressPayload.street || "",
        area: deliveryAddressPayload.area || "",
        city: deliveryAddressPayload.city || "Surat",
        state: deliveryAddressPayload.state || "Gujarat",
        pincode: deliveryAddressPayload.pincode || "",
        fullAddress:
          deliveryAddressPayload.fullAddress ||
          `${deliveryAddressPayload.street || ""}, ${deliveryAddressPayload.city || ""}`,
        customerName: deliveryAddressPayload.customerName || user.name,
        phone: deliveryAddressPayload.phone || user.phoneNumber,
        location: {
          type: "Point",
          coordinates: coords,
        },
      },
      statusHistory: [
        {
          status: "PENDING",
          updatedBy: "customer",
          timestamp: new Date(),
        },
      ],
    });

    // Clear cart
    cart.items = [];
    cart.activeStore = null;
    await cart.save();

    const { broadcastOrderUpdate } = require('../lib/socketHelper');
    broadcastOrderUpdate(order, 'order:new_placed');

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Checkout failed", error: err.message });
  }
};
