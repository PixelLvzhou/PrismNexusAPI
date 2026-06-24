# 阿里云部署指南

## 📋 部署前准备

### 1. 阿里云服务器要求
- **操作系统**: Ubuntu 20.04 LTS / CentOS 7+
- **配置**: 最低 1核1G（推荐 2核2G）
- **端口**: 开放 3000（后端API）、80/443（前端）

### 2. 域名配置（如有）
- 域名备案（国内服务器必需）
- DNS解析到服务器IP
- 配置SSL证书（推荐使用Let's Encrypt免费证书）

---

## 🚀 部署步骤

### 第一步：连接服务器

```bash
ssh root@你的服务器IP
```

### 第二步：安装Node.js环境

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**CentOS:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

验证安装：
```bash
node --version  # 应显示 v18.x.x
npm --version   # 应显示 9.x.x
```

### 第三步：安装PM2

```bash
npm install -g pm2
```

### 第四步：上传项目文件

**方式1：使用SCP**
```bash
# 在本地执行
scp -r ./backend root@你的服务器IP:/opt/
```

**方式2：使用Git**
```bash
# 在服务器上执行
cd /opt
git clone 你的仓库地址
```

### 第五步：配置环境变量

```bash
cd /opt/backend

# 复制生产环境配置
cp .env.production .env

# 编辑配置文件
nano .env
```

修改以下配置：
```env
SMTP_USER=你的QQ邮箱@qq.com
SMTP_PASS=你的SMTP授权码
JWT_SECRET=一个新的随机密钥（至少32位）
PORT=3000
```

### 第六步：初始化数据库

```bash
node init-db.js
```

### 第七步：安装依赖并启动

```bash
# 安装依赖
npm install --production

# 启动应用
pm2 start ecosystem.config.js

# 保存进程列表
pm2 save

# 设置开机自启
pm2 startup
```

### 第八步：配置Nginx反向代理（可选但推荐）

```bash
# 安装Nginx
apt-get update
apt-get install -y nginx

# 创建配置文件
nano /etc/nginx/sites-available/backend
```

写入以下内容：
```nginx
server {
    listen 80;
    server_name api.你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：
```bash
ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 第九步：配置SSL证书（可选）

使用Let's Encrypt免费证书：
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d api.你的域名.com
```

---

## 🔧 常用命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs prism-nexus-backend

# 重启应用
pm2 restart prism-nexus-backend

# 停止应用
pm2 stop prism-nexus-backend

# 删除应用
pm2 delete prism-nexus-backend

# 监控资源使用
pm2 monit
```

---

## 🌐 防火墙配置

在阿里云控制台安全组中添加入站规则：

| 协议 | 端口 | 来源 |
|------|------|------|
| TCP | 80 | 0.0.0.0/0 |
| TCP | 443 | 0.0.0.0/0 |
| TCP | 3000 | 你的前端服务器IP |

---

## 🔍 验证部署

```bash
# 检查服务是否运行
curl http://localhost:3000/health

# 检查端口监听
netstat -tlnp | grep 3000

# 查看PM2日志
pm2 logs prism-nexus-backend --lines 50
```

---

## ⚠️ 注意事项

1. **安全提醒**：
   - 首次部署后立即修改默认管理员密码
   - 使用强密码和复杂的JWT密钥
   - 定期更新系统和依赖包

2. **数据备份**：
   - 定期备份 `database.db` 文件
   - 可以使用crontab设置自动备份

3. **性能优化**：
   - SQLite适合中小型应用，高并发场景考虑迁移到MySQL
   - 可以使用Redis缓存验证码

4. **监控告警**：
   - 配置PM2监控
   - 设置日志轮转
   - 配置异常告警

---

## 📞 技术支持

如遇问题，请检查：
1. 防火墙和安全组配置
2. Node.js和npm版本
3. 端口占用情况
4. 环境和文件权限
