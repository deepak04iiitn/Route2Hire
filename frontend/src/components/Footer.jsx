import React from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ href, children, isExternal = false }) => {
  if (isExternal) {
    return (
      <a
        href={href}
        className="group relative text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="relative z-10">{children}</span>
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
      </a>
    );
  }
  
  return (
    <Link
      to={href}
      className="group relative text-slate-300 hover:text-white transition-all duration-300 text-sm font-medium"
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
};


export default function Footer() {
  return (
    <footer className="relative bg-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="relative">
                <picture>
                  {/* WebP for modern browsers - smallest file size */}
                  <source 
                    srcSet="/assets/Route2Hire-48.webp 1x, /assets/Route2Hire-96.webp 2x" 
                    type="image/webp"
                  />
                  {/* Optimized PNG fallback */}
                  <source 
                    srcSet="/assets/Route2Hire-48.png 1x, /assets/Route2Hire-96.png 2x" 
                    type="image/png"
                  />
                  {/* Final fallback */}
                  <img
                    src="/assets/Route2Hire-48.png"
                    alt="Route2Hire Logo"
                    width="48"
                    height="48"
                    className="h-12 w-12 transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Route2Hire
                </span>
                <div className="text-xs text-cyan-400 font-medium tracking-wider uppercase">Premium Careers</div>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              Connecting QA/SDET professionals to extraordinary career opportunities and job resources. Your gateway to success.
            </p>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Trusted by 1000+ professionals</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>3000+ companies hiring</span>
            </div>
          </div>
          
          {/* Career Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Career Resources
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/jobs">Job Listings</FooterLink></li>
              <li><FooterLink href="/interviewExp">Interview Experiences</FooterLink></li>
              <li><FooterLink href="/interview-questions">Question Bank</FooterLink></li>
              <li><FooterLink href="/referrals">Referrals</FooterLink></li>
              <li><FooterLink href="/salaryStructures">Salary Insights</FooterLink></li>
              <li><FooterLink href="/resumeTemplates">Resume Templates</FooterLink></li>
              <li><FooterLink href="/resume-builder">Resume Builder</FooterLink></li>
            </ul>
          </div>
          
          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Company
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/newsletter">Newsletter</FooterLink></li>
              <li><FooterLink href="/contactUs">Contact Us</FooterLink></li>
              <li><FooterLink href="/BuyMeACoffee">Premium Subscription</FooterLink></li>
              <li><FooterLink href="/myCorner">My Corner</FooterLink></li>
            </ul>
          </div>
          
          {/* Legal & Support */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Legal & Support
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/privacyPolicy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/cookies">Cookie Policy</FooterLink></li>
              <li><FooterLink href="/sign-up">Sign Up</FooterLink></li>
              <li><FooterLink href="/contactUs">Help Center</FooterLink></li>
            </ul>
          </div>
          
          {/* Community */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-6 text-white relative">
              Community
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"></div>
            </h3>
            <ul className="space-y-3">
              <li><FooterLink href="/publicpolls">Public Polls</FooterLink></li>
              <li><FooterLink href="/mypolls">My Polls</FooterLink></li>
              <li><FooterLink href="/my-jobs">My Jobs</FooterLink></li>
              <li><FooterLink href="/profile">My Profile</FooterLink></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <div className="text-center">
            <div className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Route2Hire. Crafted with 
              <span className="text-red-400 mx-1">♥</span>
              for ambitious careers.
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Gradient Bar */}
      <div className="w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600"></div>
    </footer>
  );
}