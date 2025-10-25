import Blog from '../models/blog.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import { clearSitemapCache } from './sitemap.controller.js';
import { clearLLMSCache } from './llms.controller.js';

// Helper function to calculate read time
const calculateReadTime = (content) => {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
  const wordCount = textContent.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const createBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to create blogs'));
    }

    const { title, excerpt, content, category, tags, published, featuredImage } = req.body;

    if (!title || !excerpt || !content || !category) {
      return next(errorHandler(400, 'All required fields must be filled'));
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const existingBlog = await Blog.findOne({ slug });
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    const readTime = calculateReadTime(content);

    const newBlog = new Blog({
      title,
      slug,
      excerpt,
      content,
      category,
      tags: tags || [],
      author: req.user.id,
      published: published || false,
      featuredImage: featuredImage || '',
      readTime,
    });

    const savedBlog = await newBlog.save();
    const populatedBlog = await Blog.findById(savedBlog._id).populate('author', 'username profilePicture');

    clearSitemapCache();
    clearLLMSCache();

    res.status(201).json(populatedBlog);
  } catch (error) {
    next(error);
  }
};

export const getBlogs = async (req, res, next) => {
  try {
    const { 
      category, 
      tag, 
      sort = 'createdAt', 
      order = 'desc', 
      search,
      published = 'true',
      limit = 10,
      skip = 0
    } = req.query;

    let query = {};

    // Only show published blogs to non-admins
    if (published === 'true') {
      query.published = true;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('author', 'username profilePicture');

    const total = await Blog.countDocuments(query);

    res.status(200).json({ blogs, total });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username profilePicture email');

    if (!blog) {
      return next(errorHandler(404, 'Blog not found'));
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture email');

    if (!blog) {
      return next(errorHandler(404, 'Blog not found'));
    }

    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to update blogs'));
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(errorHandler(404, 'Blog not found'));
    }

    const { title, excerpt, content, category, tags, published, featuredImage } = req.body;

    if (!title || !excerpt || !content || !category) {
      return next(errorHandler(400, 'All required fields must be filled'));
    }

    // Update slug if title changed
    let slug = blog.slug;
    if (title !== blog.title) {
      slug = generateSlug(title);
      const existingBlog = await Blog.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingBlog) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const readTime = calculateReadTime(content);

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        excerpt,
        content,
        category,
        tags: tags || [],
        published: published !== undefined ? published : blog.published,
        featuredImage: featuredImage || blog.featuredImage,
        readTime,
      },
      { new: true }
    ).populate('author', 'username profilePicture');

    clearSitemapCache();
    clearLLMSCache();

    res.status(200).json(updatedBlog);
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete blogs'));
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(errorHandler(404, 'Blog not found'));
    }

    await Blog.findByIdAndDelete(req.params.id);

    clearSitemapCache();
    clearLLMSCache();

    res.status(200).json('Blog has been deleted');
  } catch (error) {
    next(error);
  }
};

export const likeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return next(errorHandler(404, 'Blog not found'));
    }

    const userIndex = blog.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      blog.likes.push(req.user.id);
      blog.numberOfLikes += 1;
    } else {
      blog.likes.splice(userIndex, 1);
      blog.numberOfLikes -= 1;
    }

    await blog.save();
    res.status(200).json(blog);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Blog.distinct('category', { published: true });
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getTags = async (req, res, next) => {
  try {
    const tags = await Blog.distinct('tags', { published: true });
    res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
};
