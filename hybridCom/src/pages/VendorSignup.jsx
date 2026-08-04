import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, MapPin, Store as StoreIcon, UserRound } from "lucide-react";
import { getGPSLocation } from "../lib/locationService";
import { api, getApiErrorMessage } from "../lib/api";

const businessTypes = [
  "Grocery",
  "Electronics",
  "Restaurant",
  "Pharmacy",
  "Fashion",
  "Bakery",
  "Home Essentials",
  "Other"
];

const initialAccount = {
  name: "",
  phoneNumber: "",
  username: "",
  email: "",
  password: "",
  address: ""
};

const initialStore = {
  shopName: "",
  businessType: "",
  shopDescription: "",
  gstNumber: "",
  emergencyContact: "",
  street: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  landmark: ""
};

export default function VendorSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [account, setAccount] = useState(initialAccount);
  const [store, setStore] = useState(initialStore);
  const [storePhoto, setStorePhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Isolated Registration GPS State
  const [regLat, setRegLat] = useState(null);
  const [regLng, setRegLng] = useState(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("Location is not fetched yet !!!");

  const handleFetchGpsLocation = async () => {
    setIsFetchingGps(true);
    setGpsMessage("Requesting vendor GPS location access...");
    try {
      const coords = await getGPSLocation();
      setRegLat(coords.lat);
      setRegLng(coords.lng);
      setGpsMessage(`GPS Captured: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`);
      toast.success("Vendor GPS location captured successfully!");
    } catch (err) {
      console.warn("GPS failed during vendor signup:", err);
      setRegLat(null);
      setRegLng(null);
      const errTxt = "GPS permission is strictly required for vendor registration. Please enable location access in your browser.";
      setGpsMessage(errTxt);
      toast.error(errTxt);
    } finally {
      setIsFetchingGps(false);
    }
  };

  const updateAccount = (field, value) => {
    setAccount((current) => ({ ...current, [field]: value }));
  };

  const updateStore = (field, value) => {
    setStore((current) => ({ ...current, [field]: value }));
  };

  const validateAccountStep = () => {
    if (!account.name || !account.phoneNumber || !account.username || !account.email || !account.password || !account.address) {
      toast.error("Please fill all account fields");
      return false;
    }

    if (regLat == null || regLng == null) {
      toast.error("GPS location permission is strictly required for vendor registration. Click 'Fetch vendor GPS location'");
      return false;
    }

    return true;
  };

  const validateStoreStep = () => {
    const requiredFields = [
      ["shopName", "Shop name is required"],
      ["businessType", "Business type is required"],
      ["street", "Street address is required"],
      ["area", "Area/locality is required"],
      ["pincode", "Pincode is required"],
      ["city", "City is required"],
      ["state", "State is required"]
    ];

    for (const [field, errorMessage] of requiredFields) {
      if (!store[field].trim()) {
        toast.error(errorMessage);
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateAccountStep()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStoreStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const storePayload = {
        shopName: store.shopName,
        businessType: store.businessType,
        shopDescription: store.shopDescription,
        gstNumber: store.gstNumber,
        emergencyContact: store.emergencyContact,
        address: {
          street: store.street,
          area: store.area,
          pincode: store.pincode,
          city: store.city,
          state: store.state,
          landmark: store.landmark
        }
      };

      formData.append("userName", account.username);
      formData.append("name", account.name);
      formData.append("phoneNumber", account.phoneNumber);
      formData.append("email", account.email);
      formData.append("password", account.password);
      formData.append("address", account.address);
      formData.append("location", JSON.stringify({ lat: regLat, lng: regLng }));
      formData.append("role", "vendor");
      formData.append("store", JSON.stringify(storePayload));

      if (storePhoto) {
        formData.append("storePhoto", storePhoto);
      }

      const response = await api.post("/auth/reg", formData);

      toast.success(response.data.message || "Vendor registration successful");
      navigate("/vendor-login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Vendor signup failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => (step === 1 ? navigate("/store") : setStep(1))}
            className="app-control flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">
              {step === 1 ? "Register Your Shop" : "Business Setup"}
            </h1>
            <p className="app-muted mt-1 text-sm">
              {step === 1
                ? "Create your vendor account and confirm your location"
                : "Provide your business information"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500 text-white shadow-lg shadow-green-500/20">
            <StoreIcon size={30} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${step === 1 ? "bg-amber-500" : "bg-muted-foreground/30"}`} />
            <span className={`h-2.5 w-2.5 rounded-full ${step === 2 ? "bg-amber-500" : "bg-muted-foreground/30"}`} />
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            step === 1 ? handleNext() : handleSubmit();
          }}
          className="app-card mx-auto flex w-full max-w-md flex-col gap-5 rounded-3xl p-7 shadow-xl shadow-black/5"
        >
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-1 text-center">
                <h2 className="text-xl font-bold">Vendor Account</h2>
                <p className="app-muted text-sm">Create your vendor login and capture your location.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label>Name *</label>
                <input
                  type="text"
                  value={account.name || ""}
                  onChange={(event) => updateAccount("name", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Phone Number *</label>
                <div className="flex">
                  <span className="app-control flex min-h-12 items-center rounded-l-lg border-r-0 px-4">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={account.phoneNumber || ""}
                    onChange={(event) => updateAccount("phoneNumber", event.target.value)}
                    className="app-input min-w-0 flex-1 rounded-r-lg px-4 py-3"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label>Username *</label>
                <input
                  type="text"
                  value={account.username || ""}
                  onChange={(event) => updateAccount("username", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Enter your username"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={account.email || ""}
                  onChange={(event) => updateAccount("email", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="greenmart@demo.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Password *</label>
                <input
                  type="password"
                  value={account.password || ""}
                  onChange={(event) => updateAccount("password", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Create a password"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Vendor Address *</label>
                <input
                  type="text"
                  value={account.address || ""}
                  onChange={(event) => updateAccount("address", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Enter your personal address"
                />
              </div>

              <div className="app-panel-soft flex flex-col gap-3 rounded-2xl p-4">
                <button
                  type="button"
                  disabled={isFetchingGps}
                  onClick={handleFetchGpsLocation}
                  className="app-control flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-amber-500 cursor-pointer"
                >
                  <MapPin size={18} />
                  {isFetchingGps ? "Requesting GPS Access..." : "Fetch vendor GPS location 📍"}
                </button>
                <p className="app-muted text-center text-sm">{gpsMessage}</p>
                {regLat != null && regLng != null && (
                  <p className="text-center text-sm font-semibold text-green-500">
                    ✓ Vendor GPS Captured: {regLat.toFixed(4)}, {regLng.toFixed(4)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="min-h-12 rounded-xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to Business Setup
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1 text-center">
                <h2 className="text-xl font-bold">Business Information</h2>
                <p className="app-muted text-sm">Tell us about your shop.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label>Shop Name *</label>
                <input
                  type="text"
                  value={store.shopName || ""}
                  onChange={(event) => updateStore("shopName", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Enter your shop name"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Business Type *</label>
                <select
                  value={store.businessType || ""}
                  onChange={(event) => updateStore("businessType", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map((businessType) => (
                    <option key={businessType} value={businessType}>
                      {businessType}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label>Shop Description</label>
                <textarea
                  value={store.shopDescription || ""}
                  onChange={(event) => updateStore("shopDescription", event.target.value)}
                  className="app-input min-h-24 resize-none rounded-lg px-4 py-3"
                  placeholder="Describe your shop and products"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Store Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setStorePhoto(event.target.files?.[0] || null)}
                  className="app-input rounded-lg px-4 py-3"
                />
                <p className="app-muted text-xs">
                  Add a storefront or logo image for your shop profile.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label>GST Number (Optional)</label>
                <input
                  type="text"
                  value={store.gstNumber || ""}
                  onChange={(event) => updateStore("gstNumber", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Enter GST number if applicable"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={store.emergencyContact || ""}
                  onChange={(event) => updateStore("emergencyContact", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label>Shop Address *</label>
                <input
                  type="text"
                  value={store.street || ""}
                  onChange={(event) => updateStore("street", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Street Address"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={store.area || ""}
                    onChange={(event) => updateStore("area", event.target.value)}
                    className="app-input min-w-0 rounded-lg px-4 py-3"
                    placeholder="Area/Locality"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={store.pincode || ""}
                    onChange={(event) => updateStore("pincode", event.target.value)}
                    className="app-input min-w-0 rounded-lg px-4 py-3"
                    placeholder="Pincode"
                  />
                  <input
                    type="text"
                    value={store.city || ""}
                    onChange={(event) => updateStore("city", event.target.value)}
                    className="app-input min-w-0 rounded-lg px-4 py-3"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={store.state || ""}
                    onChange={(event) => updateStore("state", event.target.value)}
                    className="app-input min-w-0 rounded-lg px-4 py-3"
                    placeholder="State"
                  />
                </div>
                <input
                  type="text"
                  value={store.landmark || ""}
                  onChange={(event) => updateStore("landmark", event.target.value)}
                  className="app-input rounded-lg px-4 py-3"
                  placeholder="Landmark (Optional)"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-12 rounded-xl bg-amber-500 px-6 py-3 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Creating vendor account..." : "Create vendor account"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="app-control flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3"
              >
                <UserRound size={18} />
                Back to account details
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
