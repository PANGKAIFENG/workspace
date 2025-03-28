# 独立开发者工作管理应用 - 后端技术方案

## 1. 技术栈概述

本项目后端采用Node.js生态系统，基于Express框架构建RESTful API，使用MongoDB作为数据库，部署在腾讯云服务器上。

### 核心技术选型

- **运行环境**: Node.js 18+
- **Web框架**: Express.js
- **数据库**: MongoDB
- **ODM**: Mongoose
- **认证授权**: JWT (JSON Web Tokens)
- **API文档**: Swagger/OpenAPI
- **日志**: Winston + Morgan
- **测试**: Jest + Supertest
- **校验**: Joi/Yup
- **安全**: Helmet

## 2. 项目结构

```
server/
├── config/              # 配置文件
├── controllers/         # 控制器(处理请求)
├── middleware/          # 中间件
├── models/              # 数据模型
├── routes/              # 路由定义
├── services/            # 业务逻辑
├── utils/               # 工具函数
├── validation/          # 请求验证
├── app.js               # 应用入口
└── server.js            # 服务器启动
```

## 3. 数据模型设计

### 3.1 主要模型

#### 用户模型 (User)

```javascript
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  settings: {
    theme: { type: String, default: 'light' },
    notifications: { type: Boolean, default: true },
    workHoursPerDay: { type: Number, default: 8 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### 任务模型 (Task)

```javascript
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
```

#### 时间记录模型 (TimeRecord)

```javascript
const timeRecordSchema = new mongoose.Schema({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number }, // 持续时间(分钟)
  isActive: { type: Boolean, default: true },
  interruptions: [{
    reason: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number } // 中断时间(分钟)
  }],
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### 3.2 模型关系

- 一个用户有多个任务 (1:N)
- 一个任务有多个时间记录 (1:N)
- 一个用户有多个时间记录 (1:N)

## 4. API设计

### 4.1 认证相关API

- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/refresh-token` - 刷新令牌
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 4.2 任务相关API

- `GET /api/v1/tasks` - 获取所有任务
- `GET /api/v1/tasks/:id` - 获取单个任务
- `POST /api/v1/tasks` - 创建任务
- `PUT /api/v1/tasks/:id` - 更新任务
- `DELETE /api/v1/tasks/:id` - 删除任务
- `GET /api/v1/tasks/status/:status` - 按状态获取任务
- `GET /api/v1/tasks/priority/:priority` - 按优先级获取任务

### 4.3 时间记录相关API

- `GET /api/v1/time-records` - 获取所有时间记录
- `GET /api/v1/time-records/:id` - 获取单个时间记录
- `POST /api/v1/time-records` - 创建时间记录
- `PUT /api/v1/time-records/:id` - 更新时间记录
- `DELETE /api/v1/time-records/:id` - 删除时间记录
- `POST /api/v1/time-records/:id/start` - 开始计时
- `POST /api/v1/time-records/:id/pause` - 暂停计时
- `POST /api/v1/time-records/:id/resume` - 恢复计时
- `POST /api/v1/time-records/:id/stop` - 结束计时
- `POST /api/v1/time-records/:id/interruption` - 记录中断

### 4.4 统计相关API

- `GET /api/v1/statistics/daily` - 获取每日统计
- `GET /api/v1/statistics/weekly` - 获取每周统计
- `GET /api/v1/statistics/monthly` - 获取每月统计
- `GET /api/v1/statistics/by-tag` - 按标签获取统计
- `GET /api/v1/statistics/by-priority` - 按优先级获取统计
- `GET /api/v1/statistics/interruptions` - 获取中断分析

## 5. 认证与授权

### 5.1 JWT认证流程

1. 用户登录成功后，服务器生成JWT令牌
2. 令牌包含用户ID和角色信息，使用密钥签名
3. 客户端在后续请求中通过Authorization头发送令牌
4. 服务器验证令牌的有效性和完整性
5. 令牌到期后，客户端可以使用刷新令牌获取新的访问令牌

### 5.2 认证中间件

```javascript
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
```

## 6. 数据库设计

### 6.1 索引策略

为提高查询性能，在以下字段上创建索引：

- User集合: username, email
- Task集合: user, status, priority, dueDate
- TimeRecord集合: user, task, startTime, endTime

### 6.2 数据验证

使用Mongoose schema验证和自定义验证器确保数据完整性。

### 6.3 数据关系管理

使用Mongoose的populate功能处理文档间关系。

## 7. 错误处理

### 7.1 全局错误处理中间件

```javascript
// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { errorHandler, AppError };
```

## 8. 安全措施

- HTTPS加密传输
- 密码哈希存储 (bcrypt)
- 防SQL注入 (使用Mongoose参数化查询)
- XSS防护 (Helmet中间件)
- CORS配置
- 速率限制 (Express Rate Limit)
- 敏感数据脱敏

## 9. 日志管理

### 9.1 日志配置

使用Winston配置不同级别的日志，包括：

- 请求日志
- 错误日志
- 业务日志

### 9.2 日志格式

```javascript
const winston = require('winston');
const morgan = require('morgan');

