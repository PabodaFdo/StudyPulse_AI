const axios = require('axios');
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const predictRisk = async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict-risk`, req.body);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error predicting risk:', error.message);
    res.status(500).json({
      success: false,
      message: 'Risk prediction failed'
    });
  }
};

// @desc    Save new risk prediction history
// @route   POST /api/risk/history
// @access  Private
const saveRiskHistory = asyncHandler(async (req, res) => {
  const {
    subjectId,
    riskScore,
    riskLevel,
    trend,
    trendMessage,
    studyEngagement,
    assessmentAverage,
    quizAverage,
    studyHoursPerWeek,
    focusSessionsCompleted,
    previousExamMark
  } = req.body;

  const history = await prisma.riskPredictionHistory.create({
    data: {
      userId: req.user.id,
      subjectId: parseInt(subjectId),
      riskScore,
      riskLevel,
      trend,
      trendMessage,
      studyEngagement,
      assessmentAverage,
      quizAverage,
      studyHoursPerWeek,
      focusSessionsCompleted,
      previousExamMark
    }
  });

  res.status(201).json(history);
});

// @desc    Get risk history for a subject
// @route   GET /api/risk/history/:subjectId
// @access  Private
const getRiskHistory = asyncHandler(async (req, res) => {
  const history = await prisma.riskPredictionHistory.findMany({
    where: { 
      userId: req.user.id,
      subjectId: parseInt(req.params.subjectId)
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(history);
});

// @desc    Get latest risk prediction for a subject
// @route   GET /api/risk/history/:subjectId/latest
// @access  Private
const getLatestRiskPrediction = asyncHandler(async (req, res) => {
  const latest = await prisma.riskPredictionHistory.findFirst({
    where: { 
      userId: req.user.id,
      subjectId: parseInt(req.params.subjectId)
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!latest) {
    return res.status(200).json(null);
  }

  res.status(200).json(latest);
});

// @desc    Get risk summary for dashboard
// @route   GET /api/risk/history/summary
// @access  Private
const getRiskSummary = asyncHandler(async (req, res) => {
  // We want the latest record for each subject
  // Since Prisma doesn't natively support DISTINCT ON elegantly in SQLite/MySQL sometimes,
  // we can fetch all records ordered by date descending, and keep only the first one per subject.
  const allHistory = await prisma.riskPredictionHistory.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      subject: true // we need subject name
    }
  });

  if (allHistory.length === 0) {
    return res.status(200).json({
      hasData: false,
      totalSubjects: 0,
      highRiskCount: 0,
      decliningCount: 0,
      latestItem: null,
      needsAttention: []
    });
  }

  // Filter to keep only the latest per subject
  const subjectMap = new Map();
  for (const item of allHistory) {
    if (!subjectMap.has(item.subjectId)) {
      subjectMap.set(item.subjectId, item);
    }
  }

  const latestPerSubject = Array.from(subjectMap.values());
  const highRiskSubjects = latestPerSubject.filter(item => item.riskLevel === 'High Risk');
  const decliningSubjects = latestPerSubject.filter(item => item.trend === 'Declining');
  
  // Needs attention: High Risk OR Declining
  const needsAttention = latestPerSubject.filter(item => item.riskLevel === 'High Risk' || item.trend === 'Declining');

  // Overall latest item is just the first item of allHistory
  const latestItem = allHistory[0];

  res.status(200).json({
    hasData: true,
    totalSubjects: latestPerSubject.length,
    highRiskCount: highRiskSubjects.length,
    decliningCount: decliningSubjects.length,
    latestItem,
    needsAttention: needsAttention.slice(0, 5) // max 5 for UI
  });
});

// @desc    Delete a risk history record
// @route   DELETE /api/risk/history/:id
// @access  Private
const deleteRiskHistory = asyncHandler(async (req, res) => {
  const history = await prisma.riskPredictionHistory.findUnique({
    where: { id: parseInt(req.params.id) }
  });

  if (!history || history.userId !== req.user.id) {
    res.status(404);
    throw new Error('Risk history not found or unauthorized');
  }

  await prisma.riskPredictionHistory.delete({
    where: { id: parseInt(req.params.id) }
  });

  res.status(200).json({ success: true, message: 'Risk history removed' });
});

module.exports = {
  predictRisk,
  saveRiskHistory,
  getRiskHistory,
  getLatestRiskPrediction,
  getRiskSummary,
  deleteRiskHistory
};