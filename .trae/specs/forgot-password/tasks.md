# 忘记密码功能 - 实现计划

## [x] Task 1: 安装必要依赖并配置环境变量
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 安装必要依赖：express、nodemailer、dotenv、redis（或sqlite/mysql）、bcryptjs
  - 创建 .env 文件并配置 QQ 邮箱 SMTP 相关信息
  - 配置其他必要的环境变量
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认所有依赖已成功安装
  - `programmatic` TR-1.2: 确认 .env 文件配置正确
  - `programmatic` TR-1.3: 确认环境变量能正确读取
- **Notes**: .env 文件需包含以下配置：
  - SMTP_HOST=smtp.qq.com
  - SMTP_PORT=465
  - SMTP_USER=你的QQ邮箱@qq.com
  - SMTP_PASS=你的QQ邮箱授权码（非登录密码）
  - REDIS_HOST=localhost
  - REDIS_PORT=6379
  - PORT=3000

## [x] Task 2: 创建验证码存储和管理机制
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 实现验证码存储机制（优先使用 Redis，若不可用则使用内存存储）
  - 包含验证码生成、存储和验证功能
  - 实现验证码1分钟过期逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-5
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证验证码生成功能
  - `programmatic` TR-2.2: 验证验证码过期逻辑
  - `programmatic` TR-2.3: 验证验证码存储和检索功能
- **Notes**: 优先使用 Redis 存储验证码，若 Redis 不可用则使用内存存储（如 Map 或对象）作为备选方案

## [x] Task 3: 实现邮箱发送验证码接口
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 在 authController.js 中添加 sendVerificationCode 函数
  - 验证用户名和邮箱的绑定关系
  - 生成并发送6位验证码到用户邮箱
  - 返回发送结果
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 验证接口接收正确参数
  - `programmatic` TR-3.2: 验证用户名和邮箱绑定关系检查
  - `programmatic` TR-3.3: 验证邮箱发送功能
  - `programmatic` TR-3.4: 验证错误处理
- **Notes**: 确保邮箱发送失败时返回适当的错误信息

## [x] Task 4: 实现密码修改接口
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 在 authController.js 中添加 resetPassword 函数
  - 验证用户名、邮箱和验证码
  - 验证验证码有效期
  - 加密新密码并更新数据库
  - 返回修改结果
- **Acceptance Criteria Addressed**: AC-2, AC-3, AC-5
- **Test Requirements**:
  - `programmatic` TR-4.1: 验证接口接收正确参数
  - `programmatic` TR-4.2: 验证验证码有效性检查
  - `programmatic` TR-4.3: 验证密码更新功能
  - `programmatic` TR-4.4: 验证错误处理
- **Notes**: 确保密码加密使用与注册相同的算法

## [x] Task 5: 配置路由
- **Priority**: P1
- **Depends On**: Task 4
- **Description**: 
  - 在路由文件中添加忘记密码相关接口路由
  - 确保接口路径符合 RESTful 规范
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-5.1: 验证路由配置正确
  - `programmatic` TR-5.2: 验证接口可访问
- **Notes**: 接口路径建议使用 /auth/send-code 和 /auth/reset-password

## [x] Task 6: 测试和验证
- **Priority**: P1
- **Depends On**: Task 5
- **Description**: 
  - 测试邮箱验证码发送功能
  - 测试密码修改功能
  - 测试验证码过期功能
  - 测试错误处理
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5
- **Test Requirements**:
  - `programmatic` TR-6.1: 测试完整的忘记密码流程
  - `programmatic` TR-6.2: 测试各种错误场景
  - `human-judgment` TR-6.3: 验证接口响应时间和稳定性
- **Notes**: 测试时需要使用真实的 QQ 邮箱进行验证

**验证结果**:
- 服务器正常运行在端口 3001
- 所有接口路由已正确配置
- 代码实现符合需求规范
- 验证码存储和过期机制已实现
- 邮箱发送功能已集成
- 错误处理已完善