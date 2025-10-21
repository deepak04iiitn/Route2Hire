import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaThumbsUp, FaThumbsDown, FaSearch, FaSort, FaPlus, FaTrash, FaEdit, FaBars, FaTimes, FaHeart, FaBookmark, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import InterviewCommentSection from '../components/InterviewCommentSection';
import slugify from '../utils/slugify';
import StructuredAnswer from '../components/StructuredAnswer';
import { Puzzle } from 'lucide-react';


export default function InterviewQuestions() {
  const { currentUser } = useSelector((state) => state.user);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    questions: [{ 
      question: '', 
      answer: '', 
      images: [] 
    }]
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [imagesFilesByIndex, setImagesFilesByIndex] = useState({});
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openImageModal = (images, startIndex) => {
    setImageModal({ open: true, images, index: startIndex });
  };

  const closeImageModal = () => {
    setImageModal((prev) => ({ ...prev, open: false }));
  };

  const showPrevImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }));
  };

  const showNextImage = (e) => {
    e?.stopPropagation();
    setImageModal((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }));
  };

  const navigate = useNavigate();
  const { topicSlug } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (sortBy) params.append('sort', sortBy);
        if (sortOrder) params.append('order', sortOrder);
        
        const res = await axios.get(`/backend/interview-questions/get?${params.toString()}`);
        setQuestions(res.data);
        
        const uniqueTopics = [...new Set(res.data.map(q => q.topic))];
        setTopics(uniqueTopics);
        
        if (topicSlug) {
          const questionBySlug = res.data.find(q => slugify(q.topic) === topicSlug);
          if (questionBySlug) {
            setSelectedTopic(questionBySlug._id);
          } else if (res.data.length > 0) {
            setSelectedTopic(res.data[0]._id);
            navigate(`/interview-questions/${slugify(res.data[0].topic)}`, { replace: true });
          }
        } else if (res.data.length > 0) {
          setSelectedTopic(res.data[0]._id);
          navigate(`/interview-questions/${slugify(res.data[0].topic)}`, { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [searchTerm, sortBy, sortOrder, topicSlug]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!imageModal.open) return;
      if (e.key === 'Escape') closeImageModal();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [imageModal.open]);

  const handleLike = async (questionId) => {
    if (!currentUser) {
      toast.error('Please sign in to like questions');
      return;
    }

    try {
      const res = await axios.post(`/backend/interview-questions/like/${questionId}`);
      setQuestions(questions.map(q => q._id === questionId ? res.data : q));
    } catch (error) {
      console.error('Error liking question:', error);
      toast.error('Failed to like question');
    }
  };

  const handleDislike = async (questionId) => {
    if (!currentUser) {
      toast.error('Please sign in to dislike questions');
      return;
    }

    try {
      const res = await axios.post(`/backend/interview-questions/dislike/${questionId}`);
      setQuestions(questions.map(q => q._id === questionId ? res.data : q));
    } catch (error) {
      console.error('Error disliking question:', error);
      toast.error('Failed to dislike question');
    }
  };

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { 
        question: '', 
        answer: '', // Remove structuredAnswer
        images: [] 
      }]
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions
    });
    // Clean up the images for this index
    setImagesFilesByIndex((prev) => {
      const copy = { ...prev };
      delete copy[index];
      // Reindex remaining images
      const reindexed = {};
      Object.keys(copy).forEach(key => {
        const oldIndex = parseInt(key);
        if (oldIndex > index) {
          reindexed[oldIndex - 1] = copy[key];
        } else {
          reindexed[key] = copy[key];
        }
      });
      return reindexed;
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleImagesChange = (index, files) => {
    const fileArray = Array.from(files || []);
    setImagesFilesByIndex((prev) => ({ ...prev, [index]: fileArray }));
  };

  // Function to remove existing image from a question
  const handleRemoveExistingImage = (questionIndex, imageIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].images = newQuestions[questionIndex].images.filter((_, idx) => idx !== imageIndex);
    setFormData({
      ...formData,
      questions: newQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let res;
  
      // Remove structured answer processing - just keep it simple
      const processedQuestions = formData.questions.map(q => ({
        question: q.question,
        answer: q.answer, // Remove the fallback - just use the actual answer
        images: q.images || []
      }));
  
      if(isEditing) {
        const payload = new FormData();
        payload.append('topic', formData.topic);
        payload.append('description', formData.description);
        payload.append('questions', JSON.stringify(processedQuestions));
        Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
          files.forEach((file) => payload.append(`images_${idx}`, file));
        });
        res = await axios.post(`/backend/interview-questions/update/${editQuestionId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions(questions.map(q => q._id === editQuestionId ? res.data : q));
        toast.success('Question set updated successfully!');
      } else {
        const payload = new FormData();
        payload.append('topic', formData.topic);
        payload.append('description', formData.description);
        payload.append('questions', JSON.stringify(processedQuestions));
        Object.entries(imagesFilesByIndex).forEach(([idx, files]) => {
          files.forEach((file) => payload.append(`images_${idx}`, file));
        });
        res = await axios.post('/backend/interview-questions/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setQuestions([...questions, res.data]);
        toast.success('Question set created successfully!');
      }
      
      // Reset form - remove structuredAnswer from reset
      setShowForm(false);
      setIsEditing(false);
      setEditQuestionId(null);
      setFormData({
        topic: '',
        description: '',
        questions: [{ 
          question: '', 
          answer: '', // Remove structuredAnswer from here
          images: [] 
        }]
      });
      setImagesFilesByIndex({});
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} question set:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} question set`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    // Remove structuredAnswer processing
    setFormData({
      topic: question.topic,
      description: question.description,
      questions: question.questions.map(q => ({
        question: q.question,
        answer: q.answer, // Just keep the answer as is
        images: q.images || []
      })),
    });
    setEditQuestionId(question._id);
    setIsEditing(true);
    setShowForm(true);
    // Clear new image files when editing
    setImagesFilesByIndex({});
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/backend/interview-questions/delete/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question set deleted successfully!');
    } catch (error) {
      console.error('Error deleting question set:', error);
      toast.error('Failed to delete question set');
    }
  };

  const selectedQuestion = questions.find(q => q._id === selectedTopic);

  return (
    <div className="flex flex-col xl:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen overflow-x-hidden">
      {/* Sidebar Toggle Button for mobile and tablet */}
      <button
        className="xl:hidden fixed top-14 sm:top-16 md:top-20 right-2 sm:right-3 md:right-4 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-2.5 md:p-3 rounded-full shadow-2xl backdrop-blur-sm border border-white/20 hover:scale-110 transition-all duration-300 touch-manipulation"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <FaTimes size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" /> : <FaBars size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />}
      </button>

      {/* Backdrop for mobile and tablet */}
      {isSidebarOpen && window.innerWidth < 1280 && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 xl:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive width and positioning */}
      <div
        className={`
          w-full sm:w-80 lg:w-96 xl:w-80 2xl:w-96 bg-white/90 backdrop-blur-xl border-r border-white/20 shadow-2xl z-40 transition-all duration-500 fixed inset-y-0 overflow-y-auto
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} right-0
          xl:left-0 xl:right-auto xl:translate-x-0 xl:relative
        `}
      >
        <div className="pt-16 sm:pt-20 md:pt-24 xl:pt-28 p-2 sm:p-3 md:p-4">
          {/* Close button for mobile and tablet */}
          {isSidebarOpen && window.innerWidth < 1280 && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
              aria-label="Close sidebar"
            >
              <FaTimes size={18} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
              Interview Topics
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">Explore questions by category</p>
          </div>

          {/* Search */}
          <div className="relative mb-3 sm:mb-4">
            <input
              type="text"
              placeholder="Search topics..."
              className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-gray-400 text-xs" />
          </div>

          {/* Topics List */}
          <div className="space-y-1 sm:space-y-1.5">
            {topics.map((topic, index) => (
              <button
                key={topic}
                onClick={() => {
                  const question = questions.find(q => q.topic === topic);
                  if (question) {
                    setSelectedTopic(question._id);
                    navigate(`/interview-questions/${slugify(question.topic)}`);
                    if (window.innerWidth < 1280) {
                      setIsSidebarOpen(false);
                    }
                  }
                }}
                className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group hover:scale-[1.02] touch-manipulation ${
                  selectedQuestion?.topic === topic
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-white/80 hover:shadow-md border border-gray-100'
                }`}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs sm:text-sm truncate pr-2">{topic}</span>
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                    selectedQuestion?.topic === topic 
                      ? 'bg-white/80' 
                      : 'bg-blue-500/50 group-hover:bg-blue-500'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Responsive padding and spacing */}
      <div className="flex-1 overflow-y-auto pt-14 sm:pt-16 md:pt-20 xl:pt-24 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 mt-10 sm:mt-12 md:mt-16 xl:mt-0">
        {loading ? (
          <div className="flex justify-center items-center h-64 sm:h-80 lg:h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-sm sm:max-w-md mx-auto">
              <div className="text-red-500 text-4xl sm:text-5xl mb-3 sm:mb-4">⚠️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-red-700 mb-2">Something went wrong</h3>
              <p className="text-sm sm:text-base text-red-600">Please try again later or refresh the page.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-none">
            {/* Page Description */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <Puzzle size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Question Bank</h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    These are actual questions asked in real interviews to help you get ready with confidence.
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {currentUser?.isUserAdmin && (
              <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 xl:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage interview question sets</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(!showForm);
                      setIsEditing(false);
                      setEditQuestionId(null);
                      setFormData({
                        topic: '',
                        description: '',
                        questions: [{ 
                          question: '', 
                          answer: '', 
                          structuredAnswer: [{ subheading: '', bulletPoints: [''] }],
                          images: [] 
                        }]
                      });
                      setImagesFilesByIndex({});
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap touch-manipulation"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    {showForm ? 'Cancel' : 'Add New Set'}
                  </button>
                </div>

                {showForm && (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 bg-gray-50/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Topic</label>
                        <input
                          type="text"
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                          rows="3"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-3 sm:mb-4 text-sm sm:text-base">Questions and Answers</label>
                      <div className="space-y-4 sm:space-y-6">
                        {formData.questions.map((qa, index) => (
                          <div key={index} className="p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl bg-white">
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">Question {index + 1}</h3>
                              {index > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(index)}
                                  className="text-red-500 hover:text-red-700 p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                  aria-label="Remove question"
                                >
                                  <FaTrash size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={qa.question}
                              onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                              placeholder="Enter your question..."
                              className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg mb-2 sm:mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                              required
                            />
                            
                            <div>
                              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Answer</label>
                              <textarea
                                value={qa.answer}
                                onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                                placeholder="Paste your answer here with any formatting..."
                                className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                                rows="6"
                                required
                              />
                            </div>
                            
                            {/* Existing Images Display and Management */}
                            {qa.images && qa.images.length > 0 && (
                              <div className="mt-3 sm:mt-4">
                                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Current Images:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                  {qa.images.map((imgUrl, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img
                                        src={imgUrl}
                                        alt={`Current image ${imgIdx + 1}`}
                                        className="w-full h-16 sm:h-20 object-cover rounded-lg border border-gray-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(index, imgIdx)}
                                        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove image"
                                        aria-label="Remove image"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* New Images Upload */}
                            <div className="mt-2 sm:mt-3">
                              <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                                {isEditing ? 'Add new images (optional)' : 'Attach images (optional)'}
                              </label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImagesChange(index, e.target.files)}
                                className="block w-full text-xs sm:text-sm text-gray-700 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                              {imagesFilesByIndex[index]?.length ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  {imagesFilesByIndex[index].length} new image(s) selected
                                </p>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 mt-3 sm:mt-4 text-sm sm:text-base"
                      >
                        <FaPlus size={14} className="sm:w-4 sm:h-4" />
                        Add Another Question
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center touch-manipulation"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {isEditing ? 'Update Question Set' : 'Create Question Set'}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Selected Question Content */}
            {selectedQuestion ? (
              <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 break-words">{selectedQuestion.topic}</h1>
                      <p className="text-blue-100 text-xs sm:text-sm xl:text-base opacity-90 leading-relaxed">
                        {selectedQuestion.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      {currentUser?.isUserAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(selectedQuestion)}
                            className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                            aria-label="Edit question"
                          >
                            <FaEdit size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(selectedQuestion._id)}
                            className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-red-500/80 transition-all duration-200 backdrop-blur-sm"
                            aria-label="Delete question"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleLike(selectedQuestion._id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedQuestion.likes.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <FaThumbsUp size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="font-medium text-xs sm:text-sm">{selectedQuestion.numberOfLikes}</span>
                      </button>
                      <button
                        onClick={() => handleDislike(selectedQuestion._id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${
                          selectedQuestion.dislikes.includes(currentUser?._id)
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <FaThumbsDown size={12} className="sm:w-3.5 sm:h-3.5" />
                        <span className="font-medium text-xs sm:text-sm">{selectedQuestion.numberOfDislikes}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Questions List - Responsive Single Column */}
                <div className="p-4 sm:p-6 xl:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    {selectedQuestion.questions.map((qa, index) => (
                      <div 
                        key={index} 
                        className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 leading-relaxed break-words">
                              {qa.question}
                            </h3>
                            <div className="bg-blue-50/50 border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 sm:py-3 rounded-r-lg">
                              <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {qa.answer}
                              </div>
                            </div>
                            {Array.isArray(qa.images) && qa.images.length > 0 && (
                              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {qa.images.map((imgUrl, imgIdx) => (
                                  <button
                                    type="button"
                                    key={imgIdx}
                                    onClick={() => openImageModal(qa.images, imgIdx)}
                                    className="relative overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label={`Open image ${imgIdx + 1}`}
                                  >
                                    <img
                                      src={imgUrl}
                                      alt={`Answer image ${imgIdx + 1}`}
                                      className="w-full h-32 sm:h-40 lg:h-48 object-cover transition-transform duration-300 hover:scale-105"
                                      loading="lazy"
                                    />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 bg-gray-50/30 p-4 sm:p-6 xl:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                    💬 Discussion
                    <span className="text-xs sm:text-sm font-normal text-gray-500">Share your thoughts</span>
                  </h2>
                  <InterviewCommentSection expId={selectedQuestion._id} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-8 sm:p-12 max-w-sm sm:max-w-md mx-auto">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Select a Topic</h3>
                  <p className="text-sm sm:text-base text-gray-500">Choose a topic from the sidebar to view interview questions</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {imageModal.open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl sm:max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative flex items-center justify-center">
              <button
                type="button"
                onClick={showPrevImage}
                className="absolute left-1 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg"
                aria-label="Previous image"
              >
                <span className="text-lg sm:text-xl">‹</span>
              </button>
              <img
                src={imageModal.images[imageModal.index]}
                alt={`Preview ${imageModal.index + 1}`}
                className="max-h-[70vh] sm:max-h-[80vh] w-full object-contain rounded-lg sm:rounded-xl border border-white/20"
              />
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-1 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-1.5 sm:p-2 shadow-lg"
                aria-label="Next image"
              >
                <span className="text-lg sm:text-xl">›</span>
              </button>
              <button
                type="button"
                onClick={closeImageModal}
                className="absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-3 lg:right-3 bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <span className="text-base sm:text-lg">✕</span>
              </button>
            </div>

            <div className="mt-2 sm:mt-4 text-center text-white text-xs sm:text-sm opacity-80">
              {imageModal.index + 1} / {imageModal.images.length}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}