# 账户系统 - 实现计划

## [ ] Task 1: 修改数据库配置，添加新字段
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改 `config/db.js`，在用户表中添加新字段：`role`（权限等级）、`avatar_url`（头像URL）、`bio`（简介）
  - 设置默认值：role='user', avatar_url='', bio='', status='enabled'
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-1.1: 启动服务器后检查数据库表结构，确认新增字段存在
  - `human-judgment` TR-1.2: 检查数据库初始化日志，确认字段添加成功

## [ ] Task 2: 创建JWT认证中间件
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建 `middleware/auth.js`，实现JWT验证逻辑
  - 解析请求头中的token，验证有效性
  - 将用户信息附加到req对象
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-2.1: 无token请求返回401
  - `programmatic` TR-2.2: 无效token请求返回401
  - `programmatic` TR-2.3: 有效token请求通过验证

## [ ] Task 3: 新增账户信息查询接口
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 在 `controllers/authController.js` 中添加 `getProfile` 函数
  - 从JWT解析用户ID，查询数据库获取完整用户信息
  - 返回用户信息：id, username, email, role, avatar_url, status, bio
  - 在 `routes/auth.js` 中注册 GET `/api/auth/me` 路由
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-3.1: 调用GET /api/auth/me返回状态码200
  - `programmatic` TR-3.2: 返回数据包含所有要求的字段
  - `programmatic` TR-3.3: 未登录状态调用返回401

## [ ] Task 4: 改造注册接口
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 `controllers/authController.js` 中的 `register` 函数
  - 插入新用户时包含新增字段的默认值
  - 默认：role='user', avatar_url='', status='enabled', bio=''
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-4.1: 注册新用户后查询数据库，确认新增字段有默认值
  - `programmatic` TR-4.2: 注册成功返回状态码201

## [ ] Task 5: 迁移现有用户数据
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 在数据库初始化时执行数据迁移脚本
  - 为现有用户设置新增字段的默认值
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-5.1: 检查现有用户记录，确认新增字段已填充默认值

## [ ] Task 6: 前端调用账户信息查询接口
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 修改 `src/components/NavbarRight.vue`
  - 在组件挂载时调用 `/api/auth/me` 接口获取用户信息
  - 更新用户名称显示为从接口获取的数据
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-6.1: 登录后首页右上角显示当前用户名称
  - `human-judgment` TR-6.2: 接口调用失败时有错误处理