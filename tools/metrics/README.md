# tools/metrics · 度量采集

> Sprint 2 产出。零依赖（Node 18+ 内置 fetch/fs/child_process）,从 Git 拉数据,输出 Markdown 报告。

## 场景

| 目录 | 采集什么 | 输出 |
|------|---------|------|
| `business/collect.js` | PRD 变更次数、CR 提交、贡献者分布 | `METRICS-business.md` |
| `development/collect.js` | Conventional Commits 合规率、commit 类型分布、变更规模桶、ADR 数 | `METRICS-development.md` |
| `testing/collect.js` | 测试用例/策略/报告/提测单/Bug commit 数 + 贡献者 Top-5 | `METRICS-testing.md` |
| `operations/collect.js` | Runbook/发布/故障/复盘 + 回滚数/Hotfix 数 | `METRICS-operations.md` |
| `collect.js` | **S4 统一入口**,一次跑四场景 | 4 个 METRICS-*.md |
| `generate-dashboard.js` | **S4 汇总**,各场景 METRICS-*.md → 顶层看板 | `METRICS.md` |

## 用法

```bash
# 默认采集过去 1 年
node tools/metrics/business/collect.js
node tools/metrics/development/collect.js

# 指定时间窗（Git 语法）
node tools/metrics/business/collect.js --since "7 days ago"
node tools/metrics/development/collect.js --since "2026-01-01"
```

## 输出示例

```markdown
# 业务度量周报
采集窗口: since 7 days ago
生成时间: 2026-04-18

## PRD 变更
| 指标 | 值 |
|------|-----|
| PRD 相关 commit | 5 |
| CR（变更请求） | 2 |
...
```

## 在 CI 里自动跑

GitLab CI（`workflows/gitlab/.gitlab-ci.example.yml` 的 `business-metrics` job）已配好每周一 08:00 触发,产物为 artifact。

GitHub Actions 方案：`.github/workflows/metrics-weekly.yml`（每周一 08:00 CST / 00:00 UTC 自动跑,生成 PR 到 main）。手动触发也可: `gh workflow run metrics-weekly.yml -f since="14 days ago"`。

## 设计原则

- **零依赖**：不引入 npm 包,只用 Node 内置模块 + `git` CLI
- **Git 优先**：所有指标首先从 Git 拉,避免耦合 Jira/Confluence 凭证
- **降级优雅**：目标仓库无相关历史时输出空表 + 提示,不报错
- **可组合**：Sprint 4 会基于这些 collect.js 做 `generate-dashboard.js` 聚合看板
