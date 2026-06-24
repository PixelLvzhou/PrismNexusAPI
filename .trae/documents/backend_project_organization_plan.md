# 后端项目整理计划

## 一、项目现状分析

### 1. 核心功能文件结构

```
backend/
├── server.js                      # 主服务器入口
├── config/
│   └── db.js                     # 数据库配置
├── middleware/
│   └── auth.js                   # JWT认证中间件
├── controllers/
│   ├── authController.js          # 认证相关控制器
│   ├── accountController.js       # 账户管理控制器
│   └── weatherController.js      # 天气查询控制器（新增）
├── routes/
│   ├── auth.js                   # 认证路由
│   ├── accounts.js               # 账户路由
│   └── weather.js                # 天气路由
├── ecosystem.config.js            # PM2部署配置
└── .env                          # 环境变量
```

### 2. 现有接口清单（共12个接口）

#### 认证模块 (/api/auth/*)
| 接口 | 方法 | 路径 | 功能 | 文件位置 | 需要认证 |
|------|------|------|------|---------|---------|
| 注册 | POST | /api/auth/register | 用户注册（需验证码） | routes/auth.js → controllers/authController.js | 否 |
| 登录 | POST | /api/auth/login | 用户登录（返回JWT） | routes/auth.js → controllers/authController.js | 否 |
| 发送验证码 | POST | /api/auth/send-code | 发送邮箱验证码 | routes/auth.js → controllers/authController.js | 否 |
| 重置密码 | POST | /api/auth/reset-password | 重置密码（需验证码） | routes/auth.js → controllers/authController.js | 否 |

#### 账户管理模块 (/api/accounts/*)
| 接口 | 方法 | 路径 | 功能 | 文件位置 | 需要认证 |
|------|------|------|------|---------|---------|
| 账户列表 | GET | /api/accounts | 获取账户列表（分页、搜索） | routes/accounts.js → controllers/accountController.js | 是 |
| 账户详情 | GET | /api/accounts/:id | 获取单个账户详情 | routes/accounts.js → controllers/accountController.js | 是 |
| 创建账户 | POST | /api/accounts | 创建新账户 | routes/accounts.js → controllers/accountController.js | 是 |
| 更新账户 | PUT | /api/accounts/:id | 更新账户信息 | routes/accounts.js → controllers/accountController.js | 是 |
| 删除账户 | DELETE | /api/accounts/:id | 删除账户（软删除） | routes/accounts.js → controllers/accountController.js | 是 |
| 更新状态 | PATCH | /api/accounts/:id/status | 更新账户状态 | routes/accounts.js → controllers/accountController.js | 是 |

#### 工具模块 (/api)
| 接口 | 方法 | 路径 | 功能 | 文件位置 | 需要认证 |
|------|------|------|------|---------|---------|
| 天气查询 | GET | /api/weather | 查询实时天气 | routes/weather.js → controllers/weatherController.js | 否 |
| 健康检查 | GET | /health | 服务健康检查 | server.js | 否 |

## 二、测试与临时脚本文件清单（共29个）

### 1. 认证功能测试（12个）
| 文件名 | 功能 | 用途 | 建议处理 |
|--------|------|------|---------|
| test-login.js | 登录接口测试 | 临时测试登录功能 | **可删除** |
| test-register.js | 注册接口测试 | 临时测试注册功能 | **可删除** |
| test-send-code.js | 发送验证码测试 | 临时测试发送验证码 | **可删除** |
| test-reset-password.js | 重置密码测试 | 临时测试重置密码 | **可删除** |
| test-verify.js | 验证码验证测试 | 临时测试验证码验证 | **可删除** |
| test-login-flow.js | 登录流程测试 | 集成测试登录流程 | **可删除** |
| test-reset-and-login.js | 重置后登录测试 | 测试重置密码和登录流程 | **可删除** |
| test-verify-success.js | 验证成功测试 | 测试验证码验证成功场景 | **可删除** |
| test-api.js | 通用API测试 | 临时API测试 | **可删除** |
| test-api-demo.js | API使用演示 | 演示API调用示例 | **可删除** |
| test-email-domain.js | 邮箱域名测试 | 测试邮箱白名单功能 | **可删除** |
| test-email-validation.js | 邮箱格式测试 | 测试邮箱格式验证 | **可删除** |
| register-test.js | 注册功能测试 | 测试注册功能 | **可删除** |

### 2. 数据库操作脚本（11个）
| 文件名 | 功能 | 用途 | 建议处理 |
|--------|------|------|---------|
| check-db.js | 检查数据库结构 | 开发调试用 | **可删除** |
| check-user.js | 检查单个用户 | 开发调试用 | **可删除** |
| check-users.js | 检查所有用户 | 开发调试用 | **可删除** |
| check-user-status.js | 检查用户状态 | 开发调试用 | **可删除** |
| view-db-passwords.js | 查看数据库密码 | 调试查看密码（已加密） | **可删除** |
| reset-password-directly.js | 直接重置密码 | 紧急重置密码 | **可保留**（紧急用） |
| list-users.js | 列出所有用户 | 开发调试用 | **可删除** |
| count-users.js | 统计用户数量 | 开发调试用 | **可删除** |
| delete-users.js | 删除用户 | 开发调试用 | **可删除** |
| clean-deleted-users.js | 清理已删除用户 | 清理数据库 | **可保留** |
| list-accounts.js | 列出所有账户 | 与list-users重复 | **可删除** |
| count-accounts.js | 统计账户数量 | 与count-users重复 | **可删除** |
| delete-accounts.js | 删除账户 | 与delete-users重复 | **可删除** |

