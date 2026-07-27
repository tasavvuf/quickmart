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

export const adaptStore = (store, products = []) => ({
  id: normalizeId(store),
  _id: normalizeId(store),
  name: store?.name || "Unknown store",
  description: store?.description || "",
  category: store?.category || "Store",
  banner: store?.banner || store?.logo || "",
  logo: store?.logo || store?.banner || "",
  location: parseStoreLocation(store?.location),
  deliveryRadius: Number(store?.deliveryRadius ?? 0),
  rating: Number(store?.rating ?? 0),
  totalReviews: Number(store?.totalReviews ?? 0),
  isOpen: Boolean(store?.isOpen),
  products,
});

export const adaptProductsToStores = (products = []) => {
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

  return {
    ...user,
    id: normalizeId(user),
    username: user.userName || user.username || "",
    userName: user.userName || user.username || "",
    email: user.email || "",
    avatar,
    address: user.address || "",
    addresses: user.addresses || [],
    orderHistory: user.orderHistory || [],
  };
};

export const adaptCart = (cart) => {
  if (!cart) {
    return { activeStore: null, items: [] };
  }

  const activeStore = normalizeId(cart.activeStore);
  const items = (cart.items || [])
    .map((item) => {
      const productId = normalizeId(item.product);

      if (!productId) {
        return null;
      }

      return {
        id: productId,
        quantity: Math.max(Number(item.quantity ?? 1), 1),
      };
    })
    .filter(Boolean);

  return { activeStore, items };
};
