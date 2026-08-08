import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { UserContext } from "./context/UserContext";

import Nav from "./components/Nav";
import SeamlessPillBackground from "./components/SeamlessPillBackground";
import VendorDashboard from "./pages/VendorDashboard";
import Vendor from "./pages/Vendor";
import HomeUI from "./pages/HomeUI";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VendorLogin from "./pages/VendorLogin";
import VendorSignup from "./pages/VendorSignup";
import Store from "./pages/Store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingCart from "./components/FloatingCart";
import Cart from "./pages/Cart";
import UserPage from "./pages/UserPage";
import AddressBook from "./pages/AddressBook";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";

function App() {
  const { user, isLoggedIn, isCheckingAuth } = useContext(UserContext);

  const isVendor = isLoggedIn && user?.role === "vendor";

  // While checking auth, render nothing (prevents flash of wrong routes)
  if (isCheckingAuth) {
    return (
      <div className="app-shell items-center justify-center">
        <SeamlessPillBackground />
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="app-muted text-sm font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Vendor gets ONLY vendor routes - no customer UI at all
  if (isVendor) {
    return (
      <div className="app-shell">
        <SeamlessPillBackground />
        <Nav />
        <div className="flex-1 min-h-0 relative z-10">
          <Routes>
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            {/* Allow auth pages so vendor can logout/re-login */}
            <Route path="/vendor-login" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/vendor-signup" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/vendor-dashboard" replace />} />
            {/* Catch-all: any other route sends vendor to their dashboard */}
            <Route path="*" element={<Navigate to="/vendor-dashboard" replace />} />
          </Routes>
        </div>
        <ToastContainer />
      </div>
    );
  }

  // Normal customer/guest routes
  return (
    <div className="app-shell">
      <SeamlessPillBackground />
      <Nav />
      <div className="flex-1 min-h-0 relative z-10">
        <Routes>
          <Route path="/" element={<HomeUI />} />
          <Route path="/store" element={<Store />} />
          <Route path="/vendor/:vendorId" element={<Vendor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          {/* Non-vendor trying to access vendor dashboard -> redirect to login */}
          <Route
            path="/vendor-dashboard"
            element={
              isLoggedIn
                ? <Navigate to="/" replace />
                : <Navigate to="/vendor-login" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastContainer />
      <FloatingCart />
    </div>
  );
}

export default App;
