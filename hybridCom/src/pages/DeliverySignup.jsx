import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bike,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  ShieldCheck,
  Upload,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  Car
} from "lucide-react";
import Stepper from "../components/Stepper";
import { getGPSLocation } from "../lib/locationService";
import { api, getApiErrorMessage } from "../lib/api";
import { UserContext } from "../context/UserContext";

const vehicleOptions = ["Motorcycle", "Scooter", "Bicycle", "Car"];

const initialAccount = {
  name: "",
  phoneNumber: "",
  userName: "",
  email: "",
  password: "",
  address: "",
};

const initialPersonalInfo = {
  dateOfBirth: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  street: "",
  area: "",
  pincode: "",
  city: "Rajkot",
  state: "Gujarat",
  landmark: "",
};

const initialVehicleInfo = {
  vehicleType: "Motorcycle",
  vehicleNumber: "",
  drivingLicenseNumber: "",
  vehicleModel: "",
  insuranceNumber: "",
};

export default function DeliverySignup() {
  const navigate = useNavigate();
  const { applyAuthenticatedUser } = useContext(UserContext);

  const [activeStep, setActiveStep] = useState(1);
  const [account, setAccount] = useState(initialAccount);
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [vehicleInfo, setVehicleInfo] = useState(initialVehicleInfo);

  // File states for ImageKit upload
  const [files, setFiles] = useState({
    profilePhoto: null,
    drivingLicense: null,
    vehicleRC: null,
    vehicleInsurance: null,
    aadhaarCard: null,
    panCard: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS Location State
  const [regLat, setRegLat] = useState(null);
  const [regLng, setRegLng] = useState(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("Location not captured yet");

  const handleFetchGpsLocation = async () => {
    setIsFetchingGps(true);
    setGpsMessage("Requesting GPS location access...");
    try {
      const coords = await getGPSLocation();
      setRegLat(coords.lat);
      setRegLng(coords.lng);
      setGpsMessage(`Captured: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      toast.success("GPS location captured successfully!");
    } catch (err) {
      console.warn("GPS failed during delivery partner signup:", err);
      setRegLat(null);
      setRegLng(null);
      const errTxt = "GPS permission required for delivery partner registration.";
      setGpsMessage(errTxt);
      toast.error(errTxt);
    } finally {
      setIsFetchingGps(false);
    }
  };

  const updateAccount = (field, value) => setAccount((prev) => ({ ...prev, [field]: value }));
  const updatePersonalInfo = (field, value) => setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  const updateVehicleInfo = (field, value) => setVehicleInfo((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (field, e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prev) => ({ ...prev, [field]: e.target.files[0] }));
    }
  };

  // Step Validations
  const validateStep1 = () => {
    if (!account.name || !account.phoneNumber || !account.userName || !account.email || !account.password || !account.address) {
      toast.error("Please fill all account fields");
      return false;
    }
    if (regLat == null || regLng == null) {
      toast.error("GPS location is strictly required. Click 'Fetch GPS Location'");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!personalInfo.dateOfBirth || !personalInfo.emergencyContactName || !personalInfo.emergencyContactNumber || !personalInfo.street || !personalInfo.city || !personalInfo.pincode) {
      toast.error("Please fill all required personal and address details");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!vehicleInfo.vehicleNumber || !vehicleInfo.drivingLicenseNumber || !vehicleInfo.vehicleModel) {
      toast.error("Please fill all vehicle and license details");
      return false;
    }
    return true;
  };

  const handleStepChange = (newStep) => {
    if (newStep > activeStep) {
      if (activeStep === 1 && !validateStep1()) return;
      if (activeStep === 2 && !validateStep2()) return;
      if (activeStep === 3 && !validateStep3()) return;
    }
    setActiveStep(newStep);
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Basic user fields
      formData.append("name", account.name.trim());
      formData.append("phoneNumber", account.phoneNumber.trim());
      formData.append("userName", account.userName.trim());
      formData.append("email", account.email.trim());
      formData.append("password", account.password);
      formData.append("address", account.address.trim());
      formData.append("role", "deliveryPartner");

      // GeoJSON location
      formData.append("location", JSON.stringify({ lat: regLat, lng: regLng }));

      // Profile details
      const deliveryPartnerProfile = {
        dateOfBirth: personalInfo.dateOfBirth,
        emergencyContactName: personalInfo.emergencyContactName,
        emergencyContactNumber: personalInfo.emergencyContactNumber,
        currentAddress: {
          street: personalInfo.street,
          area: personalInfo.area,
          pincode: personalInfo.pincode,
          city: personalInfo.city,
          state: personalInfo.state,
          landmark: personalInfo.landmark,
        },
        vehicleType: vehicleInfo.vehicleType,
        vehicleNumber: vehicleInfo.vehicleNumber,
        drivingLicenseNumber: vehicleInfo.drivingLicenseNumber,
        vehicleModel: vehicleInfo.vehicleModel,
        insuranceNumber: vehicleInfo.insuranceNumber,
      };

      formData.append("deliveryPartnerProfile", JSON.stringify(deliveryPartnerProfile));

      // Append files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          formData.append(key, file);
        }
      });

      const response = await api.post("/auth/reg/delivery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { user, token } = response.data;
      if (token) {
        localStorage.setItem("accessToken", JSON.stringify(token));
      }
      applyAuthenticatedUser(user, token);
      toast.success("Registration successful! Welcome to the Delivery Team.");
      navigate("/delivery/dashboard", { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Bike className="w-4 h-4" /> Delivery Partner Onboarding
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Become a Delivery Partner</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Complete the step-by-step registration to start accepting delivery orders near you.
          </p>
        </div>

        {/* Stepper Container */}
        <Stepper
          activeStep={activeStep}
          onStepChange={handleStepChange}
          onFinalStepCompleted={handleSubmit}
          nextButtonText={activeStep === 4 ? (isSubmitting ? "Submitting..." : "Complete Registration") : "Continue"}
        >
          
          {/* STEP 1: Account & GPS */}
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Account Credentials & Location</h3>
                <p className="text-xs text-muted-foreground">Basic information and your primary delivery area GPS</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => updateAccount("name", e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={account.phoneNumber}
                  onChange={(e) => updateAccount("phoneNumber", e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Username *</label>
                <input
                  type="text"
                  value={account.userName}
                  onChange={(e) => updateAccount("userName", e.target.value)}
                  placeholder="rahul_rider"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={account.email}
                  onChange={(e) => updateAccount("email", e.target.value)}
                  placeholder="rahul@delivery.com"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Password *</label>
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => updateAccount("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Primary Base Address *</label>
                <input
                  type="text"
                  value={account.address}
                  onChange={(e) => updateAccount("address", e.target.value)}
                  placeholder="Sardarnagar Main Road, Rajkot, Gujarat"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            {/* GPS Location Capture */}
            <div className="p-4 rounded-2xl bg-secondary/20 border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500" /> GPS Location Verification *
                </span>
                <button
                  type="button"
                  onClick={handleFetchGpsLocation}
                  disabled={isFetchingGps}
                  className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {isFetchingGps ? "Fetching..." : "Fetch GPS Location"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{gpsMessage}</p>
              {regLat != null && regLng != null && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Valid GeoJSON Coordinates ({regLat.toFixed(4)}, {regLng.toFixed(4)})
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: Personal & Emergency Info */}
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Personal & Emergency Details</h3>
                <p className="text-xs text-muted-foreground">Emergency contacts and current address details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Date of Birth *</label>
                <input
                  type="date"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => updatePersonalInfo("dateOfBirth", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Emergency Contact Name *</label>
                <input
                  type="text"
                  value={personalInfo.emergencyContactName}
                  onChange={(e) => updatePersonalInfo("emergencyContactName", e.target.value)}
                  placeholder="Suresh Sharma (Father)"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Emergency Contact Number *</label>
                <input
                  type="tel"
                  value={personalInfo.emergencyContactNumber}
                  onChange={(e) => updatePersonalInfo("emergencyContactNumber", e.target.value)}
                  placeholder="9876543100"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Street *</label>
                <input
                  type="text"
                  value={personalInfo.street}
                  onChange={(e) => updatePersonalInfo("street", e.target.value)}
                  placeholder="Street 5, Sardarnagar Main"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Area / Landmark</label>
                <input
                  type="text"
                  value={personalInfo.area}
                  onChange={(e) => updatePersonalInfo("area", e.target.value)}
                  placeholder="Near Poojara Telecom"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">City *</label>
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={(e) => updatePersonalInfo("city", e.target.value)}
                  placeholder="Rajkot"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Pincode *</label>
                <input
                  type="text"
                  value={personalInfo.pincode}
                  onChange={(e) => updatePersonalInfo("pincode", e.target.value)}
                  placeholder="360001"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Vehicle Info */}
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Vehicle & Driver License Details</h3>
                <p className="text-xs text-muted-foreground">Information about your delivery vehicle and permit</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Vehicle Type *</label>
                <select
                  value={vehicleInfo.vehicleType}
                  onChange={(e) => updateVehicleInfo("vehicleType", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {vehicleOptions.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Vehicle Number *</label>
                <input
                  type="text"
                  value={vehicleInfo.vehicleNumber}
                  onChange={(e) => updateVehicleInfo("vehicleNumber", e.target.value)}
                  placeholder="GJ-03-AB-1234"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Driving License Number *</label>
                <input
                  type="text"
                  value={vehicleInfo.drivingLicenseNumber}
                  onChange={(e) => updateVehicleInfo("drivingLicenseNumber", e.target.value)}
                  placeholder="GJ0320220001234"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Vehicle Model *</label>
                <input
                  type="text"
                  value={vehicleInfo.vehicleModel}
                  onChange={(e) => updateVehicleInfo("vehicleModel", e.target.value)}
                  placeholder="Honda Activa 6G"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-foreground/80 mb-1">Insurance Policy Number</label>
                <input
                  type="text"
                  value={vehicleInfo.insuranceNumber}
                  onChange={(e) => updateVehicleInfo("insuranceNumber", e.target.value)}
                  placeholder="INS-2026-001234"
                  className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Document Uploads */}
          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Document Verification Uploads</h3>
                <p className="text-xs text-muted-foreground">Upload identity and vehicle documents for admin verification</p>
              </div>
            </div>

            {/* Privacy Alert */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
              <div>
                <span className="font-semibold text-blue-200">Strict Privacy Guarantee:</span> Uploaded documents are encrypted & accessible <strong>only to system administrators</strong> for verification. They will not be visible to vendors or users.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "profilePhoto", label: "Profile Photo", desc: "Clear front-facing photo" },
                { key: "drivingLicense", label: "Driving License", desc: "Front & Back copy" },
                { key: "vehicleRC", label: "Vehicle RC", desc: "Registration Certificate" },
                { key: "vehicleInsurance", label: "Vehicle Insurance", desc: "Valid insurance policy" },
                { key: "aadhaarCard", label: "Aadhaar Card", desc: "Government ID Proof" },
                { key: "panCard", label: "PAN Card", desc: "Identity & Tax Proof" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="p-3.5 rounded-xl bg-secondary/20 border border-border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-foreground">{label}</span>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    {files[key] ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    )}
                  </div>

                  <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-secondary/50 hover:bg-secondary border border-border rounded-lg text-xs font-semibold text-foreground/80 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-500" />
                    <span>{files[key] ? files[key].name : "Choose File"}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileChange(key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              ))}
            </div>

          </div>

        </Stepper>

        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Already registered as a delivery partner?{" "}
            <Link to="/delivery/login" className="text-amber-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
