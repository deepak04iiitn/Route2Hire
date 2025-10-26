import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ShareModal from './ShareModal';

const FlashStrip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const location = useLocation();

  // Show strip on page change (if not permanently dismissed and not on home page)
  useEffect(() => {
    const isDismissed = localStorage.getItem('flashStripDismissed');
    const isHomePage = location.pathname === '/';
    
    if (!isDismissed && !isHomePage) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname]); // Trigger on route change

  // Handle scroll to hide the strip
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('flashStripDismissed', 'true');
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-100 to-amber-100 shadow-lg overflow-hidden"
            style={{ 
              marginTop: '76px',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.4), 0 0 40px rgba(245, 158, 11, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Animated Glowing Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 opacity-20 animate-pulse"></div>
            
            {/* Top Glowing Border */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleX: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            />
            
            {/* Bottom Glowing Border */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleX: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
            />
            
            {/* Moving Flash Effect */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              />
              <motion.div
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.5
                }}
                className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent skew-x-12"
              />
            </div>
            
            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left side - Message */}
                <div className="flex-1 min-w-0">
                  <p className="text-amber-800 font-semibold text-sm sm:text-base md:text-lg truncate sm:whitespace-normal drop-shadow-sm">
                    ✨ Share this website with your friends and colleagues preparing for QA/SDET Interviews! ✨
                  </p>
                </div>

                {/* Right side - Share button and Close button */}
                <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareClick}
                    className="flex items-center space-x-1 sm:space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-amber-500"
                  >
                    <Share2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="font-semibold text-xs sm:text-sm hidden xs:inline">Share</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDismiss}
                    className="p-1 rounded-full hover:bg-amber-200 text-amber-700 transition-colors duration-200 flex-shrink-0"
                    aria-label="Dismiss notification"
                  >
                    <X size={16} className="sm:w-5 sm:h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default FlashStrip;
