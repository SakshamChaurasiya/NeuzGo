import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    const result = await login(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="font-serif text-3xl font-black tracking-tight text-charcoal-900 block">NEUZGO</span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Welcome Back</h1>
          <p className="text-sm text-charcoal-500">Sign in to access your personalized feed and bookmarks.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-3 text-sm bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="h-4.5 w-4.5" /> : <FiEye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-charcoal-950 text-white text-sm font-bold rounded-lg hover:bg-charcoal-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-charcoal-100 pt-6">
          <p className="text-sm text-charcoal-500">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-charcoal-900 hover:text-accent-blue transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
