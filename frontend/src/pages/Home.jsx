import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageFilled, RiseOutlined, CloseOutlined, SendOutlined, BarChartOutlined, UsergroupAddOutlined, RocketOutlined, TrophyOutlined, CrownOutlined, FormOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import '../styles/Home.css';
import { debounce, preloadCriticalResources } from '../utils/performanceOptimizations';

const FadedJobTablePreview = lazy(() => import('../components/FadedJobTablePreview'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const NewsletterBanner = lazy(() => import('../components/NewsLetterBanner'));

// Lazy load AI functionality only when needed
const loadAIFunctionality = () => import('@google/generative-ai');

export default function Home() {

  const [showModal, setShowModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const [aiModule, setAiModule] = useState(null);

  const chatEndRef = useRef(null);
  const navigate = useNavigate();
  const {currentUser} = useSelector((state) => state.user);

  // Memoize SEO data to prevent recreation on every render
  const jsonLd = useMemo(() => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Route2Hire",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/jobs?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
      about: "Job search, tech job listings, employee referrals, interview questions, salary insights, resume templates, and community polls",
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent scrollbar shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    // Cleanup function to reset on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [showModal]);

  // Check premium status with debouncing
  const checkPremiumStatus = useCallback(async () => {
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
  }, [currentUser?.email]);

  const debouncedCheckPremium = useMemo(
    () => debounce(checkPremiumStatus, 300),
    [checkPremiumStatus]
  );

  useEffect(() => {
    debouncedCheckPremium();
  }, [debouncedCheckPremium]);

  // Preload critical resources on component mount
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  const formatResponse = useCallback((text) => {
    const lines = text.split('\n');
    let formattedText = '';
    let inList = false;

    lines.forEach((line) => {
      line = line.replace(/\*/g, ''); // Remove asterisks
      
      if (line.trim().match(/^\d+\./) || line.trim().startsWith('-') || line.trim().startsWith('•')) {
        if (!inList) {
          formattedText += '<ul class="list-disc pl-5 space-y-2">';
          inList = true;
        }
        formattedText += `<li>${line.replace(/^\d+\.|-|•/, '').trim()}</li>`;
      } else if (line.trim().length > 0) {
        if (inList) {
          formattedText += '</ul>';
          inList = false;
        }
        
        // Apply formatting
        line = line.replace(/\_\_(.+?)\_\_/g, '<u>$1</u>'); // Underline
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold
        line = line.replace(/\_(.+?)\_/g, '<em>$1</em>'); // Italic
        
        formattedText += `<p class="mb-2">${line}</p>`;
      } else if (inList) {
        formattedText += '</ul>';
        inList = false;
      } else {
        formattedText += '<br>';
      }
    });

    if (inList) {
      formattedText += '</ul>';
    }

    return formattedText.trim();
  }, []);


  const AIanswer = useCallback(async (question) => {
    setIsLoading(true);
    
    try {
      // Lazy load AI module only when needed
      if (!aiModule) {
        const { GoogleGenerativeAI } = await loadAIFunctionality();
        setAiModule({ GoogleGenerativeAI });
      }
      
      const { GoogleGenerativeAI } = aiModule || await loadAIFunctionality();
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const generationConfig = {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      };

      const chatSession = model.startChat({
        generationConfig,
        history: [],
      });

      const fullPrompt = `Answer the following question about job opportunities or career advice. Use bullet points and numbered lists where appropriate to make the answer more readable:

${question}`;

      const result = await chatSession.sendMessage(fullPrompt);
      const formattedResponse = formatResponse(result.response.text());
      setMessages(prev => [...prev, { type: 'ai', content: formattedResponse }]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [...prev, { type: 'ai', content: "I'm sorry, I couldn't generate a response. Please try again." }]);
    }
    setIsLoading(false);
  }, [aiModule, formatResponse]);

  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === '') return;
    setMessages(prev => [...prev, { type: 'user', content: inputMessage }]);
    setInputMessage('');
    await AIanswer(inputMessage);
  }, [inputMessage, AIanswer]);

  const handleModalOpen = useCallback((modalType) => {
    if (modalType === 'chat') {
      setShowModal(true);
    } else if (modalType === 'poll') {
      // Check if user is signed in before opening poll modal
      if (!currentUser) {
        // Show sign-in prompt or redirect to sign-in page
        navigate('/sign-in');
        return;
      }
      // Trigger the global poll modal
      window.dispatchEvent(new CustomEvent('openCreatePollModal'));
    }
  }, [currentUser, navigate]);

  const handleModalClose = useCallback((modalType) => {
    if (modalType === 'chat') {
      setShowModal(false);
    }
  }, []);


  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Route2Hire | QA, SDET, Automation & IT Jobs Platform</title>
        <meta
          name="description"
          content="Discover top QA, SDET, Test Automation, and Software Testing careers on Route2Hire. Find curated jobs, employee referrals, interview prep, salary insights, and resume templates for quality assurance professionals."
        />
        <meta
          name="keywords"
          content="QA jobs, SDET careers, Test Automation, Software Testing, Quality Assurance, Test Engineering, IT jobs, Software jobs, QA platform, Test engineer roles, Automation testing jobs"
        />
        <meta property="og:title" content="Route2Hire | QA, SDET, Automation & IT Jobs Platform" />
        <meta
          property="og:description"
          content="Find your next QA, SDET, or Test Automation role with Route2Hire. Access curated jobs, referrals, interview prep, and career resources for software testing professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com" />
        <meta property="og:image" content="https://route2hire.com/logo.png" />
        <link rel="canonical" href="https://route2hire.com" />
      </Helmet>

      <div className="home-page mt-10 min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
        {/* SEO: JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-teal-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        
        {/* Hero Section - Centered */}
        <section className="py-12 sm:py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            {/* SEO-only H1 (keeps design intact while improving semantics) */}
            <h1 className="sr-only">
              Tech Job Search, Employee Referrals, Interview Prep & Salary Insights | Route2Hire
            </h1>
            
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <CrownOutlined className="text-yellow-400 text-sm sm:text-base" />
              <span className="text-yellow-300 font-semibold text-xs sm:text-sm tracking-wide">PREMIUM EXPERIENCE</span>
            </div>
            
            {/* Main Title - Centered (decorative, hidden from accessibility tree) */}
            <div className="relative max-w-6xl mx-auto" aria-hidden="true">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-teal-500/30 blur-3xl scale-110"></div>
              <div className="relative text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-6 sm:mb-8 leading-tight">
                {/* Replace the entire TypeWriterEffect Suspense block with: */}
                <div className="text-white font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent">
                  Route2Hire
                </div>
              </div>
            </div>
            
            {/* SEO-optimized subtitle and supporting copy */}
            <h2 className="text-lg sm:text-xl md:text-3xl text-white/80 mb-3 sm:mb-4 font-light leading-relaxed max-w-4xl mx-auto">
              Find curated tech jobs, verified employee referrals, expert interview preparation and much more —
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold"> all in one place</span>
            </h2>

            <p className="text-base sm:text-lg md:text-xl text-white/60 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover trending roles, salary benchmarks, resume templates, and community polls — everything you need to land your next role faster with Route2Hire.
            </p>
            
            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
              <button
                onClick={() => handleModalOpen('chat')}
                className="group relative inline-flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-500 hover:via-purple-500 hover:to-blue-500 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-105 shadow-2xl hover:shadow-blue-500/25 border border-white/10 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <MessageFilled className="text-xl sm:text-2xl flex-shrink-0" />
                <span className="whitespace-nowrap">Launch AI Assistant</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
              </button>
              
              <button
                onClick={() => navigate('/jobs')}
                className="group inline-flex items-center justify-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-105 shadow-2xl border border-white/20 hover:border-white/30 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <RiseOutlined className="text-xl sm:text-2xl flex-shrink-0" />
                <span className="whitespace-nowrap">Explore All Jobs</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>

              <button
                onClick={() => handleModalOpen('poll')}
                className="group inline-flex items-center justify-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-105 shadow-2xl border border-white/20 hover:border-white/30 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <BarChartOutlined className="text-xl sm:text-2xl flex-shrink-0" />
                <span className="whitespace-nowrap">Create Polls</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>
            
            {/* Premium Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto mb-8 sm:mb-12">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">3K+</div>
                <div className="text-white/60 font-medium text-sm sm:text-base">Fresh Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">350+</div>
                <div className="text-white/60 font-medium text-sm sm:text-base">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">95%</div>
                <div className="text-white/60 font-medium text-sm sm:text-base">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2">24/7</div>
                <div className="text-white/60 font-medium text-sm sm:text-base">AI Support</div>
              </div>
            </div>
            
          </div>
        </section>

        <Suspense fallback={
          <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 animate-pulse">
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading job preview...</div>
            </div>
          </div>
        }>
          <FadedJobTablePreview />
        </Suspense>

        {/* Premium Action Cards Section - New Addition */}
        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4">Take Action Today</h2>
              <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
                Unlock premium features and accelerate your career journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {/* AI Assistant Card */}
              <div 
                onClick={() => handleModalOpen('chat')}
                className="group cursor-pointer bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <MessageFilled className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">AI Assistant</h3>
                <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                  Get personalized career advice and job recommendations
                </p>
              </div>

              {/* Create Poll Card */}
              <div 
                onClick={() => handleModalOpen('poll')}
                className={`group cursor-pointer bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  currentUser 
                    ? 'border-white/20 hover:border-purple-500/50 hover:shadow-purple-500/20' 
                    : 'border-yellow-500/30 hover:border-yellow-500/50 hover:shadow-yellow-500/20'
                }`}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg ${
                  currentUser 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                    : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                }`}>
                  <FormOutlined className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">
                  {currentUser ? 'Create Poll' : 'Sign In to Create Poll'}
                </h3>
                <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                  {currentUser 
                    ? 'Share insights and gather community feedback'
                    : 'Join our community to create and participate in polls'
                  }
                </p>
                {!currentUser && (
                  <div className="mt-3 flex items-center justify-center">
                    <span className="text-yellow-400 text-xs font-medium bg-yellow-500/20 px-2 py-1 rounded-full">
                      Sign In Required
                    </span>
                  </div>
                )}
              </div>

              {/* Analytics Card */}
              <div 
                onClick={() => navigate('/mypolls')}
                className="group cursor-pointer bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-teal-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <BarChartOutlined className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">My Analytics</h3>
                <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                  Track your polls and engagement metrics
                </p>
              </div>

              {/* Community Card */}
              <div 
                onClick={() => navigate('/publicpolls')}
                className="group cursor-pointer bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  <UsergroupAddOutlined className="text-white text-xl sm:text-2xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 text-center">Public Polls</h3>
                <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                  Engage with public polls and discussions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Feature Cards */}
        <section id="features" className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 sm:mb-6">Premium Features</h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-3xl mx-auto">
                Experience next-generation job discovery with cutting-edge technology and premium services
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <RocketOutlined className="text-white text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">Personalized Job Alerts</h3>
                  <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                    Get job opportunities tailored to your role and experience level delivered straight to your inbox — never miss the perfect opportunity.
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <UsergroupAddOutlined className="text-white text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">Elite Community</h3>
                  <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                    Connect with industry leaders, participate in exclusive polls, and build meaningful professional relationships
                  </p>
                </div>
              </div>
              
              <div className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-green-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <TrophyOutlined className="text-white text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">Exclusive Opportunities</h3>
                  <p className="text-white/70 text-center leading-relaxed text-sm sm:text-base">
                    Access premium job listings, executive positions, and career opportunities not available anywhere else
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <Suspense fallback={
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-8 px-4 rounded-xl shadow-2xl mx-auto w-full mb-16 animate-pulse">
                <div className="text-center">
                  <div className="h-8 bg-white/20 rounded mb-4 mx-auto max-w-md"></div>
                  <div className="h-4 bg-white/20 rounded mb-6 mx-auto max-w-2xl"></div>
                  <div className="h-12 bg-white/20 rounded-full mx-auto max-w-xs"></div>
                </div>
              </div>
            }>
              <NewsletterBanner />
            </Suspense>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-12 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="h-8 bg-white/20 rounded mb-4 mx-auto max-w-md"></div>
                <div className="h-4 bg-white/20 rounded mb-8 mx-auto max-w-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
                      <div className="h-4 bg-white/20 rounded mb-4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <TestimonialSection />
            </Suspense>
          </div>
        </section>

      </div>

      {/* Premium Chat Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:max-w-4xl h-full sm:max-h-[90vh] flex flex-col overflow-hidden border border-white/10">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-4 sm:p-8 text-white relative overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h3 className="text-xl sm:text-3xl font-black mb-1 sm:mb-2">AI Career Assistant</h3>
                  <p className="text-blue-100 text-sm sm:text-lg">Your premium AI-powered career advisor</p>
                </div>
                <button 
                  onClick={() => handleModalClose('chat')} 
                  className="text-white/80 hover:text-white transition-colors duration-300 p-2 sm:p-3 hover:bg-white/10 rounded-xl sm:rounded-2xl flex-shrink-0"
                >
                  <CloseOutlined style={{ fontSize: window.innerWidth < 640 ? '20px' : '24px' }} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-grow overflow-y-auto p-3 sm:p-8 space-y-4 sm:space-y-6 bg-gradient-to-br from-slate-900/50 to-slate-800/50">
              {messages.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                    <MessageFilled className="text-white text-xl sm:text-3xl" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Welcome to Premium AI</h4>
                  <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                    Ask me anything about careers, job opportunities, salary negotiations, or professional growth!
                  </p>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInSlide`}>
                  <div 
                    className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-xl ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border border-white/20' 
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    {message.type === 'ai' ? (
                      <div 
                        className="leading-relaxed text-sm sm:text-base"
                        dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} 
                      />
                    ) : (
                      <div className="text-sm sm:text-base">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/20 flex items-center gap-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-white/80 ml-2 text-sm sm:text-base">AI is analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Premium Input Area */}
            <div className="p-3 sm:p-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-t border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  placeholder="Ask about careers, salaries, job markets..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60 transition-all duration-300 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-xl hover:shadow-2xl hover:scale-105 flex-shrink-0"
                >
                  <SendOutlined className="text-base sm:text-xl" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}