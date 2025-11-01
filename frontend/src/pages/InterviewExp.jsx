import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InterviewForm from '../components/InterviewForm';
import InterviewEmptyState from '../components/InterviewEmptyState';
import InterviewHeader from '../components/InterviewHeader';
import InterviewFilterModal from '../components/InterviewFilterModal';
import InterviewSidebar from '../components/InterviewSidebar';
import InterviewCommentSection from '../components/InterviewCommentSection';
import RelatedLinks from '../components/RelatedLinks';
import Breadcrumb from '../components/Breadcrumb';
import { useSelector } from 'react-redux';
import { X, Search, Filter, Plus, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import slugify from '../utils/slugify';

export default function InterviewExp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const {currentUser} = useSelector((state) => state.user);
  
  const navigate = useNavigate();
  const { experienceId, slug } = useParams();
  
  // Single filters state that gets applied immediately
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
    verdictFilter: '',
    sortConfig: 'rating-desc'
  });

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!currentUser?.email) {
        setIsPremiumUser(false);
        setIsCheckingPremium(false);
        return;
      }

      try {
        const response = await fetch('/backend/premium');
        const premiumUsers = await response.json();
        
        const userIsPremium = premiumUsers.some(user => user.email === currentUser.email);
        setIsPremiumUser(userIsPremium);
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremiumUser(false);
      } finally {
        setIsCheckingPremium(false);
      }
    };

    checkPremiumStatus();
  }, [currentUser]);

  useEffect(() => {
    fetchExperiences();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    if (experienceId && experiences.length > 0) {
      const experience = experiences.find(exp => exp._id === experienceId);
      if (experience) {
        setSelectedExperience(experience);
      } else if (experiences.length > 0) {
        // If invalid ID, redirect to first experience
        const firstExp = experiences[0];
        setSelectedExperience(firstExp);
        const slug = slugify(`${firstExp.company || 'company'}-${firstExp.position || 'role'}`);
        navigate(`/interview-experience/${slug}/${firstExp._id}`, { replace: true });
      }
    } else if (experiences.length > 0 && !selectedExperience) {
      // If no ID in URL, select first experience
      const firstExp = experiences[0];
      setSelectedExperience(firstExp);
      const slug = slugify(`${firstExp.company || 'company'}-${firstExp.position || 'role'}`);
      navigate(`/interview-experience/${slug}/${firstExp._id}`, { replace: true });
    }
  }, [experienceId, experiences, navigate, selectedExperience]);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/interviews/getInterviewExp');
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving filters and applying them immediately
  const handleSaveAndApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
  };

  const handleExperienceSelect = (experience) => {
    setSelectedExperience(experience);
    const slug = slugify(`${experience.company || 'company'}-${experience.position || 'role'}`);
    navigate(`/interview-experience/${slug}/${experience._id}`);
    if (window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (rating || 0);
      stars.push(
        <Star
          key={i}
          size={14}
          className={`${isFilled ? 'text-yellow-400' : 'text-blue-100'} ${isFilled ? 'fill-yellow-400' : 'fill-transparent'}`}
        />
      );
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  // Filter and sort experiences using the current filters state
  const filteredExperiences = experiences
    .filter(exp => {
      const companyMatch = (exp.company || '').toLowerCase().includes(filters.companySearch.toLowerCase());
      const positionMatch = (exp.position || '').toLowerCase().includes(filters.positionSearch.toLowerCase());
      const yoeMatch = filters.yoeSearch === '' || 
        (exp.yoe !== undefined && exp.yoe.toString() === filters.yoeSearch);
      const verdictMatch = filters.verdictFilter === '' || 
        (exp.verdict && exp.verdict.toLowerCase() === filters.verdictFilter.toLowerCase());
      
      // Add search term filtering
      const searchMatch = searchTerm === '' || 
        (exp.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exp.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      return companyMatch && positionMatch && yoeMatch && verdictMatch && searchMatch;
    })
    .sort((a, b) => {
      const [field, order] = filters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'rating') {
        return ((a.rating || 0) - (b.rating || 0)) * sortValue;
      } else if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      } else if (field === 'dislikes') {
        return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchExperiences();
  };

  const handleLike = async (experienceId) => {
    if (!currentUser) {
      // You can add a toast notification here
      return;
    }

    try {
      const response = await fetch(`/backend/interviews/likeExperience/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update the experience in the list
        setExperiences(prevExperiences => 
          prevExperiences.map(exp => 
            exp._id === experienceId 
              ? { 
                  ...exp, 
                  numberOfLikes: data.likes, 
                  numberOfDislikes: data.dislikes,
                  likes: exp.likes.includes(currentUser._id) 
                    ? exp.likes 
                    : [...exp.likes, currentUser._id],
                  dislikes: exp.dislikes.filter(id => id !== currentUser._id)
                }
              : exp
          )
        );
        
        // Update selected experience if it's the one being liked
        if (selectedExperience?._id === experienceId) {
          setSelectedExperience(prev => ({
            ...prev,
            numberOfLikes: data.likes,
            numberOfDislikes: data.dislikes,
            likes: prev.likes.includes(currentUser._id) 
              ? prev.likes 
              : [...prev.likes, currentUser._id],
            dislikes: prev.dislikes.filter(id => id !== currentUser._id)
          }));
        }
      }
    } catch (error) {
      console.error('Error liking experience:', error);
    }
  };

  const handleDislike = async (experienceId) => {
    if (!currentUser) {
      // You can add a toast notification here
      return;
    }

    try {
      const response = await fetch(`/backend/interviews/dislikeExperience/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update the experience in the list
        setExperiences(prevExperiences => 
          prevExperiences.map(exp => 
            exp._id === experienceId 
              ? { 
                  ...exp, 
                  numberOfLikes: data.likes, 
                  numberOfDislikes: data.dislikes,
                  dislikes: exp.dislikes.includes(currentUser._id) 
                    ? exp.dislikes 
                    : [...exp.dislikes, currentUser._id],
                  likes: exp.likes.filter(id => id !== currentUser._id)
                }
              : exp
          )
        );
        
        // Update selected experience if it's the one being disliked
        if (selectedExperience?._id === experienceId) {
          setSelectedExperience(prev => ({
            ...prev,
            numberOfLikes: data.likes,
            numberOfDislikes: data.dislikes,
            dislikes: prev.dislikes.includes(currentUser._id) 
              ? prev.dislikes 
              : [...prev.dislikes, currentUser._id],
            likes: prev.likes.filter(id => id !== currentUser._id)
          }));
        }
      }
    } catch (error) {
      console.error('Error disliking experience:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Helmet for Dynamic SEO */}
      <Helmet>
        <title>
          {selectedExperience 
            ? `${selectedExperience.company} Interview Experience | QA, SDET & Test Automation - Route2Hire`
            : "Interview Experiences | QA, SDET & Test Automation - Route2Hire"
          }
        </title>
        <meta
          name="description"
          content={
            selectedExperience 
              ? `Read ${selectedExperience.company} interview experience for ${selectedExperience.position} role. Get insights, tips, and company-specific interview processes to ace your next QA interview on Route2Hire.`
              : "Read real interview experiences from QA, SDET, Test Automation, and Software Testing professionals. Get insights, tips, and company-specific interview processes to ace your next QA interview on Route2Hire."
          }
        />
        <meta
          name="keywords"
          content={
            selectedExperience 
              ? `${selectedExperience.company} interview experience, ${selectedExperience.position} interview, QA interview stories, SDET interview experiences, Test Automation interviews, Software Testing interview experiences, QA interview tips, Company interview processes, QA career insights`
              : "Interview experiences, QA interview stories, SDET interview experiences, Test Automation interviews, Software Testing interview experiences, QA interview tips, Company interview processes, QA career insights"
          }
        />
        <meta property="og:title" content={selectedExperience ? `${selectedExperience.company} Interview Experience | Route2Hire` : "Interview Experiences | Route2Hire"} />
        <meta
          property="og:description"
          content={
            selectedExperience 
              ? `Read ${selectedExperience.company} interview experience for ${selectedExperience.position} role. Get company-specific insights and tips to ace your software testing interviews.`
              : "Read real interview experiences from QA, SDET, and Test Automation professionals. Get company-specific insights and tips to ace your software testing interviews."
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={selectedExperience && experienceId ? (slug ? `https://route2hire.com/interview-experience/${slug}/${experienceId}` : `https://route2hire.com/interview-experience/${experienceId}`) : "https://route2hire.com/interview-experiences"} />
        <meta property="og:image" content="https://route2hire.com/logo.png" />
        <link rel="canonical" href={selectedExperience && experienceId ? (slug ? `https://route2hire.com/interview-experience/${slug}/${experienceId}` : `https://route2hire.com/interview-experience/${experienceId}`) : "https://route2hire.com/interview-experiences"} />
      </Helmet>

      <div className="flex flex-col xl:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen overflow-x-hidden">
        {/* Sidebar Toggle Arrow - right edge */}
        <button
          className="xl:hidden fixed top-1/2 -translate-y-1/2 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-2.5 rounded-l-xl shadow-2xl backdrop-blur-sm border border-white/20 hover:translate-x-0.5 transition-all duration-300 touch-manipulation"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Backdrop for mobile and tablet */}
        {isSidebarOpen && window.innerWidth < 1280 && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Responsive width and positioning */}
        <div
          className={`
            w-full sm:w-80 lg:w-96 xl:w-80 2xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 transition-all duration-500 fixed inset-y-0 overflow-y-auto
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0
            xl:left-0 xl:right-auto xl:translate-x-0 xl:relative
          `}
        >
          <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 p-2 sm:p-3 md:p-4">
            {/* Close button for mobile and tablet */}
            {isSidebarOpen && window.innerWidth < 1280 && (
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                aria-label="Close sidebar"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}

            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                Interview Experiences
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Browse experiences by company</p>
            </div>

            {/* Search */}
            <div className="relative mb-3 sm:mb-4">
              <input
                type="text"
                placeholder="Search experiences..."
                className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-gray-400 text-xs" />
            </div>

            {/* Filter Button */}
            <div className="mb-3 sm:mb-4">
              <button
                onClick={toggleFilterModal}
                className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-sm"
              >
                <Filter size={16} />
                <span>Advanced Filters</span>
              </button>
            </div>

            {/* Add Experience Button */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={toggleModal}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm font-medium"
              >
                <Plus size={16} />
                Share Your Experience
              </button>
            </div>

            {/* Experiences List */}
            <div className="space-y-1 sm:space-y-1.5">
              {filteredExperiences.map((experience, index) => (
                <button
                  key={experience._id}
                  onClick={() => handleExperienceSelect(experience)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group hover:scale-[1.02] touch-manipulation ${
                    selectedExperience?._id === experience._id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-white/80 hover:shadow-md border border-gray-100'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs sm:text-sm truncate pr-2">{experience.company}</div>
                      <div className={`text-xs truncate pr-2 ${
                        selectedExperience?._id === experience._id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {experience.position}
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      selectedExperience?._id === experience._id 
                        ? 'bg-white/80' 
                        : 'bg-blue-500/50 group-hover:bg-blue-500'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Responsive padding and spacing */}
        <div className="flex-1 overflow-y-auto pt-14 sm:pt-16 md:pt-20 xl:pt-24 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mt-10 sm:mt-12 md:mt-16 xl:mt-0">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <Breadcrumb 
              items={[
                { label: 'Interview Experiences', path: '/interviewExp' },
                selectedExperience ? { 
                  label: selectedExperience.company || 'Company', 
                  path: `/interviewExp?company=${encodeURIComponent(selectedExperience.company || '')}` 
                } : null,
              ].filter(Boolean)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64 sm:h-80 lg:h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : filteredExperiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full overflow-hidden"
            >
              <InterviewEmptyState onShareClick={toggleModal} />
            </motion.div>
          ) : selectedExperience ? (
            <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-none">
              {/* Selected Experience Content */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 break-words">
                        {selectedExperience.company} Interview Experience
                      </h1>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-blue-100 text-xs sm:text-sm xl:text-base">
                        <span className="bg-white/20 px-2 py-1 rounded-lg">{selectedExperience.position}</span>
                        {selectedExperience.yoe && <span className="bg-white/20 px-2 py-1 rounded-lg">{selectedExperience.yoe} YOE</span>}
                        {selectedExperience.verdict && <span className="bg-white/20 px-2 py-1 rounded-lg">{selectedExperience.verdict}</span>}
                        {typeof selectedExperience.rating !== 'undefined' && (
                          <span className="bg-white/20 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                            {renderStars(selectedExperience.rating)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <button
                        onClick={() => handleLike(selectedExperience._id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedExperience.likes?.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="font-medium text-xs sm:text-sm">{selectedExperience.numberOfLikes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleDislike(selectedExperience._id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedExperience.dislikes?.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <ThumbsDown size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="font-medium text-xs sm:text-sm">{selectedExperience.numberOfDislikes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Experience Content */}
                <div className="p-4 sm:p-6 xl:p-8">
                  <div className="prose prose-sm sm:prose-base max-w-none">
                    <div className="whitespace-pre-wrap break-words leading-relaxed text-gray-700">
                      {selectedExperience.description || selectedExperience.experience || 'No description available.'}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 bg-gray-50/30 p-4 sm:p-6 xl:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    <MessageCircle size={20} />
                    Discussion
                    <span className="text-xs sm:text-sm font-normal text-gray-500">Share your thoughts</span>
                  </h2>
                  <InterviewCommentSection expId={selectedExperience._id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-8 sm:p-12 max-w-sm sm:max-w-md mx-auto">
                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Select an Experience</h3>
                <p className="text-sm sm:text-base text-gray-500">Choose an experience from the sidebar to view details</p>
              </div>
            </div>
          )}
          
          {/* Related Links Section */}
          <div className="mt-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <RelatedLinks type="interview" />
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
              onClick={toggleModal}
            >
              <InterviewForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <InterviewFilterModal
              isOpen={isFilterModalOpen}
              onClose={toggleFilterModal}
              filters={filters}
              onSaveAndApply={handleSaveAndApplyFilters}
              onClear={handleClearFilters}
            />
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}