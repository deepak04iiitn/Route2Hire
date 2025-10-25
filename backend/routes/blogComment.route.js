import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createBlogComment,
  getBlogComments,
  likeBlogComment,
  editBlogComment,
  deleteBlogComment,
  getAllBlogComments,
} from '../controllers/blogComment.controller.js';

const router = express.Router();

router.post('/create', verifyToken, createBlogComment);
router.get('/getblogcomments/:blogId', getBlogComments);
router.put('/likeblogcomment/:commentId', verifyToken, likeBlogComment);
router.put('/editblogcomment/:commentId', verifyToken, editBlogComment);
router.delete('/deleteblogcomment/:commentId', verifyToken, deleteBlogComment);
router.get('/getallblogcomments', verifyToken, getAllBlogComments);

export default router;
