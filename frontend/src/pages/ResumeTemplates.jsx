import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { X, Filter, Plus, Search, Linkedin, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Component imports
import ResumeHeader from '../components/ResumeHeader';
import ResumeFilterModal from '../components/ResumeFilterModal';
import ResumeTemplateForm from '../components/ResumeTemplateForm';
import ResumeCommentSection from '../components/ResumeCommentSection';
import ResumeEmptyState from '../components/ResumeEmptyState';
import ResumeSidebar from '../components/ResumeSidebar';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import slugify from '../utils/slugify';

export default function ResumeTemplates() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1280);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();
  const { templateId, slug } = useParams();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  // Single filters state that gets applied immediately
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
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
    fetchTemplates();
  }, []);

  // Sync selected template with URL param
  useEffect(() => {
    if (templateId && templates.length > 0) {
      const found = templates.find(t => t._id === templateId);
      if (found) {
        setSelectedTemplate(found);
        setLikes(found.numberOfLikes || 0);
        setDislikes(found.numberOfDislikes || 0);
      }
    }
  }, [templateId, templates]);

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

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/resumeTemplates/getResume');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
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

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setLikes(template.numberOfLikes || 0);
    setDislikes(template.numberOfDislikes || 0);
    const slug = slugify(`${template.company || 'company'}-${template.position || 'role'}`);
    navigate(`/resumeTemplates/${slug}/${template._id}`);
    if (window.innerWidth < 1280) setIsSidebarOpen(false);
  };

  const handleLike = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`/backend/resumeTemplates/likeResume/${selectedTemplate._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setSelectedTemplate(prev => prev ? { ...prev, numberOfLikes: data.likes, numberOfDislikes: data.dislikes } : prev);
    } catch {}
  };

  const handleDislike = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`/backend/resumeTemplates/dislikeResume/${selectedTemplate._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return;
      const data = await res.json();
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setSelectedTemplate(prev => prev ? { ...prev, numberOfLikes: data.likes, numberOfDislikes: data.dislikes } : prev);
    } catch {}
  };

  // Filter and sort templates using the current filters state
  const filteredTemplates = templates
    .filter(template => {
      const companyMatch = template.company.toLowerCase().includes(filters.companySearch.toLowerCase());
      const positionMatch = template.position.toLowerCase().includes(filters.positionSearch.toLowerCase());
      const yoeMatch = filters.yoeSearch === '' || 
        (template.yearsOfExperience !== undefined && template.yearsOfExperience.toString() === filters.yoeSearch);
      const searchMatch = searchTerm === '' ||
        template.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.position.toLowerCase().includes(searchTerm.toLowerCase());
      
      return companyMatch && positionMatch && yoeMatch && searchMatch;
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

  // Auto-select the first template by default when none is selected and no URL param
  useEffect(() => {
    if (!templateId && !selectedTemplate && filteredTemplates.length > 0) {
      const first = filteredTemplates[0];
      setSelectedTemplate(first);
      setLikes(first.numberOfLikes || 0);
      setDislikes(first.numberOfDislikes || 0);
      const slug = slugify(`${first.company || 'company'}-${first.position || 'role'}`);
      navigate(`/resumeTemplates/${slug}/${first._id}`, { replace: true });
    }
  }, [templateId, selectedTemplate, filteredTemplates, navigate]);

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchTemplates();
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
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Resume Templates | QA, SDET & Test Automation Professionals - Route2Hire</title>
        <meta
          name="description"
          content="Browse professional resume templates for QA, SDET, Test Automation, and Software Testing roles. Download ATS-friendly templates and get inspiration for your QA career resume on Route2Hire."
        />
        <meta
          name="keywords"
          content="Resume templates, QA resume examples, SDET resume templates, Test Automation resume, Software Testing resume, Professional resume templates, ATS-friendly resume, QA career templates"
        />
        <meta property="og:title" content="Resume Templates | QA, SDET & Test Automation Professionals - Route2Hire" />
        <meta
          property="og:description"
          content="Explore professional resume templates for QA, SDET, and Test Automation roles. Download ATS-friendly templates for software testing professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={selectedTemplate && templateId ? (slug ? `https://route2hire.com/resumeTemplates/${slug}/${templateId}` : `https://route2hire.com/resumeTemplates/${templateId}`) : "https://route2hire.com/resume-templates"} />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href={selectedTemplate && templateId ? (slug ? `https://route2hire.com/resumeTemplates/${slug}/${templateId}` : `https://route2hire.com/resumeTemplates/${templateId}`) : "https://route2hire.com/resume-templates"} />
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

        {isSidebarOpen && window.innerWidth < 1280 && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`w-full sm:w-80 lg:w-96 xl:w-80 2xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-30 transition-all duration-500 fixed inset-y-0 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0 xl:left-0 xl:right-auto xl:translate-x-0 xl:relative`}
        >
          <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 p-2 sm:p-3 md:p-4">
            {isSidebarOpen && window.innerWidth < 1280 && (
              <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200" aria-label="Close sidebar">
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}

            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">Resume Templates</h2>
              <p className="text-xs sm:text-sm text-gray-500">Browse ATS-friendly templates</p>
            </div>

            <div className="relative mb-3 sm:mb-4">
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
              <ResumeSidebar
                templates={filteredTemplates}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
                isFullWidth={true}
                compact={true}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-14 sm:pt-16 md:pt-20 xl:pt-24 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mt-10 sm:mt-12 md:mt-16 xl:mt-0">
          {/* Breadcrumb Navigation */}
          {selectedTemplate && (
            <div className="mb-4 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
              <Breadcrumb 
                items={[
                  { label: 'Resume Templates', path: '/resumeTemplates' },
                  { label: `${selectedTemplate.company} - ${selectedTemplate.position}` }
                ]}
              />
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64 sm:h-80 lg:h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="w-full overflow-hidden">
              <ResumeEmptyState onShareClick={toggleModal} />
            </motion.div>
          ) : selectedTemplate ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 break-words">
                      {selectedTemplate.company} - {selectedTemplate.position}
                    </h1>
                    {typeof selectedTemplate.yearsOfExperience !== 'undefined' && (
                      <div className="text-blue-100 text-xs sm:text-sm xl:text-base">{selectedTemplate.yearsOfExperience} years experience</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {selectedTemplate.linkedin && selectedTemplate.linkedin !== 'Not Provided' && (
                      <button
                        onClick={() => {
                          const url = selectedTemplate.linkedin.startsWith('http') ? selectedTemplate.linkedin : `https://${selectedTemplate.linkedin}`;
                          window.open(url, '_blank');
                        }}
                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
                        aria-label="Connect with provider on LinkedIn"
                      >
                        <Linkedin size={14} />
                      </button>
                    )}
                    <button onClick={handleLike} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white">
                      <ThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="font-medium text-xs sm:text-sm">{likes}</span>
                    </button>
                    <button onClick={handleDislike} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm bg-white/20 hover:bg-white/30 text-white">
                      <ThumbsDown size={12} className="sm:w-3.5 sm:h-3.5" />
                      <span className="font-medium text-xs sm:text-sm">{dislikes}</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 xl:p-8">
                {selectedTemplate.resume && (
                  <div className="w-full h-[60vh] rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <iframe src={`${selectedTemplate.resume.startsWith('http') ? selectedTemplate.resume : ''}#toolbar=1`} className="w-full h-full border-0" />
                  </div>
                )}
                
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Discussion</h2>
                  <ResumeCommentSection resId={selectedTemplate._id} />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold">Resume Gallery</h1>
                <p className="text-blue-100 text-xs sm:text-sm xl:text-base opacity-90 mt-1">Select a template from the sidebar to preview and download.</p>
              </div>
              <div className="p-4 sm:p-6 xl:p-8 text-sm sm:text-base text-gray-600">
                Use filters to find templates by role, company, or YOE.
              </div>
            </div>
          )}
          
          {/* Related Links Section */}
          <div className="mt-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <RelatedLinks type="general" />
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={toggleModal}>
              <ResumeTemplateForm toggleModal={toggleModal} onSubmitSuccess={handleFormSubmitSuccess} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFilterModalOpen && (
            <ResumeFilterModal isOpen={isFilterModalOpen} onClose={toggleFilterModal} filters={filters} onSave={handleSaveAndApplyFilters} onClear={handleClearFilters} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}