# 账户管理接口 - 实现计划

## [ ] Task 1: 创建管理员权限中间件
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 创建 `middleware/admin.js`，验证当前用户是否为管理员
  - 如果不是管理员，返回403错误
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 普通用户调用需要管理员权限的接口返回403
  - `programmatic` TR-1.2: 管理员用户调用需要管理员权限的接口通过验证

## [ ] Task 2: 新增账户管理接口
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 在 `controllers/authController.js` 中添加 `manageAccounts` 函数
  - 支持多种操作类型：query、update、delete、status、role
  - 在 `routes/auth.js` 中注册 POST `/api/auth/accounts` 路由
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `programmatic` TR-2.1: POST /api/auth/accounts with type=query 返回账户列表
  - `programmatic` TR-2.2: POST /api/auth/accounts with type=update 更新账户信息
  - `programmatic` TR-2.3: POST /api/auth/accounts with type=delete 软删除账户
  - `programmatic` TR-2.4: POST /api/auth/accounts with type=status 变更账户状态
  - `programmatic` TR-2.5: POST /api/auth/accounts with type=role 变更账户权限
  - `programmatic` TR-2.6: 非管理员调用返回403

## [ ] Task 3: 更新前端NavbarRight组件
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 修改 `src/components/NavbarRight.vue`
  - 存储用户角色信息
  - 根据用户角色控制账户管理按钮的显示/隐藏
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `human-judgment` TR-3.1: 管理员用户登录后显示账户管理按钮
  - `human-judgment` TR-3.2: 普通用户登录后隐藏账户管理按钮

## [ ] Task 4: 更新账户管理页面
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 修改 `src/views/AccountManage.vue`
  - 调用账户管理接口获取账户列表
  - 展示账户列表信息
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-4.1: 账户管理页面显示所有账户列表
  - `human-judgment` TR-4.2: 账户信息包含用户名、邮箱、角色、状态