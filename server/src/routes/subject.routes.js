const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  getSubject,
  updateSubject,
  deleteSubject,
  getSubjectAnalytics,
  getOverallAnalytics
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(createSubject);

router.route('/analytics/overall')
  .get(getOverallAnalytics);

router.route('/:id')
  .get(getSubject)
  .put(updateSubject)
  .delete(deleteSubject);

router.route('/:id/analytics')
  .get(getSubjectAnalytics);

module.exports = router;