### 3. 其他文件（3个）
| 文件名 | 功能 | 用途 | 建议处理 |
|--------|------|------|---------|
| init-db.js | 数据库初始化 | 生产环境数据库初始化 | **可保留** |
| frontend-example.js | 前端调用示例 | 演示前端如何调用API | **可删除** |
| database.db | SQLite数据库文件 | 数据库存储 | **保留** |

## 三、待删除文件清单（总计27个）

### 删除列表
```
test-login.js
test-register.js
test-send-code.js
test-reset-password.js
test-verify.js
test-login-flow.js
test-reset-and-login.js
test-verify-success.js
test-api.js
test-api-demo.js
test-email-domain.js
test-email-validation.js
register-test.js
check-db.js
check-user.js
check-users.js
check-user-status.js
view-db-passwords.js
list-users.js
count-users.js
delete-users.js
list-accounts.js
count-accounts.js
delete-accounts.js
frontend-example.js
```

### 保留列表（核心文件）
```
server.js                      # 主服务器
config/db.js                   # 数据库配置
middleware/auth.js             # 认证中间件
controllers/authController.js  # 认证控制器
controllers/accountController.js # 账户控制器
controllers/weatherController.js # 天气控制器
routes/auth.js                 # 认证路由
routes/accounts.js             # 账户路由
routes/weather.js              # 天气路由
ecosystem.config.js            # PM2配置
init-db.js                     # 数据库初始化
reset-password-directly.js     # 紧急重置密码
clean-deleted-users.js         # 清理已删除用户
.env                           # 环境变量
.env.production                # 生产环境配置
database.db                    # 数据库文件
package.json                   # 项目配置
package-lock.json              # 依赖锁定
API.md                         # API文档
DEPLOY_ALIYUN.md               # 阿里云部署文档
DEPLOY_GUIDE_WINDOWS.md        # Windows部署指南
deploy.sh                      # 部署脚本
```

## 四、整理后的项目结构

```
backend/
├── server.js                          # 主服务器入口（已存在）
├── config/
│   └── db.js                          # 数据库配置（已存在）
├── middleware/
│   └── auth.js                        # JWT认证中间件（已存在）
├── controllers/
│   ├── authController.js               # 认证控制器（已存在）
│   ├── accountController.js            # 账户控制器（已存在）
│   └── weatherController.js            # 天气控制器（已存在）
├── routes/
│   ├── auth.js                         # 认证路由（已存在）
│   ├── accounts.js                     # 账户路由（已存在）
│   └── weather.js                     # 天气路由（已存在）
├── utils/                              # 【可选】工具函数目录
│   ├── reset-password-directly.js      # 【保留】紧急重置密码
│   └── clean-deleted-users.js          # 【保留】清理已删除用户
├── ecosystem.config.js                 # PM2配置（已存在）
├── init-db.js                          # 数据库初始化（已存在）
├── database.db                         # SQLite数据库（已存在）
├── package.json                        # 项目配置（已存在）
├── package-lock.json                   # 依赖锁定（已存在）
├── .env                                # 环境变量（已存在）
├── .env.production                     # 生产配置（已存在）
├── API.md                              # API文档（已存在）
├── DEPLOY_ALIYUN.md                    # 阿里云部署（已存在）
├── DEPLOY_GUIDE_WINDOWS.md             # Windows部署（已存在）
└── deploy.sh                           # 部署脚本（已存在）
```

## 五、实施步骤

### 第一步：备份重要数据
1. 备份 database.db 文件
2. 备份 .env 和 .env.production 文件
3. 备份 reset-password-directly.js（如果需要）

### 第二步：删除测试文件
删除以下27个文件：
- 所有 test-*.js 文件（13个）
- 所有 check-*.js 文件（4个）
- 所有 list-*.js 文件（2个）
- 所有 count-*.js 文件（2个）
- 所有 delete-*.js 文件（2个）
- view-db-passwords.js
- frontend-example.js

### 第三步：创建工具目录（可选）
如果需要保留工具脚本，创建 utils 目录并移动：
- reset-password-directly.js
- clean-deleted-users.js

### 第四步：更新文档
1. 更新 API.md 文档，添加天气接口说明
2. 可选：创建 docs/TESTING.md 记录测试方法

### 第五步：验证
1. 重启服务器，确保服务正常运行
2. 测试核心接口是否正常工作
3. 确认所有认证功能正常

## 六、预期效果

### 整理前
- 总文件数：37个JS文件
- 核心文件：12个
- 测试/临时文件：25个

### 整理后
- 总文件数：18个JS文件
- 核心文件：12个
- 工具脚本：2个
- 其他：4个（配置、部署、文档）

### 优势
1. **结构清晰**：核心代码与测试代码分离
2. **易于维护**：删除大量临时文件，减少维护负担
3. **提高安全性**：删除调试文件，避免信息泄露
4. **便于部署**：生产环境更简洁
5. **易于理解**：新成员能快速理解项目结构

## 七、注意事项

1. **删除前备份**：确保所有重要数据已备份
2. **测试环境**：建议先在测试环境执行
3. **保留工具**：reset-password-directly.js 在紧急情况下很有用
4. **文档更新**：删除文件后及时更新相关文档
5. **版本控制**：使用 Git 管理，确保可以回滚

## 八、执行检查清单

- [ ] 备份 database.db
- [ ] 备份 .env 文件
- [ ] 备份 reset-password-directly.js（如果需要）
- [ ] 删除所有测试文件（27个）
- [ ] 创建 utils 目录（可选）
- [ ] 移动工具脚本到 utils 目录（可选）
- [ ] 更新 API.md 文档
- [ ] 重启服务器测试
- [ ] 测试核心功能（登录、注册、账户管理、天气）
- [ ] 提交代码到 Git
