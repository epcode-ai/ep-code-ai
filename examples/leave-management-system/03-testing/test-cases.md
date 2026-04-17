# 员工请假管理系统 · 测试用例集 v1.0

**模块**: 请假管理
**负责测试**: 陈测试 / 李测试
**版本**: v1.0
**最后更新**: 2026-04-14

## 测试范围

见 [test-strategy.md](./test-strategy.md)。

## 用例统计

| 模块 | 用例数 | P0 | P1 | P2 | 自动化 |
|------|-------|-----|-----|-----|-------|
| 发起请假 | 32 | 18 | 10 | 4 | 24 |
| 审批 | 24 | 14 | 8 | 2 | 18 |
| 查询 | 18 | 10 | 6 | 2 | 14 |
| 余额 | 14 | 8 | 4 | 2 | 10 |
| 权限 | 12 | 12 | 0 | 0 | 8 |
| 异常/边界 | 22 | 8 | 10 | 4 | 12 |
| **合计** | **122** | **70** | **38** | **14** | **86 (70%)** |

## 用例（节选，典型示例）

### 发起请假

#### TC-LEAVE-001 正常发起年假（成功）

| 项目 | 内容 |
|------|------|
| 用例 ID | TC-LEAVE-001 |
| 优先级 | P0 |
| 类型 | 功能 |
| 关联需求 | REQ-001 AC-1 / US-001 AC-1 |
| 自动化 | 🤖 是（test_create_leave_annual_success） |

**前置条件**:
- 账号 `test.employee.2` 已登录
- 账号年假余额 ≥ 5 天

**测试数据**:
```json
{
  "type": "annual",
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "days": 3.0,
  "reason": "五一连休想在家休息一下"
}
```

**测试步骤**:
1. 调用 `POST /api/v1/leaves` 带上述数据
2. 检查响应

**预期结果**:
- HTTP 201
- `code: 0, msg: "success"`
- `data.id` 是 UUID
- `data.status == "pending"`
- `data.approver.id` = test.employee.2 的直接主管 test.manager.1
- DB 中新增 1 条 `leave` 记录
- DB 中新增 1 条 `leave_audit` 记录（action=create）
- RabbitMQ 发布了 1 条 `leave.created` 事件
- 60 秒内主管收到站内消息和邮件

---

#### TC-LEAVE-002 年假余额不足（拒绝）

| 项目 | 内容 |
|------|------|
| 用例 ID | TC-LEAVE-002 |
| 优先级 | P0 |
| 关联需求 | REQ-001 AC-2 |
| 自动化 | 🤖 是 |

**前置条件**:
- 账号 `test.employee.3` 已登录
- 年假余额 = 1 天

**测试数据**: days = 3.0（超过余额）

**步骤**: 调用发起接口

**预期**:
- HTTP 400
- `code: 1001`
- `data.balanceAvailable: 1.0, balanceNeeded: 3.0`
- DB 中 **不新增** 任何记录

---

#### TC-LEAVE-003 边界值: days=0.5（半天）

| 项目 | 内容 |
|------|------|
| 用例 ID | TC-LEAVE-003 |
| 优先级 | P0 |
| 自动化 | 🤖 是 |

**前置**: 员工,余额 ≥ 1

**数据**:
```json
{
  "type": "sick",
  "startDate": "2026-05-01",
  "endDate": "2026-05-01",
  "days": 0.5,
  "reason": "上午身体不舒服休息半天"
}
```

**预期**:
- HTTP 201
- `data.days == 0.5`
- 余额扣减 0.5

---

#### TC-LEAVE-004 边界值: days=0（拒绝）

| 项目 | 内容 |
|------|------|
| 用例 ID | TC-LEAVE-004 |
| 优先级 | P1 |

**预期**: HTTP 400, code 1003, 错误提示 "days 必须 ≥ 0.5"

---

#### TC-LEAVE-005 边界值: days=30.5（超上限）

**预期**: HTTP 400, code 1003

---

#### TC-LEAVE-006 边界值: reason=9 字符（拒绝）

**数据**: `reason: "123456789"` (9 字符)
**预期**: HTTP 400, code 1003

---

