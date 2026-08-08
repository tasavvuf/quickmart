/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { UserContext } from "./UserContext";
import {
  getIPLocation,
  getGPSLocation,
  getSavedUserLocation,
  DEFAULT_COORDINATES,
} from "../lib/locationService";
import { MapPin, Home, Navigation, CheckCircle2, AlertCircle } from "lucide-react";

export const LocationDataContext = createContext();

export function LocationContext({ children }) {
  const { user, isLoggedIn, isCheckingAuth } = useContext(UserContext) || {};

  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationSource, setLocationSource] = useState(null); // 'saved' | 'gps' | 'ip'
  const [locationName, setLocationName] = useState("Select Location");
  const [isLocationPending, setIsLocationPending] = useState(false);
  const [message, setMessage] = useState("Location is not fetched yet !!!");

  // UI Modal / Banner states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [selectedOption, setSelectedOption] = useState("saved"); // 'saved' | 'current'
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const promiseResolverRef = useRef(null);
  const authStateRef = useRef({ isCheckingAuth: true, isLoggedIn: false, user: null });

  useEffect(() => {
    authStateRef.current = { isCheckingAuth, isLoggedIn, user };
  }, [isCheckingAuth, isLoggedIn, user]);

  const waitForAuthCheck = useCallback(() => {
    return new Promise((resolve) => {
      if (!authStateRef.current.isCheckingAuth) {
        return resolve(authStateRef.current);
      }
      const interval = setInterval(() => {
        if (!authStateRef.current.isCheckingAuth) {
          clearInterval(interval);
          resolve(authStateRef.current);
        }
      }, 50);
    });
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  }, []);

  const saveLocationState = (coords) => {
    setLat(coords.lat);
    setLng(coords.lng);
    if (coords.source) setLocationSource(coords.source);
    if (coords.name) setLocationName(coords.name);
    setMessage(`Your latitude is ${coords.lat} and longitude is ${coords.lng}`);
  };

  /**
   * Strictly GPS location fetch (for Registration - NO IP fallback)
   */
  const fetchGPSOnlyLocation = useCallback(async () => {
    setMessage("Requesting GPS location access...");
    setIsGpsLoading(true);
    try {
      const gpsCoords = await getGPSLocation();
      const finalCoords = {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        source: "gps",
        name: "GPS Location",
      };
      saveLocationState(finalCoords);
      setMessage(`GPS Captured: Lat ${gpsCoords.lat.toFixed(4)}, Lng ${gpsCoords.lng.toFixed(4)}`);
      setIsGpsLoading(false);
      return { lat: gpsCoords.lat, lng: gpsCoords.lng };
    } catch (err) {
      console.warn("GPS location denied during registration", err);
      const errTxt = "GPS permission is strictly required for registration. Please enable location access in your browser.";
      setMessage(errTxt);
      setErrorMessage(errTxt);
      setIsGpsLoading(false);
      return null;
    }
  }, []);

  /**
   * Direct location fetch method (e.g. for store flow)
   */
  const fetchDirectLocation = useCallback(async () => {
    setMessage("Fetching location...");
    setIsGpsLoading(true);
    try {
      const gpsCoords = await getGPSLocation();
      const finalCoords = {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        source: "gps",
        name: "Current Location",
      };
      saveLocationState(finalCoords);
      setIsGpsLoading(false);
      return { lat: gpsCoords.lat, lng: gpsCoords.lng };
    } catch (err) {
      console.warn("GPS failed, falling back to IP Location", err);
      try {
        const ipCoords = await getIPLocation();
        const finalCoords = {
          lat: ipCoords.lat,
          lng: ipCoords.lng,
          source: "ip",
          name: ipCoords.city ? `${ipCoords.city} (IP)` : "IP Location",
        };
        saveLocationState(finalCoords);
        setIsGpsLoading(false);
        return { lat: ipCoords.lat, lng: ipCoords.lng };
      } catch {
        setMessage("Failed to fetch location.");
        setIsGpsLoading(false);
        return null;
      }
    }
  }, []);

  /**
   * Main helper: async function getUserLocation()
   * Returns { lat, lng }
   */
  const getUserLocation = useCallback((arg) => {
    // If called as event handler (e.g. onClick={getUserLocation}) or direct flag
    const isDirectCall =
      arg &&
      (arg.nativeEvent ||
        arg.direct ||
        arg.target ||
        (typeof arg === "object" && ("preventDefault" in arg || "stopPropagation" in arg)));

    if (isDirectCall) {
      return fetchDirectLocation();
    }

    return new Promise(async (resolve) => {
      // If already resolved in this session, return existing coords immediately
      if (lat != null && lng != null && !isLocationPending && !showAuthModal && !showPermissionBanner) {
        return resolve({ lat, lng });
      }

      setIsLocationPending(true);
      setErrorMessage("");

      // Wait for UserContext to finish checking auth (/auth/test)
      const currentAuth = await waitForAuthCheck();
      const currentIsLoggedIn = currentAuth.isLoggedIn;

      console.log("========== LOCATION ==========");
      console.log(currentAuth);
      console.log("isCheckingAuth:", currentAuth.isCheckingAuth);
      console.log("isLoggedIn:", currentAuth.isLoggedIn);
      console.log("user:", currentAuth.user);

      // 1. Authenticated User
      if (currentIsLoggedIn) {
        const defaultAddr =
          currentAuth.user?.defaultAddress ||
          currentAuth.user?.addresses?.find((a) => a.isDefault);

        if (defaultAddr && defaultAddr.location?.coordinates?.length === 2) {
          const [dLng, dLat] = defaultAddr.location.coordinates;
          const finalCoords = {
            lat: dLat,
            lng: dLng,
            source: "saved",
            name: defaultAddr.label ? `Saved (${defaultAddr.label})` : "Default Address",
          };
          saveLocationState(finalCoords);
          setIsLocationPending(false);
          return resolve({ lat: dLat, lng: dLng });
        }

        // If no default address set, prompt user every time
        promiseResolverRef.current = resolve;
        setShowAuthModal(true);
        return;
      }

      // 2. Guest User -> Show Permission Banner ("📍 Allow location")
      promiseResolverRef.current = resolve;
      setShowPermissionBanner(true);
    });
  }, [lat, lng, isLocationPending, showAuthModal, showPermissionBanner, fetchDirectLocation, waitForAuthCheck]);

  // Handler for Authenticated Modal - "Use Saved Location"
  const handleSelectSavedLocation = () => {
    const savedUserLoc = getSavedUserLocation(user) || DEFAULT_COORDINATES;
    const finalCoords = {
      lat: savedUserLoc.lat,
      lng: savedUserLoc.lng,
      source: "saved",
      name: "Saved Location",
    };

    saveLocationState(finalCoords);
    setShowAuthModal(false);
    setIsLocationPending(false);

    if (promiseResolverRef.current) {
      promiseResolverRef.current({ lat: finalCoords.lat, lng: finalCoords.lng });
      promiseResolverRef.current = null;
    }
  };

  // Handler for Authenticated Modal - "Use Current Location" OR Guest "Allow"
  const handleRequestGPS = async () => {
    setIsGpsLoading(true);
    setErrorMessage("");

    try {
      const gpsCoords = await getGPSLocation();
      const finalCoords = {
        lat: gpsCoords.lat,
        lng: gpsCoords.lng,
        source: "gps",
        name: "Current Location",
      };

      saveLocationState(finalCoords);
      setShowAuthModal(false);
      setShowPermissionBanner(false);
      setIsLocationPending(false);

      if (promiseResolverRef.current) {
        promiseResolverRef.current({ lat: finalCoords.lat, lng: finalCoords.lng });
        promiseResolverRef.current = null;
      }
    } catch (err) {
      console.warn("GPS permission denied or failed, falling back to IP Location", err);
      setErrorMessage("GPS permission denied. Using IP location.");

      // Fallback to IP Location
      const ipCoords = await getIPLocation();
      const finalCoords = {
        lat: ipCoords.lat,
        lng: ipCoords.lng,
        source: "ip",
        name: ipCoords.city ? `${ipCoords.city} (IP)` : "IP Location",
      };

      saveLocationState(finalCoords);
      setShowAuthModal(false);
      setShowPermissionBanner(false);
      setIsLocationPending(false);

      if (promiseResolverRef.current) {
        promiseResolverRef.current({ lat: finalCoords.lat, lng: finalCoords.lng });
        promiseResolverRef.current = null;
      }
    } finally {
      setIsGpsLoading(false);
    }
  };

  // Handler for "Not Now" / IP location button
  const handleUseIPLocation = async () => {
    setIsGpsLoading(true);
    try {
      const ipCoords = await getIPLocation();
      const finalCoords = {
        lat: ipCoords.lat,
        lng: ipCoords.lng,
        source: "ip",
        name: ipCoords.city ? `${ipCoords.city} (IP)` : "IP Location",
      };

      saveLocationState(finalCoords);
      setShowPermissionBanner(false);
      setShowAuthModal(false);
      setIsLocationPending(false);

      if (promiseResolverRef.current) {
        promiseResolverRef.current({ lat: finalCoords.lat, lng: finalCoords.lng });
        promiseResolverRef.current = null;
      }
    } finally {
      setIsGpsLoading(false);
    }
  };

  const rePromptLocationChoice = () => {
    setLat(null);
    setLng(null);
    const savedUserLoc = isLoggedIn ? getSavedUserLocation(user) : null;
    if (isLoggedIn && savedUserLoc) {
      setShowAuthModal(true);
    } else {
      setShowPermissionBanner(true);
    }
  };

  const savedUserLocationData = isLoggedIn ? getSavedUserLocation(user) : null;

  return (
    <LocationDataContext.Provider
      value={{
        getUserLocation,
        fetchDirectLocation,
        fetchGPSOnlyLocation,
        message,
        setMessage,
        lat,
        setLat,
        lng,
        setLng,
        locationSource,
        locationName,
        isLocationPending,
        calculateDistance,
        rePromptLocationChoice,
      }}
    >
      {children}

      {/* 1. Authenticated User Modal: Welcome back 👋 Choose your location */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="app-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-amber-400/20 bg-background text-foreground">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-500">
                <MapPin size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome back 👋</h2>
                <p className="app-muted text-xs">Choose your location to view nearby stores</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {/* Option 1: Saved Location */}
              <button
                type="button"
                onClick={() => setSelectedOption("saved")}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedOption === "saved"
                    ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="mt-0.5 text-amber-400">
                  <Home size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Use Saved Location 🏠</span>
                    {selectedOption === "saved" && <CheckCircle2 size={16} className="text-amber-400" />}
                  </div>
                  <p className="app-muted text-xs truncate mt-0.5">
                    {savedUserLocationData?.address || "Fast store loading • No GPS wait"}
                  </p>
                </div>
              </button>

              {/* Option 2: Current Location */}
              <button
                type="button"
                onClick={() => setSelectedOption("current")}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedOption === "current"
                    ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400"
                    : "border-border bg-card hover:bg-muted"
                }`}
              >
                <div className="mt-0.5 text-amber-400">
                  <Navigation size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Use Current Location 📍</span>
                    {selectedOption === "current" && <CheckCircle2 size={16} className="text-amber-400" />}
                  </div>
                  <p className="app-muted text-xs mt-0.5">Use your device GPS coordinates</p>
                </div>
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                disabled={isGpsLoading}
                onClick={() => {
                  if (selectedOption === "saved") {
                    handleSelectSavedLocation();
                  } else {
                    handleRequestGPS();
                  }
                }}
                className="w-full py-3 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isGpsLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Fetching GPS...
                  </>
                ) : (
                  "Confirm Selection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Guest / Permission Banner: Tiny Popup 📍 Allow location [Allow] [Not now] */}
      {showPermissionBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-bottom-5 duration-300">
          <div className="app-card rounded-2xl p-4 shadow-2xl border border-amber-400/30 bg-background/95 backdrop-blur-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-500">
                <MapPin size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold truncate">📍 Allow location</h4>
                <p className="app-muted text-xs truncate">To find nearby stores and products</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isGpsLoading}
                onClick={handleUseIPLocation}
                className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-muted transition cursor-pointer"
              >
                Not now
              </button>

              <button
                type="button"
                disabled={isGpsLoading}
                onClick={handleRequestGPS}
                className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {isGpsLoading ? (
                  <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : null}
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </LocationDataContext.Provider>
  );
}

export default LocationContext;
