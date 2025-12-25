import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaCheckCircle, FaCircle, FaLock, FaClock, FaBook, FaExternalLinkAlt, FaStar } from 'react-icons/fa';

export default function SkillSection({ skill, isExpanded, onToggle, userProgress, onToggleSubskill, isRecommended }) {
  const completedNodeIds = userProgress?.completedNodes.map(n => n.nodeId) || [];
  const isSkillCompleted = completedNodeIds.includes(skill.id);
  
  const prerequisitesMet = !skill.prerequisites ||
    skill.prerequisites.every(prereq => completedNodeIds.includes(prereq));
  const isLocked = !isSkillCompleted && !prerequisitesMet;
  
  const completedSubskills = skill.learningSteps?.filter(step => {
    const nodeProgress = userProgress?.completedNodes.find(n => n.nodeId === skill.id);
    return nodeProgress?.completedSubskills?.includes(step.order);
  }).length || 0;
  
  const totalSubskills = skill.learningSteps?.length || 0;
  const subskillProgress = totalSubskills > 0 ? (completedSubskills / totalSubskills) * 100 : 0;
  const totalDays = (skill.learningSteps?.reduce((sum, step) => sum + (step.estimatedHours || 0), 0) || 0) / 24;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isLocked ? 'opacity-60' : ''}`}
    >
      <div
        onClick={() => !isLocked && onToggle(skill.id)}
        className={`
          bg-white border-2 rounded-2xl p-6 cursor-pointer 
          transition-all duration-300
          ${isRecommended 
            ? 'border-emerald-300 shadow-lg shadow-emerald-100 hover:shadow-xl hover:shadow-emerald-200' 
            : isSkillCompleted 
            ? 'border-violet-200 bg-violet-50/30 hover:shadow-lg hover:shadow-violet-100' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100'
          }
          ${isLocked ? 'cursor-not-allowed border-slate-200' : 'hover:-translate-y-0.5'}
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                ${isLocked 
                  ? 'bg-slate-100' 
                  : isSkillCompleted 
                  ? 'bg-violet-500 shadow-md shadow-violet-200' 
                  : 'bg-indigo-100'
                }
              `}>
                {isLocked ? (
                  <FaLock className="text-slate-400 text-lg" />
                ) : isSkillCompleted ? (
                  <FaCheckCircle className="text-white text-xl" />
                ) : (
                  <FaCircle className="text-indigo-400 text-lg" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 flex-1">
                {skill.label}
              </h3>
              
              {isRecommended && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-full shadow-md shadow-emerald-200">
                  <FaStar className="text-xs" />
                  Recommended
                </span>
              )}
            </div>
            
            <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
              {skill.description}
            </p>
            
            {!isLocked && totalSubskills > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subskillProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        isSkillCompleted 
                          ? 'bg-violet-500' 
                          : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  isSkillCompleted ? 'text-violet-600' : 'text-indigo-600'
                }`}>
                  {completedSubskills}/{totalSubskills} completed
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
            {totalDays > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 text-sky-700 rounded-lg border border-sky-200">
                <FaClock className="text-sm" />
                <span className="text-sm font-semibold">{Math.round(totalDays * 10) / 10}d</span>
              </div>
            )}
            
            {!isLocked && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center"
              >
                <FaChevronDown className="text-slate-600" />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && !isLocked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 ml-6 border-l-4 border-indigo-200 pl-8 py-2">
              {skill.learningSteps && skill.learningSteps.length > 0 ? (
                <div className="space-y-4">
                  {skill.learningSteps.map((step, index) => {
                    const nodeProgress = userProgress?.completedNodes.find(n => n.nodeId === skill.id);
                    const isStepCompleted = nodeProgress?.completedSubskills?.includes(step.order);
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                          relative bg-white border-2 rounded-xl p-5 
                          transition-all duration-300
                          ${isStepCompleted 
                            ? 'border-emerald-200 bg-emerald-50/30' 
                            : 'border-slate-200 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100'
                          }
                        `}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => onToggleSubskill(skill.id, step.order)}
                            className={`
                              mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 
                              flex items-center justify-center transition-all duration-200
                              ${isStepCompleted 
                                ? 'bg-emerald-500 border-emerald-500 shadow-md shadow-emerald-200' 
                                : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'
                              }
                            `}
                          >
                            {isStepCompleted && (
                              <FaCheckCircle className="text-white text-sm" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className={`
                                font-bold text-base
                                ${isStepCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}
                              `}>
                                {step.title}
                              </h4>
                              
                              {step.estimatedHours > 0 && (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 flex-shrink-0">
                                  <FaClock className="text-xs" />
                                  <span className="text-xs font-bold">{Math.round((step.estimatedHours / 24) * 10) / 10}d</span>
                                </div>
                              )}
                            </div>
                            
                            {step.description && (
                              <p className={`text-sm leading-relaxed mb-4 whitespace-pre-wrap ${
                                isStepCompleted ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {step.description}
                              </p>
                            )}
                            
                            {step.resources && step.resources.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wide">
                                  <div className="w-6 h-6 bg-pink-100 rounded-lg flex items-center justify-center">
                                    <FaBook className="text-pink-600 text-xs" />
                                  </div>
                                  <span>Learning Resources</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {step.resources.map((resource, rIndex) => (
                                    <a
                                      key={rIndex}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="
                                        inline-flex items-center gap-2 px-4 py-2
                                        text-sm font-semibold text-indigo-700
                                        bg-indigo-50 border-2 border-indigo-200 rounded-lg
                                        hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100
                                        transition-all duration-200 hover:-translate-y-0.5
                                      "
                                    >
                                      <span>{resource.title}</span>
                                      <FaExternalLinkAlt className="text-xs" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <p className="text-slate-500 font-medium">No learning steps defined yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}