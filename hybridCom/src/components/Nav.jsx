import { useContext } from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext';
import { LogOut, Store, User } from 'lucide-react';
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
  const authPages = ["/login", "/signup", "/vendor-login", "/vendor-signup"];
  const isAuthPage = authPages.includes(location.pathname);
  const isStorePage = location.pathname === "/store";
  const avatarInitial = (user?.username?.trim()?.charAt(0) || "U").toUpperCase();

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

  return (
    <div className="border-b border-border bg-background">
      <div className="flex items-center justify-between gap-4 px-6 py-5">
        <Link to={"/"}>
          <h1 className="text-3xl font-bold">Local Ecom</h1>
        </Link>

        <div className="flex items-center gap-3">
          {!isLoggedIn && !isStorePage && (
            <Link
              to={"/store"}
              className="app-control flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
              aria-label="Open vendor store access"
              title="Vendor store access"
            >
              <Store size={20} />
            </Link>
          )}

          <ThemeToggleButton2
            variant="circle"
            start="top-left"
            blur={true}
          />

          {isLoggedIn && (
            <>
              <Link
                to={"/user"}
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-amber-400/40 bg-card text-lg font-bold text-amber-500 transition hover:border-amber-300 hover:bg-muted"
                aria-label="Open user profile"
                title="Profile"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.username || "User"} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : user?.username ? (
                  avatarInitial
                ) : (
                  <User size={20} />
                )}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-red-500/40 bg-card text-red-400 transition hover:border-red-400 hover:bg-red-500/10"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {!isLoggedIn && !isAuthPage && (
        <div className='w-full flex flex-wrap justify-around gap-3 px-6 pb-4'>
          {isStorePage ? (
            <>
              <Link to={"/vendor-login"} className='w-50 '>
                <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>vendor login</button>
              </Link>
              <Link to={"/vendor-signup"} className='w-50 '>
                <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>vendor signup</button>
              </Link>
            </>
          ) : (
            <>
              <Link to={"/login"} className='w-50 '>
                <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>user login</button>
              </Link>
              <Link to={"/signup"} className='w-50 '>
                <button className='bg-white text-black rounded-full w-full p-2 cursor-pointer '>user signup</button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Nav
