# __PROJECT_NAME__ · 接入模式 D · 稳态运维项目

> 本目录由 `epcode init --mode=D --name=__PROJECT_NAME__` 于 __DATE__ 生成。

## 核心策略: "只用运维篇,其他不强求"

项目已运行 1 年以上,只做 bug 修复和小优化,资源转移到新项目,但要维持稳定运行。

**最小可用集**:
- ✅ 运维篇全套（发布 / Runbook / 故障响应 / 复盘）
- ✅ Bug 报告模板（统一事件处理）
- ✅ Conventional Commits（可追溯性）
- ❌ 不强求 PRD / 用户故事 / 可测性评审（已无新需求）

## 起步清单

| # | 动作 | 优先级 |
|---|------|--------|
| 1 | 为每种线上告警补 **至少 1 份 Runbook** | P0 |
| 2 | 建立故障响应 SOP（`docs/ops/incident-sop.md`） | P0 |
| 3 | 下次出故障必须做复盘（`epcode incident new`） | P0 |
| 4 | 度量 MTTR / 故障率（跑 `epcode metrics` 运维场景） | P1 |
| 5 | 把核心依赖升级也进 Runbook（减少"这谁懂"风险） | P2 |

## 常用命令

```bash
# 出故障时快速建事件报告
epcode incident new --id INC-2026-001

# 复盘后把改进项同步到 Jira/GH Issue
epcode incident to-requirement --postmortem docs/ops/postmortem-INC-001.md --target github

# 运维度量（MTTR 粗估 / 回滚数 / Hotfix 数）
epcode metrics --since "30 days ago"
```

## 目录

```
__PROJECT_NAME__/
├── docs/ops/
│   ├── runbooks/          每类告警的处置手册
│   ├── incidents/         故障报告
│   ├── postmortems/       复盘
│   └── release-plans/     小版本发布计划
└── SERVICE-LEVEL.md       当前 SLO / on-call 安排
```

## 为什么选 D

- 项目运行 1 年+,不再大版本迭代
- 只做 bug 修复、小优化、依赖升级
- 团队资源已转移,但要保证"出事有章可循"

## ⚠️ 注意

- 不要给稳态项目加太多仪式感 —— 会适得其反
- 重点在"故障时有章可循",不在"文档多完整"
