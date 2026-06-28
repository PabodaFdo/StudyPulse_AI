const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  createAssessment,
  getAssessments,
  getAssessmentsBySubject,
  getAssessmentSummary,
  updateAssessment,
  deleteAssessment
} = require('../controllers/assessment.controller');

const router = express.Router();

router.use(protect); // All assessment routes are protected

router.route('/')
  .post(createAssessment)
  .get(getAssessments);

router.get('/subject/:subjectId', getAssessmentsBySubject);
router.get('/subject/:subjectId/summary', getAssessmentSummary);

router.route('/:id')
  .put(updateAssessment)
  .delete(deleteAssessment);

module.exports = router;
