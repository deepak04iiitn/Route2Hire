import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaThumbsUp, FaEdit, FaTrash, FaReply } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function BlogCommentSection({ blogId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/backend/blog-comments/getblogcomments/${blogId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to comment');
      return;
    }

    if (comment.trim().length === 0) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (comment.length > 500) {
      toast.error('Comment must be less than 500 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/backend/blog-comments/create', {
        content: comment,
        blogId,
        userId: currentUser._id,
      });
      setComments([res.data, ...comments]);
      setComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!currentUser) {
      toast.error('Please sign in to like comments');
      return;
    }

    try {
      const res = await axios.put(`/backend/blog-comments/likeblogcomment/${commentId}`);
      setComments(
        comments.map((c) =>
          c._id === commentId ? res.data : c
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to like comment');
    }
  };

  const handleEdit = async (commentId) => {
    try {
      const res = await axios.put(`/backend/blog-comments/editblogcomment/${commentId}`, {
        content: editedContent,
      });
      setComments(
        comments.map((c) =>
          c._id === commentId ? { ...c, content: res.data.content } : c
        )
      );
      setEditingCommentId(null);
      setEditedContent('');
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Failed to edit comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await axios.delete(`/backend/blog-comments/deleteblogcomment/${commentId}`);
        setComments(comments.filter((c) => c._id !== commentId));
        toast.success('Comment deleted successfully!');
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows="4"
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {comment.length}/500 characters
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            Please{' '}
            <Link to="/sign-in" className="text-blue-600 dark:text-blue-400 hover:underline">
              sign in
            </Link>{' '}
            to leave a comment.
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {c.userId?.charAt(0)?.toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        User {c.userId?.slice(0, 8)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    {currentUser && (currentUser._id === c.userId || currentUser.isUserAdmin) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingCommentId(c._id);
                            setEditedContent(c.content);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === c._id ? (
                    <div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                        rows="3"
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEdit(c._id)}
                          className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditedContent('');
                          }}
                          className="px-4 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{c.content}</p>
                  )}

                  <button
                    onClick={() => handleLike(c._id)}
                    className={`flex items-center space-x-1 text-sm ${
                      currentUser && c.likes.includes(currentUser._id)
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    } hover:text-blue-600 transition-colors`}
                  >
                    <FaThumbsUp />
                    <span>{c.numberOfLikes}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
