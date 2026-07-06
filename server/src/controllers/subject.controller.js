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
  let studyHours = null;
  if (allFocusSessions.length > 0) {
    studyHours = Number((totalFocusMinutes / 60).toFixed(2));
    if (studyHours < 0.01) {
      studyHours = 0.01;
    }
  }

  const totalFocusMinutesThisWeek = recentFocusSessions.reduce((acc, curr) => acc + curr.duration, 0);
  let studyHoursPerWeek = null;
  if (recentFocusSessions.length > 0) {
    studyHoursPerWeek = Number((totalFocusMinutesThisWeek / 60).toFixed(2));
    if (studyHoursPerWeek < 0.01) {
      studyHoursPerWeek = 0.01;
    }
  }

  const focusSessionsSource = allFocusSessions.length > 0 ? "focus_sessions" : "manual_required";
  const studyHoursSource = allFocusSessions.length > 0 ? "focus_sessions" : "manual_required";

  console.log("Subject analytics focus debug:", {
    userId: req.user.id,
    subjectId: subject.id,
    focusSessionsCount: allFocusSessions.length,
    totalFocusMinutes,
    studyHours,
    focusSessions: allFocusSessions,
  });

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

  const assessments = await prisma.assessment.findMany({
    where: {
      userId: req.user.id,
      subjectId: subject.id
    }
  });

  let flashcardReviewAttempts = await prisma.flashcardReviewAttempt.findMany({
    where: {
      userId: req.user.id,
      subjectId: subject.id
    },
    orderBy: { createdAt: 'desc' }
  });

  if (flashcardReviewAttempts.length === 0) {
    const fallbackAttempts = await prisma.flashcardReviewAttempt.findMany({
      where: {
        userId: req.user.id,
        subjectId: null
      },
      orderBy: { createdAt: 'desc' }
    });
    if (fallbackAttempts.length > 0) {
      flashcardReviewAttempts = fallbackAttempts;
    }
  }

  let summaryReviewAttempts = await prisma.summaryReviewAttempt.findMany({
    where: {
      userId: req.user.id,
      subjectId: subject.id
    },
    orderBy: { createdAt: 'desc' }
  });

  if (summaryReviewAttempts.length === 0) {
    const fallbackSummaryAttempts = await prisma.summaryReviewAttempt.findMany({
      where: {
        userId: req.user.id,
        subjectId: null
      },
      orderBy: { createdAt: 'desc' }
    });
    if (fallbackSummaryAttempts.length > 0) {
      summaryReviewAttempts = fallbackSummaryAttempts;
    }
  }

  let assessmentTotalWeight = 0;
  let sumProduct = 0;
  assessments.forEach(a => {
    assessmentTotalWeight += a.weight;
    sumProduct += (a.mark * a.weight);
  });
  
  const assessmentWeightedAverage = assessmentTotalWeight > 0 ? Number((sumProduct / assessmentTotalWeight).toFixed(2)) : null;
  const assessmentCount = assessments.length;

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

  // Study Engagement Calculation (Version 2 with Flashcards)
  const safeStudyHours = studyHours || 0;
  const safeFocusSessionsCount = allFocusSessions.length;
  
  const quizActivity = Math.min(quizAttemptCount / 3, 1) * 20;
  const focusHoursScore = Math.min(safeStudyHours / 5, 1) * 9;
  const focusSessionsScore = Math.min(safeFocusSessionsCount / 3, 1) * 6;
  const focusActivity = focusHoursScore + focusSessionsScore;
  const notesActivity = Math.min(notesCount / 3, 1) * 15;
  const assessmentActivity = Math.min(assessmentCount / 2, 1) * 15;

  let attemptsScore = 0;
  if (flashcardReviewAttempts.length === 1) attemptsScore = 2;
  else if (flashcardReviewAttempts.length === 2) attemptsScore = 4;
  else if (flashcardReviewAttempts.length >= 3) attemptsScore = 5;

  let totalReviewedCards = 0;
  let totalAccuracySum = 0;
  flashcardReviewAttempts.forEach(attempt => {
    totalReviewedCards += attempt.reviewedCards;
    totalAccuracySum += attempt.accuracy;
  });

  let reviewedCardsScore = 0;
  if (totalReviewedCards >= 1 && totalReviewedCards <= 5) reviewedCardsScore = 2;
  else if (totalReviewedCards >= 6 && totalReviewedCards <= 15) reviewedCardsScore = 4;
  else if (totalReviewedCards >= 16) reviewedCardsScore = 5;

  let avgAccuracy = 0;
  if (flashcardReviewAttempts.length > 0) {
    avgAccuracy = totalAccuracySum / flashcardReviewAttempts.length;
  }

  let accuracyScore = 0;
  if (avgAccuracy >= 80) accuracyScore = 5;
  else if (avgAccuracy >= 60) accuracyScore = 4;
  else if (avgAccuracy >= 40) accuracyScore = 3;
  else if (avgAccuracy > 0) accuracyScore = 2;

  const flashcardActivity = attemptsScore + reviewedCardsScore + accuracyScore;

  let summaryAttemptsScore = 0;
  if (summaryReviewAttempts.length === 1) summaryAttemptsScore = 2;
  else if (summaryReviewAttempts.length === 2) summaryAttemptsScore = 3;
  else if (summaryReviewAttempts.length >= 3) summaryAttemptsScore = 4;

  let totalSummaryReviewTime = 0;
  summaryReviewAttempts.forEach(attempt => {
    totalSummaryReviewTime += attempt.readDurationSeconds;
  });

  let summaryTimeScore = 0;
  if (totalSummaryReviewTime > 0 && totalSummaryReviewTime <= 60) summaryTimeScore = 1;
  else if (totalSummaryReviewTime > 60 && totalSummaryReviewTime <= 300) summaryTimeScore = 2;
  else if (totalSummaryReviewTime > 300) summaryTimeScore = 3;

  let summaryRecentScore = 0;
  if (summaryReviewAttempts.length > 0) {
    const latestSummaryDate = new Date(summaryReviewAttempts[0].createdAt);
    const daysSinceSummary = (new Date() - latestSummaryDate) / (1000 * 60 * 60 * 24);
    if (daysSinceSummary <= 7) summaryRecentScore = 3;
    else if (daysSinceSummary <= 14) summaryRecentScore = 2;
    else summaryRecentScore = 1;
  }

  const summaryActivity = summaryAttemptsScore + summaryTimeScore + summaryRecentScore;

  console.log("Subject analytics flashcard debug:", {
    subjectId: subject.id,
    flashcardReviewAttemptsCount: flashcardReviewAttempts.length,
    flashcardActivityScore: flashcardActivity
  });

  let latestActivityDate = null;
  const dates = [];
  if (quizAttempts.length > 0) dates.push(new Date(quizAttempts[0].createdAt));
  if (allFocusSessions.length > 0) {
    const latestFs = allFocusSessions.reduce((latest, current) => 
      new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
    );
    dates.push(new Date(latestFs.createdAt));
  }
  // For notes, we need to fetch them if we want their dates, or we can fetch the latest note date
  const latestNote = await prisma.note.findFirst({
    where: { subjectId: subject.id, userId: req.user.id },
    orderBy: { updatedAt: 'desc' }
  });
  if (latestNote) dates.push(new Date(latestNote.updatedAt));
  
  if (assessments.length > 0) {
    const latestAsst = assessments.reduce((latest, current) => {
      const lDate = latest.updatedAt ? new Date(latest.updatedAt) : new Date(latest.createdAt);
      const cDate = current.updatedAt ? new Date(current.updatedAt) : new Date(current.createdAt);
      return cDate > lDate ? current : latest;
    });
    dates.push(latestAsst.updatedAt ? new Date(latestAsst.updatedAt) : new Date(latestAsst.createdAt));
  }

  if (flashcardReviewAttempts.length > 0) {
    dates.push(new Date(flashcardReviewAttempts[0].createdAt));
  }

  if (summaryReviewAttempts.length > 0) {
    dates.push(new Date(summaryReviewAttempts[0].createdAt));
  }

  if (dates.length > 0) {
    latestActivityDate = new Date(Math.max(...dates));
  }

  let recentActivity = 0;
  if (latestActivityDate) {
    const daysSinceLatestActivity = (new Date() - latestActivityDate) / (1000 * 60 * 60 * 24);
    if (daysSinceLatestActivity <= 7) {
      recentActivity = 10;
    } else if (daysSinceLatestActivity <= 14) {
      recentActivity = 5;
    } else {
      recentActivity = 0;
    }
  }

  const studyEngagementScore = Math.round(quizActivity + focusActivity + notesActivity + flashcardActivity + summaryActivity + assessmentActivity + recentActivity);
  
  let studyEngagementLevel = "Low";
  if (studyEngagementScore >= 75) studyEngagementLevel = "High";
  else if (studyEngagementScore >= 50) studyEngagementLevel = "Moderate";

  const studyEngagementBreakdown = {
    quizActivity: Math.round(quizActivity),
    focusActivity: Math.round(focusActivity),
    notesActivity: Math.round(notesActivity),
    flashcardActivity: Math.round(flashcardActivity),
    summaryActivity: Math.round(summaryActivity),
    assessmentActivity: Math.round(assessmentActivity),
    recentActivity: Math.round(recentActivity)
  };

  const engagementMetrics = {
    quizAttemptCount,
    averageQuizScore: quizAttemptAverage ? Number(quizAttemptAverage.toFixed(2)) : 0,
    focusSessions: safeFocusSessionsCount,
    studyHours: safeStudyHours,
    notesCount,
    assessmentCount,
    latestActivityDate: latestActivityDate ? latestActivityDate.toISOString() : null
  };

  // Keep compatibility with Subject Health
  let attendancePercentage = studyEngagementScore;
  let attendanceSource = "study_engagement";

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

  if (assessmentWeightedAverage !== null) {
    avgMark = assessmentWeightedAverage;
    avgMarkSource = "assessments";
  } else if (quizAttempts.length > 0) {
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
    assessmentTotalWeight,
    assessmentCount,
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
    totalWrongAnswers,
    studyEngagementScore,
    studyEngagementLevel,
    studyEngagementSource: "calculated_from_app_activity",
    studyEngagementBreakdown,
    engagementMetrics
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
