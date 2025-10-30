import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaBug, FaLightbulb, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function FeedbackModal({ type, onClose }) {
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState(type === 'feature' ? 'feature' : 'bug');

  const isBug = feedbackType === 'bug';

  const pageUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), []);
  const userAgent = useMemo(() => (typeof navigator !== 'undefined' ? navigator.userAgent : ''), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !description) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setIsSubmitting(true);
      const endpoint = isBug ? '/backend/bugs' : '/backend/feature-requests';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, description, pageUrl, userAgent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Submission failed');
      toast.success('Thanks for your feedback!');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[2147483646] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[2147483647] w-full max-w-2xl transform transition-all animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-gray-950 border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Gradient Header */}
          <div className={`relative px-6 sm:px-8 py-6 sm:py-7 ${
            isBug 
              ? 'bg-gradient-to-br from-red-600 to-rose-700 dark:from-red-700 dark:to-rose-900' 
              : 'bg-gradient-to-br from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-700'
          }`}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2.5 sm:p-3 rounded-xl ${isBug ? 'bg-red-500/20' : 'bg-yellow-500/20'} backdrop-blur-sm`}>
                  {isBug ? <FaBug className="text-red-200 text-lg sm:text-xl" /> : <FaLightbulb className="text-yellow-200 text-lg sm:text-xl" />}
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {isBug ? 'Report a Bug' : 'Request a Feature'}
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 sm:p-2.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200"
              >
                <FaTimes className="text-base sm:text-lg" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            {/* Type Toggle */}
            <div className="mb-6 sm:mb-8 flex justify-center">
              <div className="inline-flex p-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 backdrop-blur-sm max-w-md w-full">
                <button
                  type="button"
                  onClick={() => setFeedbackType('bug')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                    isBug 
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50 scale-[1.02]' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <FaBug className={isBug ? 'text-red-500' : ''} /> 
                  <span className="hidden xs:inline">Bug Report</span>
                  <span className="xs:hidden">Bug</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('feature')}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                    !isBug 
                      ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg shadow-gray-200/50 dark:shadow-gray-950/50 scale-[1.02]' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <FaLightbulb className={!isBug ? 'text-yellow-500' : ''} /> 
                  <span className="hidden xs:inline">Feature Request</span>
                  <span className="xs:hidden">Feature</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Your Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {isBug ? 'What went wrong?' : 'What would you like to see?'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-36 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 resize-none"
                  placeholder={isBug ? 'Describe the issue you encountered...' : 'Share your idea with us...'}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 px-6 py-3 sm:py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-xl font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] text-white ${
                    isBug
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40'
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="text-sm" />
                      {isBug ? 'Report Issue' : 'Submit Feedback'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}