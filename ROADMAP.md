# ROADMAP

> 本项目的实施计划和路线图。

## 当前状态

- **完成度**: 96%（L1: 95%, L2: 100%, L3: 97%, L4: 90%, L5: 70%）
- **进行中**: Sprint 5 · 统一 CLI + 对外发布 + 试点复盘
- **试点项目**: `examples/pilot-npds-newpd/` 派单叫号系统（模式 D · 稳态运维）

## 里程碑

| Sprint | 周次 | 主题 | 状态 |
|--------|------|------|------|
| S1 | Week 1 | 操作系统收尾 + 接入模式骨架 + 启动试点 | ✅ 完成 |
| S2 | Week 2 | 业务 + 开发场景工具补齐 | ✅ 完成 |
| S3 | Week 3 | 测试 + 运维场景工具补齐 | ✅ 完成 |
| S4 | Week 4 | 场景联动 + 度量闭环 | ✅ 完成 |
| S5 | Week 5 | 统一 CLI + 对外发布 + 试点复盘 | 📋 计划中 |
| S6+ | 持续 | 真实项目迭代 + 框架反馈 | 📋 |

**完整计划**（所有 Sprint 的详细产出、接入模式抽象、风险、验收）见 **[PLAN.md](./PLAN.md)** 🔗

## 近期变更

### 2026-04-18（Sprint 4 完成）
- `tools/cross-platform/scripts/link-prd-to-design.js` — 业务→开发: PRD 变更 → 受影响设计清单
- `tools/cross-platform/scripts/recommend-regression.js` — 开发→测试: git diff → 回归用例推荐
- `tools/cross-platform/scripts/generate-release-plan.js` — 测试→运维: 测试报告 → 发布计划草稿（通过率/S1 规则）
- `tools/cross-platform/scripts/incident-to-requirement.js` — 运维→业务: 复盘改进项 → Jira/GitHub Issue 批量
- `tools/metrics/collect.js` + `generate-dashboard.js` — 四场景统一入口 + METRICS.md 总看板
- `.github/workflows/metrics-weekly.yml` — 每周一 08:00 自动生成周报 PR

### 2026-04-18（Sprint 3 完成）
- `tools/integrations/zentao/` — 禅道 Bug: create / list / sync-from-markdown（含 sessionID 鉴权封装）
- `tools/integrations/tapd/` — TAPD Bug: create / list / sync-from-markdown
- `tools/cross-platform/scripts/bug-trend.js` — Bug JSON → Markdown + ASCII 趋势图
- `tools/cross-platform/scripts/coverage-analysis.js` — 需求↔用例覆盖率 + 悬空引用检测
- `tools/integrations/alertmanager/` — Prometheus webhook → 企微/钉钉/飞书/Slack 转发 server
- `tools/cross-platform/scripts/config-audit.js` — 多环境配置 diff + 敏感值扫描
- `tools/integrations/k8s/` — kubectl 封装: rollout-status / scale（含 prod 保护）/ logs
- `tools/metrics/testing/` + `tools/metrics/operations/` — 测试/运维度量周报
- CI 新增 `coverage-check` + `config-audit` job（GH + GitLab）

### 2026-04-18（Sprint 2 完成）
- `tools/cross-platform/scripts/check-prd.js` — PRD 结构校验（必备章节 / AC / 模糊词 / 量化指标）
- `tools/cross-platform/scripts/score-testability.js` — PRD 可测性评分（5 维度 × 20 = 100）
- `tools/cross-platform/scripts/generate-adr-index.js` — ADR 索引自动生成（支持 `--check` CI 模式）
- `tools/metrics/business/collect.js` — 业务度量（PRD 变更 / CR / 贡献者）
- `tools/metrics/development/collect.js` — 开发度量（Conventional Commits 合规率 / 类型分布 / 规模分布 / ADR）
- `workflows/gitlab/.gitlab-ci.example.yml` — 新增 4 个 job（prd-check / testability-score / adr-index / business-metrics）
- `.github/workflows/ci.yml` — 新增 prd-check + adr-index-sync job

### 2026-04-17（Sprint 1 开始）
- 新增接入模式抽象（4 种模式 × 5 个文档）
- 试点项目 `npds-newpd` 初始化（模式 D）
- macOS install.sh
- 三平台矩阵验证 workflow（platforms-verify.yml）
- PowerShell 语法检查 CI

### 2026-04-17（之前）
- 企业工具集成套件（Jira/Confluence/Slack/IM/GitLab）
- GitHub Actions CI + PR/Issue 模板
- 端到端示例项目 leave-management-system
- Linux/Windows 平台适配

## 贡献

- 新增内容：请按对应 Sprint 节奏
- 问题反馈：用 `.github/ISSUE_TEMPLATE/bug.yml`
- 改进建议：用 `.github/ISSUE_TEMPLATE/enhancement.yml`

## 长期愿景

用 5 Sprint 时间把本项目做到：
- ✅ 四种接入模式都有完整落地路径
- ✅ 四大场景都有工具闭环（方法论 + 模板 + Prompt + CLI + 集成 + 度量）
- ✅ 跨场景自动联动（不只是文字契约）
- ✅ 至少 1 个真实项目跑完完整周期并复盘
- ✅ 有对外门面（文档站 + 路线图）
