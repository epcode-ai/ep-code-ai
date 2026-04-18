# EP Code AI

> 企业级 AI 研发助手 — 覆盖**业务 · 开发 · 测试 · 运维**四大场景的 Claude Code 增强生态

[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)]()
[![Progress](https://img.shields.io/badge/progress-98%25%20(S5%20done)-brightgreen)](./ROADMAP.md)
[![Changelog](https://img.shields.io/badge/changelog-v0.6.0-informational)](./CHANGELOG.md)
[![npx](https://img.shields.io/badge/npx-epcode-orange)](./tools/cli/)
[![License](https://img.shields.io/badge/license-MIT-green)]()

> 📍 **最新进展**: Sprint 5 已完成（统一 `epcode` CLI + Docusaurus 文档站 + 治理文件,2026-04-18）。**5 个 Sprint 全部完成 · 整体完成度 98%**。
>
> - 🧰 [统一 CLI · epcode](./tools/cli/) · 10 个子命令,零依赖 `npx epcode --help`
> - 🌐 **[文档站 · epcode-ai.github.io/ep-code-ai](https://epcode-ai.github.io/ep-code-ai/)** ✅ 已上线 · 首页以 4 接入模式为一等公民
> - 📋 [完整建设计划 PLAN.md](./PLAN.md) · 5 Sprint × 4 接入模式 × 验收标准
> - 🗺️ [实施路线图 ROADMAP.md](./ROADMAP.md) · 概览 + 里程碑
> - 📝 [变更日志 CHANGELOG.md](./CHANGELOG.md) · 每个版本的具体产出
> - 🚀 [发布流程 RELEASE_PROCESS.md](./RELEASE_PROCESS.md) · 版本 / CHANGELOG / tag / Pages 的标准流程

---

## 项目定位

**EP Code AI** = 一个 **Claude Code 配套应用** + 一套 **企业 AI 研发方法论**。

它解决两件事：
1. **工具层**：为企业研发人员提供一个稳定、可控、可扩展的 Claude Code 客户端（macOS 应用）
2. **方法论层**：把 AI 能力系统性地嵌入到研发全流程的四大场景中（业务、开发、测试、运维）

---

## 两大组成部分

### 一、桌面应用（`app/`）

基于 Swift 开发的 macOS 原生客户端，提供：

| 能力 | 说明 |
|------|------|
| 会话历史管理 | 记录、搜索、复用每次与 Claude 的对话 |
| 环境检查向导 | 一键检测 Node、npm、Claude Code 等依赖 |
| 供应商管理 | 支持多个 Claude API 提供商切换 |
| 斜杠命令 | 扩展常用操作的快捷命令 |
| Artifact 面板 | 代码/文档产出物集中展示 |
| 文件监听 | 实时同步 Claude 会话文件变化 |

源码位于 [`app/ClaudeCodeHistory/`](./app/ClaudeCodeHistory/)。

安装参见 [`app/install.sh`](./app/install.sh)。

### 二、方法论框架（`docs/chapters/`）

按**四大场景 + 1 个总览**组织：

| # | 篇章 | 目标读者 | 状态 |
|---|------|---------|------|
| 00 | [接入模式](./docs/chapters/00-adoption/) ⭐ | 所有团队 | ✅ 完成（4 种模式） |
| 01 | [总览](./docs/chapters/01-overview/) | 全员 | ✅ 完成 |
| 02 | [业务篇](./docs/chapters/02-business/) | 产品 / 业务 / BA | ✅ 完成 |
| 03 | [开发篇](./docs/chapters/03-development/) | 开发 / 架构 | ✅ 完成 |
| 04 | [测试篇](./docs/chapters/04-testing/) | 测试 / QA | ✅ 完成 |
| 05 | [运维篇](./docs/chapters/05-operations/) | 运维 / SRE | ✅ 完成 |

---

## 项目结构

```
ep-code-ai/
├── app/                    macOS 桌面应用（Swift）
│   ├── ClaudeCodeHistory/        源代码
│   ├── ClaudeCodeHistory.xcodeproj/
│   ├── install.sh                一键安装脚本
│   └── generate_icon.swift       图标生成
│
├── docs/chapters/          方法论文档（分 6 篇）
│   ├── 00-adoption/        ⭐ 接入模式：4 种项目阶段的嵌入策略（先读这篇）
│   ├── 01-overview/        总览与四场景融合
│   ├── 02-business/        业务篇：需求、PRD、用户故事
│   ├── 03-development/     开发篇：API 契约、代码评审、架构
│   ├── 04-testing/         测试篇：生命周期、门禁、度量
│   └── 05-operations/      运维篇：发布、监控、故障
│
├── templates/              模板库（按场景分类,共 24 个）
│   ├── business/           PRD / 用户故事 / 业务规则 / 变更请求 / 竞品分析
│   ├── development/        设计文档 / ADR / 代码评审 / 依赖升级 / 发布说明
│   ├── testing/            API 契约 / Bug 报告 / 需求可测性 / 提测单 / 用例 / 测试报告
│   └── operations/         发布计划 / Runbook / 故障报告 / 复盘 / 容量规划 / 值班交接
│
├── .github/                GitHub 原生配置（本仓库自用）
│   ├── workflows/ci.yml    CI 自动检查（链接/提交/语法/提测单）
│   ├── PULL_REQUEST_TEMPLATE.md  PR 模板
│   └── ISSUE_TEMPLATE/     Issue 表单（Bug / 改进 / 提测）
│
├── workflows/              研发平台工作流指引（给其他仓库借鉴）
│   ├── gitlab/             GitLab 适配（MR、CI、标签）
│   ├── github/             GitHub 适配（含本仓库做法说明）
│   └── generic/            通用（不依赖平台）
│
├── platforms/              跨平台适配
│   ├── macos/              macOS（✅ setup + 检查脚本）
│   ├── linux/              Linux（✅ setup + 一键安装 + 检查脚本）
│   └── windows/            Windows（✅ WSL/原生双方案 + PowerShell 脚本）
│
├── tools/                  工具与集成
│   ├── cross-platform/     零依赖跨平台脚本
│   │   ├── check-links.js           Markdown 相对链接校验
│   │   ├── check-submission.js      提测申请单完整性校验
│   │   ├── markdown-lint.js         Markdown 风格检查
│   │   ├── check-commit.js          Conventional Commits 校验
│   │   ├── api-diff.js              API 契约对比
│   │   ├── check-prd.js             【S2】PRD 结构校验
│   │   ├── score-testability.js     【S2】PRD 可测性打分 0-100
│   │   ├── generate-adr-index.js    【S2】ADR 索引自动生成
│   │   ├── bug-trend.js             【S3】Bug JSON → 趋势报告 + ASCII 图
│   │   ├── coverage-analysis.js     【S3】需求↔用例覆盖率
│   │   ├── config-audit.js          【S3】多环境配置 diff + 敏感值扫描
│   │   ├── link-prd-to-design.js    【S4】业务→开发: PRD 变更 → 受影响设计
│   │   ├── recommend-regression.js  【S4】开发→测试: git diff → 回归用例推荐
│   │   ├── generate-release-plan.js 【S4】测试→运维: 测试报告 → 发布计划草稿
│   │   ├── incident-to-requirement.js 【S4】运维→业务: 复盘改进项 → Issue 批量
│   │   └── check-all.js             聚合所有检查
│   ├── metrics/            度量采集（零依赖,从 Git 读数据）
│   │   ├── collect.js                  【S4】统一入口,一次跑所有场景
│   │   ├── generate-dashboard.js       【S4】汇总生成 METRICS.md 总看板
│   │   ├── business/collect.js         【S2】业务周报（PRD/CR/贡献者）
│   │   ├── development/collect.js      【S2】开发周报（Commits 合规率/类型/规模/ADR）
│   │   ├── testing/collect.js          【S3】测试周报（用例/策略/报告/Bug 提交）
│   │   └── operations/collect.js       【S3】运维周报（Runbook/发布/回滚/Hotfix）
│   ├── cli/                【S5】统一 epcode CLI（10 个子命令,零依赖）
│   │   ├── bin/epcode.js       入口（npx epcode）
│   │   ├── commands/           子命令实现
│   │   └── scaffolds/mode-{a,b,c,d}/  4 种接入模式的脚手架模板
│   └── integrations/       企业工具集成（✅ 零依赖）
│       ├── jira/               Jira: create-issue + sync-from-markdown + list
│       ├── confluence/         Confluence: publish-markdown + fetch-page
│       ├── slack/              Slack: notify + send-release-note
│       ├── im/                 企业微信 / 钉钉 / 飞书 统一 notify
│       ├── gitlab/             GitLab: create-labels（scoped labels 批量）
│       ├── zentao/             【S3】禅道: create-bug + list + sync-from-markdown
│       ├── tapd/               【S3】TAPD: create-bug + list + sync-from-markdown
│       ├── alertmanager/       【S3】Prometheus 告警转发到企微/钉钉/飞书/Slack
│       └── k8s/                【S3】K8s: rollout-status + scale + logs（kubectl 封装）
│
├── skills/                 Claude Skills 定义（29 个 Prompt）
├── examples/               完整示例项目
│   ├── leave-management-system/  模式 A · 绿地项目完整样本
│   └── pilot-npds-newpd/         模式 D · 稳态运维真实试点
├── docs-site/              【S5】Docusaurus 文档站（GitHub Pages）
├── package.json            【S5】根 package.json,支持 `npx epcode`
├── CODEOWNERS              【S5】代码归属 & 评审分派
├── RELEASE_PROCESS.md      【S5】发布流程 SOP
├── CHANGELOG.md            📝 版本变更日志（每个 Sprint 一个条目）
├── PLAN.md                 📋 完整建设计划（5 Sprint × 接入模式 × 验收）
├── ROADMAP.md              🗺️ 实施路线图（概览）
└── assets/                 图片、图表等静态资源
```

---

## 快速开始

### 🎯 我想在自己的项目中接入本框架（先读这个）

根据你项目的阶段选对应文档：

| 你的项目阶段 | 接入模式 | 入口 |
|-------------|---------|------|
| 还没开始编码（刚立项） | A · 绿地 | [mode-a-greenfield.md](./docs/chapters/00-adoption/mode-a-greenfield.md) |
| 开发中,未上线 | B · 进行中 | [mode-b-mid-dev.md](./docs/chapters/00-adoption/mode-b-mid-dev.md) |
| 已上线,定期迭代 | C · 迭代中 | [mode-c-iterating.md](./docs/chapters/00-adoption/mode-c-iterating.md) |
| 稳态运维,只做维护 | D · 稳态 | [mode-d-maintenance.md](./docs/chapters/00-adoption/mode-d-maintenance.md) |

不确定选哪个？看 [5 分钟判定流程](./docs/chapters/00-adoption/README.md#5-分钟判定流程)。

### 🧰 用统一 CLI `epcode`（推荐,Sprint 5 新增）

```bash
# 查看所有命令
npx epcode --help

# 按接入模式初始化新项目
npx epcode init --mode=A --name=my-new-app

# PRD 结构 + 可测性打分（一条命令出报告）
npx epcode prd docs/prd/v1.0.md

# ADR 索引自动生成
npx epcode adr index --target docs/adr/

# 四场景度量 + 汇总看板
npx epcode metrics --since "7 days ago"

# 跨场景联动
npx epcode linkage prd-to-design --prd docs/prd/v1.2.md
npx epcode linkage regression --base main
npx epcode linkage release-plan --report test-report.md
npx epcode incident to-requirement --postmortem pm.md --target github
```

所有子命令见 [`tools/cli/`](./tools/cli/)。CLI 零依赖,只封装 `tools/` 下现成脚本。

### 👨‍💻 我是开发者，想安装桌面应用

```bash
cd app
./install.sh
```

### 📘 我想看方法论

从 [总览](./docs/chapters/01-overview/) 开始，或直接跳到你关心的场景：
- [业务篇](./docs/chapters/02-business/)
- [开发篇](./docs/chapters/03-development/)
- [测试篇](./docs/chapters/04-testing/)
- [运维篇](./docs/chapters/05-operations/)

### 🤖 我想用 AI 辅助工作

到 [`skills/`](./skills/) 找对应场景的 Prompt 模板（29 个）：
- [业务 Prompt](./skills/business/) · [开发 Prompt](./skills/development/) · [测试 Prompt](./skills/testing/) · [运维 Prompt](./skills/operations/)

### 🔧 我想跑质量检查脚本

```bash
# 一次性跑全部（链接校验 + Markdown 风格）
node tools/cross-platform/scripts/check-all.js

# 单个检查
node tools/cross-platform/scripts/check-links.js         # 内部链接校验
node tools/cross-platform/scripts/check-commit.js "feat: xxx"  # Commit 格式
node tools/cross-platform/scripts/check-submission.js path/to/file.md  # 提测单校验

# Sprint 2 新增 - 业务/开发场景
node tools/cross-platform/scripts/check-prd.js path/to/prd.md              # PRD 结构校验
node tools/cross-platform/scripts/score-testability.js path/to/prd.md      # PRD 可测性打分 (0-100)
node tools/cross-platform/scripts/generate-adr-index.js --target docs/adr/ # ADR 索引自动重建

# Sprint 3 新增 - 测试/运维场景
node tools/cross-platform/scripts/bug-trend.js --file bugs.json                       # Bug 趋势报告
node tools/cross-platform/scripts/coverage-analysis.js --req PRD --cases cases/       # 需求覆盖率
node tools/cross-platform/scripts/config-audit.js --dir config/                       # 多环境配置审计

# Sprint 4 新增 - 跨场景联动
node tools/cross-platform/scripts/link-prd-to-design.js --prd prd.md                  # 业务→开发
node tools/cross-platform/scripts/recommend-regression.js --base main                 # 开发→测试
node tools/cross-platform/scripts/generate-release-plan.js --report test-report.md    # 测试→运维
node tools/cross-platform/scripts/incident-to-requirement.js --postmortem pm.md       # 运维→业务

# 度量采集（从 Git 拉数据,零依赖）
node tools/metrics/collect.js --since "7 days ago"                # S4 统一入口,一次跑全部
node tools/metrics/generate-dashboard.js --since "7 days ago"     # S4 生成 METRICS.md 总看板
```

详见 [`tools/cross-platform/README.md`](./tools/cross-platform/README.md)（含 Git Hook / CI 集成示例）和 [`tools/metrics/`](./tools/metrics/)（度量脚本）

### 📖 我想看一个完整示例

[`examples/leave-management-system/`](./examples/leave-management-system/) 是一个端到端示例项目（员工请假管理系统），展示方法论如何落地：
- [业务产出](./examples/leave-management-system/01-business/)：PRD / 用户故事 / 业务规则 / 可测性评审
- [开发产出](./examples/leave-management-system/02-development/)：设计文档 / ADR / API / Release Note
- [测试产出](./examples/leave-management-system/03-testing/)：策略 / 用例 / 提测单 / Bug / 报告
- [运维产出](./examples/leave-management-system/04-operations/)：发布 / Runbook / 故障 / 复盘

### 🖥️ 我想在不同操作系统搭建环境

| 平台 | 入口 |
|------|------|
| macOS | [platforms/macos/setup.md](./platforms/macos/setup.md) |
| Linux (Ubuntu/Debian/Fedora/Arch/...) | [platforms/linux/setup.md](./platforms/linux/setup.md) |
| Windows (含 WSL2) | [platforms/windows/setup.md](./platforms/windows/setup.md) |

### 🛠️ 我想在企业中落地

1. 阅读 [`docs/chapters/01-overview/`](./docs/chapters/01-overview/) 了解整体理念
2. 根据团队角色选择对应篇章
3. 复制 [`templates/`](./templates/) 下的模板
4. 参考 [`workflows/gitlab/`](./workflows/gitlab/) 在研发平台配置门禁
5. 按对应平台的 `setup.md` 配置本地环境

---

## 实施路线图

| 阶段 | 内容 | 平台 | 状态 |
|------|------|------|------|
| Phase 1 | macOS 应用 + 测试篇 + 工作流 + 跨平台工具 | macOS | ✅ |
| Phase 2 | 业务 / 开发 / 运维篇 + 模板库 + Skills + Linux 适配 | + Linux | ✅ |
| Phase 3 | 端到端示例项目 + Windows 适配 | + Windows | ✅ |
| Phase 4（规划） | 真实案例集 + 运营数据 + 社区 | 全平台 | 📋 |

---

## 设计原则

1. **方法论与工具解耦** — 工具坏了方法论还在
2. **Markdown 作为中间层** — 文档、用例、报告统一用 Markdown
3. **Git 作为单一事实源** — 所有资产版本化
4. **跨平台优先** — 脚本优先用 Node.js / Python
5. **能力对平台** — 支持 GitLab（主）、GitHub、Gitea 等多种代码平台

---

## 贡献

欢迎以下形式贡献：
- 补充某个场景的方法论
- 新增模板
- 新增工作流适配（如 Jenkins、自研平台）
- 新增 Claude Skill
- 贡献案例

详见 [`CONTRIBUTING.md`](./CONTRIBUTING.md)

## License

MIT
