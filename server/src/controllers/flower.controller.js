const flowerService = require('../services/flower.service');

const getFlowerCollection = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const collection = await flowerService.getFlowerCollection(userId);
    
    return res.status(200).json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('Get Flower Collection Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while retrieving flower collection.'
    });
  }
};

const checkFlowerUnlocks = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const result = await flowerService.checkFlowerUnlocks(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Flower unlock check completed',
      newlyUnlocked: result.newlyUnlocked,
      data: result.collection
    });
  } catch (error) {
    console.error('Check Flower Unlocks Error:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while checking unlocks.'
    });
  }
};

module.exports = {
  getFlowerCollection,
  checkFlowerUnlocks
};
