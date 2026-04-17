# 接口: 发起请假

> **接口 ID**: API-LEAVE-001
> **归属模块**: leave-api
> **负责开发**: 赵工
> **负责测试**: 陈测试
> **最后更新**: 2026-04-10
> **版本**: v1.0.0

---

## 基本信息

| 项目 | 值 |
|------|-----|
| 方法 | `POST` |
| 路径 | `/api/v1/leaves` |
| 认证 | 是（SSO JWT） |
| 限流 | 每用户 10 req/min |
| 幂等性 | 是（通过 `Idempotency-Key` header） |
| 异步 | 否（同步返回创建结果） |

## 请求

### Headers

| 字段 | 必填 | 说明 | 示例 |
|------|------|------|------|
| Authorization | 是 | Bearer Token | `Bearer eyJhbGc...` |
| Content-Type | 是 | | `application/json` |
| Idempotency-Key | 否 | 客户端防重 UUID | `550e8400-e29b-41d4-a716-446655440000` |
| X-Request-ID | 否 | 追踪 ID | `req-20260415-abc` |

### Body

```json
{
  "type": "annual",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "days": 3.0,
  "reason": "家中有事需要回家处理一下"
}
```

| 字段 | 类型 | 必填 | 说明 | 约束 |
|------|------|------|------|------|
| type | enum | 是 | 假期类型 | annual / sick / personal / marriage / bereavement |
| startDate | string (ISO date) | 是 | 起始日期 | 格式 YYYY-MM-DD，≥ 今天（sick 除外） |
| endDate | string (ISO date) | 是 | 结束日期 | ≥ startDate |
| days | decimal | 是 | 请假天数 | 0.5 的倍数，1-30 |
| reason | string | 是 | 请假原因 | 10-500 字符 |

## 响应

### 成功响应（HTTP 201）

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": "018e6a82-3f5b-7a21-aabb-ccddeeff0011",
    "status": "pending",
    "type": "annual",
    "startDate": "2026-05-01",
    "endDate": "2026-05-03",
    "days": 3.0,
    "reason": "家中有事需要回家处理一下",
    "approver": {
      "id": "018e6a82-3f5b-7a21-aabb-ccddeeff0099",
      "name": "王经理",
      "email": "wang.manager@company.com"
    },
    "createdAt": "2026-04-15T10:30:00Z"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| data.id | UUID | 请假单 ID |
| data.status | enum | 固定 `pending`（刚创建） |
| data.approver | object | 匹配的审批人（员工的直接主管） |
| data.createdAt | ISO 8601 UTC | 创建时间 |

### 业务错误码

| code | HTTP | 含义 | 数据 |
|------|------|------|------|
| 0 | 201 | 成功 | 请假单对象 |
| 1001 | 400 | 假期余额不足 | `{ balanceAvailable: 1.0, balanceNeeded: 3.0 }` |
| 1002 | 409 | 日期冲突 | `{ conflictLeaveId: "L-042" }` |
| 1003 | 400 | 参数校验失败 | `{ errors: [{field, reason}] }` |
| 1004 | 400 | 跨年请假但下年额度未开放 | `{ nextYear: 2027 }` |
| 1005 | 400 | 起始日期早于今天 | `{ minDate: "2026-04-15" }` |
| 2001 | 403 | 无权限（非本人操作） | |
| 3001 | 404 | 员工无直接主管（HR 兜底） | `{ fallback: "hr" }` |
| 5000 | 500 | 系统错误 | `{ traceId }` |

## 示例

### 成功示例

```bash
curl -X POST https://leave.company.com/api/v1/leaves \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -d '{
    "type": "annual",
    "startDate": "2026-05-01",
    "endDate": "2026-05-03",
    "days": 3.0,
    "reason": "家中有事需要回家处理一下"
  }'
```

### 余额不足失败示例

```json
{
  "code": 1001,
  "msg": "年假余额不足",
  "data": {
    "balanceAvailable": 1.0,
    "balanceNeeded": 3.0,
    "suggestion": "请减少至 1 天或选择其他假期类型"
  }
}
```

## 测试用例提示

### 边界值
- `days`: 0.5 / 1.0 / 30.0 / 30.5（超限）
- `reason`: 9 字符（拒绝）/ 10 字符（通过）/ 500 字符（通过）/ 501 字符（拒绝）
- `startDate`: 今天 / 明天 / 昨天（拒绝,除 sick）

### 等价类
- 有效输入: 合法的各类组合
- 无效输入: enum 不支持的 type, 日期格式错误

### 异常场景
- SQL 注入: `reason: "' OR 1=1 --"`
- XSS: `reason: "<script>alert(1)</script>"`
- 超长字符串: `reason: "a" * 10000`
- Unicode: `reason: "测试 🎉 emoji"`

### 安全场景
- 员工用别人的 token 提交（应该 403）
- Token 过期（应该 401）
- 员工 A 帮员工 B 提交请假（userId 不匹配，应该 403）

### 性能场景
- 单接口 QPS: 100
- P99: < 500ms
- 并发 100 人同时发起请假

### 幂等性测试
- 相同 `Idempotency-Key` 重复请求 5 次，应只创建 1 张单

## 变更历史

| 版本 | 日期 | 变更 | 作者 |
|------|------|------|------|
| v1.0.0 | 2026-04-10 | 初版 | 赵工 |

## 相关接口

> **填写示例**（实际填写时替换）：
>
> ```
> - [列表查询](./list-leaves.md)
> - [主管审批通过](./approve-leave.md)
> - [查询假期余额](./balance.md)
> ```
