const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summary.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, summaryController.generateSummary);

router.post('/review-attempts', protect, summaryController.createReviewAttempt);
router.get('/review-attempts', protect, summaryController.getReviewAttempts);
router.get('/review-attempts/summary', protect, summaryController.getReviewSummary);

module.exports = router;
