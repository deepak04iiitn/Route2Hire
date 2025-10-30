import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import { statistics } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/statistics' , verifyToken , verifyAdmin, statistics);

export default router;