// Winston日志配置
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Morgan HTTP请求日志中间件
const morganMiddleware = morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
});

module.exports = { logger, morganMiddleware };
```

## 10. 性能优化

- 数据库查询优化
- 响应压缩 (compression)
- 缓存策略 (Redis/Memory缓存)
- 分页处理大数据集
- 异步处理耗时操作

## 11. 部署与运维

### 11.1 Docker容器化

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### 11.2 环境配置

使用dotenv管理不同环境的配置。

### 11.3 监控

- 健康检查端点
- PM2进程管理
- 基本指标监控 (CPU, 内存, 响应时间)

## 12. 数据备份策略

- 自动定时备份MongoDB数据
- 支持手动触发数据备份
- 备份数据加密存储
- 灾备恢复流程

## 13. 后续扩展计划

- API速率限制细化
- WebSocket支持实时通知
- 服务拆分与微服务化（长期）
- 引入GraphQL（可选）

## 14. 迭代一具体实现

### 14.1 核心功能实现

#### 14.1.1 用户认证与授权
- 实现用户注册、登录、登出功能。
- 使用JWT进行用户认证，确保API的安全访问。
- 提供刷新令牌的机制，支持长时间会话。

#### 14.1.2 任务管理
- 提供任务的CRUD操作API。
- 支持按状态和优先级筛选任务。
- 实现任务的标签管理和截止日期设置。

#### 14.1.3 时间跟踪
- 实现时间记录的创建、更新和删除功能。
- 支持开始、暂停、恢复和结束计时。
- 提供中断记录功能，记录中断原因和时长。

### 14.2 API接口设计

#### 14.2.1 任务相关API
```javascript
// 获取所有任务
app.get('/api/v1/tasks', authMiddleware, taskController.getAllTasks);

// 创建新任务
app.post('/api/v1/tasks', authMiddleware, taskController.createTask);

// 更新任务
app.put('/api/v1/tasks/:id', authMiddleware, taskController.updateTask);

// 删除任务
app.delete('/api/v1/tasks/:id', authMiddleware, taskController.deleteTask);
```

#### 14.2.2 时间记录相关API
```javascript
// 开始计时
app.post('/api/v1/time-records/:id/start', authMiddleware, timeRecordController.startTimer);

// 暂停计时
app.post('/api/v1/time-records/:id/pause', authMiddleware, timeRecordController.pauseTimer);

// 结束计时
app.post('/api/v1/time-records/:id/stop', authMiddleware, timeRecordController.stopTimer);
```

### 14.3 数据库设计

- **任务模型**: 增加任务的标签和截止日期字段。
- **时间记录模型**: 增加中断记录字段，支持记录中断原因和时长。

### 14.4 安全性考虑

- 使用JWT进行用户认证，确保API的安全访问。
- 实现角色和权限管理，确保不同用户的访问权限。
- 使用Helmet中间件增强HTTP头的安全性。

### 14.5 性能优化策略

- 使用Mongoose的索引功能优化数据库查询性能。
- 实现API的分页功能，减少单次请求的数据量。
- 使用Redis缓存常用数据，减少数据库查询次数。

### 14.6 开发计划

#### 第一周（用户认证与任务管理）
- [x] 实现用户注册和登录功能
- [x] 实现任务的CRUD操作
- [ ] 完成任务的标签和截止日期功能

#### 第二周（时间跟踪功能）
- [ ] 实现时间记录的CRUD操作
- [ ] 开发计时器功能
- [ ] 实现中断记录功能

#### 第三周（安全性和性能优化）
- [ ] 实现JWT认证和权限管理
- [ ] 优化数据库查询性能
- [ ] 实现数据缓存功能

#### 第四周（测试和部署）
- [ ] 编写单元测试和集成测试
- [ ] 完成后端部署和监控配置
- [ ] 文档完善和代码审查 