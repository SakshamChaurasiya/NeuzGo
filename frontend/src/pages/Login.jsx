import React, { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-4xl font-extrabold text-charcoal-900 mb-4">
        Sign In
      </h1>
      <p className="text-charcoal-600 max-w-md mx-auto mb-6">
        Login form and JWT handling will be implemented in Phase 6.
      </p>
      <Link to="/signup" className="text-accent-blue hover:underline">
        Don't have an account? Sign up
      </Link>
    </div>
  );
};

export default Login;
