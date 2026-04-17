# 运维场景模板库

> 配合 [运维篇](../../docs/chapters/05-operations/) 使用的现成模板

## 模板清单

| 模板 | 用途 | 何时使用 |
|------|------|---------|
| [发布计划](./release-plan-template.md) | 版本发布全流程 | 每次版本发布 |
| [Runbook](./runbook-template.md) | 故障处置手册 | 建立故障知识库 |
| [故障报告](./incident-report-template.md) | 实时故障通报 | 故障期间 + 刚结束时 |
| [故障复盘](./postmortem-template.md) | 深度故障分析 | 故障后 24-48h |
| [值班交接](./oncall-handoff-template.md) | 交接班记录 | 每次值班轮换 |
| [容量规划](./capacity-plan-template.md) | 资源预测与扩容 | 每季度 / 大促前 |

## 使用建议

### 按时机

**日常**:
- 值班交接（每天/每班）
- Runbook（不断新增和更新）

**版本发布时**:
- 发布计划（每次发版）

**故障期间**:
- 故障报告（实时更新，对内对外同步）
- 参考 Runbook 处置

**故障之后**:
- 复盘报告（24-48h 内）

**定期**:
- 容量规划（季度级别）

### 按角色

| 角色 | 常用模板 |
|------|---------|
| SRE / 运维 | 全部 |
| 值班工程师 | Runbook + 交接单 |
| 开发 | Runbook（熟悉）+ 复盘（被邀请参与） |
| Tech Lead | 发布计划 + 复盘 |
| 管理层 | 复盘摘要 + 容量规划 |

### 目录组织建议

```
your-project/
├── ops/
│   ├── runbooks/              ← 故障处置手册集
│   │   ├── README.md         ← 索引
│   │   ├── RB-001-db-slow.md
│   │   ├── RB-002-oom.md
│   │   └── ...
│   ├── releases/              ← 发布记录
│   │   ├── v1.2.0-plan.md
│   │   └── v1.2.0-report.md
│   ├── incidents/             ← 故障记录
│   │   ├── 2026/
│   │   │   ├── INC-2026-0042.md
│   │   │   └── PM-2026-0042.md
│   ├── handoffs/              ← 值班交接
│   │   └── 2026-04-15.md
│   └── capacity/              ← 容量规划
│       └── 2026-Q2.md
```

## 相关资源

- [运维篇总览](../../docs/chapters/05-operations/)
- [测试 → 运维 契约](../../docs/chapters/04-testing/03-roles-contracts/ops-contract.md)
