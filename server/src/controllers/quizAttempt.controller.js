const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a quiz attempt
// @route   POST /api/quiz-attempts
// @access  Private
const createQuizAttempt = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    subjectId, noteId, sourceType, sourceTitle, 
    difficulty, score, totalQuestions, wrongAnswers, percentage 
  } = req.body;

  if (score === undefined || isNaN(Number(score))) {
    res.status(400);
    throw new Error('Score must be a number');
  }

  if (!totalQuestions || isNaN(Number(totalQuestions)) || Number(totalQuestions) <= 0) {
    res.status(400);
    throw new Error('Total questions must be a number greater than 0');
  }

  let finalPercentage = percentage;
  if (finalPercentage === undefined || isNaN(Number(finalPercentage))) {
    finalPercentage = (Number(score) / Number(totalQuestions)) * 100;
  }

  if (Number(finalPercentage) < 0 || Number(finalPercentage) > 100) {
    res.status(400);
    throw new Error('Percentage must be between 0 and 100');
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      subjectId: subjectId ? Number(subjectId) : null,
      noteId: noteId ? String(noteId) : null,
      sourceType,
      sourceTitle,
      difficulty,
      score: Number(score),
      totalQuestions: Number(totalQuestions),
      percentage: Number(finalPercentage),
      wrongAnswers: wrongAnswers || null,
    }
  });

  res.status(201).json({
    success: true,
    message: 'Quiz attempt saved successfully',
    data: attempt
  });
});

// @desc    Get all quiz attempts for user
// @route   GET /api/quiz-attempts
// @access  Private
const getQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({
    success: true,
    data: attempts
  });
});

// @desc    Get overall quiz attempt stats
// @route   GET /api/quiz-attempts/stats
// @access  Private
const getQuizAttemptStats = asyncHandler(async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const totalAttempts = attempts.length;
  let averageQuizScore = 0;
  let totalWrongAnswers = 0;
  let bestScore = 0;
  let latestScore = totalAttempts > 0 ? attempts[0].percentage : 0;

  if (totalAttempts > 0) {
    let sumPercentage = 0;
    attempts.forEach(attempt => {
      sumPercentage += attempt.percentage;
      if (attempt.percentage > bestScore) {
        bestScore = attempt.percentage;
      }
      if (attempt.wrongAnswers && Array.isArray(attempt.wrongAnswers)) {
        totalWrongAnswers += attempt.wrongAnswers.length;
      }
    });
    averageQuizScore = sumPercentage / totalAttempts;
  }

  res.status(200).json({
    success: true,
    data: {
      totalAttempts,
      averageQuizScore: Number(averageQuizScore.toFixed(2)),
      recentAttempts: attempts.slice(0, 5),
      totalWrongAnswers,
      bestScore: Number(bestScore.toFixed(2)),
      latestScore: Number(latestScore.toFixed(2))
    }
  });
});

// @desc    Get topic quiz attempt stats
// @route   GET /api/quiz-attempts/topic/:noteId
// @access  Private
const getTopicQuizAttemptStats = asyncHandler(async (req, res) => {
  const noteId = req.params.noteId;
  const attempts = await prisma.quizAttempt.findMany({
    where: { 
      userId: req.user.id,
      noteId: noteId
    },
    orderBy: { createdAt: 'desc' }
  });

  const attemptCount = attempts.length;
  let averageScore = 0;
  let latestScore = attemptCount > 0 ? attempts[0].percentage : 0;
  let bestScore = attemptCount > 0 ? Math.max(...attempts.map(a => a.percentage)) : 0;
  let wrongAnswersCount = 0;
  let lastAttemptDate = attemptCount > 0 ? attempts[0].createdAt : null;

  if (attemptCount > 0) {
    let sumPercentage = 0;
    attempts.forEach(attempt => {
      sumPercentage += attempt.percentage;
      if (attempt.wrongAnswers && Array.isArray(attempt.wrongAnswers)) {
        wrongAnswersCount += attempt.wrongAnswers.length;
      }
    });
    averageScore = sumPercentage / attemptCount;
  }

  res.status(200).json({
    success: true,
    data: {
      noteId,
      attemptCount,
      averageScore: Number(averageScore.toFixed(2)),
      latestScore: Number(latestScore.toFixed(2)),
      bestScore: Number(bestScore.toFixed(2)),
      wrongAnswersCount,
      lastAttemptDate
    }
  });
});

module.exports = {
  createQuizAttempt,
  getQuizAttempts,
  getQuizAttemptStats,
  getTopicQuizAttemptStats
};
