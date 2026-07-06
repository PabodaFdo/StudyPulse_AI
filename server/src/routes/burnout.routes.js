const express = require('express');
const router = express.Router();

const { getBurnoutSummary } = require('../controllers/burnout.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/summary', protect, getBurnoutSummary);

module.exports = router;
