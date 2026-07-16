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
  address: {
    label: "Home",
    line1: "22, Kalawad Road",
    line2: "Near Crystal Mall",
    city: "Rajkot",
    state: "Gujarat",
    pincode: "360005",
  },
};

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(dummyUser);

  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [accessToken, setAccessToken] = useState(null);

  const [refreshToken, setRefreshToken] = useState(null);

  const value = {
    user,
    setUser,

    isLoggedIn,
    setIsLoggedIn,

    accessToken,
    setAccessToken,

    refreshToken,
    setRefreshToken,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
