const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMoodLabel = (mood) => {
  const labels = {
    1: 'Very Low',
    2: 'Low',
    3: 'Okay',
    4: 'Good',
    5: 'Excellent'
  };
  return labels[mood] || 'Unknown';
};

const createMoodCheckIn = async (userId, data) => {
  const { mood, energyLevel, stressLevel, journalNote } = data;
  
  if (!mood || !energyLevel || !stressLevel) {
    throw new Error('Mood, energy level, and stress level are required');
  }

  const moodCheckIn = await prisma.moodCheckIn.create({
    data: {
      userId,
      mood,
      moodLabel: getMoodLabel(mood),
      energyLevel,
      stressLevel,
      journalNote: journalNote || null
    }
  });

  return moodCheckIn;
};

const getMoodCheckIns = async (userId) => {
  const checkIns = await prisma.moodCheckIn.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  return checkIns;
};

const getMoodSummary = async (userId) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const checkIns = await prisma.moodCheckIn.findMany({
    where: {
      userId,
      createdAt: {
        gte: sevenDaysAgo
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCheckIns = checkIns.length;
  if (totalCheckIns === 0) {
    return {
      totalCheckIns: 0,
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      latestCheckIn: null
    };
  }

  const averageMood = checkIns.reduce((sum, item) => sum + item.mood, 0) / totalCheckIns;
  const averageEnergy = checkIns.reduce((sum, item) => sum + item.energyLevel, 0) / totalCheckIns;
  const averageStress = checkIns.reduce((sum, item) => sum + item.stressLevel, 0) / totalCheckIns;

  return {
    totalCheckIns,
    averageMood: parseFloat(averageMood.toFixed(1)),
    averageEnergy: parseFloat(averageEnergy.toFixed(1)),
    averageStress: parseFloat(averageStress.toFixed(1)),
    latestCheckIn: checkIns[0]
  };
};

const deleteMoodCheckIn = async (userId, id) => {
  const checkIn = await prisma.moodCheckIn.findFirst({
    where: { id, userId }
  });

  if (!checkIn) {
    throw new Error('Check-in not found or you do not have permission to delete it');
  }

  await prisma.moodCheckIn.delete({
    where: { id }
  });

  return { message: 'Check-in deleted successfully' };
};

module.exports = {
  createMoodCheckIn,
  getMoodCheckIns,
  getMoodSummary,
  deleteMoodCheckIn
};
