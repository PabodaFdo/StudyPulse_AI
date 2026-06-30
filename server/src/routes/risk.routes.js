const express = require('express');
const router = express.Router();
const { 
  predictRisk, 
  saveRiskHistory, 
  getRiskHistory, 
  getLatestRiskPrediction, 
  getRiskSummary,
  deleteRiskHistory 
} = require('../controllers/risk.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/predict', predictRisk);
router.post('/history', saveRiskHistory);
router.get('/history/summary', getRiskSummary);
router.get('/history/:subjectId', getRiskHistory);
router.get('/history/:subjectId/latest', getLatestRiskPrediction);
router.delete('/history/:id', deleteRiskHistory);

module.exports = router;