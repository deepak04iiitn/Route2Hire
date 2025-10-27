import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { ChevronDown, ChevronRight, Check, Star, Pencil, Search, Filter, X, Grid3X3, BarChart3, CheckCircle, Code, Target, Bookmark } from 'lucide-react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';

const DSAProblemTracker = () => {
  const [problems, setProblems] = useState({});
  const [stats, setStats] = useState({ total: 0, completed: 0, favorites: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedDifficulties, setExpandedDifficulties] = useState({});
  const [notesModal, setNotesModal] = useState({ isOpen: false, problem: null, notes: '' });
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedProblems, setSelectedProblems] = useState(new Set());
  const [showStats, setShowStats] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/backend/dsa-problems');
      if (response.data.success) {
        setProblems(response.data.data.problems);
        setStats(response.data.data.stats);
        
        const categories = getSortedCategories(response.data.data.problems);
        if (categories.length > 0) {
          const firstCategory = categories[0];
          setExpandedCategories({ [firstCategory]: true });
          
          const newExpandedDifficulties = {};
          ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
            newExpandedDifficulties[`${firstCategory}-${difficulty}`] = true;
          });
          setExpandedDifficulties(newExpandedDifficulties);
        }
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const updateProblemStatus = async (problemName, updates) => {
    try {
      const response = await axios.put('/backend/dsa-problems/status', {
        problemName,
        ...updates
      });

      if (response.data.success) {
        setProblems(prevProblems => {
          const newProblems = { ...prevProblems };
          let totalCompleted = 0;
          let totalFavorites = 0;

          Object.keys(newProblems).forEach(category => {
            ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
              newProblems[category][difficulty] = newProblems[category][difficulty].map(problem => {
                if (problem.problemName === problemName) {
                  const updatedProblem = {
                    ...problem,
                    ...updates,
                    completedAt: updates.isCompleted ? new Date() : (updates.isCompleted === false ? null : problem.completedAt)
                  };
                  if (updatedProblem.isCompleted) totalCompleted++;
                  if (updatedProblem.isFavorite) totalFavorites++;
                  return updatedProblem;
                } else {
                  if (problem.isCompleted) totalCompleted++;
                  if (problem.isFavorite) totalFavorites++;
                  return problem;
                }
              });
            });
          });

          setStats(prevStats => {
            const newCompletionPercentage = Math.round((totalCompleted / prevStats.total) * 100);
            return {
              ...prevStats,
              completed: totalCompleted,
              favorites: totalFavorites,
              completionPercentage: newCompletionPercentage
            };
          });

          return newProblems;
        });

        toast.success('Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating problem status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateProblemNotes = async (problemName, notes) => {
    try {
      const response = await axios.put('/backend/dsa-problems/notes', {
        problemName,
        notes
      });

      if (response.data.success) {
        setProblems(prevProblems => {
          const newProblems = { ...prevProblems };
          Object.keys(newProblems).forEach(category => {
            ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
              newProblems[category][difficulty] = newProblems[category][difficulty].map(problem => {
                if (problem.problemName === problemName) {
                  return { ...problem, notes };
                }
                return problem;
              });
            });
          });
          return newProblems;
        });

        toast.success('Notes updated successfully');
        setNotesModal({ isOpen: false, problem: null, notes: '' });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleDifficulty = (category, difficulty) => {
    const key = `${category}-${difficulty}`;
    setExpandedDifficulties(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openNotesModal = (problem) => {
    setNotesModal({
      isOpen: true,
      problem,
      notes: problem.notes || ''
    });
  };

  const closeNotesModal = () => {
    setNotesModal({
      isOpen: false,
      problem: null,
      notes: ''
    });
  };

  const handleNotesSubmit = () => {
    if (notesModal.problem) {
      updateProblemNotes(notesModal.problem.problemName, notesModal.notes);
    }
  };

  const deleteNotes = async (problemName) => {
    try {
      const response = await axios.put('/backend/dsa-problems/notes', {
        problemName,
        notes: ''
      });

      if (response.data.success) {
        setProblems(prevProblems => {
          const newProblems = { ...prevProblems };
          Object.keys(newProblems).forEach(category => {
            ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
              newProblems[category][difficulty] = newProblems[category][difficulty].map(problem => {
                if (problem.problemName === problemName) {
                  return { ...problem, notes: '' };
                }
                return problem;
              });
            });
          });
          return newProblems;
        });

        toast.success('Notes deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast.error('Failed to delete notes');
    }
  };

  const toggleBulkSelect = () => {
    setBulkSelectMode(!bulkSelectMode);
    setSelectedProblems(new Set());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilter('all');
    
    const categories = getSortedCategories(problems);
    
    if (categories.length > 0) {
      const newExpandedCategories = {};
      const newExpandedDifficulties = {};
      
      categories.forEach(category => {
        newExpandedCategories[category] = true;
        
        ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
          newExpandedDifficulties[`${category}-${difficulty}`] = true;
        });
      });
      
      setExpandedCategories(newExpandedCategories);
      setExpandedDifficulties(newExpandedDifficulties);
    }
    
    toast.success('Filters cleared');
  };

  const toggleProblemSelection = (problemName) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemName)) {
      newSelected.delete(problemName);
    } else {
      newSelected.add(problemName);
    }
    setSelectedProblems(newSelected);
  };

  const bulkMarkCompleted = async () => {
    if (selectedProblems.size === 0) return;

    try {
      const response = await axios.put('/backend/dsa-problems/bulk-update', {
        problemNames: Array.from(selectedProblems),
        updates: { isCompleted: true }
      });

      if (response.data.success) {
        setProblems(prevProblems => {
          const newProblems = { ...prevProblems };
          let totalCompleted = 0;
          let totalFavorites = 0;

          Object.keys(newProblems).forEach(category => {
            ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
              newProblems[category][difficulty] = newProblems[category][difficulty].map(problem => {
                if (selectedProblems.has(problem.problemName)) {
                  const updatedProblem = {
                    ...problem,
                    isCompleted: true,
                    completedAt: new Date()
                  };
                  if (updatedProblem.isCompleted) totalCompleted++;
                  if (updatedProblem.isFavorite) totalFavorites++;
                  return updatedProblem;
                } else {
                  if (problem.isCompleted) totalCompleted++;
                  if (problem.isFavorite) totalFavorites++;
                  return problem;
                }
              });
            });
          });

          setStats(prevStats => {
            const newCompletionPercentage = Math.round((totalCompleted / prevStats.total) * 100);
            return {
              ...prevStats,
              completed: totalCompleted,
              favorites: totalFavorites,
              completionPercentage: newCompletionPercentage
            };
          });

          return newProblems;
        });

        toast.success(`Marked ${selectedProblems.size} problems as completed`);
        setSelectedProblems(new Set());
        setBulkSelectMode(false);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to update problems');
    }
  };

  const bulkMarkFavorite = async () => {
    if (selectedProblems.size === 0) return;

    try {
      const response = await axios.put('/backend/dsa-problems/bulk-update', {
        problemNames: Array.from(selectedProblems),
        updates: { isFavorite: true }
      });

      if (response.data.success) {
        setProblems(prevProblems => {
          const newProblems = { ...prevProblems };
          let totalCompleted = 0;
          let totalFavorites = 0;

          Object.keys(newProblems).forEach(category => {
            ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
              newProblems[category][difficulty] = newProblems[category][difficulty].map(problem => {
                if (selectedProblems.has(problem.problemName)) {
                  const updatedProblem = {
                    ...problem,
                    isFavorite: true
                  };
                  if (updatedProblem.isCompleted) totalCompleted++;
                  if (updatedProblem.isFavorite) totalFavorites++;
                  return updatedProblem;
                } else {
                  if (problem.isCompleted) totalCompleted++;
                  if (problem.isFavorite) totalFavorites++;
                  return problem;
                }
              });
            });
          });

          setStats(prevStats => {
            const newCompletionPercentage = Math.round((totalCompleted / prevStats.total) * 100);
            return {
              ...prevStats,
              completed: totalCompleted,
              favorites: totalFavorites,
              completionPercentage: newCompletionPercentage
            };
          });

          return newProblems;
        });

        toast.success(`Marked ${selectedProblems.size} problems as favorites`);
        setSelectedProblems(new Set());
        setBulkSelectMode(false);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast.error('Failed to update problems');
    }
  };

  const getFilteredProblems = () => {
    let filteredProblems = JSON.parse(JSON.stringify(problems));

    if (searchTerm) {
      Object.keys(filteredProblems).forEach(category => {
        ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
          filteredProblems[category][difficulty] = filteredProblems[category][difficulty].filter(problem =>
            problem.problemName.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      });
    }

    if (filter !== 'all') {
      Object.keys(filteredProblems).forEach(category => {
        ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
          filteredProblems[category][difficulty] = filteredProblems[category][difficulty].filter(problem => {
            switch (filter) {
              case 'completed':
                return problem.isCompleted;
              case 'favorites':
                return problem.isFavorite;
              case 'incomplete':
                return !problem.isCompleted;
              default:
                return true;
            }
          });
        });
      });
    }

    Object.keys(filteredProblems).forEach(category => {
      const hasProblems = ['Easy', 'Medium', 'Hard'].some(difficulty =>
        filteredProblems[category][difficulty].length > 0
      );
      if (!hasProblems) {
        delete filteredProblems[category];
      }
    });

    return filteredProblems;
  };

  const filteredProblems = getFilteredProblems();

  const getProblemsWithNotes = () => {
    const problemsWithNotes = [];
    Object.keys(problems).forEach(category => {
      ['Easy', 'Medium', 'Hard'].forEach(difficulty => {
        problems[category][difficulty].forEach(problem => {
          if (problem.notes && problem.notes.trim()) {
            problemsWithNotes.push({
              ...problem,
              category,
              difficulty
            });
          }
        });
      });
    });
    return problemsWithNotes;
  };

  const problemsWithNotes = getProblemsWithNotes();

  const categoryOrder = [
    'Array',
    'String',
    'Math',
    'Hash Table',
    'Two Pointers',
    'Sorting',
    'Stack',
    'Queue',
    'Matrix',
    'Sliding Window',
    'Linked List',
    'Binary Search',
    'Bit Manipulation',
    'Greedy',
    'Recursion',
    'Divide and Conquer',
    'Heap',
    'Backtracking',
    'Tree',
    'Graph',
    'Dynamic Programming',
    'Design',
    'Trie'
  ];

  const getSortedCategories = (problemsObj) => {
    const categories = Object.keys(problemsObj);
    return categories.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return a.localeCompare(b);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Loading DSA problems...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>QA/SDET DSA Sheet | Real Coding Problems & Interview Questions</title>
        <meta
          name="description"
          content="Master QA and SDET DSA problems with real interview questions. Practice Data Structures & Algorithms for QA automation, SDET, and software testing roles. Explore categorized DSA questions with difficulty levels, patterns, and solutions for QA engineers, SDETs, and automation testers."
        />
        <meta
          name="keywords"
          content="qa dsa sheet, QA DSA Sheet, QA/SDET DSA Sheet, qa/sdet dsa sheet, sdet dsa sheet, SDET DSA Sheet, qa automation dsa sheet, QA Automation DSA Sheet, sdet coding sheet, SDET Coding Sheet, qa coding sheet, QA Coding Sheet, qa interview dsa sheet, QA Interview DSA Sheet, sdet interview dsa sheet, SDET Interview DSA Sheet, 
          qa dsa problems, QA DSA Problems, sdet dsa problems, SDET DSA Problems, qa dsa questions, QA DSA Questions, sdet dsa questions, SDET DSA Questions, qa coding problems, QA Coding Problems, sdet coding problems, SDET Coding Problems, qa dsa practice, QA DSA Practice, sdet dsa practice, SDET DSA Practice, qa dsa challenges, QA DSA Challenges, sdet dsa challenges, SDET DSA Challenges, qa dsa examples, QA DSA Examples, sdet dsa examples, SDET DSA Examples, qa dsa exercises, QA DSA Exercises, sdet dsa exercises, SDET DSA Exercises,
          qa interview questions, QA Interview Questions, sdet interview questions, SDET Interview Questions, qa coding interview questions, QA Coding Interview Questions, sdet coding interview questions, SDET Coding Interview Questions, qa automation interview questions, QA Automation Interview Questions, sdet interview preparation, SDET Interview Preparation, qa interview preparation, QA Interview Preparation, qa interview roadmap, QA Interview Roadmap, sdet interview roadmap, SDET Interview Roadmap,
          data structures and algorithms for qa, Data Structures and Algorithms for QA, data structures and algorithms for sdet, Data Structures and Algorithms for SDET, qa dsa topics, QA DSA Topics, sdet dsa topics, SDET DSA Topics, dsa for qa engineers, DSA for QA Engineers, dsa for sdet, DSA for SDET, dsa for test engineers, DSA for Test Engineers, dsa for automation engineers, DSA for Automation Engineers, dsa for software testers, DSA for Software Testers,
          best dsa sheet for qa, best dsa sheet for sdet, qa dsa sheet with solutions, sdet dsa sheet with answers, qa dsa sheet with explanations, qa coding questions for interview, sdet dsa interview questions, dsa for qa automation engineer, dsa for manual tester, dsa for automation tester, dsa for qa fresher, dsa for sdet interview, qa automation dsa questions, sdet data structure questions, qa coding challenges, sdet coding challenges, qa dsa roadmap, sdet dsa roadmap,
          striver sde sheet for qa, Striver SDE Sheet for QA, striver sde sheet for sdet, Striver SDE Sheet for SDET, love babbar dsa sheet for qa, Love Babbar DSA Sheet for QA, sde sheet for test engineers, SDE Sheet for Test Engineers, dsa sheet for qa testers, DSA Sheet for QA Testers, dsa sheet for sdet preparation, DSA Sheet for SDET Preparation,
          qa coding practice, QA Coding Practice, sdet coding practice, SDET Coding Practice, qa algorithms practice, QA Algorithms Practice, sdet algorithms practice, SDET Algorithms Practice, qa automation coding problems, QA Automation Coding Problems, sdet coding interview prep, SDET Coding Interview Prep, qa test engineer coding questions, QA Test Engineer Coding Questions, qa engineer coding interview, QA Engineer Coding Interview, qa coding patterns, QA Coding Patterns, sdet coding patterns, SDET Coding Patterns,
          QA DSA SHEET, SDET DSA SHEET, QA AUTOMATION DSA SHEET, QA CODING QUESTIONS, SDET INTERVIEW QUESTIONS, QA DSA PROBLEMS, SDET CODING PROBLEMS, DSA FOR QA ENGINEERS, DSA FOR SDET, QA INTERVIEW ROADMAP, SDET INTERVIEW ROADMAP, QA DSA PRACTICE, SDET DSA PRACTICE,
          what is the best dsa sheet for qa engineers, real dsa problems for sdet interview, qa automation engineer dsa practice, how to prepare dsa for qa interview, qa dsa coding questions with solutions, top dsa problems for sdet interview, qa and sdet coding interview guide, dsa for test automation and qa engineers, qa and sdet interview preparation roadmap, qa dsa sheet for beginners"
        />
        <meta property="og:title" content="QA/SDET DSA Sheet | Real Interview Questions & Coding Problems" />
        <meta
          property="og:description"
          content="Practice QA and SDET DSA questions designed for automation and testing engineers. Learn and solve real-world Data Structures & Algorithms problems tailored for QA, SDET, and QA automation interviews."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourwebsite.com/qa-sdet-dsa-sheet" />
        <meta property="og:image" content="https://yourwebsite.com/og-image.png" />
        <meta name="robots" content="index, follow" />
      </Helmet>



      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mt-20">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12"
          >
            <div className="text-center mb-8">
              {/* Main Icon and Title */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mb-6"
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group flex-shrink-0"
                >
                  <div className="p-2.5 sm:p-3 md:p-3.5 bg-indigo-600 rounded-2xl sm:rounded-3xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Code className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
                  </div>
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-indigo-400 rounded-2xl sm:rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight"
                >
                  QA/SDET DSA Problems
                </motion.h1>
              </motion.div>

              {/* Subtitle with enhanced styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="max-w-4xl mx-auto"
              >
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-600 leading-relaxed mb-4 font-medium">
                  Master Data Structures & Algorithms with real interview questions
                </p>
                <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed">
                  These questions have been taken from a large pool of real interview experiences. Practice and Ace your next interview.
                </p>
              </motion.div>

              {/* Interactive Feature Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-3 mt-8"
              >
                {[
                  { icon: CheckCircle, text: "Real Interview Questions", color: "emerald" },
                  { icon: Bookmark, text: "Add Personal Notes", color: "indigo" },
                  { icon: Target, text: "Track Progress", color: "blue" },
                  { icon: Star, text: "Mark Favorites", color: "amber" }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`flex items-center gap-2 px-4 py-2 bg-${feature.color}-50 border border-${feature.color}-200 rounded-full text-${feature.color}-700 font-semibold text-sm shadow-sm hover:shadow-md transition-all duration-300`}
                  >
                    <feature.icon className="h-4 w-4" />
                    <span>{feature.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Problems</p>
                  <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="h-14 w-14 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Grid3X3 className="h-7 w-7 text-slate-700" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide mb-2">Completed</p>
                  <p className="text-4xl font-bold text-emerald-600">{stats.completed}</p>
                </div>
                <div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-2">Favorites</p>
                  <p className="text-4xl font-bold text-amber-600">{stats.favorites}</p>
                </div>
                <div className="h-14 w-14 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="h-7 w-7 text-amber-600 fill-amber-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">Progress</p>
                  <p className="text-4xl font-bold text-indigo-600">{stats.completionPercentage}%</p>
                </div>
                <div className="h-14 w-14">
                  <CircularProgressbar
                    value={stats.completionPercentage}
                    styles={buildStyles({
                      pathColor: '#4f46e5',
                      trailColor: '#e0e7ff',
                      textColor: '#4f46e5',
                    })}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search problems by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none z-10" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-12 pr-10 py-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none bg-slate-50 cursor-pointer min-w-[180px] text-slate-900 font-medium"
                >
                  <option value="all">All Problems</option>
                  <option value="completed">Completed</option>
                  <option value="incomplete">Incomplete</option>
                  <option value="favorites">Favorites</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(searchTerm || filter !== 'all') && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={clearAllFilters}
                  className="px-5 py-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl hover:bg-rose-100 transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  <X className="h-5 w-5" />
                  Clear Filters
                </motion.button>
              )}

              {/* Notes Section Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowNotesSection(!showNotesSection)}
                className={`px-5 py-3.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                  showNotesSection
                    ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="h-5 w-5" />
                {showNotesSection ? 'Hide Notes' : 'View Notes'}
                {problemsWithNotes.length > 0 && (
                  <span className={`ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    showNotesSection ? 'bg-white bg-opacity-20 text-white' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {problemsWithNotes.length}
                  </span>
                )}
              </motion.button>

              {/* Bulk Select Toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={toggleBulkSelect}
                className={`px-5 py-3.5 rounded-xl font-semibold transition-all whitespace-nowrap border ${
                  bulkSelectMode
                    ? 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {bulkSelectMode ? 'Exit Bulk Select' : 'Bulk Select'}
              </motion.button>
            </div>

            {/* Bulk Actions */}
            {bulkSelectMode && selectedProblems.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-5 pt-5 border-t border-slate-200 flex gap-3"
              >
                <button
                  onClick={bulkMarkCompleted}
                  className="flex-1 px-5 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all font-semibold"
                >
                  Mark {selectedProblems.size} as Completed
                </button>
                <button
                  onClick={bulkMarkFavorite}
                  className="flex-1 px-5 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl hover:bg-amber-100 transition-all font-semibold"
                >
                  Mark {selectedProblems.size} as Favorite
                </button>
              </motion.div>
            )}
          </div>

          {/* Notes Section */}
          <AnimatePresence>
            {showNotesSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-indigo-200 p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Bookmark className="h-6 w-6 text-indigo-600" />
                    </div>
                    My Notes
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                      {problemsWithNotes.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowNotesSection(false)}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5 text-slate-600" />
                  </button>
                </div>

                {problemsWithNotes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-block p-4 bg-slate-100 rounded-2xl mb-4">
                      <Bookmark className="h-16 w-16 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No notes yet</h3>
                    <p className="text-slate-600">
                      Add notes to problems by clicking the pencil icon next to any problem.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {problemsWithNotes.map((problem) => (
                      <motion.div
                        key={problem.problemName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                              <a
                                href={problem.problemLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-lg"
                              >
                                {problem.problemName}
                              </a>
                              <span className="px-3 py-1 bg-white border border-slate-200 text-xs font-bold rounded-full text-slate-700">
                                {problem.category} • {problem.difficulty}
                              </span>
                              {problem.isCompleted && (
                                <span className="px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Completed
                                </span>
                              )}
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-indigo-200">
                              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{problem.notes}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openNotesModal(problem)}
                              className="p-2.5 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors border border-indigo-200"
                              title="Edit notes"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteNotes(problem.problemName)}
                              className="p-2.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors border border-rose-200"
                              title="Delete notes"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Problems List */}
          <div className="space-y-5">
            {Object.keys(filteredProblems).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                <div className="inline-block p-4 bg-slate-100 rounded-2xl mb-4">
                  <Search className="h-16 w-16 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No problems found</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  No problems match your current filters. Try adjusting your search or filter criteria.
                </p>
                {(searchTerm || filter !== 'all') && (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold inline-flex items-center gap-2"
                  >
                    <X className="h-5 w-5" />
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              getSortedCategories(filteredProblems).map((category) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors border-b border-slate-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {expandedCategories[category] ? (
                        <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 flex-shrink-0" />
                      )}
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 truncate">{category}</h2>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">
                        {['Easy', 'Medium', 'Hard'].reduce(
                          (sum, diff) => sum + (filteredProblems[category][diff]?.length || 0),
                          0
                        )}{' '}
                        problems
                      </span>
                    </div>
                  </button>

                  {/* Category Content */}
                  <AnimatePresence>
                    {expandedCategories[category] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 space-y-4">
                          {['Easy', 'Medium', 'Hard'].map((difficulty) => {
                            const problemsList = filteredProblems[category][difficulty] || [];
                            if (problemsList.length === 0) return null;

                            const difficultyKey = `${category}-${difficulty}`;
                            const difficultyStyles = {
                              Easy: {
                                bg: 'bg-emerald-50',
                                border: 'border-emerald-300',
                                text: 'text-emerald-700',
                                hover: 'hover:bg-emerald-100',
                              },
                              Medium: {
                                bg: 'bg-amber-50',
                                border: 'border-amber-300',
                                text: 'text-amber-700',
                                hover: 'hover:bg-amber-100',
                              },
                              Hard: {
                                bg: 'bg-rose-50',
                                border: 'border-rose-300',
                                text: 'text-rose-700',
                                hover: 'hover:bg-rose-100',
                              },
                            };

                            const style = difficultyStyles[difficulty];

                            return (
                              <div key={difficulty} className="space-y-3">
                                {/* Difficulty Header */}
                                <button
                                  onClick={() => toggleDifficulty(category, difficulty)}
                                  className={`w-full px-5 py-3.5 rounded-xl border-2 flex items-center justify-between transition-all ${style.bg} ${style.border} ${style.text} ${style.hover}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    {expandedDifficulties[difficultyKey] ? (
                                      <ChevronDown className="h-5 w-5" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5" />
                                    )}
                                    <span className="font-bold text-base">{difficulty}</span>
                                    <span className="text-sm font-semibold">({problemsList.length} problems)</span>
                                  </div>
                                </button>

                                {/* Problems List */}
                                <AnimatePresence>
                                  {expandedDifficulties[difficultyKey] && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden space-y-2.5 pl-3"
                                    >
                                      {problemsList.map((problem) => (
                                        <motion.div
                                          key={problem.problemName}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          className={`p-4 rounded-xl border-2 transition-all ${
                                            problem.isCompleted
                                              ? 'bg-emerald-50 border-emerald-300'
                                              : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                                          } ${bulkSelectMode && selectedProblems.has(problem.problemName) ? 'ring-2 ring-violet-500 ring-offset-2' : ''}`}
                                        >
                                          <div className="flex items-center gap-4">
                                            {/* Bulk Select Checkbox */}
                                            {bulkSelectMode && (
                                              <input
                                                type="checkbox"
                                                checked={selectedProblems.has(problem.problemName)}
                                                onChange={() => toggleProblemSelection(problem.problemName)}
                                                className="h-5 w-5 text-violet-600 border-slate-300 rounded focus:ring-2 focus:ring-violet-500 cursor-pointer"
                                              />
                                            )}

                                            {/* Problem Info */}
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                                                <a
                                                  href={problem.problemLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                                                >
                                                  {problem.problemName}
                                                </a>
                                                {problem.isCompleted && (
                                                  <span className="px-2.5 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Completed
                                                  </span>
                                                )}
                                              </div>
                                              {problem.notes && (
                                                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{problem.notes}</p>
                                              )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() =>
                                                  updateProblemStatus(problem.problemName, {
                                                    isCompleted: !problem.isCompleted,
                                                  })
                                                }
                                                className={`p-2.5 rounded-lg transition-all border ${
                                                  problem.isCompleted
                                                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 border-emerald-300'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                                                }`}
                                                title={problem.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                                              >
                                                <Check className="h-5 w-5" />
                                              </button>

                                              <button
                                                onClick={() =>
                                                  updateProblemStatus(problem.problemName, {
                                                    isFavorite: !problem.isFavorite,
                                                  })
                                                }
                                                className={`p-2.5 rounded-lg transition-all border ${
                                                  problem.isFavorite
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 border-amber-300'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                                                }`}
                                                title={problem.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                                              >
                                                <Star
                                                  className={`h-5 w-5 ${problem.isFavorite ? 'fill-current' : ''}`}
                                                />
                                              </button>

                                              <button
                                                onClick={() => openNotesModal(problem)}
                                                className={`p-2.5 rounded-lg transition-all border ${
                                                  problem.notes && problem.notes.trim()
                                                    ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-indigo-300 ring-2 ring-indigo-200'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                                                }`}
                                                title={problem.notes && problem.notes.trim() ? 'Edit notes' : 'Add notes'}
                                              >
                                                <Pencil className="h-5 w-5" />
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      <AnimatePresence>
        {notesModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={closeNotesModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900">
                  Notes for {notesModal.problem?.problemName}
                </h3>
                <button
                  onClick={closeNotesModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="h-6 w-6 text-slate-600" />
                </button>
              </div>

              <textarea
                value={notesModal.notes}
                onChange={(e) => setNotesModal({ ...notesModal, notes: e.target.value })}
                placeholder="Add your notes, approach, or learnings here..."
                rows={10}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none text-slate-900 placeholder-slate-400"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleNotesSubmit}
                  className="flex-1 px-6 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Save Notes
                </button>
                <button
                  onClick={closeNotesModal}
                  className="px-6 py-3.5 bg-slate-100 text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-200 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DSAProblemTracker;
