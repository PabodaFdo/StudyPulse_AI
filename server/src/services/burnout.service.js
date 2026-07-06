const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getBurnoutSummary = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 1. Get mood check-ins
  const moodCheckIns = await prisma.moodCheckIn.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo }
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Get focus sessions
  const focusSessions = await prisma.focusSession.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo }
    }
  });

  // 3. Get recent academic records
  const academicRecords = await prisma.academicRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Calculate averages
  let averageMood = 0;
  let averageEnergy = 0;
  let averageStress = 0;
  let recentMoodCheckIns = moodCheckIns.length;

  if (recentMoodCheckIns > 0) {
    averageMood = moodCheckIns.reduce((sum, m) => sum + m.mood, 0) / recentMoodCheckIns;
    averageEnergy = moodCheckIns.reduce((sum, m) => sum + m.energyLevel, 0) / recentMoodCheckIns;
    averageStress = moodCheckIns.reduce((sum, m) => sum + m.stressLevel, 0) / recentMoodCheckIns;
  }

  // Calculate focus stats
  const weeklyFocusSessions = focusSessions.length;
  const totalFocusMinutes = focusSessions.reduce((sum, f) => sum + f.duration, 0);
  const weeklyFocusHours = parseFloat((totalFocusMinutes / 60).toFixed(1));

  // Burnout Risk Calculation
  let risk = 0;
  let academicPressureScore = 0;

  if (recentMoodCheckIns > 0) {
    risk += ((averageStress - 1) / 4) * 30; // Max 30
    risk += ((5 - averageEnergy) / 4) * 25; // Max 25
    risk += ((5 - averageMood) / 4) * 15; // Max 15
  }

  if (weeklyFocusHours > 25) {
    risk += 20;
  } else if (weeklyFocusHours > 18) {
    risk += 15;
  } else if (weeklyFocusHours > 12) {
    risk += 8;
  }

  if (weeklyFocusSessions >= 10 && averageEnergy <= 2) {
    risk += 10;
  }

  // Academic pressure
  if (academicRecords.length > 0) {
    academicRecords.forEach(record => {
      if (record.missedDeadlines && record.missedDeadlines > 0) {
        academicPressureScore += Math.min(record.missedDeadlines * 2, 10);
      }
      if (record.assignmentAverage && record.assignmentAverage < 60) {
        academicPressureScore += 5;
      }
      if (record.examMark && record.examMark < 50) {
        academicPressureScore += 10;
      }
    });
    academicPressureScore = Math.min(academicPressureScore, 20); // Cap at 20
    risk += academicPressureScore;
  }

  const burnoutRisk = Math.max(0, Math.min(100, Math.round(risk)));

  let riskLevel = 'Low';
  if (burnoutRisk >= 70) {
    riskLevel = 'High';
  } else if (burnoutRisk >= 40) {
    riskLevel = 'Medium';
  }

  // Generate main reasons
  const mainReasons = [];
  if (recentMoodCheckIns === 0) {
    mainReasons.push("Not enough wellness check-ins yet.");
  } else {
    if (averageStress >= 4) mainReasons.push("Average stress level is high this week.");
    if (averageEnergy <= 2) mainReasons.push("Energy level is lower than expected.");
    if (averageMood <= 2) mainReasons.push("Mood trend is low.");
  }
  if (weeklyFocusHours > 25) mainReasons.push("Focus hours are high this week.");
  if (academicPressureScore >= 10) mainReasons.push("Academic pressure appears elevated.");

  if (mainReasons.length === 0) {
    mainReasons.push("Your study and wellness balance looks healthy.");
  }

  // Generate recommendations
  const recommendations = [];
  if (recentMoodCheckIns === 0) {
    recommendations.push("Complete daily Mood Check-ins so burnout analysis can become more accurate.");
  }

  if (riskLevel === 'Low') {
    recommendations.push("Maintain your current study routine.");
    recommendations.push("Keep taking short breaks during focus sessions.");
  } else if (riskLevel === 'Medium') {
    recommendations.push("Reduce long study blocks and add recovery breaks.");
    recommendations.push("Prioritize the most important subjects instead of overloading your schedule.");
    recommendations.push("Use a lighter revision plan today.");
  } else {
    recommendations.push("Take a proper rest break before continuing intense study.");
    recommendations.push("Reduce study load for today and focus on one priority task.");
    recommendations.push("Try a short walk, hydration, and sleep recovery.");
    recommendations.push("If stress continues, talk to a trusted person or academic advisor.");
  }

  return {
    burnoutRisk,
    riskLevel,
    mainReasons,
    recommendations,
    weeklyFocusHours,
    weeklyFocusSessions,
    averageStress: parseFloat(averageStress.toFixed(1)),
    averageEnergy: parseFloat(averageEnergy.toFixed(1)),
    averageMood: parseFloat(averageMood.toFixed(1)),
    recentMoodCheckIns,
    academicPressureScore,
    generatedAt: new Date()
  };
};

module.exports = {
  getBurnoutSummary
};
