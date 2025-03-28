const TimeRecord = require('../models/TimeRecord');
const Task = require('../models/Task');

// Start timer
exports.startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    // Check if task exists
    const task = await Task.findOne({ 
      _id: taskId, 
      user: req.user.id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Create time record
    const timeRecord = new TimeRecord({
      task: taskId,
      user: req.user.id,
      startTime: new Date(),
      isActive: true
    });
    
    await timeRecord.save();
    
    // Update task status
    task.status = 'in_progress';
    await task.save();
    
    res.status(201).json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Pause timer
exports.pauseTimer = async (req, res) => {
  try {
    const timeRecord = await TimeRecord.findOne({ 
      _id: req.params.id, 
      user: req.user.id,
      isActive: true 
    });
    
    if (!timeRecord) {
      return res.status(404).json({ error: 'Active time record not found' });
    }
    
    timeRecord.endTime = new Date();
    timeRecord.duration = (timeRecord.endTime - timeRecord.startTime) / 60000; // Convert to minutes
    timeRecord.isActive = false;
    
    await timeRecord.save();
    
    res.json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Resume timer
exports.resumeTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    // Create new time record for the resumed session
    const timeRecord = new TimeRecord({
      task: taskId,
      user: req.user.id,
      startTime: new Date(),
      isActive: true
    });
    
    await timeRecord.save();
    
    res.status(201).json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Stop timer
exports.stopTimer = async (req, res) => {
  try {
    const timeRecord = await TimeRecord.findOne({ 
      _id: req.params.id, 
      user: req.user.id,
      isActive: true 
    });
    
    if (!timeRecord) {
      return res.status(404).json({ error: 'Active time record not found' });
    }
    
    timeRecord.endTime = new Date();
    timeRecord.duration = (timeRecord.endTime - timeRecord.startTime) / 60000; // Convert to minutes
    timeRecord.isActive = false;
    
    await timeRecord.save();
    
    // Update task actual time
    const task = await Task.findById(timeRecord.task);
    if (task) {
      task.actualTime = (task.actualTime || 0) + timeRecord.duration;
      await task.save();
    }
    
    res.json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 