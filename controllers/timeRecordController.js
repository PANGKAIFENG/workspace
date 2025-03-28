const TimeRecord = require('../models/TimeRecord');
const Task = require('../models/Task');

// 开始计时
exports.startTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const timeRecord = new TimeRecord({
      task: taskId,
      user: req.user.id,
      startTime: new Date(),
      isActive: true
    });

    await timeRecord.save();
    task.status = 'in_progress';
    await task.save();

    res.status(201).json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 暂停计时
exports.pauseTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const timeRecord = await TimeRecord.findOne({ _id: id, user: req.user.id, isActive: true });
    if (!timeRecord) {
      return res.status(404).json({ error: 'Active time record not found' });
    }

    timeRecord.endTime = new Date();
    timeRecord.duration = (timeRecord.endTime - timeRecord.startTime) / 60000; // 转换为分钟
    timeRecord.isActive = false;
    await timeRecord.save();

    res.json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 恢复计时
exports.resumeTimer = async (req, res) => {
  try {
    const { taskId } = req.body;
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

// 结束计时
exports.stopTimer = async (req, res) => {
  try {
    const { id } = req.params;
    const timeRecord = await TimeRecord.findOne({ _id: id, user: req.user.id, isActive: true });
    if (!timeRecord) {
      return res.status(404).json({ error: 'Active time record not found' });
    }

    timeRecord.endTime = new Date();
    timeRecord.duration = (timeRecord.endTime - timeRecord.startTime) / 60000; // 转换为分钟
    timeRecord.isActive = false;
    await timeRecord.save();

    res.json(timeRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 