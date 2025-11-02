import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  getCategories,
  getTags,
} from '../controllers/blog.controller.js';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { Readable } from 'stream';

const router = express.Router();

// Multer memory storage for direct stream upload to Cloudinary
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fieldSize: 10 * 1024 * 1024, // 10MB for field values (rich text content)
    fileSize: 5 * 1024 * 1024,   // 5MB for file uploads
    fields: 20,                   // Maximum number of fields
    files: 5                      // Maximum number of files
  }
});

// Helper to upload a buffer to Cloudinary and return the secure URL
const uploadBufferToCloudinary = (buffer, folder = 'blog-images') => {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    readable.pipe(stream);
  });
};

// Image upload endpoint for rich text editor
router.post('/upload-image', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const url = await uploadBufferToCloudinary(req.file.buffer);
    res.status(200).json({ url });
  } catch (error) {
    next(error);
  }
});

router.post('/create', verifyToken, upload.single('featuredImage'), async (req, res, next) => {
  try {
    if (req.file) {
      const url = await uploadBufferToCloudinary(req.file.buffer);
      req.body.featuredImage = url;
    }
    return createBlog(req, res, next);
  } catch (err) {
    // Handle Multer errors specifically
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ 
        error: 'Content too large. Please reduce the size of your blog content or try breaking it into smaller sections.' 
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Image file too large. Please use an image smaller than 5MB.' 
      });
    }
    return next(err);
  }
});

router.get('/get', getBlogs);
router.get('/categories', getCategories);
router.get('/tags', getTags);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:id', getBlogById);

router.put('/update/:id', verifyToken, upload.single('featuredImage'), async (req, res, next) => {
  try {
    if (req.file) {
      const url = await uploadBufferToCloudinary(req.file.buffer);
      req.body.featuredImage = url;
    }
    return updateBlog(req, res, next);
  } catch (err) {
    // Handle Multer errors specifically
    if (err.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({ 
        error: 'Content too large. Please reduce the size of your blog content or try breaking it into smaller sections.' 
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Image file too large. Please use an image smaller than 5MB.' 
      });
    }
    return next(err);
  }
});

router.delete('/delete/:id', verifyToken, deleteBlog);
router.post('/like/:id', verifyToken, likeBlog);
router.post('/dislike/:id', verifyToken, dislikeBlog);

export default router;
