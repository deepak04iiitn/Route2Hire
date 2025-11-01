import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, BookOpen, TrendingUp, Users } from 'lucide-react';

/**
 * RelatedLinks component to show related content sections
 * Helps with internal linking and SEO
 */
export default function RelatedLinks({ type = 'general' }) {
  const linkSections = {
    job: {
      title: 'Explore More Resources',
      links: [
        { path: '/jobs', label: 'Browse All Jobs', icon: Briefcase },
        { path: '/interviewExp', label: 'Interview Experiences', icon: BookOpen },
        { path: '/salaryStructures', label: 'Salary Insights', icon: TrendingUp },
        { path: '/referrals', label: 'Employee Referrals', icon: Users },
        { path: '/interview-questions', label: 'Interview Questions', icon: BookOpen },
        { path: '/resume-builder', label: 'Resume Builder', icon: Briefcase },
      ]
    },
    interview: {
      title: 'Related Career Resources',
      links: [
        { path: '/interviewExp', label: 'More Interview Experiences', icon: BookOpen },
        { path: '/interview-questions', label: 'Interview Questions', icon: BookOpen },
        { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
        { path: '/salaryStructures', label: 'Salary Insights', icon: TrendingUp },
        { path: '/resume-builder', label: 'Resume Builder', icon: Briefcase },
        { path: '/referrals', label: 'Employee Referrals', icon: Users },
      ]
    },
    salary: {
      title: 'Explore Career Resources',
      links: [
        { path: '/salaryStructures', label: 'More Salary Insights', icon: TrendingUp },
        { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
        { path: '/interviewExp', label: 'Interview Experiences', icon: BookOpen },
        { path: '/referrals', label: 'Employee Referrals', icon: Users },
        { path: '/interview-questions', label: 'Interview Questions', icon: BookOpen },
        { path: '/resumeTemplates', label: 'Resume Templates', icon: Briefcase },
      ]
    },
    referral: {
      title: 'More Career Opportunities',
      links: [
        { path: '/referrals', label: 'Browse More Referrals', icon: Users },
        { path: '/jobs', label: 'Browse All Jobs', icon: Briefcase },
        { path: '/interviewExp', label: 'Interview Experiences', icon: BookOpen },
        { path: '/salaryStructures', label: 'Salary Insights', icon: TrendingUp },
        { path: '/interview-questions', label: 'Interview Questions', icon: BookOpen },
        { path: '/resume-builder', label: 'Resume Builder', icon: Briefcase },
      ]
    },
    general: {
      title: 'Explore Our Resources',
      links: [
        { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
        { path: '/interviewExp', label: 'Interview Experiences', icon: BookOpen },
        { path: '/salaryStructures', label: 'Salary Insights', icon: TrendingUp },
        { path: '/referrals', label: 'Employee Referrals', icon: Users },
        { path: '/interview-questions', label: 'Interview Questions', icon: BookOpen },
        { path: '/resume-builder', label: 'Resume Builder', icon: Briefcase },
      ]
    }
  };

  const section = linkSections[type] || linkSections.general;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <ArrowRight className="text-blue-600" size={20} />
        {section.title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {section.links.map((link, index) => {
          const Icon = link.icon;
          return (
            <Link
              key={index}
              to={link.path}
              className="group flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-md border border-gray-200 hover:border-blue-300"
            >
              <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                <Icon size={18} className="text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors flex-1">
                {link.label}
              </span>
              <ArrowRight 
                size={16} 
                className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" 
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

