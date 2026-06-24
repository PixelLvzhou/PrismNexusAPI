# 导航管理模块 - 验证清单

## 后端验证
- [ ] 数据库navigation表已创建，包含id、name、route、permission、status、created_at、updated_at字段
- [ ] GET /api/navigation 接口返回启用状态的导航列表
- [ ] POST /api/navigation 接口成功新增导航记录
- [ ] PUT /api/navigation/:id 接口成功更新导航记录
- [ ] DELETE /api/navigation/:id 接口成功删除导航记录
- [ ] 查询接口仅返回status=true的记录
- [ ] 增删改接口需要管理员权限
- [ ] 权限字段以JSON数组格式存储

## 前端验证
- [ ] NavbarRight组件中添加了导航管理按钮
- [ ] 导航管理按钮仅对developer角色显示
- [ ] router/index.ts中添加了navigation-manage路由
- [ ] NavigationManage.vue页面已创建
- [ ] 浏览/新增开关切换功能正常
- [ ] 导航列表样式与账户管理页保持一致
- [ ] 导航列表显示id、名称、导航路由、角色、状态、创建时间、最近修改时间、操作
- [ ] 操作列包含编辑、启用/禁用、删除按钮
- [ ] 新增/修改表单包含导航名称、导航路由、权限多选、状态选择
- [ ] 编辑按钮点击后自动切换到新增模式并回填数据
- [ ] 删除操作有二级确认弹框
- [ ] 启用/禁用操作有二级确认弹框
- [ ] 保存操作有二级确认弹框
- [ ] 保存按钮样式与PersonalInfo.vue保持一致
- [ ] API调用封装完成（getNavigations、createNavigation、updateNavigation、deleteNavigation）

## 功能测试
- [ ] 开发者账户登录后能看到导航管理按钮
- [ ] 点击导航管理按钮能跳转到导航管理页面
- [ ] 浏览模式下能正常显示导航列表
- [ ] 新增模式下能正常填写表单并保存
- [ ] 编辑功能能正确回填数据并保存
- [ ] 删除功能正常工作
- [ ] 启用/禁用功能正常工作
- [ ] 权限控制正常（非开发者无法访问）

## 代码质量
- [ ] 代码结构清晰，遵循现有项目风格
- [ ] 错误处理完善
- [ ] API文档已更新