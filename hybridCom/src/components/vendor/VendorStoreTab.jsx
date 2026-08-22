import React, { useState, useEffect, useRef } from "react";
import { Store, MapPin, Clock, Image as ImageIcon, Save, Tag, Phone, Upload, QrCode, Share2 } from "lucide-react";
import { toast } from "react-toastify";
import StoreQrModal from "./StoreQrModal";

export default function VendorStoreTab({ store, onUpdateStore }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    logo: "",
    banner: "",
    minOrderAmount: "",
    deliveryTime: "",
    phone: "",
    street: "",
    area: "",
    city: "",
    state: "Gujarat",
    pincode: "",
    landmark: "",
    emergencyContact: "",
    gstNumber: "",
    openingHoursOpen: "09:00 AM",
    openingHoursClose: "09:00 PM",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || "",
        description: store.description || "",
        category: store.category || "",
        logo: store.logo || "",
        banner: store.banner || "",
        minOrderAmount: store.minOrderAmount || "",
        deliveryTime: store.deliveryTime || "",
        phone: store.contactPhone || store.phone || "",
        street: store.address?.street || "",
        area: store.address?.area || "",
        city: store.address?.city || "",
        state: store.address?.state || "Gujarat",
        pincode: store.address?.pincode || "",
        landmark: store.address?.landmark || "",
        emergencyContact: store.emergencyContact || "",
        gstNumber: store.gstNumber || "",
        openingHoursOpen: store.openingHours?.open || "09:00 AM",
        openingHoursClose: store.openingHours?.close || "09:00 PM",
      });
      setLogoPreview(store.logo || null);
      setBannerPreview(store.banner || null);
      setLogoFile(null);
      setBannerFile(null);
    }
  }, [store]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image for the store logo");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image for the store banner");
        return;
      }
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Store name is required");
      return;
    }
    if (!formData.street?.trim() || !formData.area?.trim() || !formData.city?.trim() || !formData.pincode?.trim()) {
      toast.error("Complete store address (Street, Area, City, and 6-digit Pincode) is required");
      return;
    }

    setIsSaving(true);
    try {
      const addressObj = {
        street: formData.street.trim(),
        area: formData.area.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || "Gujarat",
        pincode: formData.pincode.trim(),
        landmark: formData.landmark?.trim() || "",
      };

      const openingHoursObj = {
        open: formData.openingHoursOpen || "09:00 AM",
        close: formData.openingHoursClose || "09:00 PM",
      };

      if (logoFile || bannerFile) {
        const data = new FormData();
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("phone", formData.phone);
        data.append("contactPhone", formData.phone);
        data.append("emergencyContact", formData.emergencyContact);
        data.append("gstNumber", formData.gstNumber);
        data.append("openingHours", JSON.stringify(openingHoursObj));
        if (formData.minOrderAmount) data.append("minOrderAmount", Number(formData.minOrderAmount));
        if (formData.deliveryTime) data.append("deliveryTime", formData.deliveryTime);
        data.append("address", JSON.stringify(addressObj));

        if (logoFile) data.append("logo", logoFile);
        else if (formData.logo) data.append("logo", formData.logo);

        if (bannerFile) data.append("banner", bannerFile);
        else if (formData.banner) data.append("banner", formData.banner);

        await onUpdateStore(data);
      } else {
        await onUpdateStore({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          logo: formData.logo,
          banner: formData.banner,
          minOrderAmount: Number(formData.minOrderAmount) || 0,
          deliveryTime: formData.deliveryTime,
          phone: formData.phone,
          contactPhone: formData.phone,
          emergencyContact: formData.emergencyContact,
          gstNumber: formData.gstNumber,
          openingHours: openingHoursObj,
          address: addressObj,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "app-input w-full px-4 py-3 rounded-xl text-sm";
  const labelClass = "block font-bold text-xs uppercase tracking-wider mb-1.5 app-muted";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Store Preview Card */}
      <div className="app-card rounded-3xl overflow-hidden shadow-md">
        {/* Banner Preview */}
        <div className="relative w-full h-36 bg-secondary/50 flex items-center justify-center overflow-hidden border-b border-border">
          {bannerPreview ? (
            <img src={bannerPreview} alt="Store banner" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center gap-2 app-muted text-xs font-semibold">
              <ImageIcon size={18} /> Store Banner Preview
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 -mt-12">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-card bg-muted flex items-center justify-center shadow-xl">
              {logoPreview ? (
                <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
              ) : (
                <Store size={32} className="app-muted" />
              )}
            </div>
            <div className="flex-1 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-extrabold app-heading">{formData.name || "Store Name"}</h2>
                <p className="text-xs app-muted flex items-center gap-1.5 mt-0.5">
                  <Tag size={12} className="text-amber-500" /> {formData.category || "Category"} • {store?.isOpen ? "🟢 Open" : "🔴 Closed"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="app-control shrink-0 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 hover:border-amber-500 hover:text-amber-500 transition-all shadow-xs cursor-pointer"
              >
                <QrCode size={15} className="text-amber-500" />
                <span>Share Store & QR</span>
              </button>
            </div>
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

        {/* Media & Branding (ImageKit Uploads) */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <ImageIcon size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Media & Branding (ImageKit Setup)</h3>
          </div>

          {/* Store Logo Upload */}
          <div className="space-y-2">
            <label className={labelClass}>Store Logo</label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-border hover:border-amber-500/50 flex flex-col items-center justify-center cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-all overflow-hidden shrink-0"
              >
                <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={20} className="text-amber-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold border border-border cursor-pointer flex items-center gap-1.5"
                >
                  <Upload size={13} /> {logoFile ? "Change Selected Logo" : "Upload Store Logo"}
                </button>
                <p className="text-[10px] app-muted">Upload square PNG/JPG up to 5MB (Uploaded to ImageKit)</p>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => {
                    setFormData({ ...formData, logo: e.target.value });
                    if (!logoFile) setLogoPreview(e.target.value || null);
                  }}
                  placeholder="Or paste direct logo URL"
                  className="app-input w-full px-3 py-1.5 text-xs rounded-xl mt-1"
                />
              </div>
            </div>
          </div>

          {/* Store Banner Upload */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className={labelClass}>Store Banner</label>
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-28 rounded-2xl border-2 border-dashed border-border hover:border-amber-500/50 flex flex-col items-center justify-center cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-all overflow-hidden relative group"
            >
              <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
              {bannerPreview ? (
                <>
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                    <Upload size={14} /> Change Banner
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-center p-3">
                  <Upload size={20} className="text-amber-500" />
                  <p className="text-xs font-bold text-foreground">Click to upload store banner</p>
                  <p className="text-[10px] app-muted">Wide cover photo (1200x400 recommended, uploaded to ImageKit)</p>
                </div>
              )}
            </div>
            <input
              type="url"
              value={formData.banner}
              onChange={(e) => {
                setFormData({ ...formData, banner: e.target.value });
                if (!bannerFile) setBannerPreview(e.target.value || null);
              }}
              placeholder="Or paste direct banner URL"
              className="app-input w-full px-3 py-2 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Address */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 border border-green-500/20">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold app-heading text-base">Store Address</h3>
              <p className="text-[11px] app-muted">Ensure 6-digit Pincode and full address are provided</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Street Address *</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Shop No, Building Name, Street"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Area / Locality *</label>
              <input
                type="text"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Ring Road, Vesu, etc."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Surat"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Gujarat"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Pincode (6 Digits) *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="395007"
                className={`${inputClass} font-mono font-bold`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Landmark (Optional)</label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="Near City Center Mall"
              className={inputClass}
            />
          </div>
        </div>

        {/* Contact, Timings & Business Info */}
        <div className="app-card p-6 rounded-3xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Clock size={20} />
            </div>
            <h3 className="font-bold app-heading text-base">Operating Hours & Business Info</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Opening Time</label>
              <input
                type="text"
                value={formData.openingHoursOpen}
                onChange={(e) => setFormData({ ...formData, openingHoursOpen: e.target.value })}
                className={inputClass}
                placeholder="09:00 AM"
              />
            </div>
            <div>
              <label className={labelClass}>Closing Time</label>
              <input
                type="text"
                value={formData.openingHoursClose}
                onChange={(e) => setFormData({ ...formData, openingHoursClose: e.target.value })}
                className={inputClass}
                placeholder="09:00 PM"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className={labelClass}>Emergency Contact Phone</label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className={inputClass}
                placeholder="+91 99XXXXXXXX"
              />
            </div>
            <div>
              <label className={labelClass}>GST Number (Optional)</label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className={`${inputClass} font-mono`}
                placeholder="24AAAAA0000A1Z5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className={labelClass}>Min Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className={`${inputClass} font-mono`}
                placeholder="0"
              />
            </div>
            <div>
              <label className={labelClass}>Estimated Delivery Time</label>
              <input
                type="text"
                value={formData.deliveryTime}
                onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                className={inputClass}
                placeholder="30-45 mins"
              />
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? "Saving to ImageKit & Database..." : "Save Store Details"}
          </button>
        </div>
      </form>

      {/* Store QR & Standee Modal */}
      <StoreQrModal
        store={store}
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
      />
    </div>
  );
}

