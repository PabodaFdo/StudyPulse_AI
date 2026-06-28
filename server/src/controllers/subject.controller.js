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

  const allFocusSessions = await prisma.focusSession.findMany({
    where: { 
      subjectId: subject.id, 
      userId: req.user.id
    }
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFocusSessions = allFocusSessions.filter(fs => new Date(fs.createdAt) >= sevenDaysAgo);

  const focusSessionsCompleted = allFocusSessions.length > 0 ? allFocusSessions.length : null;
  const focusSessionsThisWeek = recentFocusSessions.length;
  
  const totalFocusMinutes = allFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const studyHours = allFocusSessions.length > 0 ? Number((totalFocusMinutes / 60).toFixed(1)) : null;

  const totalFocusMinutesThisWeek = recentFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const studyHoursPerWeek = recentFocusSessions.length > 0 ? Number((totalFocusMinutesThisWeek / 60).toFixed(1)) : null;

  const focusSessionsSource = allFocusSessions.length > 0 ? "focus_sessions" : "manual_required";
  const studyHoursSource = allFocusSessions.length > 0 ? "focus_sessions" : "manual_required";

  const notesCount = await prisma.note.count({
    where: { subjectId: subject.id, userId: req.user.id }
  });
  const finalNotesCount = notesCount;
  const notesCountSource = "smart_notes";

  const quizAttempts = await prisma.quizAttempt.findMany({
    where: {
      userId: req.user.id,
      subjectId: subject.id
    },
    orderBy: { createdAt: 'desc' }
  });

  let quizAttemptAverage = null;
  let quizAttemptCount = 0;
  let latestQuizScore = null;
  let bestQuizScore = null;
  let totalWrongAnswers = 0;

  if (quizAttempts.length > 0) {
    quizAttemptCount = quizAttempts.length;
    let totalScore = 0;
    
    quizAttempts.forEach(attempt => {
      totalScore += attempt.percentage;
      totalWrongAnswers += (attempt.totalQuestions - attempt.score);
      if (bestQuizScore === null || attempt.percentage > bestQuizScore) {
        bestQuizScore = attempt.percentage;
      }
    });
    
    quizAttemptAverage = totalScore / quizAttemptCount;
    latestQuizScore = quizAttempts[0].percentage;
  }

  let finalQuizAverage = null;
  let quizAverageSource = "manual_required";
  
  if (quizAttempts.length > 0) {
    finalQuizAverage = quizAttemptAverage;
    quizAverageSource = "quiz_attempts";
  } else if (latestRecord && latestRecord.quizAverage !== null) {
    finalQuizAverage = latestRecord.quizAverage;
    quizAverageSource = "academic_records";
  }

  let attendancePercentage = null;
  let attendanceSource = "manual_required";
  if (latestRecord && latestRecord.attendancePercentage !== null) {
    attendancePercentage = latestRecord.attendancePercentage;
    attendanceSource = "academic_records";
  }

  let assignmentAverage = null;
  let assignmentSource = "manual_required";
  if (latestRecord && latestRecord.assignmentAverage !== null) {
    assignmentAverage = latestRecord.assignmentAverage;
    assignmentSource = "academic_records";
  }

  let missedDeadlines = null;
  let missedDeadlinesSource = "manual_required";
  if (latestRecord && latestRecord.missedDeadlines !== null) {
    missedDeadlines = latestRecord.missedDeadlines;
    missedDeadlinesSource = "academic_records";
  }

  let previousExamMark = null;
  let previousExamMarkSource = "manual_required";
  if (latestRecord && latestRecord.previousExamMark !== null) {
    previousExamMark = latestRecord.previousExamMark;
    previousExamMarkSource = "academic_records";
  }

  let examMark = null;
  let examMarkSource = "manual_required";
  if (latestRecord && latestRecord.examMark !== null) {
    examMark = latestRecord.examMark;
    examMarkSource = "academic_records";
  }

  let avgMark = null;
  let avgMarkSource = "manual_required";

  if (quizAttempts.length > 0) {
    avgMark = quizAttemptAverage;
    avgMarkSource = "quiz_attempts";
  } else if (examMark !== null) {
    avgMark = examMark;
    avgMarkSource = "academic_records";
  } else if (latestRecord?.grade) {
    const g = latestRecord.grade.toUpperCase();
    if (g.includes('A')) avgMark = 90;
    else if (g.includes('B')) avgMark = 80;
    else if (g.includes('C')) avgMark = 70;
    else if (g.includes('D')) avgMark = 60;
    else avgMark = 50;
    avgMarkSource = "academic_records";
  }

  const analytics = {
    subjectId: subject.id,
    subjectName: subject.name,
    attendancePercentage,
    attendanceSource,
    avgMark,
    avgMarkSource,
    quizAverage: finalQuizAverage,
    quizAverageSource,
    studyHours,
    studyHoursPerWeek,
    studyHoursSource,
    focusSessions: focusSessionsCompleted,
    focusSessionsCompleted,
    focusSessionsThisWeek,
    focusSessionsSource,
    notesCount: finalNotesCount,
    notesCountSource,
    missedDeadlines,
    missedDeadlinesSource,
    examMark,
    examMarkSource,
    quizAttemptAverage,
    quizAttemptCount,
    latestQuizScore,
    bestQuizScore,
    totalWrongAnswers
  };

  res.status(200).json(analytics);
});

// @desc    Get overall user analytics
// @route   GET /api/subjects/analytics/overall
// @access  Private
const getOverallAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const records = await prisma.academicRecord.findMany({
    where: { userId }
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentFocusSessions = await prisma.focusSession.findMany({
    where: { 
      userId,
      createdAt: { gte: sevenDaysAgo }
    }
  });

  let totalAttendance = 0, totalAssignment = 0, totalQuiz = 0, totalPrevExam = 0;
  let countAttendance = 0, countAssignment = 0, countQuiz = 0, countPrevExam = 0;
  let totalMissedDeadlines = 0;

  records.forEach(r => {
    if (r.attendancePercentage != null) { totalAttendance += r.attendancePercentage; countAttendance++; }
    if (r.assignmentAverage != null) { totalAssignment += r.assignmentAverage; countAssignment++; }
    if (r.quizAverage != null) { totalQuiz += r.quizAverage; countQuiz++; }
    if (r.previousExamMark != null) { totalPrevExam += r.previousExamMark; countPrevExam++; }
    if (r.missedDeadlines != null) { totalMissedDeadlines += r.missedDeadlines; }
  });

  const focusSessionsCompleted = recentFocusSessions.length;
  const totalFocusMinutes = recentFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);
  const studyHoursPerWeek = totalFocusMinutes > 0 ? Number((totalFocusMinutes / 60).toFixed(1)) : 0;

  const analytics = {
    attendancePercentage: countAttendance > 0 ? Number((totalAttendance / countAttendance).toFixed(1)) : 0,
    assignmentAverage: countAssignment > 0 ? Number((totalAssignment / countAssignment).toFixed(1)) : 0,
    quizAverage: countQuiz > 0 ? Number((totalQuiz / countQuiz).toFixed(1)) : 0,
    studyHoursPerWeek: studyHoursPerWeek,
    focusSessionsCompleted: focusSessionsCompleted,
    missedDeadlines: totalMissedDeadlines,
    previousExamMark: countPrevExam > 0 ? Number((totalPrevExam / countPrevExam).toFixed(1)) : 0,
  };

  res.status(200).json(analytics);
});

module.exports = {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectAnalytics,
  getOverallAnalytics
};
