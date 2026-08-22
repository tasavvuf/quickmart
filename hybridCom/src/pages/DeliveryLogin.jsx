import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Bike, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { api, getApiErrorMessage } from "../lib/api";
import { UserContext } from "../context/UserContext";

export default function DeliveryLogin() {
  const navigate = useNavigate();
  const { applyAuthenticatedUser } = useContext(UserContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        userName: formData.email,
        email: formData.email,
        password: formData.password,
        role: "deliveryPartner",
      });

      const { user, token } = response.data;
      if (token) {
        localStorage.setItem("accessToken", JSON.stringify(token));
      }
      applyAuthenticatedUser(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate("/delivery/dashboard", { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed. Please check credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md app-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl bg-card/60">
        
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-500 shadow-lg shadow-amber-500/10">
            <Bike className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
            DELIVERY PARTNER PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Partner Sign In
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Access your active orders, distance details, and earnings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                name="email"
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@delivery.com"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/80 mb-2 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-secondary/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Sign In as Delivery Partner <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-3">
          <p className="text-xs text-muted-foreground">
            Don't have a delivery partner account?{" "}
            <Link
              to="/delivery/signup"
              className="text-amber-400 font-semibold hover:underline"
            >
              Register as Partner
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground/70">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure End-to-End Partner Authentication</span>
          </div>
        </div>

      </div>
    </div>
  );
}
