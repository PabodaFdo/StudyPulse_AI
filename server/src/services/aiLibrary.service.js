const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Summaries
const createSavedSummary = async (userId, data) => {
  return await prisma.savedSummary.create({
    data: {
      userId,
      title: data.title,
      sourceType: data.sourceType || 'unknown',
      sourceTitle: data.sourceTitle || null,
      content: data.content,
      wordCount: data.wordCount || null,
    },
  });
};

const getSavedSummaries = async (userId) => {
  return await prisma.savedSummary.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getSavedSummaryById = async (userId, id) => {
  return await prisma.savedSummary.findFirst({
    where: { id, userId },
  });
};

const deleteSavedSummary = async (userId, id) => {
  return await prisma.savedSummary.deleteMany({
    where: { id, userId },
  });
};

// Quizzes
const createSavedQuiz = async (userId, data) => {
  return await prisma.savedQuiz.create({
    data: {
      userId,
      title: data.title,
      sourceType: data.sourceType || 'unknown',
      sourceTitle: data.sourceTitle || null,
      questions: data.questions,
      wordCount: data.wordCount || null,
    },
  });
};

const getSavedQuizzes = async (userId) => {
  return await prisma.savedQuiz.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getSavedQuizById = async (userId, id) => {
  return await prisma.savedQuiz.findFirst({
    where: { id, userId },
  });
};

const deleteSavedQuiz = async (userId, id) => {
  return await prisma.savedQuiz.deleteMany({
    where: { id, userId },
  });
};

// Flashcards
const createSavedFlashcardDeck = async (userId, data) => {
  return await prisma.savedFlashcardDeck.create({
    data: {
      userId,
      title: data.title,
      sourceType: data.sourceType || 'unknown',
      sourceTitle: data.sourceTitle || null,
      flashcards: data.flashcards,
      wordCount: data.wordCount || null,
    },
  });
};

const getSavedFlashcardDecks = async (userId) => {
  return await prisma.savedFlashcardDeck.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

const getSavedFlashcardDeckById = async (userId, id) => {
  return await prisma.savedFlashcardDeck.findFirst({
    where: { id, userId },
  });
};

const deleteSavedFlashcardDeck = async (userId, id) => {
  return await prisma.savedFlashcardDeck.deleteMany({
    where: { id, userId },
  });
};

module.exports = {
  createSavedSummary,
  getSavedSummaries,
  getSavedSummaryById,
  deleteSavedSummary,
  createSavedQuiz,
  getSavedQuizzes,
  getSavedQuizById,
  deleteSavedQuiz,
  createSavedFlashcardDeck,
  getSavedFlashcardDecks,
  getSavedFlashcardDeckById,
  deleteSavedFlashcardDeck,
};
