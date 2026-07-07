const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getRevisionReminders = async (userId, filters = {}) => {
  const { subjectId, priority, status } = filters;
  
  const where = { userId };
  if (subjectId) where.subjectId = parseInt(subjectId);
  if (priority) where.priority = priority;
  if (status) where.status = status;

  const reminders = await prisma.revisionReminder.findMany({
    where,
    include: {
      subject: {
        select: {
          name: true,
          code: true
        }
      }
    },
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' }
    ]
  });

  const statusOrder = { 'Pending': 1, 'Snoozed': 2, 'Completed': 3 };
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };

  return reminders.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    }
    return 0;
  });
};

const completeRevisionReminder = async (userId, reminderId) => {
  const reminder = await prisma.revisionReminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!reminder) throw new Error('Reminder not found');

  return await prisma.revisionReminder.update({
    where: { id: reminderId },
    data: { status: 'Completed' }
  });
};

const snoozeRevisionReminder = async (userId, reminderId, snoozeUntil) => {
  const reminder = await prisma.revisionReminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!reminder) throw new Error('Reminder not found');

  let defaultSnooze = new Date();
  defaultSnooze.setDate(defaultSnooze.getDate() + 1);

  return await prisma.revisionReminder.update({
    where: { id: reminderId },
    data: { 
      status: 'Snoozed',
      snoozeUntil: snoozeUntil ? new Date(snoozeUntil) : defaultSnooze
    }
  });
};

const deleteRevisionReminder = async (userId, reminderId) => {
  const reminder = await prisma.revisionReminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!reminder) throw new Error('Reminder not found');

  await prisma.revisionReminder.delete({
    where: { id: reminderId }
  });

  return { message: 'Deleted successfully' };
};

const generateRevisionReminders = async (userId) => {
  let createdCount = 0;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const createIfNotExists = async (data) => {
    const existing = await prisma.revisionReminder.findFirst({
      where: {
        userId: data.userId,
        title: data.title,
        sourceType: data.sourceType || null,
        sourceId: data.sourceId || null,
        status: 'Pending'
      }
    });

    if (!existing) {
      await prisma.revisionReminder.create({ data });
      createdCount++;
    }
  };

  try {
    const records = await prisma.academicRecord.findMany({ where: { userId } });
    for (const record of records) {
      if (record.quizAverage !== null && record.quizAverage < 60) {
        await createIfNotExists({
          userId,
          subjectId: record.subjectId,
          title: 'Revise quiz mistakes',
          description: `Your quiz average for this subject is ${record.quizAverage}%. Review previous quizzes to improve.`,
          priority: 'High',
          sourceType: 'AcademicRecord',
          sourceId: record.id.toString(),
          dueDate: tomorrow
        });
      }
      if (record.assignmentAverage !== null && record.assignmentAverage < 60) {
        await createIfNotExists({
          userId,
          subjectId: record.subjectId,
          title: 'Review assignment weak areas',
          description: `Your assignment average is ${record.assignmentAverage}%. Go over the feedback to improve.`,
          priority: 'Medium',
          sourceType: 'AcademicRecord',
          sourceId: record.id.toString(),
          dueDate: tomorrow
        });
      }
      if (record.previousExamMark !== null && record.previousExamMark < 60) {
        await createIfNotExists({
          userId,
          subjectId: record.subjectId,
          title: 'Revise exam weak topics',
          description: `Your previous exam mark was ${record.previousExamMark}%. Focus on challenging topics before the next one.`,
          priority: 'High',
          sourceType: 'AcademicRecord',
          sourceId: record.id.toString(),
          dueDate: tomorrow
        });
      }
    }
  } catch (err) {
    console.error('Error checking academic records for reminders:', err);
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        userId,
        createdAt: { lte: sevenDaysAgo }
      },
      take: 5
    });
    for (const note of notes) {
      await createIfNotExists({
        userId,
        subjectId: note.subjectId,
        title: `Review old study notes: ${note.title}`,
        priority: 'Medium',
        sourceType: 'Note',
        sourceId: note.id.toString(),
        dueDate: tomorrow
      });
    }
  } catch (err) {
    console.error('Error checking notes for reminders:', err);
  }

  if (createdCount === 0) {
    await createIfNotExists({
      userId,
      title: 'Plan your next revision session',
      description: 'Choose one subject and revise your latest notes or quiz mistakes.',
      priority: 'Medium',
      dueDate: tomorrow
    });
  }

  const allReminders = await getRevisionReminders(userId);
  return { createdCount, reminders: allReminders };
};

module.exports = {
  getRevisionReminders,
  generateRevisionReminders,
  completeRevisionReminder,
  snoozeRevisionReminder,
  deleteRevisionReminder
};
