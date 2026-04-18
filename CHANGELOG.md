# Changelog

> 本项目所有可追溯的变更记录。每完成一个 Sprint / 发布一次 / 新增重要能力时追加条目。
>
> 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。
>
> 配套文档：
> - 整体路线图 · [ROADMAP.md](./ROADMAP.md)
> - 完整 5-Sprint 建设计划 · [PLAN.md](./PLAN.md)

---

## [Unreleased] · Sprint 5 进行中

统一 CLI + 对外发布 + 试点复盘（详见 [PLAN.md § Sprint 5](./PLAN.md)）。

---

## [0.5.0] - 2026-04-18 · Sprint 4 完成

**主题**: 场景联动 + 度量闭环

### 新增 · 4 个跨场景联动脚本（零依赖）

- `tools/cross-platform/scripts/link-prd-to-design.js` — **业务 → 开发**
  PRD 变更 → 提取 REQ/US ID → 扫描设计目录找受影响文档 → 输出评审 checklist
- `tools/cross-platform/scripts/recommend-regression.js` — **开发 → 测试**
  git diff + commit msg → 抽模块/需求 ID → 匹配用例 → 推荐回归清单
- `tools/cross-platform/scripts/generate-release-plan.js` — **测试 → 运维**
  解析测试报告（通过率/覆盖率/S1-S4 分布）→ 规则推导可发布性与灰度节奏 → Markdown 发布计划
- `tools/cross-platform/scripts/incident-to-requirement.js` — **运维 → 业务**
  解析 postmortem.md 改进项（checkbox + 表格）→ 生成 GH Issue 批量命令或 Jira sync payload

### 新增 · 度量闭环

- `tools/metrics/collect.js` — 统一入口,一次跑四场景 collect.js
- `tools/metrics/generate-dashboard.js` — 汇总 METRICS-*.md → METRICS.md 顶层看板（含 details 折叠）
- `.github/workflows/metrics-weekly.yml` — 每周一 08:00 UTC 自动跑 + 产 PR

### 变更 · 文档

- `README.md` / `ROADMAP.md` · 新增 S4 脚本说明
- Badge: `progress-96%` `(S4 done)` · `changelog-v0.5.0`

### 验证

- 4 个脚本均在本仓库 + examples/leave-management-system 上跑通
- `incident-to-requirement.js` 对 postmortem-example 抽到 11 条真实改进项（过滤掉 SMART 自检元项）
- `generate-dashboard.js` 生成 241 行 METRICS.md,4/4 场景有数据

### 完成度

整体 93% → 96%（L4 场景联动 20% → 90%,L5 真实反馈 50% → 70%）。

---

## [0.4.0] - 2026-04-18 · Sprint 3 完成

**主题**: 测试 + 运维场景工具补齐

### 新增 · 企业系统集成

- `tools/integrations/zentao/` — 禅道 Bug: `create-bug.js` + `list-bugs.js` + `sync-from-markdown.js`（含 sessionID 鉴权封装 `_client.js`）
- `tools/integrations/tapd/` — TAPD Bug 同套三件（`_client.js` + create + list + sync）
- `tools/integrations/alertmanager/` — Prometheus Alertmanager webhook 接收 + 转发到企微/钉钉/飞书/Slack（`webhook-server.js` + `transform.js` + `test-fire.js`）
- `tools/integrations/k8s/` — `kubectl` 封装: `rollout-status.js` / `scale.js`（含 prod 保护）/ `logs.js`（按 label 聚合）

### 新增 · 测试 / 运维校验脚本

- `tools/cross-platform/scripts/bug-trend.js` — Bug JSON → Markdown 趋势报告 + ASCII 柱图（兼容 Jira/禅道/TAPD 字段）
- `tools/cross-platform/scripts/coverage-analysis.js` — 需求 ↔ 用例映射覆盖率,含悬空引用检测
- `tools/cross-platform/scripts/config-audit.js` — 多环境配置（.env / .yml / .json）diff + 敏感值明文扫描

### 新增 · 度量

- `tools/metrics/testing/collect.js` — 测试周报（用例/策略/报告/提测单/Bug 报告 commit 数 + 贡献者 Top-5）
- `tools/metrics/operations/collect.js` — 运维周报（Runbook/发布/故障/复盘 + 回滚数/Hotfix 数）

### 变更 · CI 集成

