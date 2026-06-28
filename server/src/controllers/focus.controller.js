const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const { addGrowthPoints } = require('../services/garden.service');

const prisma = new PrismaClient();

// @desc    Get all focus sessions for a user
// @route   GET /api/focus-sessions
// @access  Private
const getFocusSessions = asyncHandler(async (req, res) => {
  const sessions = await prisma.focusSession.findMany({
    where: { userId: req.user.id },
    include: { subject: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(sessions || []);
});

// @desc    Create a focus session
// @route   POST /api/focus-sessions
// @access  Private
const createFocusSession = asyncHandler(async (req, res) => {
  const { subjectId } = req.body;
  const durationMinutes = req.body.durationMinutes || req.body.duration;

  if (!durationMinutes || !subjectId) {
    res.status(400);
    throw new Error('Please provide durationMinutes and subjectId');
  }

  const parsedDuration = parseFloat(durationMinutes);
  const finalDuration = parsedDuration > 0 && parsedDuration < 1 ? 1 : Math.round(parsedDuration);

  const session = await prisma.focusSession.create({
    data: {
      duration: finalDuration,
      subjectId: parseInt(subjectId),
      userId: req.user.id
    },
    include: { subject: true }
  });

  // Completing focus session gives +10 points
  await addGrowthPoints(req.user.id, 10, 'Focus Session', `Completed ${durationMinutes} minutes focus session`);

  res.status(201).json(session);
});

// @desc    Get focus session analytics
// @route   GET /api/focus-sessions/analytics
// @access  Private
const getFocusAnalytics = asyncHandler(async (req, res) => {
  const sessions = await prisma.focusSession.findMany({
    where: { userId: req.user.id }
  });

  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalSessions = sessions.length;

  res.json({
    totalMinutes,
    totalSessions,
    sessions: sessions || []
  });
});

module.exports = {
  getFocusSessions,
  createFocusSession,
  getFocusAnalytics
};
