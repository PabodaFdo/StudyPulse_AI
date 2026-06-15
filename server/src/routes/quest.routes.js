const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getQuests, completeQuest } = require('../controllers/quest.controller');

router.use(protect);

router.get('/', getQuests);
router.patch('/:id/complete', completeQuest);

module.exports = router;
