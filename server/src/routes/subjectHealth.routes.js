const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { calculateSubjectHealth } = require('../controllers/subjectHealth.controller');

router.use(protect);

router.post('/calculate', calculateSubjectHealth);

module.exports = router;
