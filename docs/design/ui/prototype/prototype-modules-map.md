# 原型 ↔ 模块 ↔ 功能 映射

> 每张原型图对应哪些**功能模块**,覆盖什么**用户任务**,Sprint 1-5 的哪些**工具**会被用到,以及当前 `app/ClaudeCodeHistory/` 哪些 **Swift 文件**负责实现。
>
> 这份映射是 Sprint 7 macOS Beta 开发的**权威对照表**。

---

## 一、全景表

| # | 原型 | 核心模块 | 功能范围 | 对应 Swift 文件 | 复用 Sprint 1-5 能力 |
|---|------|---------|---------|---------------|---------------------|
| 01 | [主视图三栏](./01-main-three-pane.html) | 会话列表 + 聊天 + Artifact | 核心工作区 | `ContentView.swift`<br>`SidebarView.swift`<br>`ChatView.swift`<br>`ArtifactPanel.swift` | - |
| 02 | [首次启动向导](./02-setup-wizard.html) | 引导 + 环境检查 + 供应商配置 | 首次启动流程 | `SetupWizardView.swift`<br>`EnvironmentChecker.swift`<br>`ProviderManager.swift` | `platforms/*/scripts/check-environment.*` |
| 03 | [设置页](./03-settings.html) | 偏好设置 + 供应商管理 + 快捷键 | 配置中心 | `SettingsView.swift`<br>`AppSettings.swift`<br>`ProviderManager.swift` | - |
| 04 | [斜杠命令面板](./04-slash-command-palette.html) | 命令调用 + 参数补齐 | 快速操作 | (新增组件) | `tools/cli/commands/*` 全部 10 个 |
| 05 | [Artifact 全屏](./05-artifact-panel-expanded.html) | 文档/代码详情 + 版本对比 + 导出 | 产出管理 | `ArtifactPanel.swift`<br>`ArtifactDetector.swift` | - |
| 06 | [供应商切换](./06-provider-switcher.html) | 多供应商 + 上下文处理 | 会话中切换 | `ProviderManager.swift` | - |
| 07 | [全局搜索](./07-search-overlay.html) | 跨类型搜索 | 快速查找 | (新增组件)<br>`ConversationStore.swift` 需加索引 | - |
| 08 | [会话右键菜单](./08-conversation-context-menu.html) | 收藏 / 分组 / 多选 / 删除 | 会话管理 | `SidebarView.swift`<br>`FavoritesManager.swift`<br>`ConversationStore.swift` | - |
| 09 | [空状态合集](./09-empty-states.html) | 引导 + 提示 + 错误恢复 | 兜底与教育 | 分散在上述各组件 | - |
| 10 | [环境状态栏](./10-env-status-bar.html) | 持久化健康提示 | 全局状态监控 | `EHUBInfoBar.swift` (需扩展)<br>`EnvironmentChecker.swift` | `platforms/*/scripts/check-environment.*` |

---

## 二、按功能模块逆向汇总

### 2.1 会话管理模块

- **涵盖原型**: 01 主视图 · 08 右键菜单 · 09 空状态
- **关键用户任务**:
  - 新建会话(⌘N / 空状态按钮 / `+ 新会话`)
  - 切换会话(侧边栏点击 / ⌘K 搜索)
  - 收藏会话(右键菜单 / 拖拽)
  - 分组管理(右键菜单 → 移到分组)
  - 删除 / 归档(右键菜单 + 二次确认)
  - 多选批量操作(⌘ 点击 + 多选底栏)
- **数据存储**: 本地 SQLite(`ConversationStore.swift`)+ 搜索索引(FTS5)
- **Sprint 1-5 复用**: 无直接复用,但输出可以被 `tools/metrics/` 统计

### 2.2 聊天与 AI 交互模块

- **涵盖原型**: 01 主视图 · 09 空状态
- **关键用户任务**:
  - 发送消息(⌘↵)
  - 附件上传(📎 按钮)
  - 模型切换(⚡ 按钮,会话内)
  - 接收流式回复(AI 消息逐字显示)
  - 取消生成(停止按钮,生成中可见)
- **依赖**: `ClaudeProcessManager.swift`(启停 Claude Code 进程)
- **Sprint 1-5 复用**: 消息内容可发送到 `epcode prd` / `epcode jira sync` 做后处理

### 2.3 Artifact 管理模块

