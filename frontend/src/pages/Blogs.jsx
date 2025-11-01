import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaCalendar, FaClock, FaHeart, FaEye, FaTag, FaPlus, FaTrash, FaEdit, FaBars, FaTimes, FaBookOpen, FaImage, FaSave, FaTimes as FaClose } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { toast } from 'react-toastify';
import slugify from '../utils/slugify';
import RichTextEditor from '../components/RichTextEditor';

export default function Blogs() {
  const { currentUser } = useSelector((state) => state.user);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: [],
    published: false,
    featuredImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, image: '' });

  const navigate = useNavigate();
  const { category: categoryParam } = useParams();

  useEffect(() => {
  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);
      if (sortOrder) params.append('order', sortOrder);
      params.append('published', 'true');

      const res = await axios.get(`/backend/blogs/get?${params.toString()}`);
      setBlogs(res.data.blogs);
        
        // Set first blog as selected if none selected
        if (res.data.blogs.length > 0 && !selectedBlog) {
          setSelectedBlog(res.data.blogs[0]);
        }
        
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/backend/blogs/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('/backend/blogs/tags');
      setTags(res.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

    fetchBlogs();
    fetchCategories();
    fetchTags();
  }, [searchTerm, selectedCategory, sortBy, sortOrder, categoryParam]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLike = async (blogId) => {
    if (!currentUser) {
      toast.error('Please sign in to like blogs');
      return;
    }

    try {
      const res = await axios.post(`/backend/blogs/like/${blogId}`);
      setBlogs(blogs.map(blog => blog._id === blogId ? res.data : blog));
      if (selectedBlog && selectedBlog._id === blogId) {
        setSelectedBlog(res.data);
      }
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like blog');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('excerpt', formData.excerpt);
      payload.append('content', formData.content);
      payload.append('category', formData.category);
      payload.append('tags', JSON.stringify(formData.tags));
      payload.append('published', formData.published);
      
      if (formData.featuredImage) {
        payload.append('featuredImage', formData.featuredImage);
      }

      let res;
      if (isEditing) {
        res = await axios.post(`/backend/blogs/update/${editBlogId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setBlogs(blogs.map(blog => blog._id === editBlogId ? res.data : blog));
        toast.success('Blog updated successfully!');
      } else {
        res = await axios.post('/backend/blogs/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        setBlogs([...blogs, res.data]);
        toast.success('Blog created successfully!');
      }
      
      // Reset form
      setShowForm(false);
      setIsEditing(false);
      setEditBlogId(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: '',
        tags: [],
        published: false,
        featuredImage: null
      });
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} blog:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} blog`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tags: blog.tags || [],
      published: blog.published,
      featuredImage: null
    });
    setEditBlogId(blog._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/backend/blogs/delete/${id}`);
      setBlogs(blogs.filter(blog => blog._id !== id));
      if (selectedBlog && selectedBlog._id === id) {
        setSelectedBlog(null);
      }
      toast.success('Blog deleted successfully!');
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, featuredImage: file });
    }
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag]
        });
      }
      e.target.value = '';
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const openImageModal = (imageUrl) => {
    setImageModal({ open: true, image: imageUrl });
  };

  const closeImageModal = () => {
    setImageModal({ open: false, image: '' });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Error loading blogs</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blogs | Professional Insights and Articles - Route2Hire</title>
        <meta name="description" content="Read professional blogs covering technology, development, QA, SDET careers, and industry insights on Route2Hire." />
        <meta
          name="keywords"
          content="tech blogs, QA blogs, SDET articles, software development blogs, career insights, industry articles"
        />
        <meta property="og:title" content="Blogs | Route2Hire" />
        <meta
          property="og:description"
          content="Read professional blogs covering technology, development, and industry insights."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://route2hire.com/blogs${categoryParam ? `/category/${categoryParam}` : ''}`} />
        <meta property="og:image" content="https://route2hire.com/logo.png" />
        <link rel="canonical" href={`https://route2hire.com/blogs${categoryParam ? `/category/${categoryParam}` : ''}`} />
      </Helmet>

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
                Blog Posts
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">Browse and manage blog posts</p>
        </div>

              {/* Search */}
            <div className="relative mb-3 sm:mb-4">
                <input
                  type="text"
                  placeholder="Search blogs..."
                className="w-full pl-8 sm:pl-9 pr-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              <FaSearch className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3.5 text-gray-400 text-xs" />
              </div>

              {/* Category Filter */}
            <div className="mb-3 sm:mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

              {/* Sort */}
            <div className="mb-4 sm:mb-6">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-200 rounded-lg sm:rounded-xl bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="views-desc">Most Viewed</option>
                <option value="numberOfLikes-desc">Most Liked</option>
              </select>
            </div>

            {/* Blogs List */}
            <div className="space-y-1 sm:space-y-1.5">
              {blogs.map((blog, index) => (
                <button
                  key={blog._id}
                  onClick={() => {
                    setSelectedBlog(blog);
                    if (window.innerWidth < 1280) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 group hover:scale-[1.02] touch-manipulation ${
                    selectedBlog?._id === blog._id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-white/80 hover:shadow-md border border-gray-100'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate pr-2 mb-1">{blog.title}</h3>
                      <p className="text-xs opacity-75 line-clamp-2">{blog.excerpt}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs opacity-60">
                        <span>{blog.category}</span>
                        <span>•</span>
                        <span>{blog.readTime} min</span>
                        <span>•</span>
                        <span>{blog.views} views</span>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                      selectedBlog?._id === blog._id 
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
          {/* Breadcrumb Navigation */}
          <div className="mb-4 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
            <Breadcrumb 
              items={[
                { label: 'Blogs', path: '/blogs' },
                categoryParam && categoryParam !== 'all' ? { label: categoryParam, path: `/blogs/category/${categoryParam}` } : null,
              ].filter(Boolean)}
            />
          </div>
          
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
                    <FaBookOpen size={20} className="text-blue-600 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Blog Management</h2>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      Create, edit, and manage your blog posts with rich content and media support.
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
                      <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage blog posts and content</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(!showForm);
                        setIsEditing(false);
                        setEditBlogId(null);
                        setFormData({
                          title: '',
                          excerpt: '',
                          content: '',
                          category: '',
                          tags: [],
                          published: false,
                          featuredImage: null
                        });
                      }}
                      className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 hover:scale-105 text-sm sm:text-base whitespace-nowrap touch-manipulation"
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                      {showForm ? 'Cancel' : 'Create New Blog'}
                    </button>
                  </div>

                  {showForm && (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 bg-gray-50/50 rounded-lg sm:rounded-xl p-4 sm:p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                          <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Title *</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Category *</label>
                          <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Excerpt *</label>
                        <textarea
                          value={formData.excerpt}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                          className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                          rows="3"
                          maxLength="300"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.excerpt.length}/300 characters</p>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Content *</label>
                        <RichTextEditor
                          value={formData.content}
                          onChange={(content) => setFormData({ ...formData, content })}
                          placeholder="Write your blog content here with rich formatting options..."
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleTagRemove(tag)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <FaClose size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                        <input
                          type="text"
                          placeholder="Add a tag and press Enter"
                          onKeyDown={handleTagAdd}
                          className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 text-sm sm:text-base"
                        />
                    </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Featured Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-xs sm:text-sm text-gray-700 file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Publish immediately</span>
                        </label>
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
                            <FaSave className="text-xs sm:text-sm" />
                            {isEditing ? 'Update Blog' : 'Create Blog'}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Selected Blog Content */}
              {selectedBlog ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 xl:p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-2 sm:mb-3 break-words">{selectedBlog.title}</h1>
                        <p className="text-blue-100 text-xs sm:text-sm xl:text-base opacity-90 leading-relaxed">
                          {selectedBlog.excerpt}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs sm:text-sm text-blue-200">
                          <span className="flex items-center gap-1">
                            <FaClock />
                            {selectedBlog.readTime} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <FaEye />
                            {selectedBlog.views} views
                        </span>
                          <span className="flex items-center gap-1">
                            <FaCalendar />
                            {formatDate(selectedBlog.createdAt)}
                        </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {currentUser?.isUserAdmin && (
                          <>
                            <button
                              onClick={() => handleEdit(selectedBlog)}
                              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
                              aria-label="Edit blog"
                            >
                              <FaEdit size={14} className="sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(selectedBlog._id)}
                              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-red-500/80 transition-all duration-200 backdrop-blur-sm"
                              aria-label="Delete blog"
                            >
                              <FaTrash size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleLike(selectedBlog._id)}
                          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all duration-200 backdrop-blur-sm ${
                            selectedBlog.likes.includes(currentUser?._id)
                              ? 'bg-white/30 text-white'
                              : 'bg-white/20 hover:bg-white/30 text-white'
                          }`}
                        >
                          <FaHeart size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span className="font-medium text-xs sm:text-sm">{selectedBlog.numberOfLikes}</span>
                        </button>
                      </div>
                    </div>
                    </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 xl:p-8">
                    {/* Category and Tags */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                        {selectedBlog.category}
                      </span>
                      {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                        <>
                          {selectedBlog.tags.map((tag, index) => (
                          <span
                            key={index}
                              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            <FaTag className="mr-1 text-xs" />
                            {tag}
                          </span>
                        ))}
                        </>
                      )}
                    </div>

                    {/* Featured Image */}
                    {selectedBlog.featuredImage && (
                      <div className="mb-6">
                        <button
                          onClick={() => openImageModal(selectedBlog.featuredImage)}
                          className="w-full overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <img
                            src={selectedBlog.featuredImage}
                            alt={selectedBlog.title}
                            className="w-full h-64 sm:h-80 lg:h-96 object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        </button>
                      </div>
                    )}

                    {/* Blog Content */}
                    <div 
                      className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-800 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                    />

                    {/* Read More Link */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Link
                        to={`/blog/${selectedBlog.slug}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                      >
                        Read Full Article
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-8 sm:p-12 max-w-sm sm:max-w-md mx-auto">
                    <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Select a Blog Post</h3>
                    <p className="text-sm sm:text-base text-gray-500">Choose a blog post from the sidebar to view its content</p>
                  </div>
                </div>
              )}
              
              {/* Related Links Section */}
              <div className="mt-8 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
                <RelatedLinks type="general" />
              </div>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {imageModal.open && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
            onClick={closeImageModal}
          >
            <div className="relative max-w-4xl sm:max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <div className="relative flex items-center justify-center">
                <img
                  src={imageModal.image}
                  alt="Preview"
                  className="max-h-[70vh] sm:max-h-[80vh] w-full object-contain rounded-lg sm:rounded-xl border border-white/20"
                />
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 lg:top-3 lg:right-3 bg-white text-gray-700 rounded-full p-1.5 sm:p-2 shadow-lg hover:bg-gray-100"
                  aria-label="Close"
                >
                  <span className="text-base sm:text-lg">✕</span>
                </button>
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
    </>
  );
}
