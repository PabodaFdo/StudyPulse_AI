const express = require('express');
const router = express.Router();

const {
  createMoodCheckIn,
  getMoodCheckIns,
  getMoodSummary,
  deleteMoodCheckIn,
} = require('../controllers/mood.controller');

const { protect } = require('../middleware/auth.middleware');

router.post('/check-ins', protect, createMoodCheckIn);
router.get('/check-ins', protect, getMoodCheckIns);
router.get('/summary', protect, getMoodSummary);
router.delete('/check-ins/:id', protect, deleteMoodCheckIn);

module.exports = router;
