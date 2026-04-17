# 接口: 查询请假列表

> **接口 ID**: API-LEAVE-002
> **归属模块**: leave-api
> **负责开发**: 赵工
> **负责测试**: 陈测试
> **最后更新**: 2026-04-10
> **版本**: v1.0.0

---

## 基本信息

| 项目 | 值 |
|------|-----|
| 方法 | `GET` |
| 路径 | `/api/v1/leaves` |
| 认证 | 是 |
| 限流 | 每用户 60 req/min |
| 幂等性 | 是（GET 天然） |

## 请求

### Headers

| 字段 | 必填 | 说明 |
|------|------|------|
| Authorization | 是 | Bearer Token |

### Query Parameters

| 字段 | 类型 | 必填 | 说明 | 默认 | 约束 |
|------|------|------|------|------|------|
| scope | enum | 否 | 查询范围 | `self` | self / team / all（权限受限） |
| status | enum[] | 否 | 状态过滤 | 全部 | 多个用逗号分隔 |
| type | enum[] | 否 | 类型过滤 | 全部 | |
| startFrom | date | 否 | 起始日期下限 | - | YYYY-MM-DD |
| startTo | date | 否 | 起始日期上限 | - | |
| cursor | string | 否 | 分页游标 | - | 第 1 页不传 |
| limit | int | 否 | 每页数量 | 20 | 1-100 |

### 权限规则

| scope | 员工 | 主管 | HR |
|-------|------|------|-----|
| self | ✅ 自己的 | ✅ 自己的 | ✅ 自己的 |
| team | ❌ 403 | ✅ 直接下属的 | ✅ 全公司 |
| all | ❌ 403 | ❌ 403 | ✅ 全公司 |

## 响应

### 成功响应（HTTP 200）

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "items": [
      {
        "id": "018e6a82-3f5b-7a21-aabb-ccddeeff0011",
        "type": "annual",
        "startDate": "2026-05-01",
        "endDate": "2026-05-03",
        "days": 3.0,
        "status": "pending",
        "reason": "家中有事...",
        "approver": {
          "id": "...",
          "name": "王经理"
        },
        "createdAt": "2026-04-15T10:30:00Z"
      }
    ],
    "nextCursor": "eyJpZCI6IjAxOGU2YTgyLTNmNWIiLCJjcmVhdGVkQXQiOiIyMDI2LTA0LTE1In0=",
    "total": 42
  }
}
```

| 字段 | 说明 |
|------|------|
| data.items | 请假单数组 |
| data.nextCursor | 下一页游标，null 表示已到末页 |
| data.total | 符合条件的总数（仅首页返回） |

### 业务错误码

| code | HTTP | 含义 |
|------|------|------|
| 0 | 200 | 成功 |
| 1003 | 400 | 参数校验失败（日期格式、枚举值等） |
| 2001 | 403 | 权限不足（如 scope=all 但不是 HR） |
| 2003 | 403 | 非直接主管但 scope=team |
| 5000 | 500 | 系统错误 |

## 示例

### 查询自己本月的已通过请假

```bash
curl "https://leave.company.com/api/v1/leaves?scope=self&status=approved&startFrom=2026-04-01&startTo=2026-04-30" \
  -H "Authorization: Bearer eyJhbGc..."
```

### 主管查询团队的待审批

```bash
curl "https://leave.company.com/api/v1/leaves?scope=team&status=pending" \
  -H "Authorization: Bearer eyJhbGc..."
```

### 分页

```bash
# 第 1 页
curl "https://leave.company.com/api/v1/leaves?scope=self&limit=20" ...

# 第 2 页（用第 1 页返回的 nextCursor）
curl "https://leave.company.com/api/v1/leaves?scope=self&limit=20&cursor=eyJ..." ...
```

## 测试用例提示

### 边界值
- `limit`: 0 / 1 / 100 / 101
- `cursor`: 空 / 有效 / 已失效 / 伪造

### 权限矩阵
| 角色 | scope=self | scope=team | scope=all |
|------|-----------|-----------|-----------|
| 员工 | ✅ | ❌ | ❌ |
| 主管 | ✅ | ✅ | ❌ |
| HR | ✅ | ✅ | ✅ |

每个组合都要有用例。

### 数据量
- 空结果（新员工）
- 单页（< 20 条）
- 多页（> 20 条，需要翻页）
- 大数据量（HR 查 5000+ 条）

### 性能
- P99 ≤ 300ms
- 全量导出（HR scope=all）需要支持流式

### 并发
- 同用户同时发起多次列表查询
- 分页期间数据变化（新增、状态变更）

## 变更历史

| 版本 | 日期 | 变更 | 作者 |
|------|------|------|------|
| v1.0.0 | 2026-04-10 | 初版 | 赵工 |
