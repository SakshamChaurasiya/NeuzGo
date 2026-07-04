import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiLoader } from "react-icons/fi";

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <FiLoader className="h-8 w-8 animate-spin text-accent-blue" />
        <span className="text-sm font-medium text-charcoal-500">Verifying admin credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
