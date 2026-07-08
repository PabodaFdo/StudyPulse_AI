const express = require('express');
const router = express.Router();
const flowerController = require('../controllers/flower.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/collection', flowerController.getFlowerCollection);
router.post('/check-unlocks', flowerController.checkFlowerUnlocks);

module.exports = router;
