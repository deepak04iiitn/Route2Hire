import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import ReferralForm from '../components/ReferralForm';
import ReferralCard from '../components/ReferralCard';
import ReferralHeader from '../components/ReferralHeader';
import ReferralFilterModal from '../components/ReferralFilterModal';
import ReferralEmptyState from '../components/ReferralEmptyState';
import ReferralSidebar from '../components/ReferralSidebar';
import RelatedLinks from '../components/RelatedLinks';
import Breadcrumb from '../components/Breadcrumb';
import { Button } from 'flowbite-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import slugify from '../utils/slugify';

export default function Referrals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
  const [referrals, setReferrals] = useState([]);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  // Filters state that gets applied when user saves filters
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    jobIdSearch: '',
    sortConfig: 'likes-desc'
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
    fetchReferrals();
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

  const fetchReferrals = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/referrals/getReferral');
      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }
      const data = await response.json();
      setReferrals(data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving filters - this now applies the filters immediately
  const handleSaveFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
  };

  const handleReferralSelect = (referral) => {
    setSelectedReferral(referral);
    const company = referral.company || 'company';
    const position = referral.positions?.[0]?.position || 'role';
    const slug = slugify(`${company}-${position}`);
    window.open(`/referral/${slug}/${referral._id}`, '_blank');
    if (window.innerWidth < 1280) setIsSidebarOpen(false);
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).toLowerCase();
  };

  // Filter and sort referrals using the current filters state
  const filteredReferrals = referrals
    .filter(ref => {
      const companyMatch = safeString(ref.company).includes(safeString(filters.companySearch));
      const positionMatch = filters.positionSearch === '' || (
        ref.positions?.some(pos => 
          safeString(pos.position).includes(safeString(filters.positionSearch))
        )
      );
      const jobIdMatch = filters.jobIdSearch === '' || (
        ref.positions?.some(pos => 
          pos.jobid && safeString(pos.jobid).includes(safeString(filters.jobIdSearch))
        )
      );
      const searchMatch = searchTerm === '' || safeString(ref.company).includes(safeString(searchTerm));
      return companyMatch && positionMatch && jobIdMatch && searchMatch;
    })
    .sort((a, b) => {
      const [field, order] = filters.sortConfig.split('-');
      const sortValue = order === 'asc' ? 1 : -1;
      
      if (field === 'likes') {
        return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
      } else if (field === 'dislikes') {
        return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
      }
      return 0;
    });

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchReferrals();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Helmet for Dynamic SEO */}
      <Helmet>
        <title>Employee Referrals | QA, SDET & Test Automation Jobs - Route2Hire</title>
        <meta
          name="description"
          content="Find employee referrals for QA, SDET, Test Automation, and Software Testing positions. Get insider referrals from professionals at top companies to accelerate your QA career on Route2Hire."
        />
        <meta
          name="keywords"
          content="Employee referrals, QA referrals, SDET referrals, Test Automation referrals, Software Testing referrals, Job referrals, QA job referrals, Internal referrals, QA career referrals"
        />
        <meta property="og:title" content="Employee Referrals | QA, SDET & Test Automation Jobs - Route2Hire" />
        <meta
          property="og:description"
          content="Get employee referrals for QA, SDET, and Test Automation positions. Connect with professionals for insider job referrals in software testing."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/referrals" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/referrals" />
      </Helmet>

      <div className="flex flex-col xl:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen overflow-x-hidden">
        {/* Sidebar Toggle Arrow - right edge */}
        <button
          className="xl:hidden fixed top-1/2 -translate-y-1/2 right-0 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-2.5 rounded-l-xl shadow-2xl backdrop-blur-sm border border-white/20 hover:translate-x-0.5 transition-all duration-300"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Backdrop for mobile and tablet */}
        {isSidebarOpen && window.innerWidth < 1280 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar - Responsive width and positioning */}
        <div className={`w-full sm:w-80 lg:w-96 xl:w-80 2xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 transition-all duration-500 fixed inset-y-0 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0 xl:left-0 xl:right-auto xl:translate-x-0 xl:relative`}>
          <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 p-2 sm:p-3 md:p-4">
            {isSidebarOpen && window.innerWidth < 1280 && (
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200" aria-label="Close sidebar">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">Job Referrals</h2>
              <p className="text-xs sm:text-sm text-gray-500">Browse referrals by company and role</p>
            </div>

            <div className="relative mb-3 sm:mb-4">
              <input type="text" placeholder="Search referrals..." className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-gray-400 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 sm:mb-6">
              <button onClick={toggleFilterModal} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-300 text-sm">
                <Filter size={16} />
                <span>Filters</span>
              </button>
              <button onClick={toggleModal} className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-3 py-2.5 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 text-sm font-medium">
                <Plus size={16} />
                Share
              </button>
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              <ReferralSidebar referrals={filteredReferrals} selectedReferral={selectedReferral} onReferralSelect={handleReferralSelect} isFullWidth={true} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-14 sm:pt-16 md:pt-20 xl:pt-24 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mt-10 sm:mt-12 md:mt-16 xl:mt-0">
          {/* Breadcrumb Navigation */}
          <div className="mb-4 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <Breadcrumb 
              items={[
                { label: 'Employee Referrals', path: '/referrals' },
                selectedReferral ? { 
                  label: selectedReferral.company || 'Company', 
                  path: `/referrals?company=${encodeURIComponent(selectedReferral.company || '')}` 
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
          ) : filteredReferrals.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="w-full overflow-hidden">
              <ReferralEmptyState onShareClick={toggleModal} />
            </motion.div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Referral Finder</h1>
                <p className="text-blue-100 text-xs sm:text-sm xl:text-base opacity-90 mt-1">Select a referral from the sidebar to open its details.</p>
              </div>
              <div className="p-4 sm:p-6 xl:p-8 text-sm sm:text-base text-gray-600">
                Use filters to search by company, positions, and job IDs. Clicking an item opens the detail page in a new tab.
              </div>
            </div>
          )}
          
          {/* Related Links Section */}
          <div className="mt-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <RelatedLinks type="referral" />
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={toggleModal}>
              <ReferralForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <ReferralFilterModal isOpen={isFilterModalOpen} onClose={toggleFilterModal} filters={filters} onSave={handleSaveFilters} onClear={handleClearFilters} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

const SearchInput = ({ placeholder, value, onChange }) => (
  <motion.div 
    className="relative flex-grow"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 border border-indigo-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 bg-white bg-opacity-80 backdrop-blur-sm"
    />
    <Search className="absolute left-3 top-2.5 text-indigo-400" size={20} />
  </motion.div>
);