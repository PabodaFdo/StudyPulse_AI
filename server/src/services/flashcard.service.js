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
    return { 
      totalReviewAttempts: 0, 
      totalReviewedCards: 0,
      totalKnownCards: 0,
      totalNeedReviewCards: 0,
      averageAccuracy: 0,
      recentReviewAttempts: [],
      subjectSummary: []
    };
  }

  const totalReviewedCards = attempts.reduce((acc, curr) => acc + curr.reviewedCards, 0);
  const totalKnownCards = attempts.reduce((acc, curr) => acc + curr.knownCards, 0);
  const totalNeedReviewCards = attempts.reduce((acc, curr) => acc + curr.needReviewCards, 0);
  const totalAccuracy = attempts.reduce((acc, curr) => acc + curr.accuracy, 0);
  const averageAccuracy = totalAccuracy / attempts.length;

  const recentReviewAttempts = attempts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const subjectMap = {};
  attempts.forEach(attempt => {
    if (attempt.subjectId) {
      if (!subjectMap[attempt.subjectId]) {
        subjectMap[attempt.subjectId] = {
          subjectId: attempt.subjectId,
          attempts: 0,
          reviewedCards: 0
        };
      }
      subjectMap[attempt.subjectId].attempts += 1;
      subjectMap[attempt.subjectId].reviewedCards += attempt.reviewedCards;
    }
  });

  return {
    totalReviewAttempts: attempts.length,
    totalReviewedCards,
    totalKnownCards,
    totalNeedReviewCards,
    averageAccuracy: parseFloat(averageAccuracy.toFixed(2)),
    recentReviewAttempts,
    subjectSummary: Object.values(subjectMap)
  };
};

module.exports = {
  generateFlashcards,
  createReviewAttempt,
  getReviewAttempts,
  getReviewSummary
};
