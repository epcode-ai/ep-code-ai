# 接口名称: [接口名称，如"用户登录"]

> **接口 ID**: API-XXX-001
> **归属模块**: [模块名]
> **负责开发**: [姓名]
> **负责测试**: [姓名]
> **最后更新**: YYYY-MM-DD
> **版本**: v1.0.0

---

## 基本信息

| 项目 | 值 |
|------|-----|
| 方法 | `POST` / `GET` / `PUT` / `DELETE` / `PATCH` |
| 路径 | `/api/v1/...` |
| 认证 | 是否需要（Bearer Token / Cookie / 无） |
| 限流 | 每秒 N 次 / 无限制 |
| 幂等性 | 是 / 否 |
| 异步 | 是（返回 taskId）/ 否 |

## 请求

### Headers

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| Authorization | 是 | Bearer Token | `Bearer eyJhbGc...` |
| Content-Type | 是 | 固定值 | `application/json` |
| X-Request-ID | 否 | 请求追踪 ID | `req-12345` |

### Path Parameters

| 字段 | 类型 | 必填 | 说明 | 约束 |
|------|------|------|------|------|
| id | string | 是 | 资源 ID | UUID 格式 |

### Query Parameters

| 字段 | 类型 | 必填 | 说明 | 默认值 | 约束 |
|------|------|------|------|-------|------|
| page | int | 否 | 页码 | 1 | ≥ 1 |
| size | int | 否 | 每页数量 | 20 | 1-100 |

### Body

```json
{
  "username": "alice",
  "password": "P@ssw0rd123",
  "rememberMe": true
}
```

| 字段 | 类型 | 必填 | 说明 | 约束 |
|------|------|------|------|------|
| username | string | 是 | 用户名 | 3-20 字符，字母+数字+下划线 |
| password | string | 是 | 密码 | 8-32 字符，至少包含大小写字母和数字 |
| rememberMe | boolean | 否 | 是否记住登录 | 默认 false |

## 响应

### 成功响应（HTTP 200）

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 7200,
    "user": {
      "id": "usr-123",
      "username": "alice",
      "role": "admin"
    }
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 业务状态码，0 = 成功 |
| msg | string | 描述信息 |
| data.token | string | JWT Token |
| data.expiresIn | int | 过期时间（秒） |
| data.user.id | string | 用户 ID |
| data.user.role | string | 角色：admin / user / guest |

### 业务错误码

| code | HTTP | 含义 | 触发场景 |
|------|------|------|---------|
| 0 | 200 | 成功 | - |
| 1001 | 401 | 用户名或密码错误 | 认证失败 |
| 1002 | 403 | 账户被锁定 | 失败超 5 次 |
| 1003 | 400 | 参数错误 | 参数不符合约束 |
| 5001 | 500 | 系统错误 | 服务异常 |

## 示例

### 请求示例

```bash
curl -X POST https://api.example.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "password": "P@ssw0rd123",
    "rememberMe": true
  }'
```

### 成功响应示例

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOi...",
    "expiresIn": 7200,
    "user": {
      "id": "usr-123",
      "username": "alice",
      "role": "admin"
    }
  }
}
```

### 失败响应示例

```json
{
  "code": 1001,
  "msg": "用户名或密码错误",
  "data": null
}
```

## 测试用例提示（给测试人员的建议）

### 边界值

- username: 2/3/20/21 字符
- password: 7/8/32/33 字符

### 等价类

- 有效输入：合法字符组合
- 无效输入：特殊字符、空值、超长

### 异常场景

- SQL 注入：`' OR 1=1 --`
- XSS：`<script>alert(1)</script>`
- Unicode 字符：emoji、中文
- 空字符串 vs null vs 不传

### 安全场景

- 密码明文不允许在日志中出现
- 失败 5 次后触发锁定
- Token 过期后拒绝访问

### 性能场景

- 单接口 QPS 基线：1000
- 响应时间 P99：< 200ms

### 并发场景

- 同账号同时登录
- 同账号快速连续登录

## 变更历史

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0.0 | 2026-04-15 | 初版 | 张三 |
| v1.1.0 | 2026-04-20 | 新增 rememberMe 字段 | 李四 |

## 相关接口

- [用户登出](../auth/logout.md)
- [刷新 Token](../auth/refresh-token.md)
- [修改密码](../user/change-password.md)
