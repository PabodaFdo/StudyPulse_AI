const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const summaryService = require('../services/summary.service');

const generateSummary = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Text is required for summary generation.'
      });
    }

    const result = await summaryService.generateSummary(text);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Summary Generation Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during summary generation.'
    });
  }
};

const createReviewAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      subjectId,
      summaryId,
      sourceTitle,
      summaryWordCount,
      readDurationSeconds,
      completed
    } = req.body;

    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentAttempt = await prisma.summaryReviewAttempt.findFirst({
      where: {
        userId,
        summaryId,
        createdAt: { gte: oneMinuteAgo }
      }
    });

    if (recentAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Review attempt already recorded recently.',
        data: recentAttempt
      });
    }

    const newAttempt = await prisma.summaryReviewAttempt.create({
      data: {
        userId,
        subjectId: subjectId || null,
        summaryId: summaryId || null,
        sourceTitle: sourceTitle || 'Unknown Source',
        summaryWordCount: summaryWordCount || 0,
        readDurationSeconds: readDurationSeconds || 0,
        completed: completed !== undefined ? completed : true
      }
    });

    res.status(201).json({
      success: true,
      data: newAttempt
    });
  } catch (error) {
    console.error('Error creating summary review attempt:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getReviewAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await prisma.summaryReviewAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    console.error('Error fetching summary review attempts:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await prisma.summaryReviewAttempt.findMany({
      where: { userId }
    });

    const totalReviews = attempts.length;
    const totalTimeSeconds = attempts.reduce((acc, curr) => acc + curr.readDurationSeconds, 0);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        totalTimeSeconds
      }
    });
  } catch (error) {
    console.error('Error fetching review summary:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  generateSummary,
  createReviewAttempt,
  getReviewAttempts,
  getReviewSummary
};
