import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cookie, 
  Settings, 
  Shield, 
  Database, 
  Eye, 
  Mail,
  CheckCircle,
  AlertCircle,
  Clock,
  Globe
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';

export default function CookiePolicy() {
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    document.title = "Cookie Policy - Route2Hire";
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      title: "What Are Cookies",
      content: "Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling certain functionality.",
      icon: Cookie
    },
    {
      title: "How We Use Cookies",
      content: "We use cookies to enhance your browsing experience, analyze site traffic, personalize content, and provide social media features. Cookies help us understand how you interact with our website so we can improve our services.",
      icon: Settings
    },
    {
      title: "Types of Cookies We Use",
      content: "Essential Cookies: Required for the website to function properly. Performance Cookies: Help us understand how visitors use our website. Functional Cookies: Enable enhanced functionality and personalization. Marketing Cookies: Used to deliver relevant advertisements.",
      icon: Database
    },
    {
      title: "Essential Cookies",
      content: "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.",
      icon: CheckCircle
    },
    {
      title: "Performance Cookies",
      content: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.",
      icon: Eye
    },
    {
      title: "Functional Cookies",
      content: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.",
      icon: Settings
    },
    {
      title: "Marketing Cookies",
      content: "These cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites. If you do not allow these cookies, you will experience less targeted advertising.",
      icon: Globe
    },
    {
      title: "Third-Party Cookies",
      content: "We may also use third-party cookies from trusted partners like Google Analytics, social media platforms, and advertising networks. These cookies are subject to the respective third parties' privacy policies.",
      icon: AlertCircle
    },
    {
      title: "Cookie Duration",
      content: "Session cookies are temporary and expire when you close your browser. Persistent cookies remain on your device for a set period or until you delete them. We use both types depending on the purpose of the cookie.",
      icon: Clock
    },
    {
      title: "Managing Your Cookie Preferences",
      content: "You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit a site.",
      icon: Settings
    },
    {
      title: "Browser Settings",
      content: "Most web browsers allow you to control cookies through their settings preferences. You can set your browser to refuse cookies or delete certain cookies. Please refer to your browser's help menu to learn how to change your cookie preferences.",
      icon: Shield
    },
    {
      title: "Updates to This Policy",
      content: "We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on this page.",
      icon: Database
    }
  ];

  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Cookie Policy | Route2Hire Careers in QA, SDET & IT</title>
        <meta
          name="description"
          content="Read Route2Hire's Cookie Policy to understand how we use cookies to enhance your experience while exploring career opportunities, especially in QA, SDET, Automation, and other IT roles."
        />
        <meta
          name="keywords"
          content="Route2Hire cookie policy, QA jobs, SDET careers, Automation testing, IT jobs, Software testing platform, Cookies, User experience"
        />
        <meta property="og:title" content="Cookie Policy | Route2Hire Careers in QA, SDET & IT" />
        <meta
          property="og:description"
          content="Learn how Route2Hire uses cookies to provide a better browsing experience while helping professionals and students explore careers in QA, SDET, Automation, and IT domains."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/cookie-policy" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/cookie-policy" />
      </Helmet>

      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="max-w-4xl mx-auto mb-6 pt-20">
          <Breadcrumb 
            items={[
              { label: 'Cookie Policy' }
            ]}
          />
        </div>
        
        <div className="w-full bg-white shadow-2xl rounded-2xl overflow-hidden mt-20">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-green-600 text-white py-8 px-6 text-center"
          >
            <h1 className="text-4xl font-extrabold tracking-tight">
              Cookie Policy
            </h1>
            <p className="mt-4 text-green-100">
              How We Use Cookies to Enhance Your Experience
            </p>
            <p className="mt-2 text-sm text-green-200">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>

          {/* Cookie Consent Notice */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-green-50 p-6 border-l-4 border-green-500"
          >
            <div className="flex items-start">
              <Cookie className="h-6 w-6 text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Cookie Consent
                </h3>
                <p className="text-green-700">
                  By continuing to use our website, you consent to our use of cookies as described in this policy. 
                  You can manage your cookie preferences at any time through your browser settings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="p-6 sm:p-12">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="mb-8 group"
              >
                <div 
                  onClick={() => setActiveSection(activeSection === index ? null : index)}
                  className="flex items-center cursor-pointer hover:bg-green-50 p-4 rounded-lg transition-all duration-300"
                >
                  <section.icon 
                    className="h-10 w-10 text-green-500 mr-4 group-hover:text-green-600 transition-colors"
                    strokeWidth={1.5}
                  />
                  <h2 className="text-2xl font-semibold text-green-700 group-hover:text-green-800">
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

          {/* Cookie Management Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="bg-green-50 p-8 text-center"
          >
            <div className="flex justify-center items-center mb-4">
              <Settings 
                className="h-10 w-10 text-green-500 mr-4" 
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-semibold text-green-700">
                Manage Your Cookie Preferences
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have control over which cookies you accept. Learn how to manage your preferences.
            </p>
            <a 
              href="/contactUs" 
              className="bg-green-600 text-white px-8 py-3 rounded-full hover:bg-green-700 transition-colors inline-block"
            >
              Contact Us
            </a>
          </motion.div>

          {/* Footer */}
          <div className="bg-green-600 text-white py-4 text-center">
            <p>&copy; {new Date().getFullYear()} Route2Hire. All Rights Reserved.</p>
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
