import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Shield, ArrowRight, Lock, Mail } from "lucide-react";
import { api, getApiErrorMessage } from "../lib/api";
import { UserContext } from "../context/UserContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setUser, setIsLoggedIn } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role: "admin",
      });

      if (response.data?.user) {
        setUser(response.data.user);
        setIsLoggedIn(true);
        toast.success("Authenticated as Admin");
        navigate("/admin/dashboard");
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Admin Login Failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-monochrome min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: "#fbfbfb",
        color: "#363537",
        fontFamily: "'Satoshi', 'Satoshi Fallback', sans-serif",
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#363537] text-[#fbfbfb] flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-[#363537]">
              Vingo Admin
            </h1>
            <p className="text-xs text-[#706f73] font-medium">
              System Control & Operations Console
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#e5e5e7] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#706f73]">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9e9da2] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecom.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fbfbfb] border border-[#e5e5e7] text-xs text-[#363537] placeholder-[#9e9da2] focus:outline-none focus:border-[#363537] transition font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#706f73]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9e9da2] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#fbfbfb] border border-[#e5e5e7] text-xs text-[#363537] placeholder-[#9e9da2] focus:outline-none focus:border-[#363537] transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#363537] hover:bg-[#201f21] text-[#fbfbfb] font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 pt-3"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#fbfbfb]/30 border-t-[#fbfbfb] rounded-full animate-spin" />
              ) : (
                <>
                  Authenticate Admin <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-[#9e9da2] text-center font-medium">
          Restricted Portal • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
