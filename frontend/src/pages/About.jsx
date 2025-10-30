import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, Shield, ArrowRight, Sparkles, Star, Briefcase, Users } from 'lucide-react';

export default function About() {

  const timelineItems = [
    {
      icon: Target,
      time: "Our Mission",
      title: "Who Are We?",
      color: "text-purple-600",
      nodeBg: "bg-purple-500",
      cardBorder: "border-purple-100",
      iconBg: "bg-purple-50",
      body: [
        "Discover top career opportunities with Route2Hire! Our dedicated team connects talented professionals with the perfect job opportunities to help them thrive in their careers.",
        "Discover job roles and internships that perfectly match your skills, ambitions, and values on Route2Hire, your ultimate platform for career opportunities.",
        "At Route2Hire, we empower individuals by connecting them with the right job opportunities, ensuring every career step is meaningful and fulfilling.",
        "Experience innovation and seamless job searching with Route2Hire—the ultimate platform for professionals and students to discover their next big career opportunity."
      ]
    },
    {
      icon: Zap,
      time: "Our Approach",
      title: "What Makes Us Different from Others?",
      color: "text-blue-600",
      nodeBg: "bg-blue-500",
      cardBorder: "border-blue-100",
      iconBg: "bg-blue-50",
      body: [
        "Discover a revolutionary job search experience with Route2Hire, where personalized career recommendations help you find opportunities tailored just for you.",
        "At Route2Hire, advanced algorithms match your unique skills, experiences, and aspirations with the best job and internship opportunities for your career growth.",
        "Enhance your career with Route2Hire, offering tailored resources to help you upskill, build your network, and stay ahead of industry trends.",
        "At Route2Hire, we prioritize community building, providing access to forums, mentorship, and expert career advice to support your professional growth.",
        "At Route2Hire, it's not just about finding a job—it's about discovering the right career path that aligns with your goals and aspirations."
      ]
    },
    {
      icon: Shield,
      time: "Our Promise",
      title: "Why Choose Us?",
      color: "text-emerald-600",
      nodeBg: "bg-emerald-500",
      cardBorder: "border-emerald-100",
      iconBg: "bg-emerald-50",
      body: [
        "Choosing Route2Hire means selecting a platform that truly understands your career goals. Enjoy a seamless, intuitive experience to explore and apply for job opportunities that align with your passion, skills, and aspirations.",
        "With Route2Hire, you're not just a job seeker; you're part of a supportive community dedicated to your continuous growth, success, and career advancement.",
        "Our commitment to providing curated job opportunities, personalized insights, and professional development resources makes Route2Hire the ultimate platform to advance your career. Join us today and take the first step toward a brighter, more fulfilling professional future!"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <style>{`
        @keyframes fadeUp { 
          from { opacity: 0; transform: translateY(24px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        @keyframes scaleIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease-out both; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out both; }
        .animate-scale-in { animation: scaleIn 0.5s ease-out both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gradient-border {
          position: relative;
          background: white;
          border-radius: 1.5rem;
        }
        
        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm border border-purple-200 shadow-lg shadow-purple-100/50 mb-6">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">About Route2Hire</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Your route to<br />
              <span className="gradient-text">meaningful careers</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
              Connecting talent with opportunity through curated roles, practical resources, and a supportive community dedicated to your success.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/jobs" className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-xl hover:shadow-purple-500/25 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                Explore Jobs
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/contactUs" className="px-8 py-4 bg-white border-2 border-purple-200 text-purple-700 rounded-xl font-medium hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 shadow-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 animate-fade-in" style={{animationDelay: '200ms'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Active Job Listings', value: '2000+', gradient: 'from-purple-500 to-purple-600' },
              { label: 'Companies Hiring', value: '500+', gradient: 'from-blue-500 to-blue-600' },
              { label: 'Trusted Community', value: '700+', gradient: 'from-emerald-500 to-emerald-600' }
            ].map((stat, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>{stat.value}</div>
                <div className="text-sm font-medium text-slate-600 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-up" style={{animationDelay: '100ms'}}>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Story & Promise</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              What we do, how we do it, and why it matters to your career journey.
            </p>
          </div>

          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index} 
                  className="group animate-scale-in" 
                  style={{animationDelay: `${200 + index * 150}ms`}}
                >
                  <div className={`relative bg-white/90 backdrop-blur-sm border-2 ${item.cardBorder} rounded-3xl p-8 lg:p-10 hover:shadow-2xl hover:shadow-${item.color.split('-')[1]}-200/30 transition-all duration-300 hover:-translate-y-1`}>
                    {/* Icon Circle */}
                    <div className="absolute -left-6 top-8">
                      <div className={`relative w-16 h-16 ${item.nodeBg} rounded-2xl flex items-center justify-center shadow-lg shadow-${item.color.split('-')[1]}-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="ml-16">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <span className={`inline-block px-4 py-1.5 ${item.iconBg} ${item.color} text-xs font-semibold rounded-full uppercase tracking-wider`}>
                          {item.time}
                        </span>
                      </div>

                      <h3 className="text-3xl font-bold text-slate-900 mb-6">
                        {item.title}
                      </h3>

                      {/* Content */}
                      <div className="space-y-4">
                        {item.body.map((point, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className={`mt-2 w-2 h-2 rounded-full ${item.nodeBg} flex-shrink-0`}></div>
                            <p className="text-slate-700 leading-relaxed text-lg">
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      

      {/* Footer spacing */}
      <div className="h-16"></div>
    </div>
  );
}