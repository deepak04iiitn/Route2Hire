import React, { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageFilled, RiseOutlined, CloseOutlined, SendOutlined, BarChartOutlined, UsergroupAddOutlined, RocketOutlined, TrophyOutlined, CrownOutlined, FormOutlined } from '@ant-design/icons';
import { Code, Briefcase, MessageCircle, Puzzle, Users, TrendingUp, FileEdit, BookOpen, Map, Sparkles, ArrowRight, CheckCircle2, Zap, Shield, Target } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import '../styles/Home.css';
import { debounce, preloadCriticalResources } from '../utils/performanceOptimizations';
import FeedbackFab from '../components/FeedbackFab';

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
  const [jobsCount, setJobsCount] = useState('2500+');
  const [usersCount, setUsersCount] = useState('1000+');

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

  // All Platform Features
  const allFeatures = useMemo(
    () => [
      {
        icon: Briefcase,
        title: "Curated Job Listings",
        description: "Access 2500+ handpicked QA, SDET, Test Automation, and Software Testing roles from top companies. Every job is verified and tailored for quality assurance professionals.",
        gradient: "from-blue-500 to-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
        path: "/jobs",
        action: "Explore Jobs"
      },
      {
        icon: MessageCircle,
        title: "Interview Experiences",
        description: "Learn from real interview experiences shared by QA/SDET professionals. Company-wise insights help you prepare effectively for your next interview.",
        gradient: "from-purple-500 to-purple-600",
        bgGradient: "from-purple-50 to-purple-100",
        path: "/interviewExp",
        action: "Read Experiences"
      },
      {
        icon: Puzzle,
        title: "Interview Questions",
        description: "Master topic-wise interview questions specifically curated for QA and SDET roles. Practice with real questions asked by top tech companies.",
        gradient: "from-indigo-500 to-indigo-600",
        bgGradient: "from-indigo-50 to-indigo-100",
        path: "/interview-questions",
        action: "Practice Now"
      },
      {
        icon: Code,
        title: "QA/SDET DSA Sheet",
        description: "Track your progress with our comprehensive DSA sheet designed for QA/SDET interviews. Compete on the leaderboard and master data structures & algorithms.",
        gradient: "from-emerald-500 to-teal-600",
        bgGradient: "from-emerald-50 to-teal-100",
        path: "/qa-sdet-dsa-sheet",
        action: "Start Learning"
      },
      {
        icon: Users,
        title: "Employee Referrals",
        description: "Get referred by peers in the QA/SDET community. Connect with professionals who can help you land your dream role through verified referrals.",
        gradient: "from-green-500 to-green-600",
        bgGradient: "from-green-50 to-green-100",
        path: "/referrals",
        action: "Get Referred"
      },
      {
        icon: TrendingUp,
        title: "Salary Insights",
        description: "Access real compensation data for QA/SDET roles across different companies, locations, and experience levels. Make informed career decisions.",
        gradient: "from-orange-500 to-orange-600",
        bgGradient: "from-orange-50 to-orange-100",
        path: "/salaryStructures",
        action: "View Insights"
      },
      {
        icon: FileEdit,
        title: "Resume Templates",
        description: "Access professional QA/SDET-focused resume templates. Choose from a variety of designs tailored for quality assurance professionals.",
        gradient: "from-pink-500 to-pink-600",
        bgGradient: "from-pink-50 to-pink-100",
        path: "/resumeTemplates",
        action: "View Templates"
      },
      {
        icon: FormOutlined,
        title: "Resume Builder",
        description: "Create your professional resume with our easy-to-use resume builder. Get your resume reviewed by the community.",
        gradient: "from-rose-500 to-rose-600",
        bgGradient: "from-rose-50 to-rose-100",
        path: "/resume-builder",
        action: "Build Resume"
      },
      {
        icon: BarChartOutlined,
        title: "Community Polls",
        description: "Create and participate in polls to gather insights from the QA/SDET community. Track your poll analytics and engage with peers.",
        gradient: "from-cyan-500 to-cyan-600",
        bgGradient: "from-cyan-50 to-cyan-100",
        path: "/publicpolls",
        action: "View Polls"
      },
      {
        icon: BookOpen,
        title: "Blogs",
        description: "Read and create articles about QA/SDET careers, industry trends, and professional growth. Share your knowledge with the community.",
        gradient: "from-violet-500 to-violet-600",
        bgGradient: "from-violet-50 to-violet-100",
        path: "/blogs",
        action: "Read Blogs",
        comingSoon: true
      },
      {
        icon: Map,
        title: "Roadmaps",
        description: "Follow skill-based roadmaps tailored for different QA and SDET roles. Plan your career path with structured learning guides.",
        gradient: "from-amber-500 to-amber-600",
        bgGradient: "from-amber-50 to-amber-100",
        path: "/roadmaps",
        action: "View Roadmaps",
        comingSoon: true
      }
    ],
    []
  );

  // FAQ content
  const faqs = useMemo(
    () => [
      {
        q: 'What is Route2Hire?',
        a: 'Route2Hire is a curated platform for QA, SDET, Test Automation, and broader tech roles. We provide job listings, employee referrals, interview prep, salary insights, resume templates, DSA Sheet, and many more exciting features.'
      },
      {
        q: 'How do I get job alerts?',
        a: 'Join our Telegram community for instant updates or create a free account to personalize alerts. We share handpicked roles daily.'
      },
      {
        q: 'What is the QA/SDET DSA Sheet and how do I use it?',
        a: 'The QA/SDET DSA Sheet is a curated set of DSA topics and problems tailored for QA and SDET interviews. Start from the overview at QA/SDET DSA Sheet, then track your progress and compete with others in live leaderboard.'
      },
      {
        q: 'How can I participate in polls?',
        a: 'Sign in and head to the Create Polls action or visit Public Polls to vote and explore community insights.'
      },
      {
        q: 'Where can I connect with the community?',
        a: 'Join our Telegram and WhatsApp communities to network, get job alerts, and discuss career growth with peers.'
      }
    ],
    []
  );

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

  // Fetch live statistics (jobs and users count)
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch both jobs and users count in parallel
        const [llmsRes, usersRes] = await Promise.all([
          fetch('/llms-stats'),
          fetch('/llms/users-count')
        ]);

        // Fetch jobs count from public llms-stats endpoint
        if (llmsRes.ok) {
          const llmsData = await llmsRes.json();
          if (llmsData?.stats?.dynamicItems?.jobs) {
            const count = llmsData.stats.dynamicItems.jobs;
            setJobsCount(count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}+`);
          }
        }

        // Fetch users count from public endpoint
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData?.usersCount !== undefined) {
            const count = usersData.usersCount;
            setUsersCount(count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}+`);
          }
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default values on error
      }
    };

    fetchStatistics();
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
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
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
      <FeedbackFab />
      </div>

      <div className="relative z-10">
        
        {/* QA/SDET DSA Sheet Marquee Strip */}
        <section className="py-3 mt-12 md:mt-16 mb-2">
          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
            <div
              onClick={() => navigate('/qa-sdet-dsa-sheet')}
              role="button"
              tabIndex={0}
              aria-label="Open QA/SDET DSA Sheet"
              className="relative overflow-hidden rounded-none cursor-pointer shadow-lg bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-300"
              style={{ 
                boxShadow: '0 0 20px rgba(251, 191, 36, 0.35), 0 0 40px rgba(245, 158, 11, 0.25)'
              }}
            >
              {/* Glowing top/bottom borders */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70" />
              {/* Moving flash overlays */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-[shine_2.5s_linear_infinite]" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-200/30 to-transparent skew-x-12 animate-[shine_3s_linear_infinite_1.2s]" />
              </div>
              {/* edge fade to avoid hard cuts */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-yellow-100 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-amber-100 to-transparent" />
              <div className="py-4 pointer-events-none">
                <div
                  className="flex w-max whitespace-nowrap will-change-transform text-amber-800 text-sm sm:text-base font-semibold tracking-wide"
                  style={{ animation: 'marquee-dsa 22s linear infinite' }}
                >
                  {/* Group A */}
                  <div className="flex items-center gap-12 pr-12">
                    <span>NEW: QA/SDET DSA Sheet — track your progress and ace interviews</span>
                    <span>Launch: Learn DSA tailored for QA/SDET roles — live now</span>
                    <span>Practice smarter with curated problems and progress tracking</span>
                    <span>Visit DSA Sheet to get started today →</span>
                  </div>
                  {/* Group B (duplicate for seamless loop) */}
                  <div aria-hidden="true" className="flex items-center gap-12 pr-12">
                    <span>NEW: QA/SDET DSA Sheet — track your progress and ace interviews</span>
                    <span>Launch: Learn DSA tailored for QA/SDET roles — live now</span>
                    <span>Practice smarter with curated problems and progress tracking</span>
                    <span>Visit DSA Sheet to get started today →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>
            {`@keyframes marquee-dsa { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
              @keyframes shine { from { transform: translateX(-100%) skewX(-12deg); } to { transform: translateX(100%) skewX(-12deg); } }
            `}
          </style>
        </section>

        {/* Hero Section - Enhanced & Modern */}
        <section className="pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-24 md:pb-32 relative overflow-hidden">
          {/* Enhanced Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-30"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
            {/* SEO-only H1 (keeps design intact while improving semantics) */}
            <h1 className="sr-only">
              Tech Job Search, Employee Referrals, Interview Prep & Salary Insights | Route2Hire
            </h1>
            
            {/* Premium Badge with animation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-full px-5 sm:px-7 py-2.5 mb-8 sm:mb-10 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <CrownOutlined className="text-yellow-400 text-base sm:text-lg" />
              <span className="text-yellow-300 font-bold text-xs sm:text-sm tracking-wider">PREMIUM EXPERIENCE</span>
            </motion.div>
            
            {/* Main Title - Enhanced with better styling */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative max-w-6xl mx-auto mb-8 sm:mb-10" 
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-teal-500/30 blur-3xl scale-110 animate-pulse"></div>
              <div className="relative">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-4 leading-[0.9]">
                  <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    Route2
                  </span>
                  <span className="bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                    Hire
                  </span>
                </h1>
                <div className="h-1 w-32 sm:w-48 mx-auto bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full"></div>
              </div>
            </motion.div>
            
            {/* SEO-optimized subtitle and supporting copy */}
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl sm:text-2xl md:text-4xl text-white/90 mb-4 sm:mb-6 font-semibold leading-tight max-w-5xl mx-auto"
            >
              Find curated tech jobs, verified employee referrals, expert interview preparation and much more —
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold"> all in one place</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-white/70 mb-10 sm:mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Discover trending roles, salary benchmarks, resume templates, and community polls — everything you need to land your next role faster with Route2Hire.
            </motion.p>
            
            {/* Premium CTA Buttons - Enhanced */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-5 sm:gap-6 justify-center items-center mb-14 sm:mb-20 px-4"
            >
              <button
                onClick={() => navigate('/qa-sdet-dsa-sheet')}
                className="group relative inline-flex items-center justify-center gap-3 sm:gap-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-emerald-500/40 border-2 border-emerald-400/50 w-full sm:w-auto max-w-xs sm:max-w-none overflow-hidden"
              >
                <Code className="text-xl sm:text-2xl flex-shrink-0 relative z-10" />
                <span className="whitespace-nowrap relative z-10">QA/SDET DSA Sheet</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              </button>
              
              <button
                onClick={() => navigate('/jobs')}
                className="group relative inline-flex items-center justify-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-white/20 hover:border-blue-400 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <RiseOutlined className="text-xl sm:text-2xl flex-shrink-0" />
                <span className="whitespace-nowrap">Explore All Jobs</span>
              </button>

              <button
                onClick={() => handleModalOpen('poll')}
                className="group relative inline-flex items-center justify-center gap-3 sm:gap-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-8 sm:px-12 py-5 sm:py-6 rounded-2xl text-base sm:text-lg font-bold transition-all duration-500 hover:scale-110 shadow-xl hover:shadow-2xl border-2 border-white/20 hover:border-purple-400 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <BarChartOutlined className="text-xl sm:text-2xl flex-shrink-0" />
                <span className="whitespace-nowrap">Create Polls</span>
              </button>
            </motion.div>
            
            {/* Premium Stats - Enhanced with Icons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12"
            >
              {[
                { value: jobsCount, label: 'Fresh Jobs', gradient: 'from-blue-600 to-purple-600', icon: Briefcase, borderColor: 'hover:border-blue-300' },
                { value: usersCount, label: 'Active Users', gradient: 'from-purple-600 to-pink-600', icon: Users, borderColor: 'hover:border-purple-300' },
                { value: '100+', label: 'Interview Resources', gradient: 'from-emerald-600 to-teal-600', icon: MessageCircle, borderColor: 'hover:border-emerald-300' },
                { value: '24/7', label: 'Support', gradient: 'from-orange-600 to-red-600', icon: Shield, borderColor: 'hover:border-orange-300' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className={`group text-center p-6 sm:p-8 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 shadow-xl hover:shadow-2xl ${stat.borderColor} transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient.replace('from-', 'from-').replace('to-', 'to-')} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex justify-center mb-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300`}>
                          <Icon className={`w-6 h-6 text-white`} />
                        </div>
                      </div>
                      <div className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform`}>
                        {stat.value}
                      </div>
                      <div className="text-white/80 font-bold text-sm sm:text-base uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            
          </div>
        </section>

        <Suspense fallback={
          <div className="relative w-full h-[600px] overflow-hidden rounded-3xl border-2 border-white/10 bg-white/5 backdrop-blur-sm animate-pulse">
            <div className="flex items-center justify-center h-full">
              <div className="text-white/60">Loading job preview...</div>
            </div>
          </div>
        }>
          <FadedJobTablePreview />
        </Suspense>

        {/* Unified Features Section - Modern & Beautiful */}
        <section id="features" className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            {/* Section Header */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 sm:mb-20"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border-2 border-blue-400/30 shadow-xl shadow-blue-500/20 mb-6"
              >
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-blue-300 tracking-wide">PLATFORM FEATURES</span>
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Everything You Need for Your
                <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  QA/SDET Career
                </span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto font-medium leading-relaxed">
                A comprehensive platform designed specifically for Quality Assurance and Software Development Engineer in Test professionals
              </p>
            </motion.div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
              {allFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onClick={() => !feature.comingSoon && navigate(feature.path)}
                    className={`group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 border-2 border-white/20 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl overflow-hidden flex flex-col ${
                      feature.comingSoon 
                        ? 'cursor-not-allowed opacity-75' 
                        : 'cursor-pointer hover:border-white/30'
                    }`}
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {/* Hover Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient.replace('from-', 'from-').replace('to-', 'to-')} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                    
                    {/* Glow Effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                        {feature.title === "Community Polls" ? (
                          <BarChartOutlined className="text-white" style={{ fontSize: '2rem' }} />
                        ) : feature.title === "Resume Builder" ? (
                          <FormOutlined className="text-white" style={{ fontSize: '2rem' }} />
                        ) : (
                          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        )}
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center group-hover:text-white transition-colors">
                        {feature.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white/80 text-center leading-relaxed text-sm sm:text-base mb-6 flex-grow">
                        {feature.description}
                      </p>
                      
                      {/* Action Button - Fixed alignment */}
                      {!feature.comingSoon ? (
                        <div className="flex items-center justify-center mt-auto">
                          <button className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${feature.gradient} text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                            {feature.action}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center mt-auto">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white/60 rounded-lg font-semibold text-sm">
                            Coming Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section - New Addition */}
        <section className="py-20 sm:py-24 md:py-32 relative bg-gradient-to-b from-slate-900/50 via-purple-900/30 to-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16 sm:mb-20"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Why Choose Route2Hire?
              </h2>
              <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto font-medium">
                The fastest-growing platform dedicated exclusively to QA/SDET professionals
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto">
              {[
                {
                  icon: Target,
                  title: "QA/SDET-Focused",
                  description: "Unlike generic job platforms, every feature is designed specifically for Quality Assurance and Software Development Engineer in Test roles.",
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100"
                },
                {
                  icon: Zap,
                  title: "Comprehensive Preparation",
                  description: "Access interview experiences, topic-wise questions, and a dedicated DSA sheet with leaderboard to track your progress and compete with peers.",
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-50 to-blue-100"
                },
                {
                  icon: Shield,
                  title: "Community-Driven",
                  description: "Join our active Telegram and WhatsApp communities (3.5K+ members) for instant job alerts, networking, and peer support.",
                  gradient: "from-emerald-500 to-emerald-600",
                  bgGradient: "from-emerald-50 to-emerald-100"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 sm:p-10 border-2 border-white/20 hover:border-white/30 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient.replace('from-', 'from-').replace('to-', 'to-')} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    <div className="relative z-10">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${item.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl`}>
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center group-hover:text-white transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-center leading-relaxed text-base">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter Section - Enhanced */}
        <section className="py-16 sm:py-20 md:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent"></div>
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <Suspense fallback={
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-12 px-6 rounded-3xl shadow-2xl mx-auto w-full animate-pulse">
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

        

        {/* Testimonials - Enhanced */}
        <section id="testimonials" className="py-16 sm:py-24 md:py-32 relative bg-gradient-to-b from-purple-900/30 via-slate-900/50 to-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border-2 border-pink-400/30 shadow-xl shadow-pink-500/20 mb-6"
              >
                <TrophyOutlined className="text-pink-400 text-base" />
                <span className="text-sm font-bold text-pink-300 tracking-wide">TESTIMONIALS</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                What Our Community Says
              </h2>
              <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg md:text-xl font-medium">
                Real experiences from QA/SDET professionals who found success with Route2Hire
              </p>
            </motion.div>
            <Suspense fallback={
              <div className="text-center py-12">
                <div className="h-8 bg-white/10 rounded mb-4 mx-auto max-w-md"></div>
                <div className="h-4 bg-white/10 rounded mb-8 mx-auto max-w-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl p-6 animate-pulse">
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

        {/* FAQ Section - Enhanced */}
        <section id="faq" className="py-16 sm:py-24 md:py-32 relative bg-gradient-to-b from-slate-900/50 via-purple-900/30 to-slate-900/50">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 sm:mb-16"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border-2 border-purple-400/30 shadow-xl shadow-purple-500/20 mb-6"
              >
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-bold text-purple-300 tracking-wide">FAQ</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Frequently Asked Questions
              </h2>
              <p className="text-white/80 max-w-3xl mx-auto text-base sm:text-lg md:text-xl font-medium">
                Quick answers about Route2Hire, the QA/SDET DSA Sheet, alerts, and our community.
              </p>
            </motion.div>


            {/* FAQ Items - Enhanced */}
            <div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
              {faqs.map((item, index) => (
                <motion.details
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl border-2 border-white/20 open:border-blue-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-open:opacity-100 transition-opacity duration-300"></div>
                  <summary className="cursor-pointer list-none px-6 sm:px-8 py-5 sm:py-6 text-white flex items-start justify-between gap-4 relative z-10">
                    <span className="text-base sm:text-lg md:text-xl font-bold pr-4">{item.q}</span>
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold group-open:rotate-45 transition-all duration-300 flex-shrink-0 shadow-lg"
                    >
                      +
                    </span>
                  </summary>
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8 text-white/80 text-sm sm:text-base md:text-lg leading-relaxed relative z-10">
                    {item.a}
                  </div>
                </motion.details>
              ))}
            </div>
          </div>
        </section>

        {/* Community CTA Section - Beautiful with Waves */}
        <section className="py-16 sm:py-20 relative overflow-hidden bg-slate-900/80">
          {/* Wave Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute bottom-0 left-0 w-full h-32 text-slate-900/80" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" className="fill-current"></path>
            </svg>
            <svg className="absolute top-0 left-0 w-full h-32 text-slate-900/80 rotate-180" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z" className="fill-current"></path>
            </svg>
            {/* Decorative circles */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl opacity-30"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10 sm:mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border-2 border-blue-400/30 shadow-xl shadow-blue-500/20 mb-6"
              >
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-bold text-blue-300 tracking-wide">JOIN OUR COMMUNITY</span>
              </motion.div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
                Connect with 3.5K+ QA/SDET Professionals
              </h2>
              <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                Join our active communities for instant job alerts, networking opportunities, and peer support
              </p>
            </motion.div>

            {/* Community Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
              {/* Telegram Card */}
              <motion.a
                href="https://t.me/trendingjobs4all_QA"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                        Telegram Community
                      </h3>
                      <p className="text-sm text-white/70 font-medium">3.5K+ active members</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    Get instant job alerts, daily updates, and engage in real-time discussions with QA/SDET professionals
                  </p>
                  <div className="flex items-center text-blue-300 font-semibold text-sm group-hover:text-blue-200">
                    Join Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>

              {/* WhatsApp Card */}
              <motion.a
                href="https://chat.whatsapp.com/DXvc1ncAenX1HZ7OKr8L4Y?mode=wwt"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.03, y: -4 }}
                className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border-2 border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-300 transition-colors">
                        WhatsApp Group
                      </h3>
                      <p className="text-sm text-white/70 font-medium">Active community</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm mb-4 leading-relaxed">
                    Connect with peers, share experiences, and get instant support from the QA/SDET community
                  </p>
                  <div className="flex items-center text-green-300 font-semibold text-sm group-hover:text-green-200">
                    Join Now
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.a>
            </div>
          </div>
        </section>

      </div>

      {/* Premium Chat Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md sm:max-w-4xl h-full sm:max-h-[90vh] flex flex-col overflow-hidden border-2 border-white/10">
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
                    className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : 'bg-white/10 backdrop-blur-xl text-white border-2 border-white/20'
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
                  <div className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg flex items-center gap-4">
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
            <div className="p-3 sm:p-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-t-2 border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  placeholder="Ask about careers, salaries, job markets..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-white/60 transition-all duration-300 text-sm sm:text-base"
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
