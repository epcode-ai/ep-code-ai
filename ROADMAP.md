# ROADMAP

> 本项目的实施计划和路线图。

## 当前状态

- **完成度**: 91%（L1: 95%, L2: 100%, L3: 93%, L4: 20%, L5: 30%）
- **进行中**: Sprint 3 · 测试 + 运维场景工具补齐
- **试点项目**: `examples/pilot-npds-newpd/` 派单叫号系统（模式 D · 稳态运维）

## 里程碑

| Sprint | 周次 | 主题 | 状态 |
|--------|------|------|------|
| S1 | Week 1 | 操作系统收尾 + 接入模式骨架 + 启动试点 | ✅ 完成 |
| S2 | Week 2 | 业务 + 开发场景工具补齐 | ✅ 完成 |
| S3 | Week 3 | 测试 + 运维场景工具补齐 | 🚧 进行中 |
| S4 | Week 4 | 场景联动 + 度量闭环 | 📋 计划中 |
| S5 | Week 5 | 统一 CLI + 对外发布 + 试点复盘 | 📋 计划中 |
| S6+ | 持续 | 真实项目迭代 + 框架反馈 | 📋 |

**完整计划**（所有 Sprint 的详细产出、接入模式抽象、风险、验收）见 **[PLAN.md](./PLAN.md)** 🔗

## 近期变更

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
