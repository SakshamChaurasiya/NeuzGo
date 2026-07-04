import React from "react";

const BlogSectionHeader = ({ label, title }) => {
  return (
    <div className="space-y-2 mb-8">
      {label && (
        <span className="block text-[11px] font-sans font-bold uppercase tracking-widest text-charcoal-400">
          {label}
        </span>
      )}
      <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-tight">
        {title}
      </h2>
    </div>
  );
};

export default BlogSectionHeader;
