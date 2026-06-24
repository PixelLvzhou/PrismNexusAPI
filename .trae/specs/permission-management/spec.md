# 权限管理系统 - 产品需求文档

## Overview
- **Summary**: 本需求旨在扩展现有的权限管理系统，为开发者和管理员账户提供精细化的权限管理能力。包括权限管理页面、权限申请/审批流程、详情弹框组件开发，以及后端权限相关的接口改造。
- **Purpose**: 实现账户的精细化、具体化权限管理，支持开发者直接分配权限和其他账户主动申请获得权限两种方式。
- **Target Users**: 开发者账户（审批者）、管理员账户（申请者）

## Goals
- [ ] 新增权限管理入口（管理员可见）
- [ ] 新增权限管理页面，展示账户列表及权限状态
- [ ] 新增详情弹框组件（用于展示详细信息）
- [ ] 导航管理页新增权限申请功能
- [ ] 权限申请列表页面（待审批/已通过/已驳回/已过期）
- [ ] 后端权限申请接口开发
- [ ] 后端账户信息接口改造（新增权限状态字段）
- [ ] 后端权限申请列表查询接口（查询/取消/审批）

## Non-Goals (Out of Scope)
- [ ] 普通用户的权限管理（暂不考虑）
- [ ] 权限编码的动态配置功能
- [ ] 权限申请的有效期延长功能

## Background & Context
- 现有系统已有账户管理模块，包含developer、admin、user三种角色
- 现有导航管理功能仅对开发者账户开放
- 需要扩展：管理员账户也能进入导航管理页，但需要进行权限申请才能操作
- 前端使用Vue3 + TypeScript + TailwindCSS
- 后端使用Node.js + Express + SQLite

## 权限编码体系

### 权限编码定义
| 编码 | 名称 | 说明 |
|------|------|------|
| `NAV_MANAGE` | 导航管理权限 | 可对导航进行增删改查操作 |
| `ACCOUNT_MANAGE` | 账户管理权限 | 可对账户进行管理操作（预留） |
| `USER_MANAGE` | 用户管理权限 | 可对用户进行管理操作（预留） |

### 权限继承规则
- **开发者（developer）**：默认拥有所有权限，不需要申请
- **管理员（admin）**：默认无具体操作权限，需要申请
- **普通用户（user）**：暂无权限管理入口

## 功能需求

### 前端功能需求

#### FR-1: 权限管理入口
- 在导航管理入口下方新增"权限管理"菜单入口
- **仅开发者可见**（管理员不应看到此入口）

#### FR-2: 权限管理页面布局
- 页面结构与账户管理页风格一致
- 顶部有开关切换：权限管理 / 权限申请
- 搜索框：支持按ID或用户名搜索

#### FR-3: 权限管理容器（列表模式）
- 展示字段：ID、头像、用户名、邮箱、角色、状态、权限能力
- 权限能力列：显示权限标签 + "查看详情"按钮
- 点击"查看详情"按钮，弹出详情弹框

#### FR-4: 权限详情弹框组件（DetailDialog）
- 样式风格与ConfirmDialog一致
- 保留插槽 `<slot>` 用于展示自定义详情内容
- 与ConfirmDialog区分：ConfirmDialog用于二级确认提示，DetailDialog用于展示详细信息
- 支持关闭按钮

#### FR-5: 权限申请容器（申请模式）- 仅开发者可见
- 展示所有申请记录列表
- 状态筛选：全部 / 待审批 / 已通过 / 已驳回 / 已过期
- 待审批记录：显示通过、驳回按钮（仅开发者可见）
- 其他状态：仅展示，无取消申请按钮

#### FR-6: 导航管理页权限申请功能
- 在搜索框右侧新增"权限申请"按钮
- 按钮状态逻辑：
  - 开发者：隐藏此按钮（默认拥有权限）
  - 管理员+已有权限：禁用按钮，文案"已拥有"
  - 管理员+无权限+无申请：可点击，文案"申请权限"
  - 管理员+无权限+有申请中：禁用按钮，文案"已申请"（下方显示取消申请按钮）
  - 管理员+无权限+已过期+重新申请：可点击，文案"申请权限"
- 点击申请按钮需二级确认弹框

