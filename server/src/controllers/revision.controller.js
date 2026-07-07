const revisionService = require('../services/revision.service');

const getRevisionReminders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { subjectId, priority, status } = req.query;
    const reminders = await revisionService.getRevisionReminders(userId, { subjectId, priority, status });
    
    return res.status(200).json({
      success: true,
      count: reminders.length,
      data: reminders
    });
  } catch (error) {
    console.error('Get Revision Reminders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving reminders.'
    });
  }
};

const generateRevisionReminders = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await revisionService.generateRevisionReminders(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Revision reminders generated successfully',
      createdCount: result.createdCount,
      data: result.reminders
    });
  } catch (error) {
    console.error('Generate Revision Reminders Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while generating reminders.'
    });
  }
};

const completeRevisionReminder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const reminder = await revisionService.completeRevisionReminder(userId, id);
    
    return res.status(200).json({
      success: true,
      message: 'Revision reminder completed successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Complete Revision Reminder Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while completing the reminder.'
    });
  }
};

const snoozeRevisionReminder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { snoozeUntil } = req.body;
    const reminder = await revisionService.snoozeRevisionReminder(userId, id, snoozeUntil);
    
    return res.status(200).json({
      success: true,
      message: 'Revision reminder snoozed successfully',
      data: reminder
    });
  } catch (error) {
    console.error('Snooze Revision Reminder Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while snoozing the reminder.'
    });
  }
};

const deleteRevisionReminder = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    await revisionService.deleteRevisionReminder(userId, id);
    
    return res.status(200).json({
      success: true,
      message: 'Revision reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete Revision Reminder Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while deleting the reminder.'
    });
  }
};

module.exports = {
  getRevisionReminders,
  generateRevisionReminders,
  completeRevisionReminder,
  snoozeRevisionReminder,
  deleteRevisionReminder
};
