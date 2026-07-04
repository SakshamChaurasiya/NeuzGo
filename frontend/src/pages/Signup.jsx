import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, mobileNumber, password, confirmPassword } = form;

    if (!username.trim() || !email.trim() || !mobileNumber || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!/^[0-9]{10}$/.test(mobileNumber)) {
      toast.error("Mobile number must be exactly 10 digits.");
      return;
    }

    setSubmitting(true);
    const result = await signup({ username, email, password, confirmPassword, mobileNumber });
    setSubmitting(false);

    if (result.success) {
      toast.success("Account created! Welcome to NeuzGo.");
      navigate("/");
    } else {
      toast.error(result.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center px-4 py-8 sm:py-16">
      <div className="w-full max-w-md space-y-8 sm:space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="font-serif text-3xl font-black tracking-tight text-charcoal-900 block">NEUZGO</span>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Create Your Account</h1>
          <p className="text-sm text-charcoal-500 max-w-xs mx-auto">Join NeuzGo to save articles and personalize your reading experience.</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label htmlFor="signup-username" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Username
            </label>
            <div className="relative">
              <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="signup-username"
                type="text"
                value={form.username}
                onChange={handleChange("username")}
                placeholder="johndoe"
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm sm:text-base bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm sm:text-base bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label htmlFor="signup-mobile" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Mobile Number
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="signup-mobile"
                type="tel"
                value={form.mobileNumber}
                onChange={handleChange("mobileNumber")}
                placeholder="10-digit number"
                maxLength={10}
                required
                className="w-full pl-10 pr-4 py-3.5 text-sm sm:text-base bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
            </div>
            <p className="text-[11px] text-charcoal-400">Must be exactly 10 digits (e.g. 9876543210)</p>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange("password")}
                placeholder="Min. 6 characters"
                required
                className="w-full pl-10 pr-12 py-3.5 text-sm sm:text-base bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-charcoal-400 hover:text-charcoal-700 transition-colors touch-manipulation"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="h-4.5 w-4.5" /> : <FiEye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label htmlFor="signup-confirm" className="block text-xs font-bold uppercase tracking-wider text-charcoal-600">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-charcoal-400" />
              <input
                id="signup-confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="Repeat your password"
                required
                className="w-full pl-10 pr-12 py-3.5 text-sm sm:text-base bg-white border border-charcoal-200 rounded-lg focus:outline-none focus:border-charcoal-900 transition-colors touch-manipulation"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-charcoal-400 hover:text-charcoal-700 transition-colors touch-manipulation"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff className="h-4.5 w-4.5" /> : <FiEye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-charcoal-950 text-white text-sm font-bold rounded-lg hover:bg-charcoal-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2 touch-manipulation"
          >
            {submitting ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center border-t border-charcoal-100 pt-6">
          <p className="text-sm text-charcoal-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-charcoal-900 hover:text-accent-blue transition-colors block sm:inline mt-1 sm:mt-0 py-2 sm:py-0 touch-manipulation">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
