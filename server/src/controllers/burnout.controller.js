const burnoutService = require('../services/burnout.service');

const getBurnoutSummary = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const summary = await burnoutService.getBurnoutSummary(userId);
    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get Burnout Summary Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving burnout summary.'
    });
  }
};

module.exports = {
  getBurnoutSummary
};
