import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    published: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Array,
      default: [],
    },
    numberOfLikes: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 0, // in minutes
    },
  },
  { timestamps: true }
);

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
