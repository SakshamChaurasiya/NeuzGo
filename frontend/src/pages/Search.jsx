import React from "react";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-4xl font-extrabold text-charcoal-900 mb-4">
        Search Results
      </h1>
      <p className="text-charcoal-600 max-w-md mx-auto">
        Showing search results for: "{query}". Result listings will load in Phase 5.
      </p>
    </div>
  );
};

export default Search;
