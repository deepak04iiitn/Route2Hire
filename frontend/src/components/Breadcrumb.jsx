import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb component for internal navigation and SEO
 * @param {Array} items - Array of {label, path} objects
 */
export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      className="flex items-center space-x-2 text-sm mb-6 px-4 py-3 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/50"
      aria-label="Breadcrumb"
    >
      <Link 
        to="/" 
        className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        title="Home"
      >
        <Home size={16} className="mr-1" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="text-gray-400" />
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.path} 
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

