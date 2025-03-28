const Task = require('../models/Task');

// 获取所有任务
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 创建新任务
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, tags, dueDate, estimatedTime } = req.body;
    const task = new Task({
      title,
      description,
      user: req.user.id,
      status,
      priority,
      tags,
      dueDate,
      estimatedTime
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 更新任务
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 删除任务
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 