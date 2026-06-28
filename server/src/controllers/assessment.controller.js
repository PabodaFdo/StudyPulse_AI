const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');

const prisma = new PrismaClient();

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Private
const createAssessment = asyncHandler(async (req, res) => {
  const { subjectId, title, type, mark, weight, assessmentDate, notes } = req.body;

  if (!subjectId || !title || !type || mark === undefined || weight === undefined) {
    res.status(400);
    throw new Error('Please provide subjectId, title, type, mark, and weight');
  }

  const markNum = parseFloat(mark);
  const weightNum = parseFloat(weight);

  if (markNum < 0 || markNum > 100) {
    res.status(400);
    throw new Error('Mark must be between 0 and 100');
  }

  if (weightNum <= 0 || weightNum > 100) {
    res.status(400);
    throw new Error('Weight must be greater than 0 and less than or equal to 100');
  }

  // Verify subject belongs to user
  const subject = await prisma.subject.findFirst({
    where: { id: parseInt(subjectId), userId: req.user.id }
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found or unauthorized');
  }

  // Check total weight limit
  const existingAssessments = await prisma.assessment.findMany({
    where: { userId: req.user.id, subjectId: parseInt(subjectId) }
  });

  const currentTotalWeight = existingAssessments.reduce((acc, curr) => acc + curr.weight, 0);
  const newTotalWeight = currentTotalWeight + weightNum;

  if (Number(newTotalWeight.toFixed(2)) > 100) {
    res.status(400);
    throw new Error('Total assessment weight cannot exceed 100%. Please adjust existing weights first.');
  }

  const assessment = await prisma.assessment.create({
    data: {
      userId: req.user.id,
      subjectId: parseInt(subjectId),
      title,
      type,
      mark: markNum,
      weight: weightNum,
      assessmentDate: assessmentDate ? new Date(assessmentDate) : null,
      notes: notes || null
    }
  });

  res.status(201).json(assessment);
});

// @desc    Get all assessments for logged in user
// @route   GET /api/assessments
// @access  Private
const getAssessments = asyncHandler(async (req, res) => {
  const assessments = await prisma.assessment.findMany({
    where: { userId: req.user.id },
    include: { subject: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  res.json(assessments);
});

// @desc    Get assessments by subject
// @route   GET /api/assessments/subject/:subjectId
// @access  Private
const getAssessmentsBySubject = asyncHandler(async (req, res) => {
  const assessments = await prisma.assessment.findMany({
    where: { 
      userId: req.user.id,
      subjectId: parseInt(req.params.subjectId)
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(assessments);
});

// @desc    Get assessment summary for a subject
// @route   GET /api/assessments/subject/:subjectId/summary
// @access  Private
const getAssessmentSummary = asyncHandler(async (req, res) => {
  const subjectId = parseInt(req.params.subjectId);

  const assessments = await prisma.assessment.findMany({
    where: { 
      userId: req.user.id,
      subjectId: subjectId
    }
  });

  if (assessments.length === 0) {
    return res.json({
      success: true,
      data: {
        subjectId,
        totalAssessments: 0,
        totalWeight: 0,
        weightedAverage: null,
        remainingWeight: 100,
        breakdown: {},
        assessments: []
      }
    });
  }

  let totalWeight = 0;
  let sumProduct = 0;
  const breakdown = {};

  assessments.forEach(a => {
    totalWeight += a.weight;
    sumProduct += (a.mark * a.weight);
    breakdown[a.type] = (breakdown[a.type] || 0) + a.weight;
  });

  const weightedAverage = totalWeight > 0 ? (sumProduct / totalWeight) : null;
  const finalWeightedAverage = weightedAverage !== null ? Number(weightedAverage.toFixed(2)) : null;

  res.json({
    success: true,
    data: {
      subjectId,
      totalAssessments: assessments.length,
      totalWeight,
      weightedAverage: finalWeightedAverage,
      remainingWeight: Math.max(0, 100 - totalWeight),
      breakdown,
      assessments
    }
  });
});

// @desc    Update an assessment
// @route   PUT /api/assessments/:id
// @access  Private
const updateAssessment = asyncHandler(async (req, res) => {
  const { title, type, mark, weight, assessmentDate, notes } = req.body;
  const id = req.params.id;

  const assessment = await prisma.assessment.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found or unauthorized');
  }

  const dataToUpdate = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (type !== undefined) dataToUpdate.type = type;
  if (mark !== undefined) dataToUpdate.mark = parseFloat(mark);
  if (assessmentDate !== undefined) dataToUpdate.assessmentDate = assessmentDate ? new Date(assessmentDate) : null;
  if (notes !== undefined) dataToUpdate.notes = notes;

  if (weight !== undefined) {
    const weightNum = parseFloat(weight);
    if (weightNum <= 0 || weightNum > 100) {
      res.status(400);
      throw new Error('Weight must be greater than 0 and less than or equal to 100');
    }

    const otherAssessments = await prisma.assessment.findMany({
      where: {
        userId: req.user.id,
        subjectId: assessment.subjectId,
        NOT: { id }
      }
    });

    const totalOtherWeight = otherAssessments.reduce((acc, curr) => acc + curr.weight, 0);
    const newTotalWeight = totalOtherWeight + weightNum;

    if (Number(newTotalWeight.toFixed(2)) > 100) {
      res.status(400);
      throw new Error('Total assessment weight cannot exceed 100%. Please adjust existing weights first.');
    }

    dataToUpdate.weight = weightNum;
  }

  const updatedAssessment = await prisma.assessment.update({
    where: { id },
    data: dataToUpdate
  });

  res.json(updatedAssessment);
});

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private
const deleteAssessment = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const assessment = await prisma.assessment.findFirst({
    where: { id, userId: req.user.id }
  });

  if (!assessment) {
    res.status(404);
    throw new Error('Assessment not found or unauthorized');
  }

  await prisma.assessment.delete({
    where: { id }
  });

  res.json({ message: 'Assessment removed' });
});

module.exports = {
  createAssessment,
  getAssessments,
  getAssessmentsBySubject,
  getAssessmentSummary,
  updateAssessment,
  deleteAssessment
};
