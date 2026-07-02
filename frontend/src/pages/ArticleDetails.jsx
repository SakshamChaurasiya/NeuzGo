import React from "react";
import { useParams } from "react-router-dom";

const ArticleDetails = () => {
  const { id } = useParams();

  return (
    <div className="py-12 text-center">
      <h1 className="font-serif text-4xl font-extrabold text-charcoal-900 mb-4">
        Article View
      </h1>
      <p className="text-charcoal-600 max-w-md mx-auto">
        Detailed reporting for article ID: {id} will load in Phase 4.
      </p>
    </div>
  );
};

export default ArticleDetails;
