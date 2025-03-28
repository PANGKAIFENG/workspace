const express = require('express');
const router = express.Router();
const timeRecordController = require('../controllers/timeRecordController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Protect all time record routes

router.post('/start', timeRecordController.startTimer);
router.post('/:id/pause', timeRecordController.pauseTimer);
router.post('/:id/resume', timeRecordController.resumeTimer);
router.post('/:id/stop', timeRecordController.stopTimer);

module.exports = router; 