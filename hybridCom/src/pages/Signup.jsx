import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getGPSLocation } from "../lib/locationService";
import { api, getApiErrorMessage } from "../lib/api";

export default function Signup({
  role = "user",
  title = "Sign up",
  submitLabel = "Sign up",
  loginPath = "/login",
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [username, setusername] = useState("");
  const [address, setAddress] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);

  // Isolated Registration GPS State
  const [regLat, setRegLat] = useState(null);
  const [regLng, setRegLng] = useState(null);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState(
    "Location is not fetched yet !!!",
  );

  const handleFetchGpsLocation = async () => {
    setIsFetchingGps(true);
    setGpsMessage("Requesting GPS location access...");
    try {
      const coords = await getGPSLocation();
      setRegLat(coords.lat);
      setRegLng(coords.lng);
      setGpsMessage(
        `GPS Captured: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`,
      );
      toast.success("GPS location captured successfully!");
    } catch (err) {
      console.warn("GPS failed during signup:", err);
      setRegLat(null);
      setRegLng(null);
      const errTxt =
        "GPS permission is strictly required for registration. Please enable location access in your browser.";
      setGpsMessage(errTxt);
      toast.error(errTxt);
    } finally {
      setIsFetchingGps(false);
    }
  };

  const signupapicall = async () => {
    if (!name || !phoneNumber || !email || !password || !username || !address) {
      toast.error("Please fill all fields");
      return;
    }

    if (regLat == null || regLng == null) {
      toast.error(
        "GPS location permission is strictly required for signup. Please click 'Fetch GPS location' and grant access.",
      );
      return;
    }

    try {
      const formData = new FormData();

      formData.append("userName", username);
      formData.append("name", name);
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("address", address);
      formData.append("location", JSON.stringify({ lat: regLat, lng: regLng }));
      formData.append("role", role);

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      const response = await api.post("/auth/reg", formData);

      toast.success(response.data.message || "Signup successful!");
      navigate(loginPath);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Signup failed"));
    }
  };

  return (
    <div className="app-page flex flex-col items-center justify-start px-6 pt-6 pb-16">
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="app-card p-8 rounded-3xl flex flex-col gap-6 w-full max-w-md"
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="app-muted text-sm">
            {role === "vendor"
              ? "Create your vendor account to manage seller access."
              : "Create your customer account."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <label>username</label>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => {
              setusername(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>name</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>phone number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>email</label>
          <input
            type="text"
            name="email"
            value={email}
            onChange={(e) => {
              setemail(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => {
              setpassword(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>address</label>
          <input
            type="text"
            name="address"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label>profile photo</label>
          <input
            type="file"
            name="profilePhoto"
            accept="image/*"
            onChange={(e) => {
              setProfilePhoto(e.target.files?.[0] || null);
            }}
            className="app-input rounded-lg px-4 py-3"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={isFetchingGps}
            className="app-control px-6 py-3 text-caramel rounded-lg text-lg cursor-pointer flex items-center justify-center gap-2"
            onClick={handleFetchGpsLocation}
          >
            {isFetchingGps
              ? "Requesting GPS Access..."
              : "Fetch GPS Location 📍"}
          </button>
          <p className="app-muted text-sm text-center">{gpsMessage}</p>
          {regLat != null && regLng != null && (
            <p className="text-green-400 text-xs text-center font-semibold">
              ✓ GPS Location Captured ({regLat.toFixed(4)}, {regLng.toFixed(4)})
            </p>
          )}
        </div>

        <button
          type="submit"
          className="app-control px-6 py-3 text-caramel rounded-lg text-lg"
          onClick={(e) => {
            e.preventDefault();
            signupapicall();
          }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          className="app-muted text-sm underline underline-offset-4"
          onClick={() => navigate(loginPath)}
        >
          Already have a {role === "vendor" ? "vendor" : "user"} account?
        </button>
      </form>
    </div>
  );
}
