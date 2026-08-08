const Product = require("../models/Product.model");

const getVendorProducts = async (storeId, query = {}) => {
  const filter = { store: storeId };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  if (query.status && query.status !== "all") {
    filter.status = query.status;
  }

  if (query.featured !== undefined && query.featured !== "") {
    filter.featured = query.featured === "true" || query.featured === true;
  }

  if (query.stockStatus === "low") {
    filter.stock = { $gt: 0, $lte: 5 };
  } else if (query.stockStatus === "out") {
    filter.stock = 0;
  } else if (query.stockStatus === "in") {
    filter.stock = { $gt: 5 };
  }

  return Product.find(filter).sort({ createdAt: -1 });
};

const createProduct = async (storeId, productData) => {
  const { name, description, price, stock, category, images, featured, status } =
    productData;

  if (!name || price == null || stock == null || !category) {
    const error = new Error(
      "Missing required product fields: name, price, stock, and category are mandatory."
    );
    error.statusCode = 400;
    throw error;
  }

  return Product.create({
    store: storeId,
    name,
    description: description || "",
    price: Number(price),
    stock: Number(stock),
    images: Array.isArray(images) ? images : [],
    category,
    featured: Boolean(featured),
    status: status || "active",
  });
};

const updateProduct = async (storeId, productId, updateData) => {
  const product = await Product.findOne({ _id: productId, store: storeId });
  if (!product) {
    const error = new Error("Product not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  const fields = [
    "name",
    "description",
    "price",
    "stock",
    "images",
    "category",
    "featured",
    "status",
  ];

  fields.forEach((field) => {
    if (updateData[field] !== undefined) {
      if (field === "price" || field === "stock") {
        product[field] = Number(updateData[field]);
      } else {
        product[field] = updateData[field];
      }
    }
  });

  await product.save();
  return product;
};

const deleteProduct = async (storeId, productId) => {
  const product = await Product.findOneAndDelete({
    _id: productId,
    store: storeId,
  });

  if (!product) {
    const error = new Error("Product not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return product;
};

module.exports = {
  getVendorProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
