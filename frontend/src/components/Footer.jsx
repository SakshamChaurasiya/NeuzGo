import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-charcoal-950 text-charcoal-400 border-t border-charcoal-800/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Brand */}
          <div className="md:col-span-2">
            <span className="font-serif text-2xl font-black tracking-tight text-white">
              NEUZGO
            </span>
            <p className="mt-4 text-sm text-charcoal-400 max-w-sm leading-relaxed">
              A premium independent news platform delivering curated, high-quality headlines and in-depth reporting from around the globe.
            </p>
          </div>

          {/* Quick Categories */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/general" className="hover:text-white transition-colors">General</Link>
              </li>
              <li>
                <Link to="/category/business" className="hover:text-white transition-colors">Business</Link>
              </li>
              <li>
                <Link to="/category/technology" className="hover:text-white transition-colors">Technology</Link>
              </li>
              <li>
                <Link to="/category/science" className="hover:text-white transition-colors">Science</Link>
              </li>
            </ul>
          </div>

          {/* About/Policy */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              NeuzGO
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-charcoal-900 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} NeuzGo. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Designed for readability & elegant speed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
