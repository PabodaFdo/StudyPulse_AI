const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcard.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, flashcardController.generateFlashcards);

router.post('/review-attempts', protect, flashcardController.createReviewAttempt);
router.get('/review-attempts', protect, flashcardController.getReviewAttempts);
router.get('/review-attempts/summary', protect, flashcardController.getReviewSummary);

module.exports = router;
