import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FaPlus, FaRoad, FaClock, FaChartLine, FaEdit, FaTrash, FaArrowRight, FaStar, FaFire } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function RoadmapList() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch('/backend/roadmaps/roadmaps');
      const data = await res.json();
      if (data.success) {
        setRoadmaps(data.data);
      }
    } catch (error) {
      console.error('Error fetching roadmaps:', error);
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roadmapId) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) {
      return;
    }

    try {
      const res = await fetch(`/backend/roadmaps/admin/${roadmapId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Roadmap deleted successfully');
        fetchRoadmaps();
      } else {
        toast.error(data.message || 'Failed to delete roadmap');
      }
    } catch (error) {
      console.error('Error deleting roadmap:', error);
      toast.error('Failed to delete roadmap');
    }
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return { 
          bg: 'from-emerald-500 to-teal-600', 
          text: 'text-emerald-700', 
          badge: 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-200',
          iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
          iconColor: 'text-emerald-600',
          glow: 'shadow-emerald-500/20',
          icon: FaStar
        };
      case 'Intermediate':
        return { 
          bg: 'from-amber-500 to-orange-600', 
          text: 'text-amber-700', 
          badge: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200',
          iconBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
          iconColor: 'text-amber-600',
          glow: 'shadow-amber-500/20',
          icon: FaFire
        };
      case 'Advanced':
        return { 
          bg: 'from-rose-500 to-pink-600', 
          text: 'text-rose-700', 
          badge: 'bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-rose-200',
          iconBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
          iconColor: 'text-rose-600',
          glow: 'shadow-rose-500/20',
          icon: FaChartLine
        };
      default:
        return { 
          bg: 'from-indigo-500 to-purple-600', 
          text: 'text-indigo-700', 
          badge: 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200',
          iconBg: 'bg-gradient-to-br from-indigo-50 to-purple-50',
          iconColor: 'text-indigo-600',
          glow: 'shadow-indigo-500/20',
          icon: FaRoad
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaRoad className="text-indigo-600 text-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Learning Roadmaps | Route2Hire</title>
        <meta
          name="description"
          content="Explore structured learning roadmaps for QA, SDET, and Test Automation careers. Master new skills and track your progress with comprehensive learning paths on Route2Hire."
        />
        <meta
          name="keywords"
          content="learning roadmaps, QA roadmap, SDET roadmap, test automation roadmap, career path, skill development"
        />
        <meta property="og:title" content="Learning Roadmaps | Route2Hire" />
        <meta
          property="og:description"
          content="Explore structured learning roadmaps for QA, SDET, and Test Automation careers."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/roadmaps" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/roadmaps" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 mt-16">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb 
          items={[
            { label: 'Learning Roadmaps', path: '/roadmaps' }
          ]}
        />
      </div>
      {/* Hero Header with Gradient Overlay */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-300 rounded-full blur-3xl"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-5" 
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start justify-between gap-8"
          >
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-white/90">Your Learning Journey</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight"
              >
                Explore Learning
                <br />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
                  Roadmaps
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg sm:text-xl text-indigo-100 max-w-2xl leading-relaxed"
              >
                Choose your path, master new skills, and track your progress with structured learning roadmaps
              </motion.p>
            </div>
            
            {currentUser?.isUserAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full sm:w-auto"
              >
                <Link
                  to="/roadmaps/create"
                  className="
                    group relative inline-flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto
                    bg-white text-indigo-700 font-bold rounded-2xl
                    hover:shadow-2xl hover:shadow-white/20
                    transition-all duration-300 overflow-hidden
                    hover:-translate-y-1
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaPlus className="relative z-10 text-lg group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300">Create Roadmap</span>
                  <FaArrowRight className="relative z-10 text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {roadmaps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-12 sm:p-16 text-center overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full blur-3xl opacity-30"></div>
            
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaRoad className="text-indigo-600 text-4xl" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                No roadmaps available yet
              </h2>
              {currentUser?.isUserAdmin && (
                <p className="text-slate-600 text-lg mb-6">
                  Create your first roadmap to get started on your learning journey!
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {roadmaps.map((roadmap, index) => {
              const difficultyConfig = getDifficultyConfig(roadmap.difficulty);
              const DifficultyIcon = difficultyConfig.icon;
              
              const totalHours = (roadmap.nodes && Array.isArray(roadmap.nodes)) 
                ? roadmap.nodes.reduce((sum, node) => 
                    sum + ((node.learningSteps && Array.isArray(node.learningSteps))
                      ? node.learningSteps.reduce((s, step) => 
                          s + (step.estimatedHours || 0), 0)
                      : 0), 0)
                : 0;

              const skillsCount = (roadmap.nodes && Array.isArray(roadmap.nodes)) 
                ? roadmap.nodes.length 
                : 0;

              return (
                <motion.div
                  key={roadmap._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl shadow-lg transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${difficultyConfig.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <div className="absolute inset-[2px] bg-white rounded-3xl"></div>
                  
                  <Link to={`/roadmaps/${roadmap.role}`} className="relative block">
                    <div className="relative p-6 sm:p-8">
                      {/* Top Section */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <div className={`w-16 h-16 ${difficultyConfig.iconBg} rounded-2xl flex items-center justify-center shadow-lg ${difficultyConfig.glow} group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                            <DifficultyIcon className={`${difficultyConfig.iconColor} text-2xl`} />
                          </div>
                          <div className={`absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-br ${difficultyConfig.bg} rounded-full border-3 border-white shadow-lg`}></div>
                        </div>
                        <span className={`
                          px-4 py-2 text-xs font-bold rounded-xl border
                          ${difficultyConfig.badge} backdrop-blur-sm
                        `}>
                          {roadmap.difficulty}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300 break-words line-clamp-2 min-h-[3.5rem] leading-tight">
                        {roadmap.title || roadmap.role}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 line-clamp-3 mb-8 leading-relaxed break-words min-h-[4.5rem]">
                        {roadmap.description || 'No description available'}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                          <div className="flex items-center gap-2">
                            <FaChartLine className="text-violet-600 text-sm" />
                            <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Skills</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-900">
                            {skillsCount}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2">
                            <FaClock className="text-blue-600 text-sm" />
                            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Hours</span>
                          </div>
                          <span className="text-2xl font-bold text-slate-900">
                            {totalHours}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between pt-6 border-t-2 border-slate-100">
                        <span className="text-sm font-bold text-indigo-600 group-hover:text-indigo-700">Explore Roadmap</span>
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300">
                          <FaArrowRight className="text-indigo-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Admin Actions */}
                  {currentUser?.isUserAdmin && (
                    <div className="relative border-t-2 border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100/50 px-6 sm:px-8 py-4 flex gap-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/roadmaps/edit/${roadmap.role}`);
                        }}
                        className="
                          flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold
                          text-indigo-700 bg-white rounded-xl border-2 border-indigo-200
                          hover:bg-indigo-50 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-200/50
                          transition-all duration-300 hover:-translate-y-0.5
                        "
                      >
                        <FaEdit className="text-base" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(roadmap._id);
                        }}
                        className="
                          flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold
                          text-rose-600 bg-white rounded-xl border-2 border-rose-200
                          hover:bg-rose-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/50
                          transition-all duration-300 hover:-translate-y-0.5
                        "
                      >
                        <FaTrash className="text-base" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Related Links Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <RelatedLinks type="general" />
        </div>
      </div>
      </div>
    </>
  );
}