import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  MapPin,
  Store as StoreIcon,
  UserRound,
  FileText,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
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

  // Terms and Conditions State
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const termsScrollRef = useRef(null);

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
      if (!store[field]?.trim()) {
        toast.error(errorMessage);
        return false;
      }
    }

    return true;
  };

  const handleNextFromAccount = () => {
    if (validateAccountStep()) {
      setStep(2);
    }
  };

  const handleNextFromStore = () => {
    if (validateStoreStep()) {
      setStep(3);
    }
  };

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 40) {
      setHasScrolledToEnd(true);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast.error("You must read and accept the Vendor Terms & Conditions to complete registration");
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

      toast.success(response.data.message || "Vendor registration submitted for admin approval!");
      navigate("/vendor-login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Vendor signup failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-page px-6 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
              else navigate("/store");
            }}
            className="app-control flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
            aria-label="Go back"
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">
              {step === 1 ? "Register Your Shop" : step === 2 ? "Business Setup" : "Vendor Terms & Conditions"}
            </h1>
            <p className="app-muted mt-1 text-sm">
              {step === 1
                ? "Step 1/3: Create your vendor login & capture GPS location"
                : step === 2
                ? "Step 2/3: Provide your business and store details"
                : "Step 3/3: Review and accept Vingo Beta Vendor Agreement"}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <StoreIcon size={30} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full transition-all ${step === 1 ? "bg-amber-500 scale-125" : "bg-muted-foreground/30"}`} />
            <span className={`h-2.5 w-2.5 rounded-full transition-all ${step === 2 ? "bg-amber-500 scale-125" : "bg-muted-foreground/30"}`} />
            <span className={`h-2.5 w-2.5 rounded-full transition-all ${step === 3 ? "bg-amber-500 scale-125" : "bg-muted-foreground/30"}`} />
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (step === 1) handleNextFromAccount();
            else if (step === 2) handleNextFromStore();
            else handleSubmit();
          }}
          className="app-card mx-auto flex w-full max-w-2xl flex-col gap-5 rounded-3xl p-7 shadow-xl shadow-black/5"
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
                  className="app-control flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-caramel cursor-pointer"
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
                className="min-h-12 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue to Business Setup
              </button>
            </>
          ) : step === 2 ? (
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
                className="min-h-12 rounded-xl bg-amber-500 text-black font-extrabold px-6 py-3 transition hover:bg-amber-400 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Continue to Terms & Conditions →
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="app-control flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-xs"
              >
                <UserRound size={16} />
                Back to account details
              </button>
            </>
          ) : (
            <>
              {/* STEP 3: VENDOR TERMS & CONDITIONS */}
              <div className="flex flex-col gap-1 text-center pb-2 border-b border-border">
                <div className="mx-auto w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
                  <FileText size={22} />
                </div>
                <h2 className="text-xl font-bold app-heading">Vingo — Vendor Terms & Conditions</h2>
                <div className="flex items-center justify-center gap-2 text-[11px] app-muted font-medium">
                  <span>Version: Beta 1.0</span>
                  <span>•</span>
                  <span>Mandatory Review</span>
                </div>
              </div>

              {/* Scrollable Terms Agreement Box */}
              <div
                ref={termsScrollRef}
                onScroll={handleTermsScroll}
                className="max-h-80 overflow-y-auto pr-3 space-y-4 border-2 border-border/80 bg-secondary/20 p-4 sm:p-5 rounded-2xl text-xs leading-relaxed text-foreground shadow-inner focus:outline-none scroll-smooth"
                tabIndex={0}
              >
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-[11px] font-semibold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>
                    Please read through the terms below. You must scroll to the very end of this document to enable agreement and complete your registration.
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-foreground">Vingo — Vendor Terms & Conditions</h3>
                  <p className="text-[11px] app-muted">Version: Beta 1.0</p>
                  <p className="mt-2">
                    These Terms & Conditions apply to vendors and local businesses participating in the beta version of <strong>Vingo — Local Dukaan, Digital Udaan</strong> (“Vingo”, “Platform”, “we”, “us”, or “our”).
                  </p>
                  <p className="mt-1">
                    By registering a store and using Vingo to sell products, the vendor confirms that they have read and accepted these terms.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">1. Beta Program</h4>
                  <p className="app-muted">
                    During the beta testing period, selected vendors may use Vingo to list their businesses and receive customer orders without platform/access charges.
                  </p>
                  <p className="app-muted">
                    The purpose of this beta period is to test and improve store discovery, product listings, ordering, delivery coordination, payments, vendor operations, and the overall customer experience.
                  </p>
                  <p className="app-muted">
                    Vingo may modify, pause, or discontinue the beta program when necessary. Any platform fees, commissions, subscriptions, or other commercial charges introduced after the beta period will be communicated to vendors before they take effect.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">2. Vendor Information</h4>
                  <p className="app-muted">
                    Vendors must provide accurate information about their business, including, where applicable:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 app-muted">
                    <li>Store/business name</li>
                    <li>Owner's name</li>
                    <li>Contact number</li>
                    <li>Business address</li>
                    <li>Store location</li>
                    <li>Business category</li>
                    <li>Product information and pricing</li>
                    <li>Stock availability</li>
                    <li>Required verification documents</li>
                  </ul>
                  <p className="app-muted">
                    The vendor is responsible for keeping this information accurate and informing Vingo about relevant changes.
                  </p>
                  <p className="app-muted font-medium">
                    False, misleading, incomplete, or fraudulent information may result in suspension or removal from the platform.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">3. Products and Listings</h4>
                  <p className="app-muted">
                    The vendor is responsible for everything they publish about their products.
                  </p>
                  <p className="app-muted">
                    This includes product names, descriptions, images, prices, variants, stock levels, condition, and availability.
                  </p>
                  <p className="app-muted">
                    Products listed on Vingo should be genuinely available for fulfillment. Vendors must not knowingly list counterfeit, illegal, prohibited, unsafe, or otherwise unauthorized products.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">4. Handling Customer Orders</h4>
                  <p className="app-muted">
                    Once an order is accepted, the vendor is responsible for preparing the correct items according to the customer's order.
                  </p>
                  <p className="app-muted">
                    The vendor is expected to accept or reject orders promptly, prepare accepted orders within the expected preparation time, provide the correct products and quantities, package them appropriately, and notify Vingo if an accepted order cannot be fulfilled.
                  </p>
                  <p className="app-muted">
                    Repeated failure to fulfill accepted orders can result in warnings, temporary restrictions, suspension, or removal from Vingo.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">5. Wrong, Damaged, or Faulty Products</h4>
                  <p className="app-muted">
                    Vendors are responsible for making sure that customers receive what they ordered and that the products are in acceptable condition.
                  </p>
                  <p className="app-muted">Examples of fulfillment problems include:</p>
                  <ul className="list-disc pl-5 space-y-1 app-muted">
                    <li>Incorrect product</li>
                    <li>Incorrect quantity</li>
                    <li>Damaged product</li>
                    <li>Faulty product</li>
                    <li>Expired product, where applicable</li>
                    <li>Product that materially differs from its listing</li>
                  </ul>
                  <p className="app-muted">
                    Vingo may record and investigate complaints received from customers. If a vendor is responsible for more than three confirmed fulfillment mistakes, Vingo may impose a penalty. Depending on the severity and circumstances, this may include a monetary penalty, temporary suspension, product restrictions, temporary order restrictions, or removal from the platform.
                  </p>
                  <p className="app-muted">
                    Where a significant penalty is being considered, the vendor should have an opportunity to review or respond to the relevant incident before the penalty is applied.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">6. Sharing Vendor Contact Information</h4>
                  <p className="app-muted">
                    For legitimate order fulfillment and communication, certain vendor information may be visible to or shared with relevant users. This can include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 app-muted">
                    <li>Store/business name</li>
                    <li>Owner/vendor name</li>
                    <li>Business contact number</li>
                    <li>Relevant store address or location information</li>
                  </ul>
                  <p className="app-muted">
                    For an order involving the vendor, necessary contact information may also be provided to the assigned delivery partner so that the order can be collected and delivered successfully.
                  </p>
                  <p className="app-muted">
                    Vendor information obtained through Vingo must not be used for unrelated marketing, solicitation, or other unauthorized purposes.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">7. Vendor Payments and Weekly Settlement</h4>
                  <p className="app-muted">
                    During the beta period, Vingo may collect customer payments through the payment methods supported by the platform.
                  </p>
                  <p className="app-muted">
                    For eligible completed orders, the vendor's net earnings will be calculated after applicable adjustments.
                  </p>
                  <p className="app-muted">
                    Unless Vingo communicates otherwise, settlements will be processed every weekend for the eligible orders completed during the preceding week.
                  </p>
                  <p className="app-muted">The settlement amount may include adjustments for:</p>
                  <ul className="list-disc pl-5 space-y-1 app-muted">
                    <li>Completed orders</li>
                    <li>Refunds</li>
                    <li>Cancellations</li>
                    <li>Approved adjustments</li>
                    <li>Applicable penalties</li>
                    <li>Applicable platform charges, if introduced</li>
                  </ul>
                  <p className="app-muted">
                    If an order is disputed, refunded, under investigation, or requires additional verification, its settlement may be temporarily held. Vendors are responsible for providing correct bank or payment details for receiving settlements.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">8. Cancellations and Refunds</h4>
                  <p className="app-muted">
                    Orders may be cancelled for legitimate reasons, including vendor rejection, product unavailability, permitted customer cancellation, delivery failure, technical problems, or other fulfillment-related circumstances.
                  </p>
                  <p className="app-muted">
                    When a cancellation or order failure is attributable to the vendor, applicable adjustments may be made according to Vingo's policies.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">9. Delivery Partners</h4>
                  <p className="app-muted">
                    Vingo may assign a delivery partner to collect an order from the vendor and deliver it to the customer.
                  </p>
                  <p className="app-muted">
                    The vendor is expected to have the order ready when the delivery partner arrives, hand over the correct package, provide necessary order information, and cooperate with the delivery process.
                  </p>
                  <p className="app-muted">
                    Vendors must not intentionally interfere with or unnecessarily delay delivery operations.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">10. Delivery Verification</h4>
                  <p className="app-muted">
                    Vingo may use an order-specific verification method, such as an OTP, to confirm delivery.
                  </p>
                  <p className="app-muted">
                    Where OTP verification is enabled, the customer provides the verification code to the delivery partner as confirmation of successful delivery.
                  </p>
                  <p className="app-muted font-medium">
                    Vendors must not request or attempt to access customer delivery OTPs unless Vingo specifically requires it for a legitimate operational purpose.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">11. Professional Conduct</h4>
                  <p className="app-muted">
                    Vendors are expected to maintain professional conduct when dealing with customers, delivery partners, Vingo representatives, and other vendors.
                  </p>
                  <p className="app-muted">
                    Fraud, fake orders, manipulation of the platform, harassment, abuse, discrimination, or other conduct that negatively affects customers or the Vingo ecosystem is prohibited.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">12. Beta Availability</h4>
                  <p className="app-muted">
                    Vingo is currently operating as a beta service. As a result, vendors may experience bugs, downtime, temporary limitations, service interruptions, feature changes, or data synchronization problems.
                  </p>
                  <p className="app-muted">
                    Vingo will make reasonable efforts to maintain the platform but cannot guarantee uninterrupted service throughout the beta period.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">13. Vendor Responsibilities</h4>
                  <p className="app-muted">
                    The vendor remains responsible for the legality of their business and the products they sell.
                  </p>
                  <p className="app-muted">
                    This includes product quality, authenticity, pricing, availability, fulfillment, applicable licenses or regulatory requirements, and the accuracy of information supplied to Vingo and its customers.
                  </p>
                  <p className="app-muted font-medium">
                    Using Vingo does not transfer these responsibilities from the vendor to Vingo.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">14. Suspension and Removal</h4>
                  <p className="app-muted">
                    Vingo may restrict, suspend, or remove a vendor in situations involving repeated fulfillment failures, fraudulent activity, prohibited or illegal products, misleading listings, repeated customer complaints, platform abuse, unauthorized use of customer information, or serious violations of these terms.
                  </p>
                  <p className="app-muted">
                    Where reasonably possible, Vingo may notify the vendor and provide an opportunity to resolve the issue.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3">
                  <h4 className="font-bold text-foreground">15. Changes to the Terms</h4>
                  <p className="app-muted">
                    As Vingo develops beyond the beta stage, these terms may be revised. Vendors will be informed of material changes before the updated terms become applicable to them.
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/60 pt-3 pb-2">
                  <h4 className="font-bold text-foreground">16. Vendor Acceptance</h4>
                  <p className="app-muted">
                    By registering and operating a store on Vingo, the vendor confirms that:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 app-muted font-medium">
                    <li>The information supplied to Vingo is accurate.</li>
                    <li>They are authorized to operate the listed business.</li>
                    <li>They will responsibly fulfill customer orders.</li>
                    <li>They understand the beta payment and weekly settlement process.</li>
                    <li>They understand the fulfillment-error and penalty policy.</li>
                    <li>They consent to necessary business contact information being shared with relevant customers and assigned delivery partners for order-related purposes.</li>
                    <li>They agree to comply with these Vendor Terms & Conditions.</li>
                  </ul>
                </div>
              </div>

              {/* Scroll Status & Agreement Checkbox */}
              <div className="space-y-3 pt-2">
                {!hasScrolledToEnd ? (
                  <div
                    onClick={() => {
                      if (termsScrollRef.current) {
                        termsScrollRef.current.scrollTop = termsScrollRef.current.scrollHeight;
                        setHasScrolledToEnd(true);
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 cursor-pointer hover:bg-amber-500/15 transition-all text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronDown size={16} className="animate-bounce" />
                      <span>Scroll to the end to enable agreement</span>
                    </div>
                    <span className="text-[11px] underline">Scroll to bottom</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>Terms & Conditions reviewed completely</span>
                  </div>
                )}

                <label className={`flex items-start gap-3 p-3 rounded-2xl border transition-all select-none ${
                  !hasScrolledToEnd
                    ? "opacity-50 cursor-not-allowed border-border bg-muted/20"
                    : "cursor-pointer border-amber-500/40 bg-card hover:border-amber-500 shadow-xs"
                }`}>
                  <input
                    type="checkbox"
                    disabled={!hasScrolledToEnd}
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500/30 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-foreground leading-snug">
                    I confirm that I have read, understood, and agree to the <strong>Vingo Vendor Terms & Conditions (Beta 1.0)</strong>, and consent to store verification by Vingo Admin.
                  </span>
                </label>
              </div>

              {/* Admin Verification Reminder */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/70 flex items-start gap-2.5 text-[11px] app-muted">
                <ShieldCheck size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Admin Verification Notice:</strong> After submission, your store registration will be reviewed and verified by Vingo Admin before store opening and live order pool dispatch.
                </span>
              </div>

              {/* Final Submit Button */}
              <button
                type="submit"
                disabled={!hasScrolledToEnd || !agreedToTerms || isSubmitting}
                className="min-h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 py-3 transition shadow-md shadow-amber-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-500 cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Submitting store registration...</span>
                  </>
                ) : (
                  <span>Agree & Complete Registration</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="app-control flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-xs"
              >
                <StoreIcon size={16} />
                Back to store setup
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
