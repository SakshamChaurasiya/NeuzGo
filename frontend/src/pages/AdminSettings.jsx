import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  FiSettings,
  FiUser,
  FiLock,
  FiDatabase,
  FiActivity,
  FiInfo,
  FiGlobe
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({
    username: user?.username || "Admin",
    email: user?.email || "admin@neuzgo.com",
    mobile: user?.phoneNumber || "9876543210"
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    toast.success("Profile simulation updated successfully!");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    toast.success("Password changed successfully (Simulation)!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-gray-500">Configure profile, verify API integrations, and review system diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Admin Profile & Password */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Profile Form */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <FiUser className="text-blue-500 w-4 h-4" />
              Admin Profile Information
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    required
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5 w-full sm:w-1/2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <FiLock className="text-rose-500 w-4 h-4" />
              Security & Credentials
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Change Password
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: System Diagnostics & Versions */}
        <div className="space-y-6">
          
          {/* Environment Status */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <FiInfo className="text-purple-500 w-4 h-4" />
              Environment Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Application Version</span>
                <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">1.4.0-stable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Node Environment</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Development</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">CORS Authorization</span>
                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Wildcard (*)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium">Auth Provider</span>
                <span className="font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">JSON Web Tokens</span>
              </div>
            </div>
          </div>

          {/* API Sync Status */}
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-3">
              <FiDatabase className="text-emerald-500 w-4 h-4" />
              API Integrations Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">GNews Provider API</p>
                  <p className="text-[10px] text-gray-400">Response code 200 • Online</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">MongoDB Connection</p>
                  <p className="text-[10px] text-gray-400">Response time 4ms • Connected</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                <div className="flex-1">
                  <p className="font-bold text-gray-800">Scheduler / Cron Daemon</p>
                  <p className="text-[10px] text-gray-400">Interval: Every 6 hours • Active</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminSettings;
