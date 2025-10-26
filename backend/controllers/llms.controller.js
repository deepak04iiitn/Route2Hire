import InterviewExperience from '../models/interview.model.js';
import Salary from '../models/salary.model.js';
import Referral from '../models/referral.model.js';
import InterviewQuestion from '../models/interviewQuestion.model.js';
import mongoose from 'mongoose';

// In-memory cache for llms.txt
let llmsCache = null;
let llmsCacheTimestamp = null;
const LLMS_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Helper function to create slug from text
const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Helper function to generate llms.txt content
const generateLLMSText = (dynamicContent) => {
  const baseUrl = 'https://route2hire.com';
  
  let content = `# route2hire.com llms.txt

## Core Features

`;

  // Static content with descriptions
  const staticContent = [
    {
      url: '/',
      title: 'Tech Career Hub',
      description: 'Connect tech professionals with curated jobs, referrals, interview prep, and salary insights to accelerate career growth.'
    },
    {
      url: '/sign-in',
      title: 'Route2Hire Sign In',
      description: 'Facilitates user sign-in for accessing job listings and career resources on Route2Hire platform.'
    },
    {
      url: '/sign-up',
      title: 'Route2Hire Sign-Up',
      description: 'Facilitates user sign-up to access premium job listings and career resources.'
    },
    {
      url: '/about',
      title: 'About Route2Hire',
      description: 'Connect professionals with personalized job opportunities and career resources for growth and success.'
    },
    {
      url: '/jobs',
      title: 'Premium Job Listings',
      description: 'List and facilitate applications for high-paying job opportunities worldwide in various tech and QA roles.'
    },
    {
      url: '/my-jobs',
      title: 'My Jobs Dashboard',
      description: 'Provide a personalized job dashboard for tracking and bookmarking career opportunities.'
    },
    {
      url: '/publicpolls',
      title: 'Community Polls',
      description: 'Facilitate community engagement through public polls and real-time analytics to reveal trending opinions and insights.'
    },
    {
      url: '/mypolls',
      title: 'My Polls - Career Hub',
      description: 'Provide users access to personalized career polls and related job resources.'
    },
    {
      url: '/interviewExp',
      title: 'Interview Experiences',
      description: 'Explore and share detailed interview experiences and insights by company and position.'
    },
    {
      url: '/interview-experiences',
      title: 'Interview Experiences Hub',
      description: 'Browse comprehensive interview experiences shared by professionals across various companies and roles.'
    },
    {
      url: '/salaryStructures',
      title: 'Salary Insights',
      description: 'Provide and share salary data to promote pay transparency and informed career decisions.'
    },
    {
      url: '/referrals',
      title: 'Job Referral Platform',
      description: 'Facilitate job referrals and networking to help professionals access career opportunities and share referrals.'
    },
    {
      url: '/resumeTemplates',
      title: 'Resume Templates',
      description: 'Provide and share tailored resume templates to enhance job applications for various roles and experience levels.'
    },
    {
      url: '/resume-builder',
      title: 'Premium Resume Builder',
      description: 'Allow users to create professional resumes and access career resources for job opportunities.'
    },
    {
      url: '/interview-questions',
      title: 'Interview Questions Bank',
      description: 'Prepare candidates with categorized real interview questions and detailed explanations for IT job interviews.'
    },
    {
      url: '/dsa-tracker',
      title: 'DSA Problem Tracker',
      description: 'Master Data Structures & Algorithms with real QA/SDET interview questions. Track your progress through actual problems asked in QA and SDET interviews, organized by category and difficulty.'
    },
    {
      url: '/newsletter',
      title: 'Route2Hire Premium Jobs',
      description: 'Offer premium job alerts and career resources for personalized job search and professional growth.'
    },
    {
      url: '/contactUs',
      title: 'Contact Route2Hire',
      description: 'Provide contact information and connect users with career opportunities and support.'
    },
    {
      url: '/terms',
      title: 'Route2Hire Terms of Service',
      description: 'Outline the terms, user rights, responsibilities, and legal guidelines for using Route2Hire services.'
    },
    {
      url: '/privacyPolicy',
      title: 'Privacy Policy',
      description: 'Explain Route2Hire\'s practices on collecting, using, and protecting user privacy and data.'
    },
    {
      url: '/cookies',
      title: 'Cookie Policy',
      description: 'Explain cookie usage and management on the site to enhance user experience and privacy control.'
    }
  ];

  // Add static content
  staticContent.forEach(item => {
    content += `- [${item.title}](${baseUrl}${item.url}): ${item.description}\n`;
  });

  // Add dynamic content sections
  if (dynamicContent.interviewExperiences.length > 0) {
    content += `\n## Interview Experiences\n\n`;
    dynamicContent.interviewExperiences.slice(0, 20).forEach(exp => {
      const company = exp.company || 'Unknown Company';
      const position = exp.position || 'Unknown Position';
      content += `- [${company} - ${position} Interview Experience](${baseUrl}/interview-experience/${exp._id}): Real interview experience shared by ${exp.fullName || 'Anonymous'} for ${position} position at ${company}.\n`;
    });
  }

  if (dynamicContent.salaryRecords.length > 0) {
    content += `\n## Salary Insights & Compensation Data\n\n`;
    dynamicContent.salaryRecords.slice(0, 20).forEach(salary => {
      const company = salary.company || 'Unknown Company';
      const position = salary.position || 'Unknown Position';
      const ctc = salary.ctc || 'Not disclosed';
      content += `- [${company} - ${position} Salary Data](${baseUrl}/salary/${salary._id}): Salary information for ${position} at ${company} with CTC of ${ctc}.\n`;
    });
  }

  if (dynamicContent.referrals.length > 0) {
    content += `\n## Job Referrals & Networking\n\n`;
    dynamicContent.referrals.slice(0, 20).forEach(referral => {
      const company = referral.company || 'Unknown Company';
      const positions = referral.positions && referral.positions.length > 0 
        ? referral.positions.map(p => p.position).join(', ')
        : 'Various positions';
      content += `- [${company} Job Referrals](${baseUrl}/referral/${referral._id}): Job referral opportunities at ${company} for positions: ${positions}.\n`;
    });
  }

  if (dynamicContent.interviewQuestions.length > 0) {
    content += `\n## Interview Questions & Preparation\n\n`;
    dynamicContent.interviewQuestions.slice(0, 20).forEach(question => {
      const topic = question.topic || 'Interview Questions';
      const topicSlug = createSlug(topic);
      content += `- [${topic} Interview Questions](${baseUrl}/interview-questions/${topicSlug}): Real interview questions and answers for ${topic} preparation.\n`;
    });
  }

  if (dynamicContent.jobs.length > 0) {
    content += `\n## Current Job Opportunities\n\n`;
    dynamicContent.jobs.slice(0, 30).forEach(job => {
      const title = job.job_title || 'Job Opportunity';
      const company = job.company || 'Company';
      const location = job.location && job.location.length > 0 ? job.location.join(', ') : 'Location not specified';
      const jobSlug = createSlug(`${job._id}`);
      content += `- [${title} at ${company}](${baseUrl}/fulljd/${jobSlug}/${job._id}): ${title} position at ${company} in ${location}.\n`;
    });
  }

  content += `\n## About Route2Hire\n\n`;
  content += `Route2Hire is a comprehensive career platform designed for tech professionals. We provide:\n\n`;
  content += `- **Job Listings**: Curated high-quality job opportunities in tech and QA roles\n`;
  content += `- **Interview Preparation**: Real interview experiences and question banks\n`;
  content += `- **Salary Transparency**: Anonymous salary data for informed career decisions\n`;
  content += `- **Referral Network**: Connect with professionals for job referrals\n`;
  content += `- **Career Resources**: Resume templates, interview tips, and career guidance\n`;
  content += `- **Community Features**: Polls, discussions, and professional networking\n\n`;
  content += `Our platform helps professionals make informed career decisions, prepare for interviews, and connect with opportunities that match their skills and aspirations.\n\n`;
  content += `Last updated: ${new Date().toISOString().split('T')[0]}\n`;

  return content;
};

