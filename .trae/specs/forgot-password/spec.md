# 忘记密码功能 - 产品需求文档

## Overview
- **Summary**: 实现忘记密码功能的后端部分，包括邮箱验证码发送和密码修改功能
- **Purpose**: 解决用户忘记密码时的重置问题，通过邮箱验证码验证用户身份并允许修改密码
- **Target Users**: 忘记密码需要重置的系统用户

## Goals
- 实现邮箱发送验证码接口，验证用户名和邮箱绑定关系
- 实现密码修改接口，使用验证码验证用户身份
- 确保验证码的安全性和时效性（1分钟有效期）
- 提供清晰的错误反馈和成功提示

## Non-Goals (Out of Scope)
- 前端页面开发（已完成）
- 其他认证功能的修改
- 邮箱模板的美化

## Background & Context
- 前端部分已开发完成，需要后端接口支持
- 系统使用 Node.js + Express.js 框架
- 数据库使用 SQLite
- 邮箱服务使用 QQ 邮箱 SMTP

## Functional Requirements
- **FR-1**: 邮箱发送验证码接口，接收用户名和邮箱参数，验证绑定关系后发送6位随机验证码
- **FR-2**: 密码修改接口，接收用户名、邮箱、验证码和新密码参数，验证验证码有效性后修改密码
- **FR-3**: 验证码有效期管理，确保验证码1分钟后失效

## Non-Functional Requirements
- **NFR-1**: 安全性，确保验证码传输和存储的安全
- **NFR-2**: 可靠性，邮箱发送服务的稳定性
- **NFR-3**: 响应速度，接口响应时间不超过2秒

## Constraints
- **Technical**: 使用 QQ 邮箱 SMTP 服务
- **Dependencies**: 需要安装 express、nodemailer、dotenv、redis（或sqlite/mysql）、bcryptjs
- **Security**: 所有敏感配置必须存入 .env 文件，禁止硬编码

## Assumptions
- 用户已在系统中注册并绑定了邮箱
- QQ 邮箱 SMTP 服务配置正确
- 系统已配置 .env 文件存储邮箱相关信息
- .env 文件包含必要的配置项：SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASS 等

## Acceptance Criteria

### AC-1: 邮箱验证码发送
- **Given**: 用户输入正确的用户名和绑定的邮箱
- **When**: 调用发送验证码接口
- **Then**: 系统验证用户名和邮箱绑定关系，生成6位验证码并发送到邮箱
- **Verification**: `programmatic`
- **Notes**: 验证码有效期为1分钟

### AC-2: 验证码验证
- **Given**: 用户收到验证码并在1分钟内输入
- **When**: 调用修改密码接口
- **Then**: 系统验证验证码有效性
- **Verification**: `programmatic`

### AC-3: 密码修改
- **Given**: 验证码验证通过
- **When**: 用户输入新密码
- **Then**: 系统更新用户密码并返回成功信息
- **Verification**: `programmatic`

### AC-4: 错误处理
- **Given**: 用户输入错误的用户名或邮箱
- **When**: 调用发送验证码接口
- **Then**: 系统返回错误信息
- **Verification**: `programmatic`

### AC-5: 验证码过期
- **Given**: 验证码超过1分钟有效期
- **When**: 调用修改密码接口
- **Then**: 系统返回验证码过期错误
- **Verification**: `programmatic`

## Open Questions
- [ ] QQ 邮箱 SMTP 配置信息如何获取和存储？
- [ ] 验证码如何存储和管理？
- [ ] 密码强度要求是什么？