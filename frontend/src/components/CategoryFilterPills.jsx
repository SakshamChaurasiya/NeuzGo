import React from "react";

const CategoryFilterPills = ({ categories, selectedCategory, onChangeCategory }) => {
  return (
    <div className="w-full border-b border-charcoal-100 pb-6 mb-8">
      <div 
        className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-charcoal-200 scrollbar-track-transparent"
        role="tablist"
        aria-label="Blog categories"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              aria-controls="blog-posts-grid"
              onClick={() => onChangeCategory(cat)}
              className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap flex-shrink-0 cursor-pointer touch-manipulation ${
                isActive
                  ? "bg-charcoal-900 text-white shadow-sm"
                  : "bg-charcoal-50 text-charcoal-600 hover:bg-charcoal-100"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilterPills;
