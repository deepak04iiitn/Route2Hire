import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { FaPlus, FaTrash, FaEdit, FaEye, FaSave, FaTimes, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function AdminBlogs() {
  const { currentUser } = useSelector((state) => state.user);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    published: false,
    featuredImage: null,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [editBlogId, setEditBlogId] = useState(null);
  const quillRef = useRef(null);
  const navigate = useNavigate();
  const { action, id } = useParams();

  useEffect(() => {
    if (!currentUser?.isUserAdmin) {
      navigate('/');
      return;
    }
    fetchBlogs();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (action === 'create') {
      setShowForm(true);
      setIsEditing(false);
    } else if (action === 'edit' && id) {
      fetchBlogForEdit(id);
    }
  }, [action, id]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/backend/blogs/get?published=false');
      setBlogs(res.data.blogs);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      console.error('Error fetching blogs:', error);
    }
  };

  const fetchBlogForEdit = async (blogId) => {
    try {
      const res = await axios.get(`/backend/blogs/${blogId}`);
      const blog = res.data;
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags.join(', '),
        published: blog.published,
        featuredImage: null,
      });
      setImagePreview(blog.featuredImage || '');
      setEditBlogId(blogId);
      setIsEditing(true);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching blog for edit:', error);
      toast.error('Failed to load blog');
      navigate('/admin-blogs');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, featuredImage: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quill modules with image upload handler
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['code-block'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'code-block',
    'color',
    'background',
    'align',
  ];

  function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await axios.post('/backend/blogs/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', res.data.url);
        quill.setSelection(range.index + 1);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      }
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('excerpt', formData.excerpt);
      payload.append('content', formData.content);
      payload.append('category', formData.category);
      payload.append('tags', JSON.stringify(formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)));
      payload.append('published', formData.published);

      if (formData.featuredImage) {
        payload.append('featuredImage', formData.featuredImage);
      }

      if (isEditing) {
        await axios.put(`/backend/blogs/update/${editBlogId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog updated successfully!');
      } else {
        await axios.post('/backend/blogs/create', payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Blog created successfully!');
      }

      resetForm();
      fetchBlogs();
      navigate('/admin-blogs');
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} blog:`, error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} blog`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditBlogId(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      published: false,
      featuredImage: null,
    });
    setImagePreview('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/backend/blogs/delete/${id}`);
        setBlogs(blogs.filter(blog => blog._id !== id));
        toast.success('Blog deleted successfully!');
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Blogs | Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Blogs
            </h1>
            {!showForm && (
              <button
                onClick={() => navigate('/admin-blogs/create')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Create New Blog
              </button>
            )}
          </div>

          {/* Blog Form */}
          {showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Blog' : 'Create New Blog'}
                </h2>
                <button
                  onClick={() => {
                    resetForm();
                    navigate('/admin-blogs');
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description (max 300 characters)"
                    rows="3"
                    maxLength="300"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.excerpt.length}/300 characters
                  </p>
                </div>

                {/* Category and Tags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Technology, Design"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., react, javascript, web"
                    />
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600">
                      <FaImage className="mr-2" />
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-32 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                {/* Content - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <div className="bg-white dark:bg-gray-700 rounded-lg">
                    <ReactQuill
                      ref={quillRef}
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      modules={modules}
                      formats={formats}
                      className="h-96 mb-16"
                      placeholder="Write your blog content here..."
                    />
                  </div>
                </div>

                {/* Published Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publish immediately
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : isEditing ? 'Update Blog' : 'Create Blog'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      navigate('/admin-blogs');
                    }}
                    className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Blog List */}
          {!showForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {blogs.map((blog) => (
                      <tr key={blog._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {blog.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {blog.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.published
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {blog.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`/blogs/${blog.slug}/${blog._id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => navigate(`/admin-blogs/edit/${blog._id}`)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(blog._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {blogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No blogs found. Create your first blog!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
