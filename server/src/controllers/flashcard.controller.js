const flashcardService = require('../services/flashcard.service');

const generateFlashcards = async (req, res) => {
  try {
    const { text, card_count, difficulty } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Text is required for flashcard generation.'
      });
    }

    const result = await flashcardService.generateFlashcards(text, card_count, difficulty);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Flashcard Generation Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during flashcard generation.'
    });
  }
};

const createReviewAttempt = async (req, res) => {
  try {
    const { 
      subjectId, 
      flashcardDeckId, 
      sourceTitle, 
      totalCards, 
      reviewedCards, 
      knownCards, 
      needReviewCards, 
      accuracy 
    } = req.body;

    const userId = req.user.id;

    if (totalCards === undefined || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: 'totalCards and accuracy are required.'
      });
    }

    const attempt = await flashcardService.createReviewAttempt(userId, {
      subjectId,
      flashcardDeckId,
      sourceTitle,
      totalCards,
      reviewedCards,
      knownCards,
      needReviewCards,
      accuracy
    });

    return res.status(201).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Create Review Attempt Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating review attempt.'
    });
  }
};

const getReviewAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    
    const attempts = await flashcardService.getReviewAttempts(userId, limit);
    
    return res.status(200).json({
      success: true,
      data: attempts
    });
  } catch (error) {
    console.error('Get Review Attempts Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching review attempts.'
    });
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const summary = await flashcardService.getReviewSummary(userId);
    
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get Review Summary Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error fetching review summary.'
    });
  }
};

module.exports = {
  generateFlashcards,
  createReviewAttempt,
  getReviewAttempts,
  getReviewSummary
};
