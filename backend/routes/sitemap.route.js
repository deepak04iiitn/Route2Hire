import express from 'express';
import { generateSitemap, getSitemapStats, clearSitemapCache } from '../controllers/sitemap.controller.js';

const router = express.Router();

// Main sitemap endpoint
router.get('/sitemap.xml', generateSitemap);

// Sitemap statistics endpoint (for monitoring)
router.get('/sitemap-stats', getSitemapStats);

// Cache management endpoint (for webhooks)
router.post('/sitemap-cache/clear', (req, res) => {
  clearSitemapCache();
  res.json({ success: true, message: 'Sitemap cache cleared successfully' });
});

export default router;
