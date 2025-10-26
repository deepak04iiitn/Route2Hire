import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  X, 
  Copy, 
  MessageCircle, 
  Linkedin, 
  Twitter, 
  Mail,
  Check,
  ExternalLink
} from 'lucide-react';

const ShareModal = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const websiteUrl = window.location.origin;
  const websiteTitle = "Route2Hire - Your Career Growth Platform";
  const websiteDescription = "Explore real Interview Experiences, QA/SDET DSA Sheet, curated Interview Questions, and an ATS-friendly Resume Builder — all in one place.";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: handleCopyLink,
      color: 'bg-gray-600 hover:bg-gray-700',
      text: copied ? 'Copied!' : 'Copy Link'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        const message = `${websiteTitle}\n\n${websiteDescription}\n\n${websiteUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      },
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(websiteUrl)}`;
        window.open(url, '_blank');
      },
      color: 'bg-blue-700 hover:bg-blue-800'
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      action: () => {
        const text = `${websiteTitle} - ${websiteDescription}`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(websiteUrl)}`;
        window.open(url, '_blank');
      },
      color: 'bg-black hover:bg-gray-800'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = `Check out ${websiteTitle}`;
        const body = `Hi!\n\nI wanted to share this amazing platform with you:\n\n${websiteTitle}\n\n${websiteDescription}\n\nVisit: ${websiteUrl}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url);
      },
      color: 'bg-red-600 hover:bg-red-700'
    }
  ];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/80 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center space-x-4">
              <img
                src="/assets/Route2Hire.png"
                alt="Route2Hire"
                className="w-16 h-16 rounded-xl shadow-lg"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-800">Route2Hire</h2>
                <p className="text-sm text-slate-600">Your Career Growth Platform</p>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed text-base">
                  {websiteDescription}
                </p>
              </div>

              {/* Share Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Share via:</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <motion.button
                        key={option.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={option.action}
                        className={`flex items-center justify-between p-4 rounded-xl text-white font-medium transition-all duration-300 ${option.color} shadow-lg hover:shadow-xl`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Icon size={20} />
                          </div>
                          <span>{option.text || option.name}</span>
                        </div>
                        <ExternalLink size={16} className="opacity-70" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Website Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src="/assets/Route2Hire.png"
                    alt="Route2Hire"
                    className="w-8 h-8 rounded-lg"
                  />
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Route2Hire</p>
                    <p className="text-xs text-gray-600">{websiteUrl}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {websiteDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              Thank you for sharing! 🙏
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ShareModal;
