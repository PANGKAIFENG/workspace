# Work Management App for Independent Developers

This application helps independent developers manage their work, track time spent on tasks, and analyze productivity.

## Features

- User authentication
- Task management
- Time tracking
- Productivity analysis

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/work-management-app.git
   ```

2. Install dependencies:
   ```
   cd work-management-app
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/work_management
   JWT_SECRET=your_secret_key_here
   ```

4. Start the server:
   ```
   npm start
   ```

## Project Structure

- `config/`: Configuration files
- `controllers/`: Request handlers
- `middleware/`: Custom middleware functions
- `models/`: Database models
- `routes/`: API routes
- `utils/`: Utility functions
- `app.js`: Express application setup
- `server.js`: Server entry point

## API Endpoints

### Authentication
- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login
- `POST /api/v1/auth/logout`: Logout

### Tasks
- `GET /api/v1/tasks`: Get all tasks
- `GET /api/v1/tasks/:id`: Get a specific task
- `POST /api/v1/tasks`: Create a new task
- `PUT /api/v1/tasks/:id`: Update a task
- `DELETE /api/v1/tasks/:id`: Delete a task

### Time Records
- `POST /api/v1/time-records/start`: Start timer
- `POST /api/v1/time-records/:id/pause`: Pause timer
- `POST /api/v1/time-records/:id/resume`: Resume timer
- `POST /api/v1/time-records/:id/stop`: Stop timer 