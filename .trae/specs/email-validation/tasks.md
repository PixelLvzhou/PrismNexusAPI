# 邮箱校验功能 - 实现计划

## [x] Task 1: 实现 validateEmail 通用函数
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 在 authController.js 文件中实现 validateEmail(email) 函数
  - 实现空值/空格校验逻辑
  - 实现严格格式校验逻辑（使用指定的正则表达式）
  - 返回 { valid: 布尔值, msg: 提示信息 } 格式的结果
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `programmatic` TR-1.1: 函数能正确校验空邮箱，返回 { valid: false, msg: "邮箱不能为空" }
  - `programmatic` TR-1.2: 函数能正确校验格式错误的邮箱，返回 { valid: false, msg: "邮箱格式不正确（请填写如 123456@qq.com 的合法邮箱）" }
  - `programmatic` TR-1.3: 函数能正确校验格式正确的邮箱，返回 { valid: true, msg: "" }

## [x] Task 2: 集成邮箱校验到注册接口
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 在 register 函数中调用 validateEmail 函数
  - 校验失败时返回 400 状态码和对应错误信息
  - 校验通过后继续执行原有注册逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 提交空邮箱时返回 400 状态码和 "邮箱不能为空" 错误信息
  - `programmatic` TR-2.2: 提交格式错误的邮箱时返回 400 状态码和 "邮箱格式不正确（请填写如 123456@qq.com 的合法邮箱）" 错误信息
  - `programmatic` TR-2.3: 提交格式正确的邮箱时继续执行注册逻辑

## [x] Task 3: 测试验证
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 测试各种邮箱格式的校验结果
  - 验证注册接口的响应
  - 确保原有功能不受影响
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 测试空邮箱、空格邮箱的校验
  - `programmatic` TR-3.2: 测试格式错误的邮箱校验
  - `programmatic` TR-3.3: 测试格式正确的邮箱校验
  - `programmatic` TR-3.4: 测试注册接口的完整流程