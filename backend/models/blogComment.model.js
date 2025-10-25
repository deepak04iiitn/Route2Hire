import mongoose from 'mongoose';

const blogCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const BlogComment = mongoose.model('BlogComment', blogCommentSchema);

export default BlogComment;
