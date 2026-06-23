const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/generate', protect, quizController.generateQuiz);

module.exports = router;
