/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const UserContext = createContext();

const dummyUser = {
  username: "Aarav Patel",
  email: "aarav.patel@example.com",
  phone: "+91 98765 43210",
  dob: "2001-09-14",
  role: "customer",
  id: "frontend-dummy-user",
  avatar: null,
  activeAddressId: "addr-home",
  address: {
    id: "addr-home",
    label: "Home",
    line1: "22, Kalawad Road",
    line2: "Near Crystal Mall",
    city: "Rajkot",
    state: "Gujarat",
    pincode: "360005",
  },
  addresses: [
    {
      id: "addr-home",
      label: "Home",
      line1: "22, Kalawad Road",
      line2: "Near Crystal Mall",
      city: "Rajkot",
      state: "Gujarat",
      pincode: "360005",
    },
    {
      id: "addr-work",
      label: "Work",
      line1: "401, Orbit Plaza",
      line2: "Yagnik Road",
      city: "Rajkot",
      state: "Gujarat",
      pincode: "360001",
    },
  ],
  orderHistory: [
    {
      id: "ORD-1042",
      storeName: "Fresh Basket",
      date: "2026-07-12",
      status: "Delivered",
      total: 684,
      items: ["Milk", "Eggs", "Bread"],
      addressLabel: "Home",
    },
    {
      id: "ORD-1037",
      storeName: "Daily Dairy",
      date: "2026-07-06",
      status: "Delivered",
      total: 342,
      items: ["Cheese", "Butter"],
      addressLabel: "Work",
    },
    {
      id: "ORD-1029",
      storeName: "Green Grocers",
      date: "2026-06-28",
      status: "Cancelled",
      total: 219,
      items: ["Tomatoes", "Spinach", "Onion"],
      addressLabel: "Home",
    },
  ],
};

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(dummyUser);

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [accessToken, setAccessToken] = useState(null);

  const [refreshToken, setRefreshToken] = useState(null);

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
