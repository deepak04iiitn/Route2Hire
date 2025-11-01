import React, { useEffect, useRef } from 'react';
import { BrowserRouter , Routes , Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Header from './components/Header';
import Footer from './components/Footer';
import FlashStrip from './components/FlashStrip';
import Profile from './pages/Profile';
import FullJd from './pages/FullJd';
import MyJobs from './pages/MyJobs';
import PublicPolls from './pages/PublicPolls';
import MyPolls from './pages/MyPolls';
import InterviewExp from './pages/InterviewExp';
import SalaryStructures from './pages/SalaryStructures';
import Referrals from './pages/Referrals';
import ResumeReviews from './pages/ResumeReviews';
import ResumeTemplates from './pages/ResumeTemplates';
import MyCorner from './pages/MyCorner';
import PremiumSubscription from './pages/PremiumSubscription';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/Dashboard';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Jobs from './pages/Jobs';
import InterviewDetailPage from './pages/InterviewDetailPage';
import SalaryDetailPage from './pages/SalaryDetailPage';
import ReferralDetailPage from './pages/ReferralDetailPage';
import ResumeBuilder from './pages/ResumeBuilder';
import InterviewQuestions from './pages/InterviewQuestions';
import AdminInterviewQuestions from './pages/AdminInterviewQuestions';
import Newsletter from './pages/Newsletter';
import GlobalPollModal from './components/GlobalPollModal';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess, initializeSessionExpiry } from './redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminBlogs from './pages/AdminBlogs';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import DSAProblemTracker from './pages/DSAProblemTracker';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import RoadmapPage from './pages/RoadmapPage';
// import RoadmapList from './pages/RoadmapList';
// import CreateRoadmap from './pages/CreateRoadmap';


function SessionManager() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser, sessionExpiry } = useSelector((state) => state.user);
  const timerRef = useRef(null);


  useEffect(() => {
    // On mount or user change, ensure we have an expiry
    if (currentUser && !sessionExpiry) {
      dispatch(initializeSessionExpiry());
    }
  }, [currentUser, sessionExpiry, dispatch]);


  useEffect(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }


    if (!currentUser || !sessionExpiry) return;


    const now = Date.now();
    const msUntilExpiry = Math.max(0, sessionExpiry - now);


    if (msUntilExpiry === 0) {
      // Expired already
      dispatch(signoutSuccess());
      navigate('/sign-in');
      return;
    }


    timerRef.current = setTimeout(() => {
      dispatch(signoutSuccess());
      navigate('/sign-in');
    }, msUntilExpiry);


    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentUser, sessionExpiry, dispatch, navigate]);


  // Additionally, when the document becomes visible again, if expired, logout
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (currentUser && sessionExpiry && Date.now() >= sessionExpiry) {
          dispatch(signoutSuccess());
          navigate('/sign-in');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser, sessionExpiry, dispatch, navigate]);


  return null;
}


export default function App() {
  return (
    <HelmetProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <SessionManager />
            <Header />
            <FlashStrip />
            <div className="flex-grow">
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/about' element={<About />} />
                <Route path='/sign-in' element={<SignIn />} />
                <Route path='/sign-up' element={<SignUp />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/fulljd/:url/:id' element={<FullJd />} />
                <Route path="/my-jobs" element={<MyJobs />} />
                <Route path='/publicpolls' element={<PublicPolls />} />
                <Route path="/mypolls" element={<MyPolls />} />
                <Route path="/interviewExp" element={<InterviewExp />} />
                <Route path="/interview-experiences" element={<InterviewExp />} />
                <Route path="/interview-experience/:slug/:experienceId" element={<InterviewExp />} />
                <Route path="/interview-experience/:experienceId" element={<InterviewExp />} />
                <Route path="/salaryStructures" element={<SalaryStructures />} />
                <Route path="/salaryStructures/:slug/:salaryId" element={<SalaryStructures />} />
                <Route path="/salaryStructures/:salaryId" element={<SalaryStructures />} />
                <Route path="/salary/:id" element={<SalaryDetailPage />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/referral/:slug/:id" element={<ReferralDetailPage />} />
                <Route path="/referral/:id" element={<ReferralDetailPage />} />
                <Route path='/resumeTemplates' element={<ResumeTemplates />} />
                <Route path='/resumeTemplates/:slug/:templateId' element={<ResumeTemplates />} />
                <Route path='/resumeTemplates/:templateId' element={<ResumeTemplates />} />
                <Route path='/myCorner' element={<MyCorner />} />
                
                {/* Admin-only Routes */}
                <Route element={<AdminRoute />}>
                  <Route path='/dashboard' element={<Dashboard />} />
                  <Route path='/admin/interview-questions' element={<AdminInterviewQuestions />} />
                  <Route path='/admin-blogs' element={<AdminBlogs />} />
                  <Route path='/admin-blogs/:action' element={<AdminBlogs />} />
                  <Route path='/admin-blogs/:action/:id' element={<AdminBlogs />} />
                </Route>
                
                <Route path='/BuyMeACoffee' element={<PremiumSubscription />} />
                <Route path='/contactUs' element={<ContactUs />} />
                <Route path='/privacyPolicy' element={<PrivacyPolicy />} />
                <Route path='/terms' element={<TermsOfService />} />
                <Route path='/cookies' element={<CookiePolicy />} />
                <Route path='/newsletter' element={<Newsletter />} />
                <Route path='/jobs' element={<Jobs />} />
                <Route path='/resume-builder' element={<ResumeBuilder />} />
                
                {/* Interview Questions Routes */}
                <Route path='/interview-questions' element={<InterviewQuestions />} />
                <Route path='/interview-questions/:topicSlug' element={<InterviewQuestions />} />
                <Route path='/interview-questions/:topicSlug/:questionId' element={<InterviewQuestions />} />
                
                {/* Blog Routes */}
                {/* <Route path='/blogs' element={<Blogs />} />
                <Route path='/blogs/category/:category' element={<Blogs />} />
                <Route path='/blog/:slug' element={<BlogDetail />} /> */}
                
                {/* DSA Problem Tracker Route */}
                <Route path='/dsa-tracker' element={<DSAProblemTracker />} />

                {/* Roadmap Route */}
                <Route path="/roadmaps" element={<RoadmapList />} />
                <Route path="/roadmaps/create" element={<CreateRoadmap />} />
                <Route path="/roadmaps/edit/:role" element={<CreateRoadmap />} />
                <Route path="/roadmaps/:role" element={<RoadmapPage />} />

              </Routes>
            </div>
            <Footer />
            <GlobalPollModal />
            <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar={false} newestOnTop theme="colored" closeOnClick pauseOnFocusLoss={false} draggable pauseOnHover />
          </div>
        </BrowserRouter>
    </HelmetProvider>
  );
}
