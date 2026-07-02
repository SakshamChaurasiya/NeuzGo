import React from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-4xl font-extrabold text-charcoal-900 mb-4">
        Create Account
      </h1>
      <p className="text-charcoal-600 max-w-md mx-auto mb-6">
        Signup form and validation will be implemented in Phase 6.
      </p>
      <Link to="/login" className="text-accent-blue hover:underline">
        Already have an account? Sign in
      </Link>
    </div>
  );
};

export default Signup;
