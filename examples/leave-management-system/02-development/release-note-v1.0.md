# Release Note: 员工请假管理系统 v1.0.0

**发布日期**: 2026-04-25
**发布类型**: 首次发布
**上线方式**: 灰度发布（HR 5 人 → IT 30 人 → 全员）

## 摘要

员工请假管理系统 v1.0 正式上线。员工可以自助申请请假，主管统一入口审批，HR 一键导出月度统计。取代原先的"钉钉填表 + 邮件审批"流程。

## 新增功能

### 员工侧

- 🆕 **发起请假** — 选假期类型 → 选日期 → 填原因 → 提交 (REQ-001, US-001)
- 🆕 **查询请假历史** — 近 6 个月默认展示，支持筛选 (REQ-002, US-002)
- 🆕 **查询假期余额** — 5 类假期的总额、已用、剩余一目了然 (REQ-003, US-003)

### 主管侧

- 🆕 **审批请假** — 通过 / 驳回 / 问询三种操作 (REQ-004, US-101)
- 🆕 **查看团队假期** — 本月谁在休、谁下周休 (REQ-005, US-102)

### HR 侧

- 🆕 **月度统计导出** — 按部门、按假期类型分组的 Excel (REQ-006, US-201)

## 变更说明

- 原"邮件审批"流程**保留 30 天过渡期**，期间两种方式均可使用
- 6 月 1 日起强制使用新系统

## 已知问题

- **大数据量导出性能**：HR 导出 > 5000 行时耗时约 15 秒（目标 ≤ 10 秒）
  - 临时方案：提示用户缩小时间范围
  - 计划在 v1.1（5 月）优化
- **移动端体验**：v1.0 未针对手机浏览器优化，建议 PC 使用
  - v2 将推出独立移动 App

## 升级指南

### 对员工

1. 用企业邮箱 SSO 登录 https://leave.company.com
2. 第一次登录会看到"新手引导"
3. 原有邮件里的"请假中"记录不会自动导入，如需补录请联系 HR

### 对主管

1. 同上登录
2. 未处理的老邮件请假需要自行处理完毕（过渡期结束前）

### 对 HR

1. 首次使用前联系 IT 给你 HR 角色权限
2. 月度统计建议放在每月 5 日前完成

### 对 IT 运维

#### 数据库

```bash
# 新增 PostgreSQL 15 实例
# 服务器: hr-pg-prod.internal （4c8g, 500GB SSD）
# 已通过 Migration 创建所有表
```

#### 服务

```bash
# 新增 2 个 Pod
kubectl -n hr apply -f manifests/leave-api.yaml
kubectl -n hr apply -f manifests/notification-worker.yaml
```

#### 配置

新增配置项（已在配置中心）:
- `LEAVE_API_URL=https://leave-api.internal.company.com`
- `LEAVE_DB_HOST=hr-pg-prod.internal`
- `LEAVE_QUERY_MAX_COUNT=3`
- `LEAVE_APPROVAL_TIMEOUT_HOURS=48`

## 架构

- Web 前端: Next.js 14 + Tailwind
- 后端: Node.js 20 + Fastify + Prisma
- 数据库: PostgreSQL 15
- 队列: 复用现有 RabbitMQ
- 认证: 复用公司 SSO

详见 [design-doc.md](./design-doc.md)。

## API 变化

全新系统，所有接口均为新增：

- `POST /api/v1/leaves` — 发起请假
- `GET /api/v1/leaves` — 查询列表
- `GET /api/v1/leaves/:id` — 查询详情
- `POST /api/v1/leaves/:id/approve` — 审批通过
- `POST /api/v1/leaves/:id/reject` — 审批驳回
- `POST /api/v1/leaves/:id/query` — 审批问询
- `GET /api/v1/leaves/balance` — 查询余额
- `GET /api/v1/leaves/stats` — HR 统计（仅 HR）

完整文档见 [api-docs/](./api-docs/)。

## 性能数据（上线前压测）

| 接口 | 目标 P99 | 实测 P99 | QPS 目标 | QPS 实测 |
|------|---------|---------|---------|---------|
| POST /leaves | 500ms | 312ms ✅ | 100 | 156 ✅ |
| GET /leaves | 300ms | 187ms ✅ | 500 | 720 ✅ |
| GET /balance | 100ms | 48ms ✅ | 1000 | 2400 ✅ |
| 导出 3k 行 | 10s | 3.8s ✅ | - | - |
| 导出 5k 行 | 10s | 14.2s ⚠️ | - | - |

## 贡献者

- 产品: @王小花
- 架构: @李架构
- 后端: @赵工, @qian
- 前端: @sun
- 测试: @陈测试, @李测试
- 运维: @周运维
- DBA: @王 DBA
- HR: @张总（业务规则确认）

## 完整变更

- 代码: https://git.company.com/hr/leave-management/compare/...v1.0.0
- 测试报告: [../03-testing/test-report-v1.0.md](../03-testing/test-report-v1.0.md)
- 发布计划: [../04-operations/release-plan-v1.0.md](../04-operations/release-plan-v1.0.md)
