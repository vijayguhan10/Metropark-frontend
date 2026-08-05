import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usersApi, toLocalDateTime } from "../../api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/";

  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' | 'signup'

  const validate = () => {
    const errs = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Valid email is required";
    }
    if (!form.password || form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (mode === "signup") {
      if (!form.name.trim()) errs.name = "Name is required";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      let backendUserId;

      if (mode === "signup") {
        // Backend assigns userId — we never send it
        const newUser = await usersApi.create({
          name: form.name,
          email: form.email,
          phone: form.phone,
          userStatus: "ACTIVE",
          createdAt: toLocalDateTime(),
        });
        // Handle JSON object or plain-text response (_raw)
        backendUserId = newUser?.userId ?? newUser?.user_id ?? newUser?.id ?? newUser?._raw?.trim() ?? null;
        if (!backendUserId) throw new Error("Server did not return a userId.");
      }

      login({
        email: form.email,
        name: form.name || form.email.split("@")[0],
        backendUserId,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || "Account creation failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30 mb-4">
            <svg
              className="w-9 h-9 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 17l4 4 4-4m-4-5v9M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Metropark
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Smart parking for the modern city
          </p>
        </div>

        {/* Card */}
        <div className="bg-white-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-white-800/60 rounded-xl p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setErrors({});
                }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === m
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="John Smith"
                  className={`w-full bg-white-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50 ${
                    errors.name
                      ? "border-red-500"
                      : "border-slate-700 focus:border-violet-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange("phone")}
                  placeholder="+1 555 000 0000"
                  className={`w-full bg-white-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50 ${
                    errors.phone
                      ? "border-red-500"
                      : "border-slate-700 focus:border-violet-500"
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className={`w-full bg-white-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50 ${
                  errors.email
                    ? "border-red-500"
                    : "border-slate-700 focus:border-violet-500"
                }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="••••••••"
                className={`w-full bg-white-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm outline-none transition-all focus:ring-2 focus:ring-violet-500/50 ${
                  errors.password
                    ? "border-red-500"
                    : "border-slate-700 focus:border-violet-500"
                }`}
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <p className="text-red-400 text-xs text-center -mb-1">{errors.submit}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 mt-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 pt-5 border-t border-slate-800">
            <p className="text-xs text-slate-500 text-center">
              Demo: use any valid email &amp; password (min 6 chars)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
