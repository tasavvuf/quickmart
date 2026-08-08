import { useContext, useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext';
import { LogOut, Store, User, Package } from 'lucide-react';
import { ThemeToggleButton2 } from './ui/skiper-ui/skiper4';
import { toast } from 'react-toastify';
import { api, getApiErrorMessage } from '../lib/api';

function Nav() {
  const {
    isLoggedIn,
    user,
    setUser,
    setIsLoggedIn,
    setAccessToken,
    setRefreshToken,
  } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeOrder, setActiveOrder] = useState(null);

  const authPages = ["/login", "/signup", "/vendor-login", "/vendor-signup"];
  const isAuthPage = authPages.includes(location.pathname);
  const isStorePage = location.pathname === "/store" || location.pathname.startsWith("/vendor");
  const avatarInitial = (user?.name?.trim()?.charAt(0) || user?.userName?.trim()?.charAt(0) || user?.username?.trim()?.charAt(0) || "U").toUpperCase();
  const isVendor = isLoggedIn && user?.role === "vendor";
  const isDeliveryPartner = isLoggedIn && user?.role === "deliveryPartner";

  const fetchActiveOrder = useCallback(async () => {
    if (!isLoggedIn || isVendor || isDeliveryPartner) return;
    try {
      const res = await api.get("/orders");
      if (res.data?.success && Array.isArray(res.data.orders)) {
        const found = res.data.orders.find(
          (o) =>
            o.vendorStatus !== "DELIVERED" &&
            o.vendorStatus !== "REJECTED" &&
            !o.userStatus?.includes("CANCELLED")
        );
        setActiveOrder(found || null);
      }
    } catch (err) {
      console.error("Nav order check error", err);
    }
  }, [isLoggedIn, isVendor, isDeliveryPartner]);

  useEffect(() => {
    fetchActiveOrder();

    if (isLoggedIn && !isVendor && !isDeliveryPartner) {
      const interval = setInterval(fetchActiveOrder, 5000);
      return () => clearInterval(interval);
    }
  }, [fetchActiveOrder, isLoggedIn, isVendor, isDeliveryPartner, location.pathname]);

  const handleLogout = async () => {
    try {
      const response = await api.get("/auth/logout");
      toast.success(response.data.message || "Logged out successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Logout failed"));
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setIsLoggedIn(false);
      setAccessToken(null);
      setRefreshToken(null);
      navigate("/login", { replace: true });
    }
  };

  const getBrandDestination = () => {
    if (isVendor) return "/vendor-dashboard";
    if (isDeliveryPartner) return "/delivery/dashboard";
    return "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-border bg-background/95 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {/* Brand Logo */}
        <Link to={getBrandDestination()} className="group flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-black text-2xl shadow-md border-2 border-border group-hover:scale-105 transition-transform">
            E
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {isVendor ? (
              <span className="flex items-center gap-2">
                Local Ecom 
                <span className="badge-yellow text-xs px-2.5 py-0.5">
                  Vendor
                </span>
              </span>
            ) : isDeliveryPartner ? (
              <span className="flex items-center gap-2">
                Local Ecom 
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Partner
                </span>
              </span>
            ) : (
              <span>Local Ecom</span>
            )}
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          {/* Active Order Button on Nav if customer has an ongoing order */}
          {isLoggedIn && !isVendor && !isDeliveryPartner && activeOrder && (
            <Link
              to={`/orders/${activeOrder._id}`}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition shadow-md shadow-amber-500/20 active:scale-95"
              title="Track your active order"
            >
              <Package size={15} />
              <span className="hidden sm:inline">Track Active Order</span>
              <span className="sm:hidden">Active Order</span>
            </Link>
          )}

          {!isLoggedIn && !isStorePage && (
            <Link
              to={"/store"}
              className="app-control flex h-11 px-4 items-center justify-center gap-2 text-xs font-black text-foreground hover:bg-secondary transition-all"
              aria-label="Vendor store portal"
              title="Vendor store portal"
            >
              <Store size={18} className="text-primary" />
              <span className="hidden sm:inline">Merchant Hub</span>
            </Link>
          )}

          {/* Theme Switcher Toggle */}
          <ThemeToggleButton2
            variant="circle"
            start="top-left"
            blur={true}
          />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              {!isVendor && !isDeliveryPartner && (
                <Link
                  to={"/user"}
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border bg-card text-base font-black text-foreground transition hover:border-sunyellow hover:scale-105"
                  aria-label="Open user profile"
                  title="Profile"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.username || "User"} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitial
                  )}
                </Link>
              )}
              {(isVendor || isDeliveryPartner) && (
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-card text-base font-black text-foreground shadow-sm"
                  title={user?.username || user?.name || "Partner"}
                >
                  {avatarInitial}
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-red-500/40 bg-card text-red-500 transition hover:bg-red-500/10 hover:border-red-500 active:scale-95"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : !isAuthPage ? (
            <div className="hidden sm:flex items-center gap-2.5">
              {isStorePage ? (
                <>
                  <Link to={"/vendor-login"}>
                    <button className="btn-secondary px-5 py-2.5 text-xs font-black">Vendor Login</button>
                  </Link>
                  <Link to={"/vendor-signup"}>
                    <button className="btn-primary px-5 py-2.5 text-xs font-black">Register Shop</button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={"/login"}>
                    <button className="btn-secondary px-5 py-2.5 text-xs font-black">User Login</button>
                  </Link>
                  <Link to={"/signup"}>
                    <button className="btn-primary px-5 py-2.5 text-xs font-black">User Signup</button>
                  </Link>
                  <Link to={"/delivery/login"}>
                    <button className="btn-secondary px-5 py-2.5 text-xs font-black">Delivery Portal</button>
                  </Link>
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav Action Buttons */}
      {!isLoggedIn && !isAuthPage && (
        <div className="sm:hidden w-full flex justify-center gap-3 px-6 pb-4 pt-1 border-t border-border/40">
          {isStorePage ? (
            <>
              <Link to={"/vendor-login"} className="flex-1">
                <button className="btn-secondary w-full py-2.5 text-xs font-black">Vendor Login</button>
              </Link>
              <Link to={"/vendor-signup"} className="flex-1">
                <button className="btn-primary w-full py-2.5 text-xs font-black">Register Shop</button>
              </Link>
            </>
          ) : (
            <>
              <Link to={"/login"} className="flex-1">
                <button className="btn-secondary w-full py-2.5 text-xs font-black">User Login</button>
              </Link>
              <Link to={"/signup"} className="flex-1">
                <button className="btn-primary w-full py-2.5 text-xs font-black">User Signup</button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Nav;
