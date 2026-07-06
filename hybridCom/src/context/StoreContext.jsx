/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { stores as fakeStores } from "../data/stores";

export const StoreContext = createContext();

export function StoreContextProvider({ children }) {
  const [stores, setStores] = useState(fakeStores);

  const [selectedStore, setSelectedStore] = useState(null);

  const value = {
    stores,
    setStores,

    selectedStore,
    setSelectedStore,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}
