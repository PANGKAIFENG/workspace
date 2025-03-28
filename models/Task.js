const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: { 
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{ type: String }],
  dueDate: { type: Date },
  estimatedTime: { type: Number }, // 估计完成时间(分钟)
  actualTime: { type: Number, default: 0 }, // 实际花费时间(分钟)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema); 