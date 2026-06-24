# 认证接口 API 文档

## 概述
本文档描述了用户认证系统的API接口，包括登录、注册、验证码、密码重置等功能。

## 接口列表

### 1. 用户注册

**URL**: `/api/auth/register`
**方法**: `POST`
**功能**: 用户注册（需要邮箱验证码）

**请求体**:
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "newuser@163.com",
  "code": "123456"
}
```

**返回值**:
```json
{
  "message": "注册成功"
}
```

### 2. 用户登录

**URL**: `/api/auth/login`
**方法**: `POST`
**功能**: 用户登录，返回JWT令牌

**请求体**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**返回值**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

### 3. 发送验证码

**URL**: `/api/auth/send-code`
**方法**: `POST`
**功能**: 发送邮箱验证码（用于注册或密码重置）

**请求体**:
```json
{
  "type": "reg",  // 或 "mod"
  "username": "admin",  // 密码重置时需要
  "email": "admin@163.com"
}
```

**返回值**:
```json
{
  "message": "验证码已发送到您的邮箱"
}
```

### 4. 重置密码

**URL**: `/api/auth/reset-password`
**方法**: `POST`
**功能**: 重置用户密码（需要验证码）

**请求体**:
```json
{
  "type": "mod",
  "username": "admin",
  "email": "admin@163.com",
  "code": "123456",
  "newPassword": "newpassword123"  // 可选，不传则只验证验证码
}
```

**返回值**:
```json
{
  "message": "密码修改成功"
}
```

## 天气查询接口

### 5. 查询实时天气

**URL**: `/api/weather`
**方法**: `GET`
**功能**: 查询指定位置的实时天气信息

**查询参数**:
| 参数名 | 类型 | 描述 | 默认值 |
| ------ | ---- | ---- | ------ |
| city | string | 城市名称（仅用于显示） | 北京 |
| lat | number | 纬度 | 39.9042 |
| lon | number | 经度 | 116.4074 |

**示例请求**:
```
GET /api/weather
GET /api/weather?city=上海&lat=31.2304&lon=121.4737
```

**返回值**:
```json
{
  "city": "北京",
  "temperature": 24,
  "condition": "多云",
  "humidity": 60,
  "windSpeed": 15,
  "icon": "⛅"
}
```

## 系统接口

### 6. 健康检查

**URL**: `/health`
**方法**: `GET`
**功能**: 检查服务运行状态

**返回值**:
```json
{
  "status": "ok"
}
```

## 错误处理

所有接口返回标准的HTTP状态码：

| 状态码 | 描述 |
| ------ | ---- |
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

错误响应格式：
```json
{
  "error": "错误消息"
}
```

## 示例请求

### 使用curl登录
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

### 使用curl注册
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username": "newuser", "password": "password123", "email": "newuser@163.com", "code": "123456"}'
```

### 使用curl获取天气
```bash
curl -X GET "http://localhost:3000/api/weather"
```