#### TC-LEAVE-007 边界值: reason=500 字符（通过）

---

#### TC-LEAVE-008 边界值: reason=501 字符（拒绝）

---

#### TC-LEAVE-009 跨年请假（通过）

**前置**:
- 当前时间 2026-12-28
- 2027 年年假余额已开放
- 员工余额 2026 有 2 天、2027 有 5 天

**数据**:
```json
{
  "type": "annual",
  "startDate": "2026-12-29",
  "endDate": "2027-01-02",
  "days": 5.0,
  "reason": "春节回老家"
}
```

**预期**:
- HTTP 201
- 2026 余额扣减 2（12-29, 12-30）
- 2027 余额扣减 3（1-1 节假日?按需）

---

#### TC-LEAVE-010 跨年请假（2027 未开放，拒绝）

**前置**: 2027 年额度未结算
**预期**: HTTP 400, code 1004

---

#### TC-LEAVE-011 日期冲突

**前置**: 员工已有 pending 请假 2026-05-01 ~ 2026-05-05
**数据**: startDate=2026-05-03, endDate=2026-05-03
**预期**: HTTP 409, code 1002, data.conflictLeaveId

---

#### TC-LEAVE-012 起始日期早于今天（拒绝）

**数据**: startDate 是昨天
**预期**: HTTP 400, code 1005

---

#### TC-LEAVE-013 病假 + 起始日期早于今天（例外通过）

**说明**: 病假允许补录
**数据**: type=sick, startDate=昨天
**预期**: HTTP 201（业务规则例外）

---

#### TC-LEAVE-014 安全: SQL 注入 reason

**数据**: `reason: "' OR 1=1 --; DROP TABLE leave; --"`
**预期**:
- HTTP 201 或 400（按校验规则）
- DB 未被破坏
- reason 字段原样存储（被 ORM 参数化）

---

#### TC-LEAVE-015 安全: XSS reason

**数据**: `reason: "<script>alert('XSS')</script>还好吗"`
**预期**:
- HTTP 201
- 前端展示时转义,不执行 JS

---

#### TC-LEAVE-016 幂等性: 相同 Idempotency-Key 重复提交

**步骤**:
1. 用同一 Idempotency-Key 提交 5 次
**预期**:
- DB 中只创建 1 条 leave
- 5 次响应都是 201 + 相同的 leave id

---

#### TC-LEAVE-017 并发: 同员工快速连击提交

**步骤**: 3 个并发请求,相同内容
**预期**: 只创建 1 条（基于 Idempotency-Key 或 DB 唯一约束）

---

#### TC-LEAVE-018 员工无直接主管（兜底 HR）

**账号**: test.employee.orphan
**预期**:
- HTTP 201
- `data.approver` = HR 角色员工
- 通知发给 HR

---

### 审批

#### TC-LEAVE-101 主管通过审批

| 项目 | 内容 |
|------|------|
| 用例 ID | TC-LEAVE-101 |
| 优先级 | P0 |
| 关联需求 | REQ-004 AC-1 / US-101 AC-1 |

**前置**: test.manager.1 登录,有一条 pending 请假 L-001

**步骤**: POST /api/v1/leaves/L-001/approve

**预期**:
- HTTP 200
- leave.status → approved
- leave.approver_id 设置
- leave.approved_at 设置
- leave_balance.used += leave.days
- leave_audit 新增 action=approve
- 员工收到通知

---

#### TC-LEAVE-102 驳回审批（需要原因）

**步骤**: POST /approve/reject, body: `{ reason: "项目关键节点不能休假" }`
**预期**: status → rejected

---

#### TC-LEAVE-103 驳回审批（原因缺失）

**步骤**: 不带 reason
**预期**: HTTP 400, code 1003

---

#### TC-LEAVE-104 问询 → 员工修改 → 重新提交

**步骤**:
1. 主管问询: POST /query, body: `{ question: "请说明具体原因" }`
2. 员工修改 reason
3. 员工重新提交: PUT /leaves/L-001
**预期**: 回到 pending, query_count = 1

---

#### TC-LEAVE-105 问询 3 次后自动驳回

**步骤**: 主管问询 3 次
**预期**: 第 3 次问询后状态 = rejected, 员工无法再修改

