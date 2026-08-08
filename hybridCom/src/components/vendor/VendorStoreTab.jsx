import React, { useState, useEffect } from "react";
import { Store, MapPin, Clock, Image as ImageIcon, Save, Tag, Phone } from "lucide-react";

export default function VendorStoreTab({ store, onUpdateStore }) {
  const [formData, setFormData] = useState({
    name: "", description: "", category: "", logo: "", minOrderAmount: "", deliveryTime: "",
    phone: "", city: "", street: "", area: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "", description: store.description || "", category: store.category || "",
        logo: store.logo || "", minOrderAmount: store.minOrderAmount || "", deliveryTime: store.deliveryTime || "",
        phone: store.phone || "", city: store.address?.city || "", street: store.address?.street || "",
        area: store.address?.area || "",
      });
    }
  }, [store]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateStore({
        name: formData.name, description: formData.description, category: formData.category,
        logo: formData.logo, minOrderAmount: Number(formData.minOrderAmount), deliveryTime: formData.deliveryTime,
        phone: formData.phone, address: { city: formData.city, street: formData.street, area: formData.area },
      });
    } finally { setIsSaving(false); }
  };

  const inputClass = "app-input w-full px-4 py-3 rounded-xl text-sm";
  const labelClass = "block font-bold text-xs uppercase tracking-wider mb-1.5 app-muted";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Store Preview Card */}
      <div className="app-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-muted flex items-center justify-center shadow-lg shadow-amber-500/10">
            {formData.logo ? (
              <img src={formData.logo} alt="Store logo" className="w-full h-full object-cover" />
            ) : (
              <Store size={28} className="app-muted" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold app-heading">{formData.name || "Store Name"}</h2>
            <p className="text-xs app-muted flex items-center gap-1.5">
              <Tag size={12} className="text-amber-500" /> {formData.category || "Category"} • {store?.isOpen ? "🟢 Open" : "🔴 Closed"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Details */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Store size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Basic Details</h3>
          </div>

          <div>
            <label className={labelClass}>Store Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass} placeholder="My Awesome Store" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass} placeholder="Tell customers about your store..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={inputClass} placeholder="Grocery, Pharmacy..." />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass} placeholder="+91 98XXXXXXXX" />
            </div>
          </div>
        </div>

        {/* Media & Branding */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <ImageIcon size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Media & Branding</h3>
          </div>
          <div>
            <label className={labelClass}>Logo URL</label>
            <input type="url" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className={inputClass} placeholder="https://res.cloudinary.com/..." />
          </div>
        </div>

        {/* Address */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Store Address</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Street</label>
              <input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>Area</label>
              <input type="text" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className={inputClass} /></div>
            <div><label className={labelClass}>City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} /></div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Clock size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Delivery & Order Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Min Order Amount (₹)</label>
              <input type="number" min="0" value={formData.minOrderAmount} onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className={`${inputClass} font-mono`} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Estimated Delivery Time</label>
              <input type="text" value={formData.deliveryTime} onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className={inputClass} placeholder="30-45 mins" />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button type="submit" disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50">
            <Save size={18} /> {isSaving ? "Saving..." : "Save Store Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
