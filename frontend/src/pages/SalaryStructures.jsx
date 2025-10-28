import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { X, Filter, Plus, Search, ThumbsUp, ThumbsDown, MessageCircle, IndianRupee, TrendingUp, Banknote, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

// Components
import SalaryHeader from '../components/SalaryHeader';
import SalaryFilterModal from '../components/SalaryFilterModal';
import SalaryForm from '../components/SalaryForm';
import SalaryEmptyState from '../components/SalaryEmptyState';
import SalarySidebar from '../components/SalarySidebar'; // You'll need to create this component
import SalaryCommentSection from '../components/SalaryCommentSection';
import slugify from '../utils/slugify';

export default function SalaryStructures() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const { salaryId } = useParams();

  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    locationSearch: '',
    experienceFilter: '',
    sortConfig: 'ctc-desc'
  });

  const [appliedFilters, setAppliedFilters] = useState({
    companySearch: '',
    positionSearch: '',
    locationSearch: '',
    experienceFilter: '',
    sortConfig: 'ctc-desc'
  });

  const toggleFilterModal = () => setIsFilterModalOpen(!isFilterModalOpen);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

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
    fetchSalaries();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync selected salary with URL param
  useEffect(() => {
    if (salaryId && salaries.length > 0) {
      const found = salaries.find(s => s._id === salaryId);
      if (found) setSelectedSalary(found);
    }
  }, [salaryId, salaries]);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/salary/getSalary');
      if (!response.ok) {
        throw new Error('Failed to fetch salaries');
      }
      const data = await response.json();
      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFilters = (newFilters) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters); // Apply filters immediately when saved
  };

  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters); // Apply cleared filters immediately
  };

  const handleSalarySelect = (salary) => {
    setSelectedSalary(salary);
    setLikes(salary.numberOfLikes || 0);
    setDislikes(salary.numberOfDislikes || 0);
    if (currentUser) {
      setIsLiked(Array.isArray(salary.likes) && salary.likes.includes(currentUser._id));
      setIsDisliked(Array.isArray(salary.dislikes) && salary.dislikes.includes(currentUser._id));
    } else {
      setIsLiked(false);
      setIsDisliked(false);
    }
    const slug = slugify(`${salary.company || 'company'}-${salary.position || 'role'}`);
    navigate(`/salaryStructures/${slug}/${salary._id}`);
    if (window.innerWidth < 1280) setIsSidebarOpen(false);
  };

  const filteredSalaries = salaries
    .filter(salary => {
      const companyMatch = salary.company.toLowerCase().includes(appliedFilters.companySearch.toLowerCase());
      const positionMatch = salary.position.toLowerCase().includes(appliedFilters.positionSearch.toLowerCase());
      const locationMatch = salary.location.toLowerCase().includes(appliedFilters.locationSearch.toLowerCase());
      const experienceMatch = !appliedFilters.experienceFilter || 
        salary.yearsOfExperience === parseInt(appliedFilters.experienceFilter);
      
      const searchMatch = searchTerm === '' ||
        salary.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salary.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        salary.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return companyMatch && positionMatch && locationMatch && experienceMatch && searchMatch;
    })
    .sort((a, b) => {
      const [field, order] = appliedFilters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'ctc') {
        const ctcA = parseFloat(a.ctc);
        const ctcB = parseFloat(b.ctc);
        return (ctcA - ctcB) * sortValue;
      } else if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      } else if (field === 'dislikes') {
        return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
      }
      return 0;
    });

  // Auto-select first salary when list loads or filters change
  useEffect(() => {
    if (filteredSalaries.length > 0) {
      if (!selectedSalary || !filteredSalaries.find(s => s._id === selectedSalary._id)) {
        const first = filteredSalaries[0];
        setSelectedSalary(first);
        const slug = slugify(`${first.company || 'company'}-${first.position || 'role'}`);
        navigate(`/salaryStructures/${slug}/${first._id}`, { replace: true });
      }
    } else {
      if (selectedSalary) setSelectedSalary(null);
    }
  }, [filteredSalaries]);

  // When URL selected salary changes, sync like/dislike flags
  useEffect(() => {
    if (selectedSalary) {
      setLikes(selectedSalary.numberOfLikes || 0);
      setDislikes(selectedSalary.numberOfDislikes || 0);
      if (currentUser) {
        setIsLiked(Array.isArray(selectedSalary.likes) && selectedSalary.likes.includes(currentUser._id));
        setIsDisliked(Array.isArray(selectedSalary.dislikes) && selectedSalary.dislikes.includes(currentUser._id));
      } else {
        setIsLiked(false);
        setIsDisliked(false);
      }
    }
  }, [selectedSalary, currentUser]);

  const handleLike = async () => {
    if (!selectedSalary) return;
    try {
      const response = await fetch(`/backend/salary/likeSalary/${selectedSalary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;
      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setIsLiked(true);
      setIsDisliked(false);
      setSelectedSalary(prev => prev ? { ...prev, numberOfLikes: data.likes, numberOfDislikes: data.dislikes } : prev);
    } catch (e) {
      // noop
    }
  };

  const handleDislike = async () => {
    if (!selectedSalary) return;
    try {
      const response = await fetch(`/backend/salary/dislikeSalary/${selectedSalary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;
      const data = await response.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setIsLiked(false);
      setIsDisliked(true);
      setSelectedSalary(prev => prev ? { ...prev, numberOfLikes: data.likes, numberOfDislikes: data.dislikes } : prev);
    } catch (e) {
      // noop
    }
  };

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchSalaries();
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
        <title>Salary Structures | QA, SDET & Test Automation Salaries - Route2Hire</title>
        <meta
          name="description"
          content="Explore salary structures for QA, SDET, Test Automation, and Software Testing roles. Compare compensation packages, get salary insights, and negotiate better offers for QA professionals on Route2Hire."
        />
        <meta
          name="keywords"
          content="QA salary, SDET salary, Test Automation salary, Software Testing salary, QA compensation, Salary insights, QA salary comparison, Test engineer salary, Quality Assurance salary"
        />
        <meta property="og:title" content="Salary Structures | QA, SDET & Test Automation Salaries - Route2Hire" />
        <meta
          property="og:description"
          content="Compare salary structures for QA, SDET, and Test Automation roles. Get salary insights and compensation data for software testing professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/salary-structures" />
        <meta property="og:image" content="https://route2hire.com/logo.png" />
        <link rel="canonical" href="https://route2hire.com/salary-structures" />
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
                Salary Structures
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Browse salaries by company and role</p>
            </div>

            {/* Search */}
            <div className="relative mb-3 sm:mb-4">
              <input
                type="text"
                placeholder="Search salaries..."
                className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-gray-400 text-xs" />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-6">
              <button
                onClick={toggleFilterModal}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-sm"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
                      <button
                onClick={toggleModal}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-3 py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 text-sm font-medium"
                      >
                <Plus size={16} />
                Share
                      </button>
                    </div>

            {/* Sidebar list */}
            <div className="space-y-1 sm:space-y-1.5">
              <SalarySidebar
                salaries={filteredSalaries}
                selectedSalary={selectedSalary}
                onSalarySelect={handleSalarySelect}
                isFullWidth={true}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-14 sm:pt-16 md:pt-20 xl:pt-24 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mt-10 sm:mt-12 md:mt-16 xl:mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 sm:h-80 lg:h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : filteredSalaries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full overflow-hidden"
          >
            <SalaryEmptyState onShareClick={toggleModal} />
          </motion.div>
          ) : selectedSalary ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold break-words">
                        {selectedSalary.position} at {selectedSalary.company}
                      </h1>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 sm:gap-3 text-blue-100 text-xs sm:text-sm xl:text-base">
                      {selectedSalary.location && (
                        <span className="bg-white/20 px-2 py-1 rounded-lg flex items-center gap-1"><MapPin size={14} /> {selectedSalary.location}</span>
                      )}
                      {typeof selectedSalary.yearsOfExperience !== 'undefined' && (
                        <span className="bg-white/20 px-2 py-1 rounded-lg">{selectedSalary.yearsOfExperience} YOE</span>
                      )}
                    </div>
                  </div>
                  <div className="lg:hidden px-3 py-1.5 rounded-lg bg-white/20 whitespace-nowrap">CTC: {selectedSalary.ctc} LPA</div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <div className="hidden lg:inline-flex px-3 py-1.5 rounded-lg bg-white/20 whitespace-nowrap mr-1">CTC: {selectedSalary.ctc} LPA</div>
                    <button onClick={handleLike} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${isLiked ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                      <ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="font-medium text-xs sm:text-sm">{likes}</span>
                    </button>
                    <button onClick={handleDislike} className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${isDisliked ? 'bg-white/30 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                      <ThumbsDown size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="font-medium text-xs sm:text-sm">{dislikes}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 xl:p-8">
                {/* Compensation Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-2xl mb-2">
                      <IndianRupee className="mx-auto text-green-600" size={28} />
                    </div>
                    <p className="text-2xl font-bold text-gray-800">{selectedSalary.ctc}</p>
                    <p className="text-green-700 font-medium">Total CTC (LPA)</p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-2xl mb-2">
                      <Banknote className="mx-auto text-blue-600" size={28} />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{selectedSalary.salary || 'N/A'}</p>
                    <p className="text-blue-700 font-medium">Base Salary</p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-2xl mb-2">
                      <TrendingUp className="mx-auto text-emerald-600" size={28} />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{selectedSalary.bonus || 'N/A'}</p>
                    <p className="text-emerald-700 font-medium">Bonus</p>
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-gradient-to-br from-purple-400/20 to-fuchsia-400/20 rounded-2xl mb-2">
                      <TrendingUp className="mx-auto text-purple-600" size={28} />
                    </div>
                    <p className="text-xl font-bold text-gray-800">{selectedSalary.stockBonus || 'N/A'}</p>
                    <p className="text-purple-700 font-medium">Stock Bonus</p>
                  </div>
                </div>

                {/* Profile & Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Education</div>
                    <div className="text-gray-900 font-semibold">{selectedSalary.education || 'N/A'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Years of Experience</div>
                    <div className="text-gray-900 font-semibold">{selectedSalary.yearsOfExperience || 'N/A'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Prior Experience</div>
                    <div className="text-gray-900 font-semibold">{selectedSalary.priorExperience || 'N/A'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Relocation / Signing Bonus</div>
                    <div className="text-gray-900 font-semibold">{selectedSalary.relocationSigningBonus || 'N/A'}</div>
                  </div>
                </div>

                {/* Benefits and Other Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Benefits</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{selectedSalary.benefits || 'N/A'}</div>
                  </div>
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Other Details</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{selectedSalary.otherDetails || 'N/A'}</div>
                  </div>
                </div>

                {/* LinkedIn */}
                {selectedSalary.linkedin && selectedSalary.linkedin !== 'Not Provided' && (
                  <div className="mb-6">
                    <a
                      href={selectedSalary.linkedin.startsWith('http') ? selectedSalary.linkedin : `https://${selectedSalary.linkedin}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View on LinkedIn
                    </a>
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t border-gray-200 bg-gray-50/30 p-4 sm:p-6 xl:p-8 rounded-xl">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    <MessageCircle size={20} />
                    Discussion
                    <span className="text-xs sm:text-sm font-normal text-gray-500">Share your thoughts</span>
                  </h2>
                  <SalaryCommentSection salId={selectedSalary._id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Salary Explorer</h1>
                <p className="text-blue-100 text-xs sm:text-sm xl:text-base opacity-90 mt-1">Select a salary from the sidebar to view details.</p>
              </div>
              <div className="p-4 sm:p-6 xl:p-8 text-sm sm:text-base text-gray-600">
                Use filters to narrow down by company, role, location, and experience.
              </div>
            </div>
          )}
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
              <SalaryForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <SalaryFilterModal
              isOpen={isFilterModalOpen}
              onClose={toggleFilterModal}
              filters={filters}
              onSave={handleSaveFilters}
              onClear={handleClearFilters}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}