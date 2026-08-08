const DEFAULT_LOCATION = {
  city: "Surat",
  address: "Surat, Gujarat",
  lat: null,
  lng: null,
};

const normalizeId = (value) => value?._id || value?.id || value;

const parseStoreLocation = (location) => {
  if (!location) {
    return DEFAULT_LOCATION;
  }

  if (typeof location === "object") {
    return {
      city: location.city || location.address || DEFAULT_LOCATION.city,
      address: location.address || location.city || DEFAULT_LOCATION.address,
      lat: location.lat ?? null,
      lng: location.lng ?? null,
    };
  }

  return {
    ...DEFAULT_LOCATION,
    city: location,
    address: location,
  };
};

export const formatAddress = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  if (typeof addr === "object") {
    if (addr.fullAddress) return addr.fullAddress;
    const parts = [addr.street, addr.area, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }
  return "";
};

export const adaptProduct = (product) => ({
  id: normalizeId(product),
  _id: normalizeId(product),
  name: product?.name || "Untitled product",
  description: product?.description || "",
  price: Number(product?.price ?? 0),
  image: product?.image || product?.images?.[0] || "",
  images: product?.images || (product?.image ? [product.image] : []),
  featured: Boolean(product?.featured),
  stock: Number(product?.stock ?? 0),
  category: product?.category || "General",
  status: product?.status || "available",
  storeId: normalizeId(product?.store),
});

export const adaptStore = (store, products = []) => {
  const storeProducts = Array.isArray(store?.products) && store.products.length > 0 ? store.products : products;
  const rawDistance = store?.distance != null ? Number(store.distance) : null;
  // MongoDB $geoNear returns distance in meters. Convert to km:
  const distanceInKm = rawDistance != null ? Number((rawDistance / 1000).toFixed(1)) : null;

  return {
    id: normalizeId(store),
    _id: normalizeId(store),
    name: store?.name || "Unknown store",
    description: store?.description || "",
    category: store?.category || "Store",
    banner: store?.banner || store?.logo || "",
    logo: store?.logo || store?.banner || "",
    storePhoto: store?.storePhoto || null,
    location: parseStoreLocation(store?.location),
    deliveryRadius: Number(store?.deliveryRadius ?? 0),
    rating: Number(store?.rating ?? 0),
    totalReviews: Number(store?.totalReviews ?? 0),
    isOpen: Boolean(store?.isOpen),
    owner: store?.owner || null,
    gstNumber: store?.gstNumber || "",
    emergencyContact: store?.emergencyContact || "",
    address: formatAddress(store?.address),
    rawAddress: store?.address || null,
    isVerifiedByAdmin: Boolean(store?.isVerifiedByAdmin),
    distance: distanceInKm,
    products: (storeProducts || []).map(adaptProduct),
  };
};

export const adaptStores = (stores = []) => {
  return stores.map((store) => adaptStore(store));
};

export const adaptProductsToStores = (products = []) => {
  if (Array.isArray(products) && products.length > 0 && (products[0]?.products || !products[0]?.store)) {
    return adaptStores(products);
  }
  const storesById = new Map();

  for (const product of products) {
    const store = product.store;
    const storeId = normalizeId(store);

    if (!storeId) {
      continue;
    }

    const adaptedProduct = adaptProduct(product);
    const current = storesById.get(storeId);

    if (current) {
      current.products.push(adaptedProduct);
    } else {
      storesById.set(storeId, adaptStore(store, [adaptedProduct]));
    }
  }

  return Array.from(storesById.values());
};

export const adaptUser = (user) => {
  if (!user) {
    return null;
  }

  const avatar = user.profilePhoto?.url || user.avatar || null;
  const addresses = (user.addresses || []).map((addr) => ({
    ...addr,
    id: normalizeId(addr),
    _id: normalizeId(addr),
    line1: addr.street || addr.line1 || addr.fullAddress || "",
    line2: addr.area || addr.line2 || "",
  }));

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;
  const activeAddressId = user.selectedAddressId || (defaultAddress ? defaultAddress.id : null);
  const activeAddress = addresses.find((a) => a.id === activeAddressId) || defaultAddress;

  return {
    ...user,
    id: normalizeId(user),
    username: user.userName || user.username || "",
    userName: user.userName || user.username || "",
    name: user.name || "",
    phoneNumber: user.phoneNumber || "",
    email: user.email || "",
    avatar,
    address: activeAddress?.fullAddress || formatAddress(user.address) || "Surat, Gujarat, India",
    addresses,
    activeAddressId,
    selectedAddressId: activeAddressId,
    defaultAddress,
    currentDeliveryAddress: activeAddress,
    orderHistory: user.orderHistory || [],
  };
};

export const adaptCart = (cart) => {
  if (!cart) {
    return { activeStore: null, items: [] };
  }

  const activeStore =
    typeof cart.activeStore === "object" && cart.activeStore !== null
      ? adaptStore(cart.activeStore)
      : normalizeId(cart.activeStore);

  const items = (cart.items || [])
    .map((item) => {
      const productId = normalizeId(item.product);

      if (!productId) {
        return null;
      }

      const product =
        typeof item.product === "object" && item.product !== null
          ? adaptProduct(item.product)
          : null;

      return {
        id: productId,
        quantity: Math.max(Number(item.quantity ?? 1), 1),
        product,
      };
    })
    .filter(Boolean);

  return { activeStore, items };
};
