import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Database, 
  Lock, 
  Mail, 
  FileText 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    document.title = "Privacy Policy - Route2Hire";
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "Introduction",
      content: "Welcome to Route2Hire. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services. Please read it carefully.",
      icon: FileText
    },
    {
      title: "Information We Collect",
      content: "We collect various types of information to provide better services to our users. This may include personal information like your name, email address, job preferences, and browsing behavior.",
      icon: Database
    },
    {
      title: "How We Use Your Information",
      content: "The information we collect helps us to provide personalized job recommendations, improve our services, and communicate with you effectively regarding job opportunities and site updates.",
      icon: ShieldCheck
    },
    {
      title: "Data Security",
      content: "We implement strict security measures to ensure that your personal data is safe. We use encryption and secure servers to protect your information from unauthorized access.",
      icon: Lock
    },
    {
      title: "Third-Party Sharing",
      content: "We do not share your personal data with third parties unless required by law or necessary to provide our services, such as partnering with job boards or employers.",
      icon: ShieldCheck
    },
    {
      title: "Your Rights",
      content: "You have the right to access, update, or delete your personal information at any time. If you wish to exercise any of your rights, please contact us directly.",
      icon: FileText
    }
  ];

  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Privacy Policy | Route2Hire QA & SDET Platform</title>
        <meta
          name="description"
          content="Read Route2Hire's Privacy Policy to understand how we protect your personal information while using our QA, SDET, Test Automation, and Software Testing career platform."
        />
        <meta
          name="keywords"
          content="Privacy policy, Route2Hire privacy, Data protection, User privacy, QA platform privacy, SDET platform privacy, Software Testing platform privacy, Privacy rights"
        />
        <meta property="og:title" content="Privacy Policy | Route2Hire QA & SDET Platform" />
        <meta
          property="og:description"
          content="Learn how Route2Hire protects your privacy while providing QA, SDET, and Test Automation career services and resources."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/privacy-policy" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/privacy-policy" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto mb-6 pt-20">
        <Breadcrumb 
          items={[
            { label: 'Privacy Policy' }
          ]}
        />
      </div>
      
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-blue-600 text-white py-8 px-6 text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-blue-100">
            Transparency and Trust at Route2Hire
          </p>
        </motion.div>

        {/* Sections */}
        <div className="p-6 sm:p-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="mb-8 group"
            >
              <div 
                onClick={() => setActiveSection(activeSection === index ? null : index)}
                className="flex items-center cursor-pointer hover:bg-blue-50 p-4 rounded-lg transition-all duration-300"
              >
                <section.icon 
                  className="h-10 w-10 text-blue-500 mr-4 group-hover:text-blue-600 transition-colors"
                  strokeWidth={1.5}
                />
                <h2 className="text-2xl font-semibold text-blue-700 group-hover:text-blue-800">
                  {section.title}
                </h2>
              </div>
              <AnimatePresence>
                {activeSection === index && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-gray-600 text-lg leading-relaxed mt-4 px-4 overflow-hidden"
                  >
                    {section.content}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="bg-blue-50 p-8 text-center"
        >
          <div className="flex justify-center items-center mb-4">
            <Mail 
              className="h-10 w-10 text-blue-500 mr-4" 
              strokeWidth={1.5}
            />
            <h3 className="text-2xl font-semibold text-blue-700">
              Got Questions?
            </h3>
          </div>
          <p className="text-gray-600 mb-6">
            We're here to help. Reach out to us with any privacy-related inquiries.
          </p>
          <a 
            href="/contactUs" 
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>

        {/* Footer */}
        <div className="bg-blue-600 text-white py-4 text-center">
          <p>&copy; 2024 Route2Hire. All Rights Reserved.</p>
        </div>
      </div>
      
      {/* Related Links Section */}
      <div className="max-w-4xl mx-auto mt-8 pb-8">
        <RelatedLinks type="general" />
      </div>
      </div>
    </>
  );
}