/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../lib/api";
import { adaptProductsToStores } from "../lib/adapters";

export const StoreContext = createContext();

export function StoreContextProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const loadStores = async () => {
    setIsLoadingStores(true);

    try {
      const response = await api.get("/products");
      setStores(adaptProductsToStores(response.data));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load products"));
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);


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