// Main function to generate llms.txt
export const generateLLMS = async (req, res) => {
  try {
    // Check cache first
    if (llmsCache && llmsCacheTimestamp && (Date.now() - llmsCacheTimestamp < LLMS_CACHE_DURATION)) {
      res.set('Content-Type', 'text/plain; charset=utf-8');
      return res.send(llmsCache);
    }

    console.log('Generating fresh llms.txt...');
    
    // Fetch all dynamic content in parallel with optimized queries
    const [
      interviewExperiences,
      salaryRecords,
      referrals,
      interviewQuestions,
      jobs
    ] = await Promise.all([
      InterviewExperience.find({}, '_id company position fullName').lean().limit(20),
      Salary.find({}, '_id company position ctc').lean().limit(20),
      Referral.find({}, '_id company positions').lean().limit(20),
      InterviewQuestion.find({}, '_id topic').lean().limit(20),
      mongoose.connection.db.collection('naukri').find(
        { 
          apply_link: { $exists: true, $ne: null, $ne: '' },
          apply_link: { $ne: 'Not Found' },
          apply_link: { $ne: 'about:blank' },
          apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } },
          apply_link: { $regex: /^https?:\/\/.+\..+/i }
        },
        { projection: { _id: 1, job_title: 1, company: 1, location: 1 } }
      ).limit(30).toArray()
    ]);

    const dynamicContent = {
      interviewExperiences,
      salaryRecords,
      referrals,
      interviewQuestions,
      jobs
    };

    // Generate llms.txt content
    const llmsContent = generateLLMSText(dynamicContent);

    // Cache the result
    llmsCache = llmsContent;
    llmsCacheTimestamp = Date.now();

    // Set appropriate headers for SEO and performance
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // Cache for 1 hour
    res.set('ETag', `"${Date.now()}"`); // Simple ETag for caching
    res.set('Last-Modified', new Date().toUTCString());
    res.set('X-Content-Type-Options', 'nosniff');
    
    res.send(llmsContent);

  } catch (error) {
    console.error('Error generating llms.txt:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate llms.txt',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Function to clear llms.txt cache (useful for webhooks)
export const clearLLMSCache = () => {
  llmsCache = null;
  llmsCacheTimestamp = null;
  console.log('LLMS cache cleared');
};

// Function to get llms.txt statistics
export const getLLMSStats = async (req, res) => {
  try {
    const [
      interviewCount,
      salaryCount,
      referralCount,
      questionCount,
      jobCount
    ] = await Promise.all([
      InterviewExperience.countDocuments(),
      Salary.countDocuments(),
      Referral.countDocuments(),
      InterviewQuestion.countDocuments(),
      mongoose.connection.db.collection('naukri').countDocuments({
        apply_link: { $exists: true, $ne: null, $ne: '' },
        apply_link: { $ne: 'Not Found' },
        apply_link: { $ne: 'about:blank' },
        apply_link: { $not: { $regex: /invalid-url|\/404\/|\/404$|not.found|not.available/i } },
        apply_link: { $regex: /^https?:\/\/.+\..+/i }
      })
    ]);

    const totalDynamicItems = interviewCount + salaryCount + referralCount + questionCount + jobCount;
    const staticItemCount = 21; // Count of static items
    const totalItems = staticItemCount + totalDynamicItems;

    res.json({
      success: true,
      stats: {
        staticItems: staticItemCount,
        dynamicItems: {
          interviewExperiences: interviewCount,
          salaryRecords: salaryCount,
          referrals: referralCount,
          interviewQuestions: questionCount,
          jobs: jobCount,
          total: totalDynamicItems
        },
        totalItems,
        cacheStatus: llmsCache ? 'cached' : 'not cached',
        cacheAge: llmsCacheTimestamp ? Math.floor((Date.now() - llmsCacheTimestamp) / 1000) : null
      }
    });
  } catch (error) {
    console.error('Error getting llms stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get llms statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
