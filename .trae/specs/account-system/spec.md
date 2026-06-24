# 账户系统 - 产品需求文档

## Overview
- **Summary**: 开发账户系统，新增账户信息查询接口，返回当前登录用户的完整信息（包括账号ID、账户名称、邮箱、权限等级、头像URL、账号状态、简介信息），并改造注册接口支持新增字段。
- **Purpose**: 完善用户账户信息管理功能，为后续用户中心、权限控制等功能打下基础。
- **Target Users**: 系统管理员和普通用户

## Goals
- [x] 新增账户信息查询接口，返回完整的用户信息
- [x] 改造注册接口，支持新增字段（权限等级、头像URL、账号状态、简介信息）
- [x] 为现有用户数据添加新增字段的默认值
- [x] 前端首页调用账户信息查询接口，动态显示当前用户名称

## Non-Goals (Out of Scope)
- [ ] 用户信息修改功能（后续迭代）
- [ ] 权限管理功能（后续迭代）
- [ ] 用户状态管理功能（后续迭代）

## Background & Context
- 当前用户表仅包含基础字段：`id`, `username`, `email`, `password`
- 前端当前使用硬编码的用户信息
- 需要扩展用户表结构以支持更多用户属性

## Functional Requirements
- **FR-1**: 新增账户信息查询接口 `/api/auth/me`，返回当前登录用户的完整信息
- **FR-2**: 改造注册接口，新用户注册时自动添加默认值（权限等级=普通用户，头像URL=空字符，状态=正常，简介=空字符）
- **FR-3**: 为现有用户数据补充新增字段的默认值
- **FR-4**: 前端首页调用账户信息查询接口，动态更新右上角用户名称显示

## Non-Functional Requirements
- **NFR-1**: API接口响应时间 < 100ms
- **NFR-2**: 用户信息查询需要JWT认证
- **NFR-3**: 数据存储使用SQLite数据库

## Constraints
- **Technical**: Node.js + Express + SQLite 技术栈
- **Dependencies**: 现有认证系统使用JWT

## Assumptions
- [x] 现有数据库已有用户表
- [x] JWT认证机制已完善
- [x] 前端已集成JWT token管理

## Acceptance Criteria

### AC-1: 账户信息查询接口
- **Given**: 用户已登录，请求头包含有效的JWT token
- **When**: 调用 GET `/api/auth/me`
- **Then**: 返回状态码200，包含用户信息：`id`, `username`, `email`, `role`, `avatar_url`, `status`, `bio`
- **Verification**: `programmatic`

### AC-2: 新用户注册
- **Given**: 用户提交注册请求（username, password, email, code）
- **When**: 调用 POST `/api/auth/register`
- **Then**: 用户成功创建，新增字段默认值：role='user', avatar_url='', status='enabled', bio=''
- **Verification**: `programmatic`

### AC-3: 现有用户数据迁移
- **Given**: 数据库中存在已注册用户
- **When**: 系统启动时执行数据迁移脚本
- **Then**: 所有现有用户的新增字段被设置为默认值
- **Verification**: `human-judgment`

### AC-4: 前端用户名称显示
- **Given**: 用户成功登录系统
- **When**: 进入首页
- **Then**: 右上角用户信息按钮显示当前登录用户的名称
- **Verification**: `human-judgment`

## Open Questions
- [ ] 暂无