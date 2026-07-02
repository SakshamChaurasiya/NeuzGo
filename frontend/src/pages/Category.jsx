import React from "react";
import { useParams } from "react-router-dom";

const Category = () => {
  const { categoryId } = useParams();

  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-4xl font-extrabold capitalize text-charcoal-900 mb-4">
        {categoryId} News
      </h1>
      <p className="text-charcoal-600 max-w-md mx-auto">
        Curated reports in the {categoryId} category will load in Phase 3.
      </p>
    </div>
  );
};

export default Category;
