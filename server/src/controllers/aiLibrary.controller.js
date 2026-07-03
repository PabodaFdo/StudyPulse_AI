const aiLibraryService = require('../services/aiLibrary.service');
const { addGrowthPoints } = require('../services/garden.service');

// Summaries
const saveSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, sourceType, sourceTitle, content, wordCount } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const savedSummary = await aiLibraryService.createSavedSummary(userId, {
      title,
      sourceType,
      sourceTitle,
      content,
      wordCount,
    });

    try {
      await addGrowthPoints(userId, 5, 'Saved AI Summary', `Saved summary: ${title}`);
    } catch (err) {
      console.error('Failed to add growth points for saving summary:', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Saved successfully',
      data: savedSummary,
    });
  } catch (error) {
    console.error('Error in saveSummary:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSummaries = async (req, res) => {
  try {
    const userId = req.user.id;
    const summaries = await aiLibraryService.getSavedSummaries(userId);
    return res.status(200).json({ success: true, data: summaries });
  } catch (error) {
    console.error('Error in getSummaries:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSummaryById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const summary = await aiLibraryService.getSavedSummaryById(userId, id);
    
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }
    
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    console.error('Error in getSummaryById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const summary = await aiLibraryService.getSavedSummaryById(userId, id);
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Summary not found' });
    }

    await aiLibraryService.deleteSavedSummary(userId, id);
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSummary:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Quizzes
const saveQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, sourceType, sourceTitle, questions, wordCount } = req.body;

    if (!title || !questions) {
      return res.status(400).json({ success: false, message: 'Title and questions are required' });
    }

    const savedQuiz = await aiLibraryService.createSavedQuiz(userId, {
      title,
      sourceType,
      sourceTitle,
      questions,
      wordCount,
    });

    try {
      await addGrowthPoints(userId, 8, 'Saved AI Quiz', `Saved quiz: ${title}`);
    } catch (err) {
      console.error('Failed to add growth points for saving quiz:', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Saved successfully',
      data: savedQuiz,
    });
  } catch (error) {
    console.error('Error in saveQuiz:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;
    const quizzes = await aiLibraryService.getSavedQuizzes(userId);
    return res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const quiz = await aiLibraryService.getSavedQuizById(userId, id);
    
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    
    return res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    console.error('Error in getQuizById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const quiz = await aiLibraryService.getSavedQuizById(userId, id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await aiLibraryService.deleteSavedQuiz(userId, id);
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Flashcards
const saveFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, sourceType, sourceTitle, flashcards, wordCount } = req.body;

    if (!title || !flashcards) {
      return res.status(400).json({ success: false, message: 'Title and flashcards are required' });
    }

    const existingDecks = await aiLibraryService.getSavedFlashcardDecks(userId);
    const isDuplicate = existingDecks.find(deck => 
      deck.title === title && 
      deck.sourceTitle === sourceTitle && 
      deck.flashcards.length === flashcards.length
    );

    if (isDuplicate) {
      return res.status(200).json({
        success: true,
        message: 'Already saved',
        data: isDuplicate,
      });
    }

    const savedDeck = await aiLibraryService.createSavedFlashcardDeck(userId, {
      title,
      sourceType,
      sourceTitle,
      flashcards,
      wordCount,
    });

    try {
      await addGrowthPoints(userId, 8, 'Saved AI Flashcards', `Saved flashcards: ${title}`);
    } catch (err) {
      console.error('Failed to add growth points for saving flashcards:', err);
    }

    return res.status(201).json({
      success: true,
      message: 'Saved successfully',
      data: savedDeck,
    });
  } catch (error) {
    console.error('Error in saveFlashcards:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const decks = await aiLibraryService.getSavedFlashcardDecks(userId);
    return res.status(200).json({ success: true, data: decks });
  } catch (error) {
    console.error('Error in getFlashcards:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getFlashcardsById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const deck = await aiLibraryService.getSavedFlashcardDeckById(userId, id);
    
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Flashcard deck not found' });
    }
    
    return res.status(200).json({ success: true, data: deck });
  } catch (error) {
    console.error('Error in getFlashcardsById:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteFlashcards = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const deck = await aiLibraryService.getSavedFlashcardDeckById(userId, id);
    if (!deck) {
      return res.status(404).json({ success: false, message: 'Flashcard deck not found' });
    }

    await aiLibraryService.deleteSavedFlashcardDeck(userId, id);
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFlashcards:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  saveSummary,
  getSummaries,
  getSummaryById,
  deleteSummary,
  saveQuiz,
  getQuizzes,
  getQuizById,
  deleteQuiz,
  saveFlashcards,
  getFlashcards,
  getFlashcardsById,
  deleteFlashcards,
};