#### FR-7: 导航管理页申请记录展示 - 仅申请者本人可见
- 在权限申请按钮下方展示当前管理员用户的申请状态
- 展示内容：申请人账户名、申请权限名称、申请时间、剩余时效、审批人、审批状态
- 状态颜色：待审批（黄色）、通过（绿色）、驳回（灰色）、过期（红色）
- 驳回状态：显示驳回原因
- 取消申请按钮：**在"管理员+无权限+有申请中"状态下显示**，申请人可取消（需二级确认），取消后按钮文案改为"已取消"并置灰
- **重要说明**：取消申请按钮在导航管理页展示，不在权限管理页的申请列表里

#### FR-8: 权限管理页申请列表操作 - 仅开发者可见
- 待审批记录：显示通过、驳回按钮
- 驳回需填写原因
- 已通过/已驳回/已过期：仅展示，不显示操作按钮
- **注意**：此处没有取消申请按钮，取消申请功能在导航管理页

### 后端功能需求

#### FR-9: 权限申请接口
- **接口路径**: `POST /api/permission/apply`
- **认证要求**: 需要JWT认证
- **权限要求**: 仅管理员账户可申请
- **请求参数**:
```json
{
  "permission_code": "NAV_MANAGE"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "申请已提交",
  "application_id": 1,
  "expires_at": "2024-01-02T12:00:00Z"
}
```
- **业务逻辑**:
  - 检查用户是否已拥有该权限（拥有则返回已拥有）
  - 检查是否有待审批的申请（已有则返回申请中）
  - 创建申请记录，时效24小时
  - 返回申请ID和过期时间

#### FR-10: 权限申请列表查询接口
- **接口路径**: `POST /api/permission/applications`
- **认证要求**: 需要JWT认证
- **权限要求**: 仅管理员和开发者可访问
- **请求参数**:
```json
{
  "type": "query",  // query | cancel | approve | reject
  "page": 1,
  "page_size": 10,
  "status": "pending"  // 可选：pending/approved/rejected/expired/all
}
```
- **取消申请**:
```json
{
  "type": "cancel",
  "application_id": 1
}
```
- **审批通过**:
```json
{
  "type": "approve",
  "application_id": 1
}
```
- **审批驳回**:
```json
{
  "type": "reject",
  "application_id": 1,
  "reject_reason": "不符合申请条件"
}
```

#### FR-11: 账户信息接口改造
- 改造现有的账户列表接口，新增权限状态字段
- **新增字段** `permissions`:
```json
{
  "permissions": [
    {
      "code": "NAV_MANAGE",
      "name": "导航管理权限",
      "granted": true,
      "granted_at": "2024-01-01T12:00:00Z",
      "granted_by": 1
    },
    {
      "code": "ACCOUNT_MANAGE",
      "name": "账户管理权限",
      "granted": false
    }
  ]
}
```

#### FR-12: 用户权限查询接口
- **接口路径**: `GET /api/permission/my-permissions`
- **认证要求**: 需要JWT认证
- **响应**: 返回当前用户的权限列表及状态

#### FR-13: 数据库变更
- **新增表**: `permission_applications`（权限申请表）
  - `id` - 申请记录ID（主键）
  - `applicant_id` - 申请人ID（外键）
  - `permission_code` - 权限编码
  - `status` - 状态（pending/approved/rejected/expired/cancelled）
  - `approver_id` - 审批人ID（通过/驳回时记录）
  - `reject_reason` - 驳回原因
  - `expires_at` - 过期时间
  - `created_at` - 创建时间
  - `updated_at` - 更新时间
- **新增表**: `user_permissions`（用户权限表）
  - `id` - 记录ID（主键）
  - `user_id` - 用户ID（外键）
  - `permission_code` - 权限编码
  - `granted_at` - 授予时间
  - `granted_by` - 授予人ID
  - UNIQUE(user_id, permission_code)

## 路由权限控制

### 前端路由权限
| 路由 | 开发者 | 管理员 | 普通用户 |
|------|--------|--------|----------|
| /navigation-manage | 可进入（可操作） | 可进入（需权限） | 不可见 |
| /permission-manage | 可进入 | 不可见 | 不可见 |

