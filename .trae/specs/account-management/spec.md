# 账户管理接口 - 产品需求文档

## Overview
- **Summary**: 新增账户列表接口，支持查询所有账户信息，并预留扩展能力支持修改、删除、变更状态和权限操作，根据传参类型确定调用需求；同时修改前端逻辑，仅管理员账户可见账户管理按钮。
- **Purpose**: 实现账户管理功能，支持管理员对系统账户进行管理操作。
- **Target Users**: 系统管理员

## Goals
- [ ] 新增账户列表接口，支持查询所有账户信息
- [ ] 预留扩展能力，支持修改、删除、变更状态和权限操作
- [ ] 在账户管理页面调用接口展示账户列表
- [ ] 前端账户管理按钮仅对管理员账户可见

## Non-Goals (Out of Scope)
- [ ] 用户注册功能（已有）
- [ ] 用户登录功能（已有）
- [ ] 用户个人信息修改（后续迭代）

## Background & Context
- 当前系统已有基础的用户表结构
- 账户信息包含：id、username、email、role、avatar_url、status、bio
- 需要为管理员提供账户管理能力

## Functional Requirements
- **FR-1**: 新增账户管理接口 `/api/auth/accounts`，支持多种操作类型
- **FR-2**: 支持查询操作（type=query）：返回所有账户列表
- **FR-3**: 支持修改操作（type=update）：更新账户信息（用户名、邮箱、角色、状态、简介）
- **FR-4**: 支持删除操作（type=delete）：软删除账户
- **FR-5**: 支持状态变更操作（type=status）：启用/禁用账户
- **FR-6**: 支持权限变更操作（type=role）：变更账户权限等级
- **FR-7**: 接口需要管理员权限验证
- **FR-8**: 前端账户管理按钮仅在当前用户为管理员时显示

## Non-Functional Requirements
- **NFR-1**: 接口响应时间 < 200ms
- **NFR-2**: 接口需要JWT认证
- **NFR-3**: 非管理员调用管理接口返回403错误

## Constraints
- **Technical**: Node.js + Express + SQLite 技术栈
- **Dependencies**: 依赖现有的JWT认证机制

## Assumptions
- [ ] JWT认证机制已完善
- [ ] 用户表结构已包含role字段用于区分管理员和普通用户

## Acceptance Criteria

### AC-1: 查询账户列表
- **Given**: 当前用户是管理员，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`，参数 `{ type: 'query' }`
- **Then**: 返回状态码200，包含所有账户列表
- **Verification**: `programmatic`

### AC-2: 修改账户信息
- **Given**: 当前用户是管理员，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`，参数 `{ type: 'update', id: 1, username: 'newname', email: 'new@example.com', bio: 'new bio' }`
- **Then**: 返回状态码200，账户信息更新成功
- **Verification**: `programmatic`

### AC-3: 删除账户
- **Given**: 当前用户是管理员，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`，参数 `{ type: 'delete', id: 1 }`
- **Then**: 返回状态码200，账户被软删除
- **Verification**: `programmatic`

### AC-4: 变更账户状态
- **Given**: 当前用户是管理员，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`，参数 `{ type: 'status', id: 1, status: 'disabled' }`
- **Then**: 返回状态码200，账户状态更新成功
- **Verification**: `programmatic`

### AC-5: 变更账户权限
- **Given**: 当前用户是管理员，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`，参数 `{ type: 'role', id: 1, role: 'admin' }`
- **Then**: 返回状态码200，账户权限更新成功
- **Verification**: `programmatic`

### AC-6: 非管理员访问限制
- **Given**: 当前用户是普通用户，请求头包含有效的JWT token
- **When**: 调用 POST `/api/auth/accounts`
- **Then**: 返回状态码403，提示无权限
- **Verification**: `programmatic`

### AC-7: 账户管理按钮显示控制
- **Given**: 当前登录用户是管理员
- **When**: 打开用户菜单下拉框
- **Then**: 显示"账户管理"按钮
- **Verification**: `human-judgment`

### AC-8: 账户管理按钮隐藏
- **Given**: 当前登录用户是普通用户
- **When**: 打开用户菜单下拉框
- **Then**: 不显示"账户管理"按钮
- **Verification**: `human-judgment`

## Open Questions
- [ ] 暂无