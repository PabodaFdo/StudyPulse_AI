const express = require('express');
const router = express.Router();
const revisionController = require('../controllers/revision.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/reminders', revisionController.getRevisionReminders);
router.post('/reminders/generate', revisionController.generateRevisionReminders);
router.patch('/reminders/:id/complete', revisionController.completeRevisionReminder);
router.patch('/reminders/:id/snooze', revisionController.snoozeRevisionReminder);
router.delete('/reminders/:id', revisionController.deleteRevisionReminder);

module.exports = router;
