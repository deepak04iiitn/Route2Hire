import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendar, FaClock, FaEye, FaTag, FaUser, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import BlogCommentSection from '../components/BlogCommentSection';
import Breadcrumb from '../components/Breadcrumb';
import RelatedLinks from '../components/RelatedLinks';
import { fixListNumbering } from '../utils/fixListNumbering';

export default function BlogDetail() {
  const { currentUser } = useSelector((state) => state.user);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog && contentRef.current) {
      // Fix list numbering after content is rendered
      setTimeout(() => {
        fixListNumbering(contentRef.current);
      }, 0);
    }
  }, [blog]);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`/backend/blogs/slug/${slug}`);
      setBlog(res.data);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      console.error('Error fetching blog:', error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to like this blog');
      return;
    }

    try {
      const res = await axios.post(`/backend/blogs/like/${blog._id}`);
      setBlog(res.data);
    } catch (error) {
      console.error('Error liking blog:', error);
      toast.error('Failed to like blog');
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      toast.error('Please sign in to dislike this blog');
      return;
    }

    try {
      const res = await axios.post(`/backend/blogs/dislike/${blog._id}`);
      setBlog(res.data);
    } catch (error) {
      console.error('Error disliking blog:', error);
      toast.error('Failed to dislike blog');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/backend/blogs/delete/${blog._id}`);
        toast.success('Blog deleted successfully!');
        navigate('/blogs');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Blog not found</p>
          <Link to="/blogs" className="text-blue-500 hover:underline">
            ← Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{blog.title} | Blog</title>
        <meta name="description" content={blog.excerpt} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://route2hire.com/blog/${blog.slug}`} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
        <link rel="canonical" href={`https://route2hire.com/blog/${blog.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Breadcrumb Navigation */}
          <Breadcrumb 
            items={[
              { label: 'Blogs', path: '/blogs' },
              blog.category ? { label: blog.category, path: `/blogs/category/${blog.category}` } : null,
              { label: blog.title }
            ].filter(Boolean)}
          />
        </div>

        {/* Blog Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Header */}
          <header className="mb-8">
            {/* Category Badge */}
            <div className="mb-4">
              <span className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {blog.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center">
                {blog.author?.profilePicture ? (
                  <img
                    src={blog.author.profilePicture}
                    alt={blog.author.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                ) : (
                  <FaUser className="w-10 h-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full mr-3" />
                )}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {blog.author?.username}
                  </p>
                </div>
              </div>
              <span className="flex items-center">
                <FaCalendar className="mr-2" />
                {formatDate(blog.createdAt)}
              </span>
              <span className="flex items-center">
                <FaClock className="mr-2" />
                {blog.readTime} min read
              </span>
              <span className="flex items-center">
                <FaEye className="mr-2" />
                {blog.views} views
              </span>
            </div>

            {/* Admin Actions
            {currentUser?.isUserAdmin && (
              <div className="flex gap-3 mb-6">
                <Link
                  to={`/admin-blogs/edit/${blog._id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaEdit className="mr-2" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
              </div>
            )} */}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    <FaTag className="mr-2 text-xs" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="rounded-lg overflow-hidden mb-8 shadow-lg">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}
          </header>

          {/* Blog Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8" ref={contentRef}>
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-blue-600 dark:prose-a:text-blue-400
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-pink-600 dark:prose-code:text-pink-400
                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Like/Dislike Buttons */}
          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                currentUser && blog.likes?.includes(currentUser._id)
                  ? 'bg-green-500/30 text-gray-900 dark:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-100 dark:hover:bg-green-900/30'
              }`}
            >
              <ThumbsUp size={20} />
              <span className="font-medium">{blog.numberOfLikes || 0}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                currentUser && blog.dislikes?.includes(currentUser._id)
                  ? 'bg-red-500/30 text-gray-900 dark:text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <ThumbsDown size={20} />
              <span className="font-medium">{blog.numberOfDislikes || 0}</span>
            </button>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <BlogCommentSection blogId={blog._id} />
          </div>

          {/* Related Links Section */}
          <RelatedLinks type="general" />
        </article>
      </div>
    </>
  );
}
