import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, X } from 'lucide-react';

export default function SocialIconFab() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showText, setShowText] = useState(true);
  const componentRef = useRef(null);
  const location = useLocation();

  // Social links from Home page
  const telegramLink = 'https://t.me/trendingjobs4all_QA';
  const whatsappLink = 'https://chat.whatsapp.com/DXvc1ncAenX1HZ7OKr8L4Y?mode=wwt';

  // Show text automatically on every page visit, then hide after 7 seconds
  useEffect(() => {
    setShowText(true);
    const timer = setTimeout(() => {
      setShowText(false);
    }, 7000); // Hide after 7 seconds

    return () => clearTimeout(timer);
  }, [location.pathname]); // Run on every route change

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  return createPortal(
    <div 
      ref={componentRef}
      className="fixed right-0 bottom-20 xl:bottom-auto xl:top-1/2 xl:-translate-y-1/2 z-30 xl:z-[2147483646] flex items-center pointer-events-none"
      style={{ maxHeight: '100vh', overflow: 'visible' }}
    >
      {/* Main Icon Button */}
      <button
        type="button"
        onClick={() => {
          setIsExpanded(!isExpanded);
          setShowText(false); // Hide text when panel is toggled
        }}
        aria-label="Join community"
        className="group relative flex items-center pointer-events-auto transition-all duration-300 hover:translate-x-[-8px]"
      >
        {/* Text Label - visible when not expanded */}
        {!isExpanded && (
          <div 
            className={`absolute right-full mr-3 whitespace-nowrap bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 pr-8 rounded-l-lg shadow-lg transition-opacity duration-300 ${
              showText ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none'
            }`}
            style={{
              animation: showText ? 'slideInFromRightText 0.5s ease-out forwards' : 'none'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs sm:text-sm font-semibold">Join the fastest-growing QA/SDET community.</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowText(false);
              }}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-blue-600"></div>
          </div>
        )}

        {/* Icon Circle */}
        <div className="w-14 h-14 rounded-l-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl shadow-purple-500/50 flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 border-2 border-white/20">
          {isExpanded ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </div>
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div 
          className="ml-2 bg-white rounded-l-2xl shadow-2xl p-4 min-w-[200px] max-w-[250px] pointer-events-auto"
          style={{
            animation: 'slideInFromRight 0.3s ease-out forwards'
          }}
        >
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Join Our Community</h3>
            <p className="text-xs text-gray-600">Connect with QA/SDET professionals</p>
          </div>
          
          <div className="space-y-2">
            {/* WhatsApp Link */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group"
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-sm">WhatsApp</span>
            </a>

            {/* Telegram Link */}
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group"
            >
              <Send className="w-5 h-5 flex-shrink-0" />
              <span className="font-semibold text-sm">Telegram</span>
            </a>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInFromRightText {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}

