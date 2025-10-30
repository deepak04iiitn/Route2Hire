import express from 'express';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';
import { createFeatureRequest, listFeatureRequests, updateFeatureStatus } from '../controllers/featureRequest.controller.js';

const router = express.Router();

// Public create
router.post('/', createFeatureRequest);

// Admin list and update
router.get('/', verifyToken, verifyAdmin, listFeatureRequests);
router.patch('/:id/status', verifyToken, verifyAdmin, updateFeatureStatus);

export default router;


