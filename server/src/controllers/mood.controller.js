const moodService = require('../services/mood.service');

const createMoodCheckIn = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const checkIn = await moodService.createMoodCheckIn(userId, req.body);
    return res.status(201).json(checkIn);
  } catch (error) {
    console.error('Create Mood Check-In Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while saving the mood check-in.'
    });
  }
};

const getMoodCheckIns = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const checkIns = await moodService.getMoodCheckIns(userId);
    return res.status(200).json(checkIns);
  } catch (error) {
    console.error('Get Mood Check-Ins Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving mood check-ins.'
    });
  }
};

const getMoodSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const summary = await moodService.getMoodSummary(userId);
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Get Mood Summary Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving mood summary.'
    });
  }
};

const deleteMoodCheckIn = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    const result = await moodService.deleteMoodCheckIn(userId, id);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete Mood Check-In Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while deleting the mood check-in.'
    });
  }
};

module.exports = {
  createMoodCheckIn,
  getMoodCheckIns,
  getMoodSummary,
  deleteMoodCheckIn
};
