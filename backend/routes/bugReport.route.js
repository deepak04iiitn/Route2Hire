import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { createBugReport, listBugReports, updateBugStatus } from '../controllers/bugReport.controller.js';

const router = express.Router();

// Public create
router.post('/', createBugReport);

// Admin list and update
router.get('/', verifyToken, listBugReports);
router.patch('/:id/status', verifyToken, updateBugStatus);

export default router;


