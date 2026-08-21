import React, { useState, useRef } from "react";
import {
  Plus, Search, Edit2, Trash2, Star, Package,
  AlertTriangle, CheckCircle, XCircle, X, Image as ImageIcon,
  Upload, Sparkles
} from "lucide-react";
import { toast } from "react-toastify";

export default function VendorProductsTab({ products, loading, onCreateProduct, onUpdateProduct, onDeleteProduct }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", stock: "", category: "Grocery", imageUrl: "", featured: false, status: "active",
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ["all", "Grocery", "Fruits & Vegetables", "Beverages", "Snacks & Munchies", "Dairy & Bakery", "Personal Care", "Household"];

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setSelectedImageFile(null);
    setImagePreview(null);
    setFormData({ name: "", description: "", price: "", stock: "", category: "Grocery", imageUrl: "", featured: false, status: "active" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setSelectedImageFile(null);
    setImagePreview(product.images?.[0] || null);
    setFormData({
      name: product.name, description: product.description || "", price: product.price, stock: product.stock,
      category: product.category, imageUrl: product.images?.[0] || "", featured: product.featured || false, status: product.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    // Enforce Featured Products Rule: Max 3
    if (formData.featured) {
      const currentFeaturedCount = products.filter(
        (p) => p.featured && (!editingProduct || p._id !== editingProduct._id)
      ).length;
      if (currentFeaturedCount >= 3) {
        toast.error("Maximum 3 products per store can be featured. Please unmark another product first.");
        return;
      }
    }

    setFormSubmitting(true);
    try {
      if (selectedImageFile) {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description || "");
        data.append("price", formData.price);
        data.append("stock", formData.stock);
        data.append("category", formData.category);
        data.append("featured", formData.featured);
        data.append("status", formData.status);
        data.append("images", selectedImageFile);

        if (editingProduct) await onUpdateProduct(editingProduct._id, data);
        else await onCreateProduct(data);
      } else {
        const payload = {
          name: formData.name, description: formData.description, price: Number(formData.price),
          stock: Number(formData.stock), category: formData.category,
          images: formData.imageUrl ? [formData.imageUrl] : (editingProduct?.images || []),
          featured: formData.featured, status: formData.status,
        };
        if (editingProduct) await onUpdateProduct(editingProduct._id, payload);
        else await onCreateProduct(payload);
      }
      setIsModalOpen(false);
    } finally { setFormSubmitting(false); }
  };

  const handleToggleFeatured = async (product) => {
    if (!product.featured) {
      const currentFeatured = products.filter((p) => p.featured && p._id !== product._id).length;
      if (currentFeatured >= 3) {
        toast.error("Maximum 3 products per store can be featured.");
        return;
      }
    }
    await onUpdateProduct(product._id, { featured: !product.featured });
  };
  const handleToggleActive = async (product) => { await onUpdateProduct(product._id, { status: product.status === "active" ? "inactive" : "active" }); };
  const handleDeleteConfirm = async (productId) => { await onDeleteProduct(productId); setDeletingProductId(null); };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ? true : p.category === selectedCategory;
    let matchesStock = true;
    if (stockFilter === "low") matchesStock = p.stock > 0 && p.stock <= 5;
    if (stockFilter === "out") matchesStock = p.stock === 0;
    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 app-muted" size={16} />
            <input type="text" placeholder="Search product catalog..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="app-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            className="app-input px-3 py-2.5 rounded-xl text-xs">
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
            className="app-input px-3 py-2.5 rounded-xl text-xs">
            <option value="all">All Stock</option>
            <option value="low">Low Stock (≤5)</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <button onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 hover:bg-amber-400 active:scale-95 cursor-pointer">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <div className="py-20 text-center app-muted">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-4"></div>
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl app-card app-muted">
          <Package className="mx-auto mb-3" size={40} />
          <h3 className="text-lg font-bold app-heading mb-1">No Products Found</h3>
          <p className="text-xs mb-4">Try adjusting your search or filters.</p>
          <button onClick={handleOpenAdd} className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 cursor-pointer">Create Your First Product</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => {
            const isLowStock = p.stock > 0 && p.stock <= 5;
            const isOutOfStock = p.stock === 0;
            return (
              <div key={p._id} className="app-card app-card-hover p-4 rounded-3xl flex flex-col justify-between space-y-3 transition-all hover:translate-y-[-2px] relative group">
                {/* Image */}
                <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-muted border border-border">
                  {p.images?.length > 0 ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center app-muted">
                      <ImageIcon size={32} /><span className="text-[10px] mt-1">No Image</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <button onClick={() => handleToggleFeatured(p)}
                      className={`app-control p-1.5 rounded-lg ${p.featured ? "text-amber-500 border-amber-500/50" : ""}`} title={p.featured ? "Unmark Featured" : "Mark Featured"}>
                      <Star size={14} className={p.featured ? "fill-amber-500" : ""} />
                    </button>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <button onClick={() => handleToggleActive(p)}
                      className={`app-control px-2.5 py-1 rounded-lg text-[10px] font-bold ${p.status === "active" ? "text-green-500 border-green-500/40" : "text-destructive border-destructive/40"}`}>
                      {p.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-amber-500 uppercase tracking-wider">{p.category}</span>
                  <h4 className="text-sm font-bold app-heading truncate" title={p.name}>{p.name}</h4>
                  <p className="text-[11px] app-muted line-clamp-2 min-h-[32px]">{p.description || "No description"}</p>
                </div>

                {/* Price & Stock */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-base font-extrabold text-amber-500 font-mono">₹{p.price}</span>
                  {isOutOfStock ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                      <XCircle size={12} /> Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle size={12} /> Stock: {p.stock}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/30 flex items-center gap-1">
                      <CheckCircle size={12} /> Stock: {p.stock}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={() => handleOpenEdit(p)}
                    className="app-control flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold">
                    <Edit2 size={13} /> Edit
                  </button>
                  <button onClick={() => setDeletingProductId(p._id)}
                    className="app-control p-1.5 rounded-xl text-destructive border-destructive/30" title="Delete product">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-background border border-border p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-bold app-heading">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="app-muted hover:text-foreground cursor-pointer"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Product Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Amul Taaza Milk 1L" className="app-input w-full px-3 py-2 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Price (₹) *</label>
                  <input type="number" required min="0" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 66" className="app-input w-full px-3 py-2 rounded-xl font-mono" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Stock Quantity *</label>
                  <input type="number" required min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="e.g. 25" className="app-input w-full px-3 py-2 rounded-xl font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="app-input w-full px-3 py-2 rounded-xl">
                    {categories.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="app-input w-full px-3 py-2 rounded-xl">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {/* Product Image Selection: File Upload (ImageKit) or URL */}
              <div className="space-y-2">
                <label className="block font-semibold">Product Image (ImageKit Upload or URL)</label>
                
                {/* File Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-amber-500/50 rounded-2xl p-4 text-center cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border shadow-sm group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        Change
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Upload size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">Click to upload product image</p>
                        <p className="text-[10px] app-muted">PNG, JPG, WEBP up to 5MB (Uploaded to ImageKit)</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Optional Fallback URL */}
                <div className="pt-1">
                  <span className="text-[10px] app-muted block mb-1">Or paste direct image URL:</span>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      if (!selectedImageFile) setImagePreview(e.target.value || null);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="app-input w-full px-3 py-2 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product details..." className="app-input w-full px-3 py-2 rounded-xl" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="featuredCheck" checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-border" />
                <label htmlFor="featuredCheck" className="font-medium">Feature this product on store homepage</label>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="app-control px-4 py-2 rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-md cursor-pointer disabled:opacity-50">
                  {formSubmitting ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/30 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold app-heading">Delete Product?</h3>
            <p className="text-xs app-muted">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setDeletingProductId(null)} className="app-control px-4 py-2 rounded-xl text-xs font-semibold">Cancel</button>
              <button onClick={() => handleDeleteConfirm(deletingProductId)}
                className="px-5 py-2 rounded-xl bg-destructive hover:opacity-90 text-white text-xs font-bold cursor-pointer">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
