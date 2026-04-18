# Changelog

> 本项目所有可追溯的变更记录。每完成一个 Sprint / 发布一次 / 新增重要能力时追加条目。
>
> 格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。
>
> 配套文档：
> - 整体路线图 · [ROADMAP.md](./ROADMAP.md)
> - 完整 5-Sprint 建设计划 · [PLAN.md](./PLAN.md)

---

## [Unreleased] · Sprint 3 进行中

测试 + 运维场景工具补齐（详见 [PLAN.md § Sprint 3](./PLAN.md#-sprint-3week-3-测试--运维场景工具补齐)）。

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
