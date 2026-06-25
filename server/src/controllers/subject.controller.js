const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get all subjects for user
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await prisma.subject.findMany({
    where: { userId: req.user.id }
  });
  res.status(200).json(subjects);
});

// @desc    Create a subject
// @route   POST /api/subjects
// @access  Private
const createSubject = asyncHandler(async (req, res) => {
  const subjectName = req.body.subjectName || req.body.name;
  
  if (!subjectName) {
    res.status(400);
    throw new Error('Please provide a subject name');
  }

  const subject = await prisma.subject.create({
    data: {
      name: subjectName,
      ...(req.body.code !== undefined && { code: req.body.code }),
      ...(req.body.credits !== undefined && { credits: Number(req.body.credits) }),
      ...(req.body.gradeTarget !== undefined && { gradeTarget: req.body.gradeTarget }),
      ...(req.body.currentStanding !== undefined && { currentStanding: req.body.currentStanding }),
      ...(req.body.status !== undefined && { status: req.body.status }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      userId: req.user.id
    }
  });
  res.status(201).json(subject);
});

// @desc    Get a single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id }
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  res.status(200).json(subject);
});

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id }
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const subjectName = req.body.subjectName || req.body.name;
  const { code, credits, gradeTarget, currentStanding, status, description } = req.body;

  const updateData = {};

  if (subjectName !== undefined) updateData.name = subjectName;
  if (code !== undefined) updateData.code = code;
  if (credits !== undefined) updateData.credits = Number(credits);
  if (gradeTarget !== undefined) updateData.gradeTarget = gradeTarget;
  if (currentStanding !== undefined) updateData.currentStanding = currentStanding;
  if (status !== undefined) updateData.status = status;
  if (description !== undefined) updateData.description = description;

  const updatedSubject = await prisma.subject.update({
    where: { id: subject.id },
    data: updateData
  });

  res.status(200).json(updatedSubject);
});

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await prisma.subject.findFirst({
    where: { id: Number(req.params.id), userId: req.user.id }
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  await prisma.subject.delete({
    where: { id: subject.id }
  });

  res.status(200).json({ id: req.params.id });
});

// @desc    Get subject analytics
// @route   GET /api/subjects/:id/analytics
// @access  Private
const getSubjectAnalytics = asyncHandler(async (req, res) => {
  const subjectId = Number(req.params.id);
  
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId: req.user.id }
  });

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const latestRecord = await prisma.academicRecord.findFirst({
    where: { subjectId: subject.id, userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFocusSessions = await prisma.focusSession.findMany({
    where: { 
      subjectId: subject.id, 
      userId: req.user.id,
      createdAt: { gte: sevenDaysAgo }
    }
  });

  const focusSessionsCompleted = recentFocusSessions.length;
  const totalFocusMinutes = recentFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const studyHoursPerWeek = totalFocusMinutes > 0 ? Number((totalFocusMinutes / 60).toFixed(1)) : 0;

  const notesCount = await prisma.note.count({
    where: { subjectId: subject.id, userId: req.user.id }
  });

  let averageMark = latestRecord?.examMark || 0;
  if (latestRecord?.grade && averageMark === 0) {
    const g = latestRecord.grade.toUpperCase();
    if (g.includes('A')) averageMark = 90;
    else if (g.includes('B')) averageMark = 80;
    else if (g.includes('C')) averageMark = 70;
    else if (g.includes('D')) averageMark = 60;
    else averageMark = 50;
  }

  const analytics = {
    subjectId: subject.id,
    subjectName: subject.name,
    attendancePercentage: latestRecord?.attendancePercentage || 0,
    assignmentAverage: latestRecord?.assignmentAverage || 0,
    quizAverage: latestRecord?.quizAverage || 0,
    studyHoursPerWeek: studyHoursPerWeek,
    focusSessionsCompleted: focusSessionsCompleted,
    missedDeadlines: latestRecord?.missedDeadlines || 0,
    previousExamMark: latestRecord?.previousExamMark || 0,
    examMark: latestRecord?.examMark || 0,
    averageMark: averageMark,
    notesCount: notesCount
  };

  res.status(200).json(analytics);
});

module.exports = {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectAnalytics
};
