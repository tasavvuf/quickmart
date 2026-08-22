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
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliverySignup from "./pages/DeliverySignup";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Store from "./pages/Store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FloatingCart from "./components/FloatingCart";
import Cart from "./pages/Cart";
import UserPage from "./pages/UserPage";
import AddressBook from "./pages/AddressBook";
import OrderHistory from "./pages/OrderHistory";
import OrderDetail from "./pages/OrderDetail";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/react";

function App() {
  const { user, isLoggedIn, isCheckingAuth } = useContext(UserContext);

  const isVendor = isLoggedIn && user?.role === "vendor";
  const isDeliveryPartner = isLoggedIn && user?.role === "deliveryPartner";
  const isAdmin = isLoggedIn && user?.role === "admin";

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

  // Vendor gets ONLY vendor routes
  if (isVendor) {
    return (
      <div className="app-shell">
        <SeamlessPillBackground />
        <Nav />
        <div className="flex-1 min-h-0 relative z-10">
          <Routes>
            <Route path="/vendor-dashboard" element={<VendorDashboard />} />
            <Route path="/vendor-login" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/vendor-signup" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/vendor-dashboard" replace />} />
            <Route path="*" element={<Navigate to="/vendor-dashboard" replace />} />
          </Routes>
        </div>
        <ToastContainer />
        <Analytics />
      </div>
    );
  }

  // Delivery Partner gets Delivery Dashboard UI
  if (isDeliveryPartner) {
    return (
      <div className="app-shell">
        <SeamlessPillBackground />
        <Nav />
        <div className="flex-1 min-h-0 relative z-10">
          <Routes>
            <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
            <Route path="/delivery/login" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="/delivery/signup" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="/signup" element={<Navigate to="/delivery/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/delivery/dashboard" replace />} />
          </Routes>
        </div>
        <ToastContainer />
        <Analytics />
      </div>
    );
  }

  // Admin gets Admin Console UI
  if (isAdmin) {
    return (
      <div className="app-shell bg-slate-950">
        <div className="flex-1 min-h-0 relative z-10">
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
        <ToastContainer />
        <Analytics />
      </div>
    );
  }

  // Normal customer/guest routes
  return (
    <div className="app-shell">
      <SeamlessPillBackground />
      <Nav />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<HomeUI />} />
          <Route path="/store" element={<Store />} />
          <Route path="/vendor/:vendorId" element={<Vendor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-signup" element={<VendorSignup />} />
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery/signup" element={<DeliverySignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin/login" replace />}
          />
          <Route
            path="/delivery/dashboard"
            element={
              isLoggedIn
                ? <Navigate to="/" replace />
                : <Navigate to="/delivery/login" replace />
            }
          />
          <Route path="/cart" element={<Cart />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/address-book" element={<AddressBook />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
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
      </main>
      <Footer />
      <ToastContainer />
      <FloatingCart />
      <Analytics />
    </div>
  );
}

export default App;