### 后端API权限
| API | 开发者 | 管理员 | 普通用户 |
|-----|--------|--------|----------|
| POST /api/permission/apply | 不可申请（默认拥有） | 可申请 | 不可申请 |
| POST /api/permission/applications (query) | 可查询 | 可查询 | 不可查询 |
| POST /api/permission/applications (approve/reject) | 可审批 | 不可审批 | 不可审批 |
| POST /api/permission/applications (cancel) | 可取消自己的 | 可取消自己的 | 不可取消 |

## 状态机设计

### 申请记录状态流转
```
[申请提交]
    ↓ (创建)
[待审批 pending]
    ↓──┬──→ [已通过 approved] (审批通过)
    │                    ↓
    │               [权限生效]
    │
    ├──→ [已驳回 rejected] (审批驳回)
    │         ↓
    │    [申请人可见驳回原因]
    │
    ├──→ [已取消 cancelled] (申请人主动取消)
    │         ↓
    │      [流程结束]
    │
    └──→ [已过期 expired] (24小时时效到期)
              ↓
           [流程结束]
```

## Open Questions
- [x] 审批人角色：已确认只有开发者
- [x] 时效计算：已确认从申请创建时开始
- [x] 驳回原因：已确认需要
- [x] 权限生效：已确认永久生效
- [ ] 普通用户是否需要权限管理入口？（暂不考虑）
- [ ] 是否需要通知申请人审批结果？（暂不考虑，可后期扩展）

## Acceptance Criteria

### AC-1: 权限管理入口显示
- **Given**: 当前登录用户是管理员
- **When**: 打开导航管理下拉菜单
- **Then**: 显示"权限管理"入口
- **Verification**: human-judgment

### AC-2: 权限管理页面布局
- **Given**: 用户进入权限管理页面
- **When**: 查看页面布局
- **Then**: 包含开关切换（权限管理/权限申请）、搜索框、账户列表
- **Verification**: human-judgment

### AC-3: 权限申请流程
- **Given**: 当前登录用户是管理员且无NAV_MANAGE权限
- **When**: 在导航管理页点击"申请权限"按钮并确认
- **Then**: 创建申请记录，页面显示"已申请"状态
- **Verification**: human-judgment

### AC-4: 权限审批流程
- **Given**: 当前登录用户是开发者，有待审批申请
- **When**: 在权限申请列表中点击"通过"按钮
- **Then**: 申请状态变为已通过，用户获得该权限
- **Verification**: human-judgment

### AC-5: 权限驳回流程
- **Given**: 当前登录用户是开发者，有待审批申请
- **When**: 在权限申请列表中点击"驳回"按钮并填写原因
- **Then**: 申请状态变为已驳回，申请人可看到驳回原因
- **Verification**: human-judgment

### AC-6: 申请时效过期
- **Given**: 存在一条待审批申请，已超过24小时
- **When**: 系统定时任务执行或用户刷新列表
- **Then**: 申请状态自动变为已过期
- **Verification**: programmatic

### AC-7: 账户权限状态查询
- **Given**: 开发者查询账户列表
- **When**: 查看某用户的权限能力列
- **Then**: 显示该用户拥有的具体权限列表
- **Verification**: human-judgment

### AC-8: 详情弹框展示
- **Given**: 用户点击某账户的"查看详情"按钮
- **When**: 弹出详情弹框
- **Then**: 弹框内显示该账户的完整权限信息
- **Verification**: human-judgment

## Technical Constraints

### 前端
- Vue 3 + TypeScript
- 使用现有的 ConfirmDialog 组件风格
- 详情弹框需新封装为 DetailDialog 组件

### 后端
- Node.js + Express
- SQLite 数据库
- JWT 认证

### 数据库
- 新增 `permission_applications` 表
- 新增 `user_permissions` 表
- 用户表需添加 `permissions` 字段的关联或冗余设计

## Implementation Priority

### Phase 1: 后端基础建设
1. 数据库表创建
2. 权限申请接口
3. 权限查询接口
4. 审批/驳回/取消接口
5. 账户信息接口改造

### Phase 2: 前端组件开发
1. DetailDialog 组件封装
2. 权限管理页面框架
3. 权限申请功能
4. 申请记录展示

### Phase 3: 功能完善
1. 导航管理页申请按钮集成
2. 申请时效过期处理
3. 驳回原因展示
