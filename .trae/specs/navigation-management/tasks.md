# 导航管理模块 - 实现计划（分解和优先级任务列表）

## [ ] Task 1: 后端数据库表初始化
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在SQLite数据库中创建navigation导航信息表
  - 表结构：id(主键自增)、name(导航名称)、route(导航路由)、permission(权限等级，JSON数组)、status(状态，布尔值)、created_at(创建时间)、updated_at(更新时间)
  - 在db.js中添加初始化逻辑
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-1.1: 数据库启动时自动创建navigation表
  - `programmatic` TR-1.2: 表结构包含所有必需字段
- **Notes**: 参考users表的创建方式

## [ ] Task 2: 后端导航控制器开发
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 创建navigationController.js控制器文件
  - 实现query(查询)、create(新增)、update(修改)、delete(删除)方法
  - 查询接口仅返回status=true的导航记录
  - 权限字段存储为JSON数组格式
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-2.1: GET /api/navigation 返回启用状态的导航列表
  - `programmatic` TR-2.2: POST /api/navigation 成功新增导航记录
  - `programmatic` TR-2.3: PUT /api/navigation/:id 成功更新导航记录
  - `programmatic` TR-2.4: DELETE /api/navigation/:id 成功删除导航记录
- **Notes**: 参考authController.js的实现风格

## [ ] Task 3: 后端导航路由配置
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建navigation.js路由文件
  - 配置GET/POST/PUT/DELETE路由
  - 应用authenticateToken和requireAdmin中间件保护非查询接口
  - 在server.js中注册路由
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-3.1: 未登录访问查询接口返回401
  - `programmatic` TR-3.2: 非管理员访问增删改接口返回403
- **Notes**: 参考auth.js路由配置方式

## [ ] Task 4: 前端NavbarRight组件添加导航管理按钮
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在NavbarRight.vue中添加导航管理按钮
  - 仅当用户角色为developer时显示
  - 添加goToNavigationManage方法
- **Acceptance Criteria Addressed**: [AC-5, AC-6]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 开发者账户登录后显示"导航管理"按钮
  - `human-judgment` TR-4.2: 管理员和普通用户登录后不显示该按钮
- **Notes**: 参考账户管理按钮的实现方式

## [ ] Task 5: 前端路由配置
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 在router/index.ts中添加导航管理页面路由
  - 路由路径: /navigation-manage
- **Acceptance Criteria Addressed**: [AC-7, AC-8]
- **Test Requirements**:
  - `human-judgment` TR-5.1: 点击导航管理按钮能正确跳转到导航管理页面
- **Notes**: 参考AccountManage路由配置

## [ ] Task 6: 前端导航管理页面开发
- **Priority**: P0
- **Depends On**: Task 4, Task 5
- **Description**: 
  - 创建NavigationManage.vue页面组件
  - 实现浏览/新增开关切换功能
  - 实现导航列表展示（参考AccountManage.vue样式）
  - 实现新增/修改表单（导航名称、导航路由、权限多选、状态选择）
  - 添加编辑、启用/禁用、删除按钮及二级确认弹框
- **Acceptance Criteria Addressed**: [AC-7, AC-8, AC-9, AC-10]
- **Test Requirements**:
  - `human-judgment` TR-6.1: 页面布局完整，开关切换正常
  - `human-judgment` TR-6.2: 导航列表样式与账户管理页保持一致
  - `human-judgment` TR-6.3: 新增/修改表单功能完整
  - `human-judgment` TR-6.4: 编辑按钮正确回填数据
  - `human-judgment` TR-6.5: 删除、启用/禁用、保存均有二级确认
- **Notes**: 复用ConfirmDialog组件，参考PersonalInfo.vue的保存按钮样式

## [ ] Task 7: 前端API调用封装
- **Priority**: P1
- **Depends On**: Task 3, Task 6
- **Description**: 
  - 在api/auth.ts中添加导航相关API调用函数
  - 实现getNavigations、createNavigation、updateNavigation、deleteNavigation
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-7.1: API函数能正确调用后端接口
  - `programmatic` TR-7.2: 错误处理正确

## [ ] Task 8: 后端接口测试
- **Priority**: P1
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 使用curl或Postman测试所有导航接口
  - 验证查询、新增、修改、删除功能
  - 验证权限控制
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3, AC-4]
- **Test Requirements**:
  - `programmatic` TR-8.1: 所有接口返回正确的HTTP状态码
  - `programmatic` TR-8.2: 数据正确持久化到数据库

## [ ] Task 9: 前端功能测试
- **Priority**: P1
- **Depends On**: Task 6, Task 7
- **Description**: 
  - 测试导航管理页面的所有功能
  - 验证浏览/新增模式切换
  - 验证列表展示和操作
  - 验证表单新增和编辑
- **Acceptance Criteria Addressed**: [AC-7, AC-8, AC-9, AC-10]
- **Test Requirements**:
  - `human-judgment` TR-9.1: 页面功能完整可用
  - `human-judgment` TR-9.2: UI样式与现有系统保持一致

## [ ] Task 10: 代码优化和文档更新
- **Priority**: P2
- **Depends On**: 所有其他任务
- **Description**: 
  - 优化代码结构，添加必要注释
  - 更新API.md文档，添加导航接口说明
- **Acceptance Criteria Addressed**: [所有]
- **Test Requirements**:
  - `human-judgment` TR-10.1: 代码结构清晰，注释完整
  - `human-judgment` TR-10.2: API文档更新及时