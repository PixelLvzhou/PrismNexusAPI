#!/bin/bash

# ============================================
# Prism Nexus 后端部署脚本
# ============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以root运行
if [ "$EUID" -ne 0 ]; then
    log_warning "建议使用 root 权限运行此脚本"
fi

echo "============================================"
echo "   Prism Nexus 后端部署脚本"
echo "============================================"
echo ""

# 1. 检查Node.js是否安装
log_info "检查Node.js环境..."
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js 安装完成"
else
    log_success "Node.js 已安装: $(node --version)"
fi

# 2. 检查npm是否安装
log_info "检查npm环境..."
if ! command -v npm &> /dev/null; then
    log_error "npm 未安装"
    exit 1
else
    log_success "npm 已安装: $(npm --version)"
fi

# 3. 安装PM2
log_info "安装PM2进程管理器..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    log_success "PM2 安装完成"
else
    log_success "PM2 已安装: $(pm2 --version)"
fi

# 4. 创建logs目录
log_info "创建日志目录..."
if [ ! -d "logs" ]; then
    mkdir -p logs
    log_success "日志目录创建完成"
else
    log_success "日志目录已存在"
fi

# 5. 安装依赖
log_info "安装项目依赖..."
npm install --production
log_success "依赖安装完成"

# 6. 检查.env文件
if [ ! -f ".env" ]; then
    log_warning ".env 文件不存在，复制生产环境配置..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        log_warning "请编辑 .env 文件配置生产环境参数"
    else
        log_error ".env.production 模板文件也不存在"
        exit 1
    fi
else
    log_success ".env 文件已存在"
fi

# 7. 停止旧进程
log_info "停止旧进程..."
pm2 stop prism-nexus-api 2>/dev/null
pm2 delete prism-nexus-api 2>/dev/null

# 8. 启动应用
log_info "启动应用..."
pm2 start ecosystem.config.js
log_success "应用启动完成"

# 9. 保存PM2进程列表
log_info "保存PM2进程列表..."
pm2 save

# 10. 设置开机自启
log_info "设置开机自启..."
pm2 startup

# 11. 显示状态
echo ""
echo "============================================"
log_success "部署完成！"
echo "============================================"
echo ""
log_info "查看应用状态: pm2 status"
log_info "查看应用日志: pm2 logs prism-nexus-api"
log_info "重启应用: pm2 restart prism-nexus-api"
log_info "停止应用: pm2 stop prism-nexus-api"
echo ""
