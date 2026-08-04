/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import { adaptUser } from "../lib/adapters";

export const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [accessToken, setAccessToken] = useState(null);

  const [refreshToken, setRefreshToken] = useState(null);

  const applyAuthenticatedUser = (nextUser, token = null) => {
    setUser(adaptUser(nextUser));
    setIsLoggedIn(true);
    setAccessToken(token);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/test");
        console.log("AUTH TEST RESPONSE");
        console.log(response.data);
        applyAuthenticatedUser(response.data.user);
        console.log("Applied authenticated user");
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const setActiveAddress = (addressId) => {
    setUser((current) => {
      const activeAddress = current.addresses?.find((address) => address.id === addressId);
      if (!activeAddress) return current;

      return {
        ...current,
        activeAddressId: addressId,
        address: activeAddress,
      };
    });
  };

  const addAddress = (address) => {
    const nextAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };

    setUser((current) => ({
      ...current,
      addresses: [...(current.addresses || []), nextAddress],
      activeAddressId: nextAddress.id,
      address: nextAddress,
    }));
  };

  const updateAddress = (addressId, addressUpdates) => {
    setUser((current) => {
      const addresses = (current.addresses || []).map((address) => {
        if (address.id !== addressId) return address;
        return {
          ...address,
          ...addressUpdates,
          id: addressId,
        };
      });

      const activeAddress = addresses.find((address) => address.id === current.activeAddressId);

      return {
        ...current,
        addresses,
        address: activeAddress || current.address,
      };
    });
  };

  const deleteAddress = (addressId) => {
    setUser((current) => {
      const addresses = (current.addresses || []).filter(
        (address) => address.id !== addressId
      );

      const wasActive = current.activeAddressId === addressId;
      const nextActive = wasActive ? addresses[0]?.id || null : current.activeAddressId;
      const activeAddress = addresses.find((address) => address.id === nextActive);

      return {
        ...current,
        addresses,
        activeAddressId: nextActive,
        address: activeAddress || null,
      };
    });
  };

  const value = {
    user,
    setUser,

    isLoggedIn,
    setIsLoggedIn,

    accessToken,
    setAccessToken,

    refreshToken,
    setRefreshToken,
    isCheckingAuth,
    applyAuthenticatedUser,

    setActiveAddress,
    addAddress,
    updateAddress,
    deleteAddress,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
