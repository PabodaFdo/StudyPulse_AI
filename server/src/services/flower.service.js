const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const FLOWER_CATALOG = [
  {
    flowerKey: "rose",
    flowerName: "Rose",
    rarity: "Common",
    unlockCondition: "Complete your first study quest",
  },
  {
    flowerKey: "sunflower",
    flowerName: "Sunflower",
    rarity: "Common",
    unlockCondition: "Reach 100 Study Garden growth points",
  },
  {
    flowerKey: "lotus",
    flowerName: "Lotus",
    rarity: "Rare",
    unlockCondition: "Complete 5 focus sessions",
  },
  {
    flowerKey: "orchid",
    flowerName: "Orchid",
    rarity: "Rare",
    unlockCondition: "Complete 3 revision reminders",
  },
  {
    flowerKey: "cherry_blossom",
    flowerName: "Cherry Blossom",
    rarity: "Epic",
    unlockCondition: "Complete 5 mood check-ins",
  },
  {
    flowerKey: "lavender",
    flowerName: "Lavender",
    rarity: "Epic",
    unlockCondition: "Reach 250 Study Garden growth points",
  }
];

const getFlowerCollection = async (userId) => {
  const dbFlowers = await prisma.flowerCollection.findMany({
    where: { userId }
  });

  const unlockedMap = {};
  dbFlowers.forEach(f => {
    unlockedMap[f.flowerKey] = f;
  });

  const collection = FLOWER_CATALOG.map(catalogItem => {
    const unlockedData = unlockedMap[catalogItem.flowerKey];
    if (unlockedData) {
      return {
        ...catalogItem,
        isUnlocked: true,
        unlockReason: unlockedData.unlockReason,
        unlockedAt: unlockedData.unlockedAt
      };
    }
    return {
      ...catalogItem,
      isUnlocked: false
    };
  });

  const unlockedFlowers = collection.filter(f => f.isUnlocked);
  const lockedFlowers = collection.filter(f => !f.isUnlocked);

  return {
    unlockedFlowers,
    lockedFlowers,
    totalFlowers: FLOWER_CATALOG.length,
    unlockedCount: unlockedFlowers.length,
    progressPercentage: Math.round((unlockedFlowers.length / FLOWER_CATALOG.length) * 100) || 0
  };
};

const checkFlowerUnlocks = async (userId) => {
  let newlyUnlocked = [];

  const existingFlowers = await prisma.flowerCollection.findMany({
    where: { userId },
    select: { flowerKey: true }
  });
  const existingSet = new Set(existingFlowers.map(f => f.flowerKey));

  const unlockFlower = async (key, reason) => {
    if (existingSet.has(key)) return;
    try {
      const catalogItem = FLOWER_CATALOG.find(f => f.flowerKey === key);
      await prisma.flowerCollection.create({
        data: {
          userId,
          flowerKey: key,
          flowerName: catalogItem.flowerName,
          rarity: catalogItem.rarity,
          unlockReason: reason
        }
      });
      existingSet.add(key);
      newlyUnlocked.push(catalogItem.flowerName);
    } catch (error) {
      console.error(`Error unlocking ${key} for user ${userId}:`, error.message);
    }
  };

  try {
    if (!existingSet.has('rose')) {
      const quests = await prisma.studyQuest.count({
        where: { userId, completed: true }
      });
      if (quests >= 1) {
        await unlockFlower('rose', 'Completed first study quest');
      }
    }

    if (!existingSet.has('lotus')) {
      const sessions = await prisma.focusSession.count({
        where: { userId }
      });
      if (sessions >= 5) {
        await unlockFlower('lotus', 'Completed 5 focus sessions');
      }
    }

    if (!existingSet.has('orchid')) {
      const reminders = await prisma.revisionReminder.count({
        where: { userId, status: 'Completed' }
      });
      if (reminders >= 3) {
        await unlockFlower('orchid', 'Completed 3 revision reminders');
      }
    }

    if (!existingSet.has('cherry_blossom')) {
      const moods = await prisma.moodCheckIn.count({
        where: { userId }
      });
      if (moods >= 5) {
        await unlockFlower('cherry_blossom', 'Completed 5 mood check-ins');
      }
    }

    if (!existingSet.has('sunflower') || !existingSet.has('lavender')) {
      const garden = await prisma.studyGarden.findUnique({
        where: { userId }
      });
      if (garden) {
        if (!existingSet.has('sunflower') && garden.level >= 100) {
          await unlockFlower('sunflower', 'Reached 100 Study Garden growth points');
        }
        if (!existingSet.has('lavender') && garden.level >= 250) {
          await unlockFlower('lavender', 'Reached 250 Study Garden growth points');
        }
      }
    }
  } catch (error) {
    console.error('Error during unlock checks:', error.message);
  }

  const collection = await getFlowerCollection(userId);
  return { newlyUnlocked, collection };
};

module.exports = {
  getFlowerCollection,
  checkFlowerUnlocks
};
