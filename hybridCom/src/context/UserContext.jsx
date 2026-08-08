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

  const setActiveAddress = async (addressId) => {
    if (isLoggedIn) {
      try {
        const res = await api.put("/auth/addresses/select", { addressId });
        if (res.data?.user) {
          applyAuthenticatedUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error("Failed to set active address:", err);
      }
    }
    setUser((current) => {
      if (!current) return current;
      const activeAddress = current.addresses?.find(
        (address) => address.id === addressId || address._id === addressId
      );
      if (!activeAddress) return current;

      return {
        ...current,
        activeAddressId: addressId,
        selectedAddressId: addressId,
        currentDeliveryAddress: activeAddress,
        address: activeAddress.fullAddress || activeAddress.street || current.address,
      };
    });
  };

  const addAddress = async (addressData) => {
    if (isLoggedIn) {
      try {
        const res = await api.post("/auth/addresses", addressData);
        if (res.data?.user) {
          applyAuthenticatedUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error("Failed to add address:", err);
      }
    }
    const nextAddress = {
      ...addressData,
      id: `addr-${Date.now()}`,
      _id: `addr-${Date.now()}`,
      fullAddress:
        addressData.fullAddress ||
        `${addressData.line1 || addressData.street || ""}, ${addressData.line2 || addressData.area || ""}, ${addressData.city || ""}`.replace(/^, |, $/g, ""),
    };

    setUser((current) => ({
      ...current,
      addresses: [...(current?.addresses || []), nextAddress],
      activeAddressId: nextAddress.id,
      selectedAddressId: nextAddress.id,
      currentDeliveryAddress: nextAddress,
      address: nextAddress.fullAddress,
    }));
  };

  const updateAddress = async (addressId, addressUpdates) => {
    if (isLoggedIn) {
      try {
        const res = await api.put(`/auth/addresses/${addressId}`, addressUpdates);
        if (res.data?.user) {
          applyAuthenticatedUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error("Failed to update address:", err);
      }
    }
    setUser((current) => {
      if (!current) return current;
      const addresses = (current.addresses || []).map((address) => {
        if (address.id !== addressId && address._id !== addressId) return address;
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
        currentDeliveryAddress: activeAddress || current.currentDeliveryAddress,
        address: activeAddress?.fullAddress || current.address,
      };
    });
  };

  const setDefaultAddress = async (addressId) => {
    if (isLoggedIn) {
      try {
        const res = await api.put(`/auth/addresses/${addressId}/default`);
        if (res.data?.user) {
          applyAuthenticatedUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error("Failed to set default address:", err);
      }
    }
    setUser((current) => {
      if (!current) return current;
      const addresses = (current.addresses || []).map((a) => ({
        ...a,
        isDefault: a.id === addressId || a._id === addressId,
      }));
      const defaultAddress = addresses.find((a) => a.isDefault);
      return {
        ...current,
        addresses,
        defaultAddress,
        activeAddressId: addressId,
        selectedAddressId: addressId,
        currentDeliveryAddress: defaultAddress || current.currentDeliveryAddress,
        address: defaultAddress?.fullAddress || current.address,
      };
    });
  };

  const deleteAddress = async (addressId) => {
    if (isLoggedIn) {
      try {
        const res = await api.delete(`/auth/addresses/${addressId}`);
        if (res.data?.user) {
          applyAuthenticatedUser(res.data.user);
          return res.data.user;
        }
      } catch (err) {
        console.error("Failed to delete address:", err);
      }
    }
    setUser((current) => {
      if (!current) return current;
      const addresses = (current.addresses || []).filter(
        (address) => address.id !== addressId && address._id !== addressId
      );

      const wasActive = current.activeAddressId === addressId;
      const nextActive = wasActive ? addresses[0]?.id || null : current.activeAddressId;
      const activeAddress = addresses.find((address) => address.id === nextActive);

      return {
        ...current,
        addresses,
        activeAddressId: nextActive,
        selectedAddressId: nextActive,
        currentDeliveryAddress: activeAddress || null,
        address: activeAddress?.fullAddress || null,
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
    setDefaultAddress,
    deleteAddress,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
