import React from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaFire, FaClock } from 'react-icons/fa';

export default function ProgressSummary({ progress, roadmapData, userProgress }) {
  const daysActive = userProgress?.createdAt 
    ? Math.floor((new Date() - new Date(userProgress.createdAt)) / (1000 * 60 * 60 * 24)) 
    : 0;

  const totalDays = (roadmapData?.nodes.reduce((sum, node) => {
    return sum + (node.learningSteps?.reduce((s, step) => s + (step.estimatedHours || 0), 0) || 0);
  }, 0) || 0) / 24;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-white border-2 border-violet-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-violet-100 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full opacity-50 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-50 rounded-full opacity-50 -ml-12 -mb-12"></div>
        
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-violet-600 mb-2 uppercase tracking-wide">Overall Progress</p>
            <p className="text-4xl font-bold text-slate-900">{progress}%</p>
          </div>
          <div className="w-14 h-14 bg-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
            <FaTrophy className="text-white text-2xl" />
          </div>
        </div>
        
        <div className="relative">
          <div className="h-3 bg-violet-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-violet-500 rounded-full shadow-sm"
            />
          </div>
          <p className="text-xs font-medium text-violet-600 mt-3">
            {progress === 100 ? '🎉 Complete!' : 'Keep pushing forward!'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden bg-white border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-orange-100 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full opacity-50 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-full opacity-50 -ml-12 -mb-12"></div>
        
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-orange-600 mb-2 uppercase tracking-wide">Days Active</p>
            <p className="text-4xl font-bold text-slate-900">{daysActive}</p>
          </div>
          <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <FaFire className="text-white text-2xl" />
          </div>
        </div>
        
        <div className="relative">
          <p className="text-xs font-medium text-orange-600">
            {daysActive === 0 ? 'Just started!' : daysActive === 1 ? 'First day complete!' : `${daysActive} day streak! 🔥`}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-white border-2 border-sky-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-sky-100 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full opacity-50 -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-50 rounded-full opacity-50 -ml-12 -mb-12"></div>
        
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-sky-600 mb-2 uppercase tracking-wide">Total Time</p>
            <p className="text-4xl font-bold text-slate-900">{Math.round(totalDays * 10) / 10}d</p>
          </div>
          <div className="w-14 h-14 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
            <FaClock className="text-white text-2xl" />
          </div>
        </div>
        
        <div className="relative">
          <p className="text-xs font-medium text-sky-600">
            Estimated learning time
          </p>
        </div>
      </motion.div>
    </div>
  );
}