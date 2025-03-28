const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, taskController.getAllTasks);
router.post('/', authMiddleware, taskController.createTask);
router.put('/:id', authMiddleware, taskController.updateTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router; 