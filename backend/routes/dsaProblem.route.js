import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { 
    getDSAProblems, 
    updateProblemStatus, 
    updateProblemNotes, 
    getProgressStats,
    getFilteredProblems,
    bulkUpdateProblems,
    getRecentActivity
} from '../controllers/dsaProblem.controller.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get all DSA problems with user's progress
router.get('/', getDSAProblems);

// Update problem status (completed/favorite)
router.put('/status', updateProblemStatus);

// Update problem notes
router.put('/notes', updateProblemNotes);

// Get progress statistics
router.get('/stats', getProgressStats);

// Get filtered problems
router.get('/filter', getFilteredProblems);

// Bulk update problems
router.put('/bulk-update', bulkUpdateProblems);

// Get recent activity
router.get('/recent-activity', getRecentActivity);

export default router;
