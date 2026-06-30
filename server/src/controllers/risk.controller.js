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
  deleteRiskHistory
};