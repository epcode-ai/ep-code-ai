# EP Code AI · 桌面应用 UI/UX 设计稿

> Sprint 6 ⑥ 产出。三平台桌面应用(macOS / Linux / Windows)的统一 UI/UX 设计蓝图。
>
> **状态**: v1.0 草案 · 待评审 · 评审通过后作为 Sprint 7-8 实现的权威源
>
> **观看顺序**:
> 1. 本文(原则 + 索引)
> 2. [wireframes/](./wireframes/) — 10 张静态页面线框图(ASCII)
> 3. [interaction-flows/](./interaction-flows/) — 5 个关键交互流程图(Mermaid)
> 4. [cross-platform-constraints.md](./cross-platform-constraints.md) — 三平台一致性约束

---

## 一、设计原则

### 1.1 信息密度优先,装饰其次

- 三栏视图最大化利用屏幕,装饰性留白控制在 8-12%
- 没用的功能不放(如品牌大 logo、空白引导卡片占满屏)

### 1.2 键盘第一,鼠标第二

- 所有高频操作必须有快捷键(`/` 命令面板、`⌘K` 搜索、`⌘N` 新会话、`⌘,` 设置)
- 鼠标只是 fallback,不是主要交互方式
- 命令面板覆盖所有 CLI 子命令(`epcode prd`、`epcode adr` 等),用户在 GUI 里也能跑

### 1.3 状态可见

- 当前供应商、模型、连接状态、环境检查结果 都在视觉上随时可见
- 失败状态用红/黄高亮,不靠 toast(toast 会闪过)

### 1.4 渐进披露

- 默认隐藏高级功能(模型温度、上下文窗口、调试面板等)
- 设置页有 "⚗️ 实验性" tab 收纳

### 1.5 三平台一致 + 平台特性

- **必须一致**: 信息架构、核心功能层级、关键术语、快捷键(modifier 键除外)
- **可分平台定制**: 窗口控件位置、菜单组织、系统托盘、通知样式

---

## 二、索引

### Wireframes(静态线框图,10 张)

| # | 文件 | 主题 |
|---|------|------|
| 1 | [main-three-pane.md](./wireframes/01-main-three-pane.md) | 主视图(侧边栏 + 聊天 + Artifact) |
| 2 | [setup-wizard.md](./wireframes/02-setup-wizard.md) | 首次启动 4 步向导 |
| 3 | [settings.md](./wireframes/03-settings.md) | 设置页(General / Provider / Shortcuts / Experimental) |
| 4 | [slash-command-palette.md](./wireframes/04-slash-command-palette.md) | 斜杠命令浮层 |
| 5 | [artifact-panel-expanded.md](./wireframes/05-artifact-panel-expanded.md) | Artifact 全屏详情 |
| 6 | [provider-switcher.md](./wireframes/06-provider-switcher.md) | 供应商切换浮层 |
| 7 | [search-overlay.md](./wireframes/07-search-overlay.md) | 全局搜索(⌘K) |
| 8 | [conversation-context-menu.md](./wireframes/08-conversation-context-menu.md) | 会话右键菜单 + 收藏 + 分组 |
| 9 | [empty-states.md](./wireframes/09-empty-states.md) | 各种空状态 |
| 10 | [env-status-bar.md](./wireframes/10-env-status-bar.md) | 持久化环境健康状态栏 |

### Interaction Flows(交互流程,5 个 Mermaid)

| # | 文件 | 流程 |
|---|------|------|
| 1 | [flow-new-conversation.md](./interaction-flows/01-flow-new-conversation.md) | 新建会话从入口到首条消息 |
| 2 | [flow-env-check-fail.md](./interaction-flows/02-flow-env-check-fail.md) | 环境检查失败的兜底引导 |
| 3 | [flow-slash-command.md](./interaction-flows/03-flow-slash-command.md) | 斜杠命令调用 + 自动补全 |
| 4 | [flow-artifact-detect.md](./interaction-flows/04-flow-artifact-detect.md) | AI 输出 → 自动识别为 Artifact |
| 5 | [flow-provider-switch.md](./interaction-flows/05-flow-provider-switch.md) | 会话中切换供应商的影响处理 |

---

## 三、与 Phase 1 的关系

本设计稿对应 `app/ClaudeCodeHistory/` 已有的 22 个 Swift 文件。Sprint 7 macOS Beta 时:

| 设计稿 | Swift 实现 | 改动评估 |
|--------|----------|---------|
| 主三栏 | `ContentView.swift` + `SidebarView.swift` + `ChatView.swift` + `ArtifactPanel.swift` | 中,需补缺失元素(供应商显示、状态栏) |
| 首次向导 | `SetupWizardView.swift` + `EnvironmentChecker.swift` | 大,加 Provider 配置步骤 |
| 设置页 | `SettingsView.swift` + `AppSettings.swift` + `ProviderManager.swift` | 大,重构成多 tab |
| 斜杠命令面板 | (无) | 全新,需加新组件 |
| 全局搜索 | (无) | 全新 |
| 状态栏 | `EHUBInfoBar.swift` 局部 | 中,扩展为完整状态栏 |

---

## 四、待评审项

主理人评审时优先关注:

- [ ] 三栏布局比例 (240 / flex / 320 px) 是否合适?
- [ ] 命令面板是否覆盖了 CLI 全集(10 个 subcommand)?
- [ ] 首次向导 4 步是否过长?是否能合并 1-4 步?
- [ ] 跨平台约束(`cross-platform-constraints.md`)是否过严?
- [ ] 是否需要补 "AI 思考中" 的视觉反馈线框?
- [ ] 是否需要补 "设置 → 隐私" 页(数据收集/上报开关)?