- **涵盖原型**: 01 主视图(右栏)· 05 全屏详情
- **关键用户任务**:
  - 自动识别代码 / Markdown / JSON
  - 切换 Artifact(◀▶ 按钮或点击卡片)
  - 大纲导航(标题树跳转)
  - 版本对比(v2 ↔ v3 diff)
  - 导出(.md / .pdf / .html / .zip)
  - 跳转到生成时对话
- **检测策略**: `ArtifactDetector.swift` 按长度 + 结构门槛
- **Sprint 1-5 复用**: 导出的 Artifact 可被 `epcode linkage` 脚本消费(如测试报告 → 发布计划)

### 2.4 环境与供应商模块

- **涵盖原型**: 02 首次向导 · 03 设置 Provider tab · 06 供应商切换 · 09 供应商未配置空态 · 10 环境状态栏
- **关键用户任务**:
  - 首次环境检查 + 一键修复(SetupWizard 步骤 2)
  - 配置多供应商(Anthropic / Bedrock / Vertex / 代理)
  - 测试连接
  - 会话内切换供应商(含上下文重塑警告)
  - 持久化健康监控(底部状态栏)
- **依赖**: `EnvironmentChecker.swift` + `ProviderManager.swift`
- **Sprint 1-5 复用**: `platforms/macos/scripts/check-environment.sh` 的检查逻辑被 GUI 封装

### 2.5 命令系统模块

- **涵盖原型**: 04 斜杠命令面板
- **关键用户任务**:
  - `/` 快速调用 10 个 CLI 子命令
  - 模糊搜索命令
  - 参数补齐(表单式)
  - 最近使用 / 收藏
- **实现**: 新增 `SlashCommandPalette.swift` 组件,扫描 `tools/cli/commands/*.js` 的 JSDoc 建命令注册表
- **Sprint 1-5 复用**: **全部 10 个 `epcode` 子命令** 在 GUI 里完全可用:
  - `/init <mode>` · `/adopt` · `/migrate` · `/check` · `/prd` · `/adr` · `/metrics` · `/incident` · `/linkage` · `/jira`

### 2.6 搜索模块

- **涵盖原型**: 07 全局搜索 ⌘K
- **关键用户任务**:
  - 跨会话 / Artifact / 命令 / 消息 搜索
  - 最近访问快速进入
  - 分组展示 + 筛选
- **实现**: SQLite FTS5 本地索引 + 新增 `SearchOverlay.swift`

### 2.7 设置与偏好模块

- **涵盖原型**: 03 设置页
- **关键用户任务**:
  - 外观(主题 / 字号 / 字体)
  - 会话偏好(自动命名 / 归档 / 保留)
  - 通知开关
  - 快捷键自定义
  - 实验性功能开关
  - 数据导出 / 清空
- **实现**: `SettingsView.swift` 需重构为 4 tab 布局 + `AppSettings.swift` 扩展 schema

### 2.8 状态与错误处理模块

- **涵盖原型**: 09 所有空态 · 10 状态栏
- **关键用户任务**:
  - 环境健康监控
  - 网络 / API 异常兜底
  - 错误重试 / 恢复
  - 用户引导(新用户 / 搜索无结果等)

---

## 三、按用户角色视角

### 3.1 新用户首次打开应用

主线: `02 向导` → `09.1 首次空态` → `01 主视图 + 09.3 新会话空态` → 发出第一条消息

### 3.2 老用户日常使用

主线: `01 主视图` ↔ `07 ⌘K 搜索` ↔ `04 / 命令` ↔ `05 Artifact 详情`

### 3.3 产品经理

高频: `04 /prd 命令` · `01 主视图(写 PRD)` · `05 Artifact 全屏(改 PRD)`

### 3.4 开发

高频: `01 主视图(代码讨论)` · `04 /adr /check 命令` · `05 Artifact(看生成代码)`

### 3.5 测试

高频: `04 /prd /linkage regression /linkage release-plan` · `05 Artifact(看测试报告)`

### 3.6 运维 / SRE

高频: `04 /incident /metrics /linkage release-plan` · `03 设置(Runbook 相关偏好)` · `10 状态栏`

---

## 四、Sprint 7 实现影响估算