---

#### TC-LEAVE-106 非主管审批（拒绝）

**账号**: test.employee.2（不是主管）
**步骤**: POST /leaves/L-001/approve
**预期**: HTTP 403, code 2001

---

#### TC-LEAVE-107 非直接主管审批（拒绝）

**账号**: test.manager.new（不是该员工的主管）
**预期**: HTTP 403, code 2001

---

#### TC-LEAVE-108 重复审批（状态错误）

**前置**: leave 已经是 approved
**步骤**: 再次 POST /approve
**预期**: HTTP 409, code 2002

---

#### TC-LEAVE-109 并发审批（竞态）

**步骤**: 同一 leave,2 个并发 approve 请求
**预期**:
- 只有 1 个成功（HTTP 200）
- 另一个返回 409 或 200 但不重复扣余额
- leave_audit 只记 1 条 approve

---

### 余额

#### TC-LEAVE-201 新员工按月折算年假

**账号**: test.employee.new（2026-07-01 入职,工龄 < 1 年?实际 5 年在别公司,按本公司工龄算）
**预期**: 年假 = 5 × 6/12 = 2.5 向下取整 = 2 天

---

#### TC-LEAVE-202 年度年假 12/31 清零

**前置**: 设置系统时间为 2026-12-31 23:59
**触发**: 定时任务 cron
**预期**: 所有未使用年假余额 → 0（记录在 leave_balance_audit）

---

### 权限矩阵

#### TC-LEAVE-301 员工 scope=self ✅

#### TC-LEAVE-302 员工 scope=team ❌ 403

#### TC-LEAVE-303 员工 scope=all ❌ 403

#### TC-LEAVE-304 主管 scope=self ✅

#### TC-LEAVE-305 主管 scope=team ✅（只返直接下属）

#### TC-LEAVE-306 主管 scope=all ❌ 403

#### TC-LEAVE-307 HR scope=self ✅

#### TC-LEAVE-308 HR scope=team ✅（全公司）

#### TC-LEAVE-309 HR scope=all ✅（全公司）

#### TC-LEAVE-310 员工看别人的详情（拒绝）

#### TC-LEAVE-311 员工改别人的请假（拒绝）

#### TC-LEAVE-312 越权: 伪造 Token header

---

### 性能

#### TC-LEAVE-401 单接口 QPS 100

**工具**: Locust
**预期**: P99 ≤ 500ms,错误率 < 0.5%

---

#### TC-LEAVE-402 并发 300 人同时发起请假

**预期**: 无数据异常,各请求正确对应各自用户

---

### 兼容性

#### TC-LEAVE-501 Chrome 120 + macOS
#### TC-LEAVE-502 Chrome 120 + Windows
#### TC-LEAVE-503 Edge 120 + Windows
#### TC-LEAVE-504 Safari 16 + macOS
#### TC-LEAVE-505 分辨率 1280×720
#### TC-LEAVE-506 分辨率 1920×1080
#### TC-LEAVE-507 分辨率 3840×2160 (4K)

---

## 测试数据准备

```bash
# 1. 在 TEST 环境部署服务
kubectl apply -f manifests/test-env.yaml

# 2. 运行 seed 脚本
./scripts/seed-test-data.sh

# 3. 验证测试账号可登录
curl -u test.employee.1:password https://leave-test.internal/api/v1/auth/whoami
```

## 环境要求

- 测试环境: https://leave-test.internal.company.com
- 后端版本: v1.0.0-rc.N
- 数据库: PostgreSQL 15（独立实例）
- Mock SSO: https://sso-test.internal
- 测试邮箱: test-mail.internal

## 评审记录

| 评审人 | 角色 | 日期 | 意见 | 状态 |
|-------|------|------|------|------|
| 王小花 | 产品 | 2026-04-12 | 建议补充 TC-LEAVE-018 孤儿员工场景 | ✅ 已补 |
| 赵工 | 开发 | 2026-04-12 | 技术实现已覆盖 | ✅ 通过 |
| 李测试 | 测试 | 2026-04-13 | 建议加 TC-LEAVE-016/17 幂等和并发 | ✅ 已补 |
