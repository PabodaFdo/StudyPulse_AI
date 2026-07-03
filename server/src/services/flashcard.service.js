const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateFlashcards = async (text, cardCount = 10, difficulty = 'medium') => {
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const response = await axios.post(`${mlServiceUrl}/generate-flashcards`, { 
      text,
      card_count: cardCount,
      difficulty
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`ML Service Error: ${error.response.data.detail || error.message}`);
    } else {
      throw new Error(`Failed to connect to ML Service: ${error.message}`);
    }
  }
};

const createReviewAttempt = async (userId, data) => {
  // Simple backend duplicate check (e.g. within last 1 minute for same deck)
  const oneMinuteAgo = new Date(Date.now() - 60000);
  
  if (data.flashcardDeckId) {
    const existing = await prisma.flashcardReviewAttempt.findFirst({
      where: {
        userId,
        flashcardDeckId: data.flashcardDeckId,
        createdAt: { gte: oneMinuteAgo }
      }
    });
    if (existing) {
      // Avoid duplicate save
      return existing;
    }
  }

  const attempt = await prisma.flashcardReviewAttempt.create({
    data: {
      userId,
      subjectId: data.subjectId ? parseInt(data.subjectId) : null,
      flashcardDeckId: data.flashcardDeckId || null,
      sourceTitle: data.sourceTitle || null,
      totalCards: data.totalCards,
      reviewedCards: data.reviewedCards,
      knownCards: data.knownCards,
      needReviewCards: data.needReviewCards,
      accuracy: data.accuracy,
    }
  });

  return attempt;
};

const getReviewAttempts = async (userId, limit = 20) => {
  return await prisma.flashcardReviewAttempt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

const getReviewSummary = async (userId) => {
  const attempts = await prisma.flashcardReviewAttempt.findMany({
    where: { userId }
  });

  if (attempts.length === 0) {
    return { totalAttempts: 0, averageAccuracy: 0, totalCardsReviewed: 0 };
  }

  const totalCardsReviewed = attempts.reduce((acc, curr) => acc + curr.reviewedCards, 0);
  const totalAccuracy = attempts.reduce((acc, curr) => acc + curr.accuracy, 0);
  const averageAccuracy = totalAccuracy / attempts.length;

  return {
    totalAttempts: attempts.length,
    averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
    totalCardsReviewed
  };
};

module.exports = {
  generateFlashcards,
  createReviewAttempt,
  getReviewAttempts,
  getReviewSummary
};
