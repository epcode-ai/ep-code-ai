# ROADMAP

> 本项目的实施计划和路线图。

## 当前状态

- **完成度**: 98%（L1: 95%, L2: 100%, L3: 97%, L4: 90%, L5: 85%）
- **状态**: Phase 1（方法论 + 工具链 + CLI + 文档站）🎉 完成 · Phase 2（产品化落地）启动中
- **试点项目**: `examples/pilot-npds-newpd/` 派单叫号系统（模式 D · 稳态运维,数据不足,复盘暂缓）

## 里程碑

| Sprint | 周次 | 主题 | 状态 |
|--------|------|------|------|
| S1 | Week 1 | 操作系统收尾 + 接入模式骨架 + 启动试点 | ✅ 完成 |
| S2 | Week 2 | 业务 + 开发场景工具补齐 | ✅ 完成 |
| S3 | Week 3 | 测试 + 运维场景工具补齐 | ✅ 完成 |
| S4 | Week 4 | 场景联动 + 度量闭环 | ✅ 完成 |
| S5 | Week 5 | 统一 CLI + 对外发布 + 试点复盘 | ✅ 完成 |
| **Phase 2 · 落地与产品化** | | | |
| S6 | Week 6 | 架构图 + UI/UX 设计稿 + 信息流 + 手册起步 | ✅ 完成 |
| S7 | Week 7 | 跨平台栈决策(ADR-0002)+ macOS 改造清单 + 打包 workflow | 🟡 规划完成 · 代码实施 S7.1-7.4 |
| S8 | Week 8 | 用户手册完整版 + Linux/Win Beta + v1.0 GA | 📋 计划中 |
| S9 | Week 9 | 服务端同步 RFC + OTA 协议设计（不实现） | 📋 计划中 |
| S10 | Week 10 | 真实试点项目复盘 | 📋 计划中 |

**完整计划**（所有 Sprint 的详细产出、接入模式抽象、风险、验收）见 **[PLAN.md](./PLAN.md)** 🔗

## 近期变更

### 2026-04-20（Sprint 7 规划完成 · 代码留 S7.1-7.4）
- **ADR-0001** 采用 4 种接入模式作为框架一等公民(回溯 Sprint 1)· Accepted
- **ADR-0002** 跨平台桌面应用技术栈 · **混合方案**(macOS 保留 Swift + Linux/Win 用 Tauri+Svelte)· Proposed
- **ADR-0003** 自动更新策略 · GitHub Release 为统一更新源(三平台共享)· Proposed
- **Swift 改造清单** `docs/design/ui/swift-refactor-plan.md` · 19 项改动 + 4 轮 PR 推进计划
- **macOS 打包 workflow** `.github/workflows/macos-build.yml` · 支持签名/无签名双路径(secret 未配时走无签名)
- **ADR 索引** `docs/adr/README.md` 自动生成

### 2026-04-20（Sprint 6 完成 · Phase 2 第一 Sprint）
- **⑥ UI/UX 设计稿**: 17 张 HTML 原型 + 13 wireframes 文档(覆盖 17 个主题)+ 5 Mermaid flows + 映射表
  - 核心: 主视图 / 向导 / 设置 / 命令面板 / Artifact / 供应商切换 / 搜索 / 右键菜单 / 空态 / 状态栏
  - 角色: 登录 / 项目列表 / 新建项目向导(4 模式 A/B/C/D) · 四大场景工作流(业务/开发/测试/运维 + Prompt 一键操作)
- **① 架构图 + 技术盘点**: `ARCHITECTURE.md` 含 4 张 Mermaid(四层 / 数据流 / 依赖 / 部署)+ 技术盘点清单 20+ 项
- **⑤ 信息共享模式**: `docs/architecture/information-sharing.md` 固化 Git+Markdown+CI 模型,含优缺点 / 反模式 / 何时上服务端
- **② 用户手册起步**: `docs/manual/` README + 00-install(三平台)+ 99-cheatsheet(一页速查)
- **③ 桌面应用**: 未启动,推迟到 Sprint 7 实施

### 2026-04-18（Sprint 5 完成）
- `tools/cli/` — 统一 `epcode` CLI,10 个子命令（init/adopt/migrate/check/prd/adr/metrics/incident/linkage/jira）
- `tools/cli/scaffolds/mode-{a,b,c,d}/` — 4 种接入模式的脚手架模板
- `package.json` 根目录 — 支持 `npx epcode` 调用
- `docs-site/` — Docusaurus v3 文档站,首页以 4 接入模式为一等公民（4 张卡片）
- `.github/workflows/pages.yml` — docs-site 变动时自动部署到 GitHub Pages
- `CODEOWNERS` — 代码归属规则
- `RELEASE_PROCESS.md` — 版本 / CHANGELOG / tag / Pages 的标准发布流程

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