- `.github/workflows/ci.yml` 新增 `coverage-check`、`config-audit` job
- `workflows/gitlab/.gitlab-ci.example.yml` 新增 `coverage-check`、`config-audit`、`testing-ops-metrics` job

### 约定

- 所有外部系统集成（Zentao/TAPD/Alertmanager/K8s）支持 `--dry-run`,无凭证也能跑通
- `scale.js` 默认拒绝把 name 含 prod/production/live 的 Deployment 缩到 0（加 `--force` 覆盖）
- `config-audit.js` 检测到 prod 明文敏感值时退出码 2（CI 硬门禁）

### 完成度

整体 91% → 93%（L3 场景纵深 93% → 97%）。

---

## [0.3.0] - 2026-04-18 · Sprint 2 完成

**主题**: 业务 + 开发场景工具补齐

### 新增 · 校验脚本（零依赖 Node 18+）

- `tools/cross-platform/scripts/check-prd.js` — PRD 结构校验（必备章节 / 验收标准 / 非功能量化 / 模糊词检测）
- `tools/cross-platform/scripts/score-testability.js` — PRD 可测性 0-100 打分（5 维度 × 20 分）
- `tools/cross-platform/scripts/generate-adr-index.js` — ADR 索引自动生成（支持 `--check` CI 校验模式）

### 新增 · 度量采集

- `tools/metrics/business/collect.js` — 业务度量（PRD 变更 / CR / 贡献者分布）
- `tools/metrics/development/collect.js` — 开发度量（Conventional Commits 合规率 / 类型分布 / 规模桶 / ADR 数）
- `tools/metrics/_common/git.js` — Git 读取共享工具

### 新增 · CI 集成

- GitHub Actions (`.github/workflows/ci.yml`): 新增 `prd-check`、`adr-index-sync` 两个 job
- GitLab CI (`workflows/gitlab/.gitlab-ci.example.yml`): 新增 `prd-check`、`testability-score`、`adr-index`、`business-metrics` 四个 job

### 变更 · 文档同步

- `docs/chapters/02-business/05-ai-assistance.md` — 新增"CLI 脚手架"章节
- `docs/chapters/03-development/01-design-standards.md` — 附 ADR 索引使用说明
- `README.md` — 脚本列表补齐 Sprint 2 新脚本
- `ROADMAP.md` — Sprint 2 标记 ✅,整体完成度 88% → 91%

### 验证

- `check-all.js` 全绿（断链 0）
- examples/leave-management-system PRD 可测性得分 76/100
- GH Actions 7/7 job 通过

---

## [0.2.0] - 2026-04-17 · Sprint 1 完成

**主题**: 操作系统收尾 + 接入模式骨架 + 试点启动

### 新增 · 4 种接入模式文档（关键产出）

- `docs/chapters/00-adoption/README.md` — 接入模式抽象总览 + 5 分钟判定流程
- `docs/chapters/00-adoption/mode-a-greenfield.md` — 绿地项目全套上车
- `docs/chapters/00-adoption/mode-b-mid-dev.md` — 开发中追溯补齐
- `docs/chapters/00-adoption/mode-c-iterating.md` — 迭代项目渐进嵌入
- `docs/chapters/00-adoption/mode-d-maintenance.md` — 稳态运维聚焦

### 新增 · 三平台验证

- `platforms/macos/scripts/install.sh`
- `.github/workflows/platforms-verify.yml` — Linux (4 发行版 Docker 矩阵) / macOS / Windows 三平台验证
- 打开 `powershell-syntax` 门禁

### 新增 · 试点项目

- `examples/pilot-npds-newpd/` — 派单叫号系统（模式 D · 稳态运维）

---

## [0.1.0] - 2026-04-16 之前 · 基础建设期

- 四大场景方法论骨架（业务 / 开发 / 测试 / 运维）
- 24 个模板 + 29 个 Claude Skills Prompt
- 5 个企业集成（Jira / Confluence / Slack / IM / GitLab）
- macOS 桌面应用（Swift）
- 端到端示例 `examples/leave-management-system/`
- 通用跨平台脚本（check-links / check-submission / markdown-lint / check-commit / api-diff / check-all）

---

## 维护约定

- **每个 Sprint 完成** → 追加一个版本条目,打 tag（`v0.x.0`）
- **重要 Bug 修复** → 打 patch（`v0.x.y`）
- **破坏性变更** → 在条目内显著标注 `⚠️ Breaking`
- **未发布的改动** → 写在顶部 `[Unreleased]` 段
