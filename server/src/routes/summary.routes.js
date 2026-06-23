const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summary.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, summaryController.generateSummary);

module.exports = router;
