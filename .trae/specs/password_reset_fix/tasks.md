# 密码重置接口改造 - 实现计划

## [x] Task 1: 分析当前密码重置接口实现
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 分析当前 resetPassword 函数的实现
  - 理解当前的验证和修改密码逻辑
  - 确定需要修改的部分
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-1.1: 确认对当前实现的理解
  - `programmatic` TR-1.2: 确认当前接口的行为
- **Notes**: 重点关注验证码的使用和密码更新逻辑

## [x] Task 2: 改造密码重置接口逻辑
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 修改 resetPassword 函数，使新密码参数变为非必填
  - 添加逻辑，根据是否传密码来决定操作类型
  - 当不传密码时，只验证账户信息和验证码
  - 当传入密码时，验证通过后更新密码并删除验证码
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `programmatic` TR-2.1: 验证不传密码时只验证不修改
  - `programmatic` TR-2.2: 验证传入密码时验证并修改
  - `programmatic` TR-2.3: 验证验证码只在修改密码时使用
- **Notes**: 确保错误处理逻辑保持一致

## [/] Task 3: 测试改造后的接口
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 测试验证账户信息模式
  - 测试修改密码模式
  - 测试错误场景
  - 验证验证码使用逻辑
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-3.1: 测试验证模式返回成功
  - `programmatic` TR-3.2: 测试修改模式返回成功
  - `programmatic` TR-3.3: 测试验证码错误返回错误信息
  - `programmatic` TR-3.4: 测试验证码在修改后过期
- **Notes**: 测试时需要使用真实的用户名和邮箱