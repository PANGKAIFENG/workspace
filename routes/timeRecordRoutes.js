const express = require('express');
const router = express.Router();
const timeRecordController = require('../controllers/timeRecordController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/start', authMiddleware, timeRecordController.startTimer);
router.post('/:id/pause', authMiddleware, timeRecordController.pauseTimer);
router.post('/:id/resume', authMiddleware, timeRecordController.resumeTimer);
router.post('/:id/stop', authMiddleware, timeRecordController.stopTimer);

module.exports = router; 