| Swift 文件 | 现状 | 设计稿要求 | 改动量 | Sprint 7 是否处理 |
|----------|------|----------|--------|-----------------|
| `ContentView.swift` | 有三栏雏形 | 顶栏 + 状态栏 + 主 | 中 | ✅ |
| `SidebarView.swift` | 有列表 | 分组 + 收藏 + 右键菜单 + 多选 | 大 | ✅ |
| `ChatView.swift` | 有基础 | 附件 + 模型徽章 + token 计数 + 流式 | 中 | ✅ |
| `ArtifactPanel.swift` | 有列表 | 全屏详情 + 大纲 + 版本对比 | 中 | ⚠️ 只做基础版,版本对比延后 |
| `ArtifactDetector.swift` | 有雏形 | 支持 Markdown 文档 + 流式增量 | 中 | ✅ |
| `SetupWizardView.swift` | 有步骤 1-2 | 加步骤 3 供应商 + 步骤 4 完成 | 中 | ✅ |
| `EnvironmentChecker.swift` | 检测 | 加一键修复入口 | 中 | ✅ |
| `ProviderManager.swift` | 单供应商 | 多供应商 + 切换浮层 | 大 | ✅ |
| `SettingsView.swift` | 单页 | 4 tab + 表单 | 大 | ✅ |
| `AppSettings.swift` | 基础 | 扩展 schema(快捷键/实验性等) | 中 | ✅ |
| `EHUBInfoBar.swift` | 简单 | 扩展为完整状态栏 + tooltip | 中 | ✅ |
| `ConversationStore.swift` | 存储 | 加 FTS5 搜索索引 + 分组表 | 中 | ✅ |
| `FavoritesManager.swift` | 基础 | 对接分组 | 小 | ✅ |
| (新增) `SlashCommandPalette.swift` | - | 命令面板 + 参数表单 | 大 | ✅ |
| (新增) `SearchOverlay.swift` | - | ⌘K 搜索 | 大 | 🟡 基础版,无筛选 |
| (新增) `CommandRegistry.swift` | - | 扫描 tools/cli/commands/ 建注册表 | 中 | ✅ |

**总体估算**:
- macOS Beta(Sprint 7): 实现约 **80%** 设计稿功能,版本对比和搜索筛选延后到 v0.7
- Linux/Windows 实现(Sprint 8): 基于 macOS 移植 + 跨平台栈决策

---

## 五、快速验收表

Sprint 7 验收时,每个原型对应 1-3 个验收用例:

| # | 原型 | 关键验收点 |
|---|------|----------|
| 01 | 主视图 | ✅ 发送消息能收到回复 · ✅ Artifact 自动出现在右栏 · ✅ 状态栏显示环境 |
| 02 | 向导 | ✅ 4 步可以完整过 · ✅ 跳过后能从设置重开 · ✅ 环境检查准确 |
| 03 | 设置 | ✅ 4 tab 切换正常 · ✅ 改主题立即生效 · ✅ 快捷键冲突检测 |
| 04 | 命令面板 | ✅ `/` 触发 · ✅ 10 个 CLI 子命令全部能跑 · ✅ 参数表单正确 |
| 05 | Artifact 全屏 | ✅ 大纲跳转正确 · ✅ 导出 .md 可用(.pdf 可延后) · ⚠️ 版本对比可延后 |
| 06 | 切换供应商 | ✅ 新会话切换无 bug · ✅ 会话内切换有警告 · ✅ 上下文重塑可用 |
| 07 | 全局搜索 | ✅ ⌘K 弹出 · ✅ 能搜到会话 · ⚠️ 筛选模式可延后 |
| 08 | 右键菜单 | ✅ 收藏 / 分组 / 删除 正常 · ⚠️ 多选可延后 |
| 09 | 空状态 | ✅ 每种空态都有 CTA · ✅ 错误状态有恢复按钮 |
| 10 | 状态栏 | ✅ 三色态切换正确 · ✅ hover 弹详情 · ✅ 修复按钮可用 |

---

## 六、文档联动

- 方法论: [docs/chapters/](../../../chapters/)(不受本设计稿影响)
- 线框详情: [docs/design/ui/wireframes/](../wireframes/)(本映射的源头)
- 交互流程: [docs/design/ui/interaction-flows/](../interaction-flows/)(补充静态页面看不到的状态变化)
- 跨平台约束: [docs/design/ui/cross-platform-constraints.md](../cross-platform-constraints.md)
- 发布流程: [RELEASE_PROCESS.md](../../../../RELEASE_PROCESS.md)(macOS Beta 走此流程)
