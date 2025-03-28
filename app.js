const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const timeRecordRoutes = require('./routes/timeRecordRoutes');
const { errorHandler } = require('./utils/errorHandler');

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/time-records', timeRecordRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Work Management API' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app; 