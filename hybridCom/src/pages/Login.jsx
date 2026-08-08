import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext";
import { api, getApiErrorMessage } from "../lib/api";
import { LogIn, ShieldCheck } from "lucide-react";

function Login({
  role = "user",
  title = "Login",
  submitLabel = "Sign In",
  signupPath = "/signup",
  successPath = "/",
}) {
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const { applyAuthenticatedUser, setRefreshToken } = useContext(UserContext);
  const navigate = useNavigate();

  const signinapicall = async () => {
    if (!username || !password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await api.post("/auth/login", {
        userName: username,
        email: username,
        password,
        role,
      });

      toast.success(response.data.message || "Login successful");
      localStorage.setItem("accessToken", JSON.stringify(response.data.token));
      setRefreshToken(null);
      applyAuthenticatedUser(response.data.user, response.data.token);
      navigate(successPath, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Login failed"));
    }
  };

  return (
    <div className="app-page flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md flex flex-col gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="app-card p-8 rounded-3xl flex flex-col gap-6 shadow-2xl border-2 border-border bg-card"
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground border-2 border-border shadow-md mb-1">
              {role === "vendor" ? <ShieldCheck size={28} /> : <LogIn size={28} />}
            </div>
            <h2 className="text-3xl font-black text-foreground">{title}</h2>
            <p className="text-muted-foreground text-xs font-semibold">
              {role === "vendor"
                ? "Enter your merchant account credentials."
                : "Enter your customer account credentials."}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-foreground">
                Username or Email
              </label>
              <input
                type="text"
                name="username"
                placeholder="e.g. john_doe"
                value={username}
                onChange={(e) => {
                  setusername(e.target.value);
                }}
                className="app-input rounded-xl px-4 py-3 text-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-foreground">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setpassword(e.target.value);
                }}
                className="app-input rounded-xl px-4 py-3 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-sm font-black shadow-lg cursor-pointer rounded-full"
            onClick={(e) => {
              e.preventDefault();
              signinapicall();
            }}
          >
            {submitLabel}
          </button>

          <div className="pt-3 border-t-2 border-border/60 text-center">
            <button
              type="button"
              className="text-xs font-black text-foreground hover:underline cursor-pointer"
              onClick={() => navigate(signupPath)}
            >
              Create {role === "vendor" ? "vendor" : "user"} account →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
