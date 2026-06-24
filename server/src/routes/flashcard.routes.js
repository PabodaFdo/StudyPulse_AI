const express = require('express');
const router = express.Router();
const flashcardController = require('../controllers/flashcard.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, flashcardController.generateFlashcards);

module.exports = router;
