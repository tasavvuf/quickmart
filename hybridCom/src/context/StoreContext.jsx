/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptStores } from "../lib/adapters";
import { LocationDataContext } from "./LocationContext";

export const StoreContext = createContext();

export function StoreContextProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const locationCtx = useContext(LocationDataContext);

  const loadStores = useCallback(async (customLocation = null) => {
    setIsLoadingStores(true);

    try {
      let location = customLocation;
      if (!location || location.lat == null || location.lng == null) {
        if (locationCtx?.lat != null && locationCtx?.lng != null) {
          location = { lat: locationCtx.lat, lng: locationCtx.lng };
        } else if (locationCtx?.getUserLocation) {
          location = await locationCtx.getUserLocation();
        }
      }

      if (!location || location.lat == null || location.lng == null) {
        setIsLoadingStores(false);
        return;
      }

      const response = await api.get("/stores", {
        params: {
          lat: location.lat,
          lng: location.lng,
        },
      });

      const rawStores = response.data?.stores || response.data || [];
      setStores(adaptStores(rawStores));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load stores"));
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  }, [locationCtx?.lat, locationCtx?.lng, locationCtx?.getUserLocation]);

  useEffect(() => {
    if (locationCtx?.lat != null && locationCtx?.lng != null) {
      loadStores({ lat: locationCtx.lat, lng: locationCtx.lng });
    } else {
      loadStores();
    }
  }, [locationCtx?.lat, locationCtx?.lng, loadStores]);

  const value = {
    stores,
    setStores,
    isLoadingStores,
    loadStores,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
