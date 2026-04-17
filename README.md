# EP Code AI

> 企业级 AI 研发助手 — 覆盖**业务 · 开发 · 测试 · 运维**四大场景的 Claude Code 增强生态

[![Platform](https://img.shields.io/badge/platform-macOS-blue)]()
[![Stage](https://img.shields.io/badge/stage-macOS%20Phase%201-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

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
| 01 | [总览](./docs/chapters/01-overview/) | 全员 | 🚧 进行中 |
| 02 | [业务篇](./docs/chapters/02-business/) | 产品 / 业务 / BA | 📋 规划中 |
| 03 | [开发篇](./docs/chapters/03-development/) | 开发 / 架构 | 📋 规划中 |
| 04 | [测试篇](./docs/chapters/04-testing/) | 测试 / QA | ✅ 骨架完成 |
| 05 | [运维篇](./docs/chapters/05-operations/) | 运维 / SRE | 📋 规划中 |

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
├── docs/chapters/          方法论文档（分 5 篇）
│   ├── 01-overview/        总览与四场景融合
│   ├── 02-business/        业务篇：需求、PRD、用户故事
│   ├── 03-development/     开发篇：API 契约、代码评审、架构
│   ├── 04-testing/         测试篇：生命周期、门禁、度量
│   └── 05-operations/      运维篇：发布、监控、故障
│
├── templates/              模板库（按场景分类）
│   ├── business/
│   ├── development/
│   ├── testing/
│   └── operations/
│
├── workflows/              研发平台工作流
│   ├── gitlab/             GitLab 适配（MR、CI、标签）
│   ├── github/             GitHub 适配
│   └── generic/            通用（不依赖平台）
│
├── platforms/              跨平台适配
│   ├── macos/              macOS（Phase 1 优先）
│   ├── linux/              Linux（Phase 2）
│   └── windows/            Windows（Phase 3）
│
├── tools/                  工具与集成
│   ├── cross-platform/     跨平台脚本（Node/Python）
│   └── integrations/       与 Jira、Confluence 等的对接
│
├── skills/                 Claude Skills 定义
├── examples/               完整示例项目
└── assets/                 图片、图表等静态资源
```

---

## 快速开始

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

### 🛠️ 我想在企业中落地

1. 阅读 [`docs/chapters/01-overview/`](./docs/chapters/01-overview/) 了解整体理念
2. 根据团队角色选择对应篇章
3. 复制 [`templates/`](./templates/) 下的模板
4. 参考 [`workflows/gitlab/`](./workflows/gitlab/) 在研发平台配置门禁
5. 按 [`platforms/macos/setup.md`](./platforms/macos/setup.md) 配置本地环境

---

## 实施路线图

| 阶段 | 内容 | 平台 | 状态 |
|------|------|------|------|
| Phase 1 | macOS 应用稳定 + 测试篇 + 工作流 | macOS | 🚧 进行中 |
| Phase 2 | 业务篇 + 开发篇 + Linux 适配 | + Linux | 📋 |
| Phase 3 | 运维篇 + Windows 适配 + 案例库 | + Windows | 📋 |

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
