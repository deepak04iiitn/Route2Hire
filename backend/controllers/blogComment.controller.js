import BlogComment from '../models/blogComment.model.js';
import { errorHandler } from '../utils/error.js';

export const createBlogComment = async (req, res, next) => {
  try {
    const { content, blogId, userId } = req.body;

    if (userId !== req.user.id) {
      return next(errorHandler(403, 'You are not allowed to create this comment'));
    }

    const newComment = new BlogComment({
      content,
      blogId,
      userId,
    });

    await newComment.save();

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const getBlogComments = async (req, res, next) => {
  try {
    const comments = await BlogComment.find({ blogId: req.params.blogId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const likeBlogComment = async (req, res, next) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    const userIndex = comment.likes.indexOf(req.user.id);
    if (userIndex === -1) {
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    } else {
      comment.numberOfLikes -= 1;
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

export const editBlogComment = async (req, res, next) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    if (comment.userId !== req.user.id && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to edit this comment'));
    }

    const editedComment = await BlogComment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
      },
      { new: true }
    );

    res.status(200).json(editedComment);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogComment = async (req, res, next) => {
  try {
    const comment = await BlogComment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, 'Comment not found'));
    }
    if (comment.userId !== req.user.id && !req.user.isUserAdmin) {
      return next(errorHandler(403, 'You are not allowed to delete this comment'));
    }
    await BlogComment.findByIdAndDelete(req.params.commentId);
    res.status(200).json('Comment has been deleted');
  } catch (error) {
    next(error);
  }
};

export const getAllBlogComments = async (req, res, next) => {
  if (!req.user.isUserAdmin) {
    return next(errorHandler(403, 'You are not allowed to get all comments'));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'desc' ? -1 : 1;
    const comments = await BlogComment.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    const totalComments = await BlogComment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await BlogComment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (error) {
    next(error);
  }
};
