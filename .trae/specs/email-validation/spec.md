# 邮箱校验功能 - 产品需求文档

## Overview
- **Summary**: 在现有的 Express.js 注册接口中添加高精度的邮箱校验逻辑，包括空值校验、格式校验等核心规则
- **Purpose**: 确保用户注册时提供的邮箱格式正确，提高数据质量和用户体验
- **Target Users**: 开发人员和系统维护人员

## Goals
- 实现高精度的邮箱校验逻辑
- 封装为通用函数便于复用
- 集成到现有的注册接口中
- 保持原有接口逻辑不变

## Non-Goals (Out of Scope)
- 不修改现有的用户名和密码校验逻辑
- 不添加域名白名单和平台专属规则（当前版本暂不实现）
- 不修改其他接口的逻辑

## Background & Context
- 现有的注册接口位于 `controllers/authController.js` 中的 `register` 函数
- 接口当前只进行简单的非空校验，缺少详细的邮箱格式校验
- 需要按照指定的校验规则和错误提示信息进行实现

## Functional Requirements
- **FR-1**: 实现 `validateEmail(email)` 通用函数，返回校验结果
- **FR-2**: 在注册接口中集成邮箱校验逻辑
- **FR-3**: 校验失败时返回 400 状态码和对应错误信息
- **FR-4**: 校验通过后继续执行原有注册逻辑

## Non-Functional Requirements
- **NFR-1**: 校验逻辑必须使用指定的正则表达式
- **NFR-2**: 校验规则必须按照优先级顺序执行
- **NFR-3**: 错误提示信息必须与要求一致

## Constraints
- **Technical**: 基于现有的 Express.js 框架和 Node.js 环境
- **Dependencies**: 无新的外部依赖

## Assumptions
- 现有的数据库结构和连接逻辑保持不变
- 现有的密码加密和用户名校验逻辑保持不变

## Acceptance Criteria

### AC-1: 邮箱空值校验
- **Given**: 用户提交注册请求，邮箱字段为空或全是空格
- **When**: 调用注册接口
- **Then**: 返回 400 状态码和 "邮箱不能为空" 错误信息
- **Verification**: `programmatic`

### AC-2: 邮箱格式校验
- **Given**: 用户提交注册请求，邮箱格式不符合要求
- **When**: 调用注册接口
- **Then**: 返回 400 状态码和 "邮箱格式不正确（请填写如 123456@qq.com 的合法邮箱）" 错误信息
- **Verification**: `programmatic`

### AC-3: 邮箱校验通过
- **Given**: 用户提交注册请求，邮箱格式正确
- **When**: 调用注册接口
- **Then**: 继续执行原有注册逻辑
- **Verification**: `programmatic`

### AC-4: 通用函数封装
- **Given**: 调用 `validateEmail` 函数
- **When**: 传入不同格式的邮箱
- **Then**: 返回正确的校验结果和错误信息
- **Verification**: `programmatic`

## Open Questions
- [ ] 后续是否需要添加域名白名单和平台专属规则？