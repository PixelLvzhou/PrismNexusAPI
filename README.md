# PrismNexusAPI

后端 API 服务。

## ✨ 功能特性

- 用户认证系统
- 权限管理
- 邮件服务
- 数据管理接口

## 🛠️ 技术栈

- Node.js
- Express
- SQLite
- JWT
- Redis
- PM2

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件配置必要的环境变量。

### 初始化数据库

```bash
npm run db:init
```

### 启动开发服务器

```bash
npm run dev
```

### 生产环境部署

```bash
npm run deploy
```

## 📜 可用脚本

| 脚本 | 描述 |
|------|------|
| `start` | 启动生产服务器 |
| `dev` | 启动开发服务器 |
| `deploy` | 使用 PM2 启动生产进程 |
| `deploy:restart` | 重启 PM2 进程 |
| `deploy:stop` | 停止 PM2 进程 |
| `deploy:logs` | 查看 PM2 日志 |
| `deploy:status` | 查看 PM2 状态 |
| `db:init` | 初始化数据库 |

## 📄 许可证

ISC License
