import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import SkillSection from '../components/roadmap/SkillSection';
import ProgressSummary from '../components/roadmap/ProgressSummary';
import RoadmapFilters from '../components/roadmap/RoadmapFilters';
import ConfettiEffect from '../components/roadmap/ConfettiEffect';
import { calculateProgress, getNextRecommendedSkill } from '../utils/roadmapUtils';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaShare, FaLightbulb, FaRocket } from 'react-icons/fa';

export default function RoadmapPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  
  const [roadmapData, setRoadmapData] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [expandedSkills, setExpandedSkills] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendedNext, setRecommendedNext] = useState(null);

  useEffect(() => {
    fetchRoadmapData();
    if (currentUser) {
      fetchUserProgress();
    }
  }, [role, currentUser]);

  const fetchRoadmapData = async () => {
    try {
      const res = await fetch(`/backend/roadmaps/roadmaps/${encodeURIComponent(role)}`);
      const data = await res.json();
      
      if (data.success) {
        setRoadmapData(data.data);
      } else {
        toast.error('Roadmap not found');
        navigate('/roadmaps');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const res = await fetch(
        `/backend/roadmaps/progress/${currentUser._id}/${encodeURIComponent(role)}`
      );
      const data = await res.json();
      
      if (data.success) {
        setUserProgress(data.data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  useEffect(() => {
    if (roadmapData && userProgress) {
      const next = getNextRecommendedSkill(roadmapData.nodes, userProgress.completedNodes);
      setRecommendedNext(next);
    }
  }, [roadmapData, userProgress]);

  const toggleSkill = (skillId) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillId)) {
      newExpanded.delete(skillId);
    } else {
      newExpanded.add(skillId);
    }
    setExpandedSkills(newExpanded);
  };

  const handleToggleSubskill = async (nodeId, subskillId) => {
    if (!currentUser) {
      toast.error('Please sign in to track your progress');
      return;
    }

    try {
      const res = await fetch(
        `/backend/roadmaps/progress/${currentUser._id}/${encodeURIComponent(role)}/subskill`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodeId, subskillId }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setUserProgress(data.data);
        toast.success('Progress updated!');
        
        if (data.milestone) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleShare = () => {
    if (!currentUser) {
      toast.error('Please sign in to share your progress');
      return;
    }

    const shareUrl = `${window.location.origin}/roadmaps/share/${currentUser._id}/${encodeURIComponent(role)}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  const filteredSkills = roadmapData?.nodes.filter(skill => {
    const matchesSearch = !searchQuery || 
      skill.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || skill.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(roadmapData?.nodes || [], userProgress?.completedNodes || []);
  const categories = [...new Set(roadmapData?.nodes.map(node => node.category).filter(Boolean))];

  return (
    <>
      <Helmet>
        <title>{roadmapData?.title || 'Learning Roadmap'} | Route2Hire</title>
      </Helmet>
      <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Breadcrumb 
          items={[
            { label: 'Roadmaps', path: '/roadmaps' },
            { label: roadmapData?.title || 'Roadmap' }
          ]}
        />
      </div>
      
      {showConfetti && <ConfettiEffect />}
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/roadmaps')}
            className="
              inline-flex items-center gap-2 px-5 py-2.5
              text-slate-700 hover:text-slate-900
              bg-white border-2 border-slate-200 rounded-xl
              hover:border-slate-300 hover:shadow-md
              transition-all duration-200 font-medium
            "
          >
            <FaArrowLeft className="text-sm" />
            <span>Back to Roadmaps</span>
          </button>
        </motion.div>

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-8 shadow-lg shadow-slate-200/50"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
                <FaRocket className="text-xs" />
                <span>Learning Path</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                {roadmapData?.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {roadmapData?.description}
              </p>
            </div>
            
            {currentUser && (
              <button
                onClick={handleShare}
                className="
                  flex items-center gap-3 px-6 py-3
                  text-white bg-indigo-600 rounded-xl
                  hover:bg-indigo-700 active:bg-indigo-800
                  transition-all duration-200 font-semibold shadow-lg shadow-indigo-200
                  hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5
                "
              >
                <FaShare />
                <span>Share Progress</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Progress Summary */}
        {currentUser && userProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProgressSummary 
              progress={progress}
              roadmapData={roadmapData}
              userProgress={userProgress}
            />
          </motion.div>
        )}

        {/* Recommended Next Card */}
        {recommendedNext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-emerald-500 text-white rounded-2xl p-6 mb-8 shadow-lg shadow-emerald-200"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400 rounded-full opacity-20 -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600 rounded-full opacity-20 -ml-16 -mb-16"></div>
            
            <div className="relative flex items-start gap-5">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white/30">
                <FaLightbulb className="text-2xl" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-emerald-100 mb-1 uppercase tracking-wide">
                  Recommended Next
                </div>
                <h3 className="text-xl font-bold mb-2">{recommendedNext.label}</h3>
                <p className="text-emerald-50 leading-relaxed">{recommendedNext.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <RoadmapFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categories={categories}
          />
        </motion.div>

        {/* Skills List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-5 mt-8"
        >
          {filteredSkills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
            >
              <SkillSection
                skill={skill}
                isExpanded={expandedSkills.has(skill.id)}
                onToggle={toggleSkill}
                userProgress={userProgress}
                onToggleSubskill={handleToggleSubskill}
                isRecommended={recommendedNext?.id === skill.id}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredSkills.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center mt-8"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No skills found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        )}
        
        {/* Related Links Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <RelatedLinks type="general" />
        </div>
      </div>
      </div>
    </>
  );
}