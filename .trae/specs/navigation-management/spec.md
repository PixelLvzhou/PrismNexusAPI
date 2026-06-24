# 导航管理模块 - 产品需求文档

## Overview
- **Summary**: 本项目旨在实现导航管理功能，包括后端导航信息CRUD接口和前端导航管理页面。后端提供导航信息的增删改查功能，前端提供开发者专属的导航管理界面。
- **Purpose**: 实现系统导航的动态配置，支持按权限等级控制导航显示，提高系统灵活性和安全性。
- **Target Users**: 系统开发者账户

## Goals
- 实现后端导航信息CRUD接口（查询、新增、修改、删除）
- 实现前端导航管理页面（浏览/新增切换、列表展示、表单编辑）
- 实现权限控制（仅开发者账户可见）
- 实现状态管理（启用/禁用导航）
- 实现二级确认弹框（删除、启用/禁用、保存）

## Non-Goals (Out of Scope)
- 导航菜单的前端渲染逻辑（已有Navbar组件处理）
- 用户角色管理（已有账户管理模块）
- 导航排序功能
- 多级导航树结构

## Background & Context
- 现有系统已实现账户管理模块，包含用户角色权限控制
- 前端使用Vue3 + TypeScript + TailwindCSS
- 后端使用Node.js + Express + SQLite
- 已存在ConfirmDialog组件用于二级确认

## Functional Requirements
- **FR-1**: 后端新增导航信息表，包含字段：id、导航名称、导航路由、权限等级、创建时间、最近修改时间、状态
- **FR-2**: 后端实现导航信息查询接口（仅返回启用状态的导航）
- **FR-3**: 后端实现导航信息新增接口（需要管理员权限）
- **FR-4**: 后端实现导航信息修改接口（需要管理员权限）
- **FR-5**: 后端实现导航信息删除接口（需要管理员权限）
- **FR-6**: 前端在NavbarRight组件中新增导航管理按钮（仅开发者可见）
- **FR-7**: 前端新增导航管理页面，包含浏览/新增开关切换
- **FR-8**: 前端实现导航列表展示（与账户管理页风格一致）
- **FR-9**: 前端实现导航新增/修改表单（含权限多选）
- **FR-10**: 前端实现删除、启用/禁用、保存的二级确认弹框

## Non-Functional Requirements
- **NFR-1**: 接口响应时间 < 200ms
- **NFR-2**: 前端页面响应式设计，支持移动端
- **NFR-3**: 操作前必须确认，防止误操作

## Constraints
- **Technical**: 后端使用SQLite数据库，前端使用Vue3组合式API
- **Dependencies**: 依赖现有的认证中间件和ConfirmDialog组件

## Assumptions
- 开发者账户角色为"developer"
- 权限等级与用户角色对应（developer、admin、user）
- 状态字段使用布尔值（true=启用，false=禁用）

## Acceptance Criteria

### AC-1: 导航信息查询接口
- **Given**: 已登录用户发起查询请求
- **When**: 调用GET /api/navigation接口
- **Then**: 返回所有启用状态的导航信息数组，每个对象包含id、name、route、permission、created_at、updated_at、status字段
- **Verification**: `programmatic`

### AC-2: 导航信息新增接口
- **Given**: 已登录的管理员/开发者账户
- **When**: 调用POST /api/navigation接口，传入name、route、permission、status
- **Then**: 返回成功消息，导航信息被保存到数据库
- **Verification**: `programmatic`

### AC-3: 导航信息修改接口
- **Given**: 已登录的管理员/开发者账户
- **When**: 调用PUT /api/navigation/:id接口，传入更新字段
- **Then**: 返回成功消息，数据库中对应记录被更新
- **Verification**: `programmatic`

### AC-4: 导航信息删除接口
- **Given**: 已登录的管理员/开发者账户
- **When**: 调用DELETE /api/navigation/:id接口
- **Then**: 返回成功消息，数据库中对应记录被删除
- **Verification**: `programmatic`

### AC-5: 导航管理按钮显示
- **Given**: 当前登录用户角色为developer
- **When**: 打开用户下拉菜单
- **Then**: 显示"导航管理"按钮
- **Verification**: `human-judgment`

### AC-6: 导航管理按钮隐藏
- **Given**: 当前登录用户角色为admin或user
- **When**: 打开用户下拉菜单
- **Then**: 不显示"导航管理"按钮
- **Verification**: `human-judgment`

### AC-7: 导航管理页面浏览模式
- **Given**: 用户进入导航管理页面
- **When**: 浏览/新增开关处于"浏览"状态
- **Then**: 显示导航列表，样式与账户管理页保持一致
- **Verification**: `human-judgment`

### AC-8: 导航管理页面新增模式
- **Given**: 用户进入导航管理页面
- **When**: 切换浏览/新增开关到"新增"状态
- **Then**: 显示新增/修改表单，包含导航名称、导航路由、权限多选、状态选择
- **Verification**: `human-judgment`

### AC-9: 导航编辑功能
- **Given**: 用户在导航列表中点击"编辑"按钮
- **When**: 系统自动切换到新增模式并回填数据
- **Then**: 表单中显示被编辑导航的当前数据
- **Verification**: `human-judgment`

### AC-10: 二级确认弹框
- **Given**: 用户点击删除、启用/禁用或保存按钮
- **When**: 触发相应操作
- **Then**: 弹出确认对话框，确认后执行操作
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要支持导航排序功能？
- [ ] 是否需要支持多级导航结构？