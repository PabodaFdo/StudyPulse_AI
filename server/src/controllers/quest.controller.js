const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../utils/asyncHandler');
const { addGrowthPoints } = require('../services/garden.service');

const prisma = new PrismaClient();

const calculateQuestProgress = async (quest) => {
  let progress = 0;
  let target = quest.targetCount || 1;
  const userId = quest.userId;
  const title = quest.title.toLowerCase();
  
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  
  if (quest.type === 'WEEKLY') {
    // Get start of the current week (Sunday or Monday, let's just subtract current day to get Sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());
  }
  
  if (title.includes('pomodoro') || title.includes('focus marathon')) {
    progress = await prisma.focusSession.count({
      where: { 
        userId, 
        duration: { gte: 25 },
        createdAt: { gte: startDate }
      }
    });
  } else if (title.includes('synthesis') || title.includes('folder maintenance')) {
    progress = await prisma.note.count({
      where: { 
        userId,
        createdAt: { gte: startDate }
      }
    });
  } else if (title.includes('academic starter')) {
    progress = await prisma.academicRecord.count({
      where: { 
        userId,
        createdAt: { gte: startDate }
      }
    });
  }
  
  return { progress, target, targetReached: progress >= target };
};

// @desc    Get user's study quests (seeds default quests if empty)
// @route   GET /api/quests
// @access  Private
const getQuests = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  let quests = await prisma.studyQuest.findMany({
    where: { userId },
    orderBy: { id: 'asc' }
  });

  // Re-seed if user doesn't have exactly 5 quests (our new standard)
  if (quests.length !== 5) {
    await prisma.studyQuest.deleteMany({ where: { userId } });
    
    await prisma.studyQuest.createMany({
      data: [
        {
          userId,
          title: 'Pomodoro Focus',
          description: 'Complete one 25-minute focus session.',
          rewardPoints: 10,
          type: 'DAILY',
          targetCount: 1
        },
        {
          userId,
          title: 'Active Synthesis',
          description: 'Revise one smart note summary sheet.',
          rewardPoints: 5,
          type: 'DAILY',
          targetCount: 1
        },
        {
          userId,
          title: 'Academic Starter',
          description: 'Add one academic record.',
          rewardPoints: 3,
          type: 'DAILY',
          targetCount: 1
        },
        {
          userId,
          title: 'Focus Marathon',
          description: 'Complete five Pomodoro focus sessions.',
          rewardPoints: 40,
          type: 'WEEKLY',
          targetCount: 5
        },
        {
          userId,
          title: 'Folder Maintenance',
          description: 'Revise five smart note sheets.',
          rewardPoints: 25,
          type: 'WEEKLY',
          targetCount: 5
        }
      ]
    });
    
    quests = await prisma.studyQuest.findMany({
      where: { userId },
      orderBy: { id: 'asc' }
    });
  }

  // Compute real progress
  const enrichedQuests = await Promise.all(quests.map(async (q) => {
    const { progress, target, targetReached } = await calculateQuestProgress(q);
    return { ...q, progress, target, targetReached };
  }));

  res.json(enrichedQuests);
});

// @desc    Complete a quest
// @route   PATCH /api/quests/:id/complete
// @access  Private
const completeQuest = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const questId = parseInt(req.params.id);

  const quest = await prisma.studyQuest.findUnique({
    where: { id: questId }
  });

  if (!quest) {
    res.status(404);
    throw new Error('Quest not found');
  }

  if (quest.userId !== userId) {
    res.status(401);
    throw new Error('Not authorized to complete this quest');
  }

  if (quest.completed) {
    res.status(400);
    throw new Error('Quest is already completed');
  }

  const { targetReached, progress, target } = await calculateQuestProgress(quest);
  if (!targetReached) {
    res.status(400);
    throw new Error('Quest target has not been reached yet');
  }

  // Mark as completed
  const updatedQuest = await prisma.studyQuest.update({
    where: { id: questId },
    data: { completed: true }
  });

  // Add growth points
  await addGrowthPoints(userId, quest.rewardPoints, 'Quest Completed', quest.title);

  // Return the updated quest with progress flag
  res.json({ ...updatedQuest, progress, target, targetReached: true });
});

module.exports = {
  getQuests,
  completeQuest
};
