import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("neufeed_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.get("/auth/me");
      if (response.data && response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem("neufeed_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      localStorage.removeItem("neufeed_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem("neufeed_token", token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ username, email, password, confirmPassword, mobileNumber }) => {
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/signup", {
        username,
        email,
        password,
        confirmPassword,
        mobileNumber,
      });
      const { token, user: userData } = response.data;
      localStorage.setItem("neufeed_token", token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed. Please check your details.";
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("neufeed_token");
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
