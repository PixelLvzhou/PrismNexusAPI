# 配置 QQ 邮箱 SMTP 计划

## [x] Task 1: 获取 QQ 邮箱授权码
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 登录 QQ 邮箱
  - 进入设置页面
  - 开启 SMTP 服务
  - 获取授权码
- **Success Criteria**:
  - 成功获取 QQ 邮箱授权码
- **Test Requirements**:
  - `human-judgment` TR-1.1: 确认授权码已正确获取
- **Notes**: 授权码是用于第三方应用登录 QQ 邮箱的密码，不是 QQ 登录密码

## [x] Task 2: 配置 .env 文件
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 打开 .env 文件
  - 修改 SMTP_USER 为真实的 QQ 邮箱
  - 修改 SMTP_PASS 为获取的授权码
- **Success Criteria**:
  - .env 文件中的邮箱和授权码配置正确
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认 .env 文件格式正确
  - `human-judgment` TR-2.2: 确认配置值正确
- **Notes**: 确保不要将 .env 文件提交到版本控制系统

## [x] Task 3: 重启服务器
- **Priority**: P1
- **Depends On**: Task 2
- **Description**: 
  - 停止当前运行的服务器
  - 重新启动服务器
- **Success Criteria**:
  - 服务器成功重启，加载新的配置
- **Test Requirements**:
  - `programmatic` TR-3.1: 确认服务器正常启动
- **Notes**: 服务器需要重启才能加载新的环境变量配置

## [/] Task 4: 测试忘记密码功能
- **Priority**: P1
- **Depends On**: Task 3
- **Description**:
  - 测试发送验证码接口
  - 测试密码修改接口
- **Success Criteria**:
  - 验证码成功发送到邮箱
  - 密码修改功能正常工作
- **Test Requirements**:
  - `programmatic` TR-4.1: 测试发送验证码接口返回 200 状态
  - `human-judgment` TR-4.2: 确认收到验证码邮件
  - `programmatic` TR-4.3: 测试密码修改接口返回 200 状态
- **Notes**: 测试时需要使用已注册的用户名和邮箱