import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { usersApi, toLocalDateTime } from "../../api";

export default function Login() {
  const { login, loginWithPhone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from
    ? location.state.from.pathname + (location.state.from.search || "")
    : "/";

  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    name: "", 
    phone: "",
    loginPhone: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' | 'signup'

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/[^\d+]/g, '');
    return /^\+?\d{10,15}$/.test(cleaned);
  };

  const validate = () => {
    const errs = {};
    
    if (mode === "login") {
      if (!form.loginPhone.trim()) {
        errs.loginPhone = "Phone number is required";
      } else if (!validatePhone(form.loginPhone)) {
        errs.loginPhone = "Please enter a valid phone number (10-15 digits)";
      }
    } else {
      if (!form.name.trim()) errs.name = "Full name is required";
      if (!form.email.trim()) {
        errs.email = "Email address is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = "Please enter a valid email address";
      }
      if (!form.phone.trim()) {
        errs.phone = "Phone number is required";
      } else if (!validatePhone(form.phone)) {
        errs.phone = "Please enter a valid phone number (10-15 digits)";
      }
      if (!form.password) {
        errs.password = "Password is required";
      } else if (form.password.length < 8) {
        errs.password = "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        errs.password = "Password must contain uppercase, lowercase, and number";
      }
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
      if (mode === "login") {
        const loginResponse = await usersApi.login(form.loginPhone.trim());
        
        const backendUserId = loginResponse?.user_id ?? loginResponse?.userId ?? loginResponse?.id ?? loginResponse?._raw?.trim();
        if (!backendUserId) throw new Error("Server did not return a valid user ID.");
        
        const userData = await usersApi.getById(backendUserId);
        
        loginWithPhone({
          user_id: backendUserId,
          name: userData.name,
          email: userData.email,
        });
      } else {
        const newUser = await usersApi.create({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
          userStatus: "ACTIVE",
          createdAt: toLocalDateTime(),
        });
        
        const backendUserId = newUser?.userId ?? newUser?.user_id ?? newUser?.id ?? newUser?._raw?.trim() ?? null;
        if (!backendUserId) throw new Error("Server did not return a userId.");
        
        login({
          email: form.email.trim(),
          name: form.name.trim(),
          backendUserId,
        });
      }
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ submit: err.message || (mode === "login" ? "Login failed. Please try again." : "Account creation failed. Please try again.") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const formatPhoneInput = (value) => {
    return value.replace(/[^\d\s\-\(\)\+]/g, '');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-black shadow-lg shadow-black/10 mb-5">
            <svg
              className="w-10 h-10 text-white"
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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Metropark
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Smart parking for the modern city
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-100">
          {/* Tabs */}
          <div className="flex mb-8 bg-slate-100 rounded-xl p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setErrors({});
                  setForm((prev) => ({ ...prev, loginPhone: "", email: "", password: "", name: "", phone: "" }));
                }}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  mode === m
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Login Mode - Phone Only */}
            {mode === "login" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={form.loginPhone}
                    onChange={(e) => handleChange("loginPhone")(e)}
                    placeholder="+1 555 000 0000"
                    className={`w-full bg-white border rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-black/10 ${
                      errors.loginPhone
                        ? "border-red-500 focus:border-red-500"
                        : "border-slate-300 focus:border-black"
                    }`}
                    autoComplete="tel"
                    inputMode="tel"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                {errors.loginPhone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.loginPhone}
                  </p>
                )}
              </div>
            )}

            {/* Signup Mode - Full Form */}
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="John Smith"
                      className={`w-full bg-white border rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-black/10 ${
                        errors.name
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-300 focus:border-black"
                      }`}
                      autoComplete="name"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="you@example.com"
                      className={`w-full bg-white border rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-black/10 ${
                        errors.email
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-300 focus:border-black"
                      }`}
                      autoComplete="email"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone")({ target: { value: formatPhoneInput(e.target.value) } })}
                      placeholder="+1 555 000 0000"
                      className={`w-full bg-white border rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-black/10 ${
                        errors.phone
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-300 focus:border-black"
                      }`}
                      autoComplete="tel"
                      inputMode="tel"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={form.password}
                      onChange={handleChange("password")}
                      placeholder="••••••••"
                      className={`w-full bg-white border rounded-xl px-4 py-3.5 text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-black/10 pr-12 ${
                        errors.password
                          ? "border-red-500 focus:border-red-500"
                          : "border-slate-300 focus:border-black"
                      }`}
                      autoComplete="new-password"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                  {!errors.password && form.password && (
                    <p className="text-slate-400 text-xs mt-1">
                      Must contain uppercase, lowercase, and number (min 8 chars)
                    </p>
                  )}
                </div>
              </>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <p className="text-red-600 text-sm flex items-center justify-center gap-1.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {errors.submit}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-black/10 hover:shadow-black/20 mt-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
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

          {/* Divider */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Demo hint */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              {mode === "login" 
                ? "Demo: enter any valid phone number to sign in" 
                : "Demo: use any valid email, phone & password (min 8 chars)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
