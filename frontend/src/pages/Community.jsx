import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Linkedin, Twitter, Send, Youtube, Instagram, Github, Users, Sparkles, ExternalLink, Moon, Sun, Zap, Heart, TrendingUp, MessageCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';

export default function Community() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const socialLinks = [
    // {
    //   name: 'LinkedIn',
    //   icon: Linkedin,
    //   description: 'Join our professional network',
    //   url: 'https://linkedin.com/company/route2hire',
    //   color: '#0077B5',
    //   bgColor: darkMode ? 'bg-[#0077B5]' : 'bg-blue-500',
    //   stats: '15K+ Followers'
    // },
    // {
    //   name: 'Twitter/X',
    //   icon: Twitter,
    //   description: 'Stay updated with job news',
    //   url: 'https://twitter.com/route2hire',
    //   color: '#1DA1F2',
    //   bgColor: darkMode ? 'bg-[#1DA1F2]' : 'bg-sky-400',
    //   stats: '8K+ Tweets'
    // },
    {
        name: 'Topmate',
        icon: Users,
        description: 'Book 1:1 sessions with us',
        url: 'https://topmate.io/sandeep_yadav_sdet/',
        color: '#FF6B6B',
        bgColor: darkMode ? 'bg-[#FF6B6B]' : 'bg-red-400',
        stats: '15+ Sessions'
    },
    {
      name: 'Telegram',
      icon: Send,
      description: 'Get instant job alerts',
      url: 'https://t.me/trendingjobs4all_QA',
      color: '#0088cc',
      bgColor: darkMode ? 'bg-[#0088cc]' : 'bg-cyan-500',
      stats: '3.5K+ Members'
    },
    // {
    //   name: 'YouTube',
    //   icon: Youtube,
    //   description: 'Watch career tips & tutorials',
    //   url: 'https://youtube.com/@route2hire',
    //   color: '#FF0000',
    //   bgColor: darkMode ? 'bg-[#FF0000]' : 'bg-red-500',
    //   stats: '50K+ Views'
    // },
    {
      name: 'Instagram',
      icon: Instagram,
      description: 'Follow our daily inspiration',
      url: 'https://www.instagram.com/route2hire?igsh=ZGk5NTQyY2RiOGF1',
      color: '#E4405F',
      bgColor: darkMode ? 'bg-[#E4405F]' : 'bg-pink-500',
      stats: 'Daily Updates'
    },
  ];

  const communities = [
    {
      name: 'Telegram Community',
      icon: Users,
      description: 'Join 3.5K+ job seekers in our active community',
      url: 'https://t.me/trendingjobs4all_QA',
      members: '3500+',
      color: '#7C3AED',
      bgColor: 'bg-purple-600',
      activity: 'High Activity'
    },
    {
      name: 'WhatsApp Community',
      icon: MessageCircle,
      description: 'Connect with active tech professionals',
      url: 'https://chat.whatsapp.com/DXvc1ncAenX1HZ7OKr8L4Y?mode=wwt',
      members: 'Active Daily',
      color: '#25D366',
      bgColor: 'bg-green-600',
      activity: 'Very Active'
    }
  ];

  const features = [
    { icon: Zap, text: 'Instant Updates', color: 'text-yellow-500' },
    { icon: Heart, text: 'Supportive Community', color: 'text-red-500' },
    { icon: TrendingUp, text: 'Career Growth', color: 'text-green-500' }
  ];

  return (
    <>
      {/* ✅ Helmet for SEO */}
      <Helmet>
        <title>Community | Join Route2Hire - QA, SDET & Tech Community</title>
        <meta
          name="description"
          content="Join Route2Hire's vibrant community of 3000+ job seekers and tech enthusiasts. Connect on Telegram, WhatsApp, Instagram, and Topmate. Get instant job alerts, career tips, and professional networking opportunities for QA, SDET, and Test Automation professionals."
        />
        <meta
          name="keywords"
          content="Route2Hire community, QA community, SDET community, Test Automation community, Telegram job alerts, WhatsApp job groups, tech community, job seekers community, QA professionals network, SDET networking, career growth community"
        />
        <meta property="og:title" content="Community | Join Route2Hire - QA, SDET & Tech Community" />
        <meta
          property="og:description"
          content="Join 3000+ job seekers and tech enthusiasts in Route2Hire's active community. Connect on Telegram, WhatsApp, Instagram, and Topmate for instant job alerts, career tips, and professional networking."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/community" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/community" />
      </Helmet>

      <div className={`min-h-screen transition-all duration-700 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
      {/* Floating Logos Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute ${darkMode ? 'opacity-5' : 'opacity-10'}`}
            style={{
              width: `${Math.random() * 150 + 80}px`,
              height: `${Math.random() * 150 + 80}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            <img 
              src="/assets/Route2Hire.png" 
              alt="Route2Hire Logo" 
              className="w-full h-full object-contain"
              style={{ filter: darkMode ? 'brightness(0.8) contrast(1.2)' : 'brightness(1.2) contrast(0.8)' }}
            />
          </div>
        ))}
      </div>

      {/* Animated Grid Pattern */}
      <div className={`fixed inset-0 pointer-events-none ${darkMode ? 'opacity-5' : 'opacity-10'}`}>
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(${darkMode ? '#ffffff' : '#000000'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: 'Community' }
            ]}
          />
        </div>

        {/* Header Section */}
        <div className={`text-center mb-20 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-6 py-3 bg-blue-500 text-white rounded-full font-semibold text-sm animate-bounce-slow">
            🚀 Join 3500+ Members Worldwide
          </div>
          <h1 className={`text-6xl sm:text-7xl lg:text-8xl font-black mb-8 ${darkMode ? 'text-white' : 'text-gray-900'} tracking-tight`}>
            Connect with{' '}
            <span className="inline-block animate-color-shift">
              Route2Hire
            </span>
          </h1>
        </div>

        {/* Social Links Grid */}
        <div className="mb-24">
          <h2 className={`text-4xl sm:text-5xl font-black mb-12 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="inline-block animate-pulse-slow">📱</span> Join Us Now
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              const isHovered = hoveredCard === `social-${index}`;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredCard(`social-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative transform transition-all duration-500 hover:scale-105 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`relative ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 ${isHovered ? 'border-current' : darkMode ? 'border-gray-800' : 'border-gray-200'} overflow-hidden`}
                    style={{ borderColor: isHovered ? social.color : undefined }}
                  >
                    {/* Animated Background Wave */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 animate-wave" style={{ backgroundColor: `${social.color}15` }} />
                    </div>

                    <div className="relative">
                      <div className={`w-20 h-20 ${social.bgColor} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-xl`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-black mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {social.name}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 text-base`}>
                        {social.description}
                      </p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full mb-4`}>
                        <TrendingUp className="w-4 h-4" style={{ color: social.color }} />
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{social.stats}</span>
                      </div>
                      <div className="flex items-center text-base font-bold" style={{ color: social.color }}>
                        Visit Platform <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>

                    {/* Corner Accent */}
                    <div className="absolute top-0 right-0 w-24 h-24 opacity-20 transform rotate-45 translate-x-12 -translate-y-12 transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: social.color }} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Community Section */}
        <div className={`mb-20 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
          <h2 className={`text-4xl sm:text-5xl font-black mb-12 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="inline-block animate-bounce-slow">🌟</span> Join Our Communities
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {communities.map((community, index) => {
              const Icon = community.icon;
              const isHovered = hoveredCard === `community-${index}`;
              return (
                <a
                  key={community.name}
                  href={community.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredCard(`community-${index}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative transform transition-all duration-500 hover:scale-105"
                >
                  <div className={`relative ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 overflow-hidden`}
                    style={{ borderColor: isHovered ? community.color : darkMode ? '#1F2937' : '#E5E7EB' }}
                  >
                    {/* Animated Particles */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 rounded-full animate-particle"
                          style={{
                            backgroundColor: community.color,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`
                          }}
                        />
                      ))}
                    </div>

                    <div className="relative">
                      <div className="flex items-center mb-6">
                        <div className={`w-16 h-16 ${community.bgColor} rounded-2xl flex items-center justify-center mr-5 transform group-hover:rotate-12 transition-transform duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {community.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`text-base font-bold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              👥 {community.members}
                            </span>
                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse-slow">
                              {community.activity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 text-lg`}>
                        {community.description}
                      </p>
                      <button className={`px-8 py-4 ${community.bgColor} text-white font-black rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto`}>
                        Join Now →
                      </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 transform group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: community.color }} />
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-blue-500'} rounded-3xl p-12 shadow-2xl relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 animate-pulse-slow" style={{ backgroundColor: darkMode ? '#ffffff' : '#000000' }} />
            </div>
            <div className="relative">
              <h2 className={`text-4xl sm:text-5xl font-black mb-6 ${darkMode ? 'text-white' : 'text-white'}`}>
                Ready to Start Your Journey?
              </h2>
              <p className={`text-xl mb-8 ${darkMode ? 'text-gray-400' : 'text-blue-100'}`}>
                Join thousands of professionals who've transformed their careers with Route2Hire
              </p>
              <a
                href="https://route2hire.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-3 px-10 py-5 ${darkMode ? 'bg-blue-600' : 'bg-white text-blue-600'} font-black rounded-2xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 text-xl`}
              >
                Visit Main Site <ExternalLink className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Related Links Section */}
        <div className={`mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '900ms' }}>
          <RelatedLinks type="general" />
        </div>

        {/* Footer */}
        <footer className={`text-center py-8 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          <p className="text-lg font-semibold">© Route2Hire 2025 | Built with ❤️ for job seekers & tech enthusiasts</p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
        
        @keyframes wave {
          0%, 100% {
            transform: translateY(100%);
          }
          50% {
            transform: translateY(0%);
          }
        }
        
        @keyframes particle {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          50% {
            transform: translate(var(--tx, 20px), var(--ty, -20px)) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes color-shift {
          0%, 100% { color: #3B82F6; }
          25% { color: #8B5CF6; }
          50% { color: #EC4899; }
          75% { color: #10B981; }
        }
        
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        
        .animate-particle {
          animation: particle 2s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        .animate-color-shift {
          animation: color-shift 6s linear infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
      </div>
    </>
  );
}