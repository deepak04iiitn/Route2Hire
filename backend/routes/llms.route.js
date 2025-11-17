import express from 'express';
import { generateLLMS, getLLMSStats, clearLLMSCache, getUsersCount } from '../controllers/llms.controller.js';

const router = express.Router();

// Main llms.txt endpoint
router.get('/llms.txt', generateLLMS);

// LLMS statistics endpoint (for monitoring)
router.get('/llms-stats', getLLMSStats);

// Public users count endpoint
router.get('/users-count', getUsersCount);

// Cache management endpoint (for webhooks)
router.post('/llms-cache/clear', (req, res) => {
  clearLLMSCache();
  res.json({ success: true, message: 'LLMS cache cleared successfully' });
});

export default router;
