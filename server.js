const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 导入数据库配置
const { initDatabase, testConnection } = require('./config/db');

// 创建 Express 应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 导入路由
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const navigationRoutes = require('./routes/navigation');
const permissionRoutes = require('./routes/permission');

// 使用路由
app.use('/api', authRoutes);
app.use('/api', weatherRoutes);
app.use('/api', navigationRoutes);
app.use('/api/permission', permissionRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    // 测试数据库连接
    await testConnection();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// 启动服务器
startServer();