# 示例项目 · 员工请假管理系统 v1.0

> 一个端到端落地 EP Code AI 方法论的**虚构项目**，展示业务 / 开发 / 测试 / 运维四个阶段的产出。

## 项目简介

**名称**: 员工请假管理系统（Leave Management System）
**版本**: v1.0
**时间**: 2026 Q2（虚构）
**规模**: 2 后端 + 1 前端 + 1 测试，4 周交付

### 核心功能

1. 员工发起请假
2. 主管审批请假
3. 查看请假历史
4. HR 查看全公司请假统计

## 交付物目录

```
leave-management-system/
├── 01-business/              业务阶段产出
│   ├── prd-v1.0.md                PRD
│   ├── user-stories.md            用户故事 + 验收标准
│   ├── business-rules.md          业务规则（决策表）
│   └── testability-review.md      测试给产品的可测性评审
│
├── 02-development/           开发阶段产出
│   ├── design-doc.md              概要设计
│   ├── adr/0001-use-postgresql.md ADR
│   ├── api-docs/                  Markdown 接口契约
│   │   ├── create-leave.md
│   │   └── list-leaves.md
│   └── release-note-v1.0.md       Release Note
│
├── 03-testing/               测试阶段产出
│   ├── test-strategy.md           测试策略
│   ├── test-cases.md              测试用例集
│   ├── submission-v1.0.md         提测申请单（达标样本）
│   ├── bug-example.md             Bug 报告样本
│   └── test-report-v1.0.md        测试报告（准出）
│
└── 04-operations/            运维阶段产出
    ├── release-plan-v1.0.md       发布计划
    ├── runbook-db-slow.md         Runbook 样本
    ├── incident-example.md        故障报告样本
    └── postmortem-example.md      复盘报告样本
```

## 时间线（虚构）

```
Week 1    业务 & 测试
 ├─ 业务写 PRD (01-business/prd-v1.0.md)
 ├─ 测试做可测性评审 (testability-review.md)
 └─ 产品确认用户故事和验收标准

Week 2    开发 & 测试设计
 ├─ 开发出概要设计、API 契约
 ├─ 开发出 ADR (选 PostgreSQL)
 └─ 测试写测试策略、用例集

Week 3    开发 & 测试执行
 ├─ 开发完成功能，提测 (submission-v1.0.md)
 ├─ 测试发现 5 个 Bug (示例 bug-example.md)
 ├─ 开发修复，测试回归
 └─ 测试准出 (test-report-v1.0.md)

Week 4    发布 & 运维
 ├─ 运维按发布计划灰度上线
 ├─ 上线后出现 DB 慢查询 → 参考 Runbook 处置
 ├─ 产出故障报告 (incident-example.md)
 └─ 48h 内产出复盘 (postmortem-example.md)
```

## 阅读建议

### 跟着时间线读

依次读 `01-business → 02-development → 03-testing → 04-operations`，像亲历项目一样。

### 按角色聚焦

| 你是... | 只看这部分 |
|---------|----------|
| 产品经理 | [01-business/](./01-business/) |
| 架构/开发 | [02-development/](./02-development/) |
| 测试/QA | [03-testing/](./03-testing/) |
| SRE/运维 | [04-operations/](./04-operations/) |

### 对照模板读

所有交付物都基于 [`templates/`](../../templates/) 里的空模板填写,可以双屏对照：
- 左侧：本项目的填好版本
- 右侧：原始模板

## 作为练习

新员工培训时可以让他们：
1. 读 `prd-v1.0.md`，模仿写 `testability-review.md`
2. 读 `design-doc.md`，模仿写 API Markdown 文档
3. 读 `test-strategy.md`，模仿写用例
4. 读 `runbook-db-slow.md`，针对新场景写一份新的 Runbook
