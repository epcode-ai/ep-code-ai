# EP Code AI · 桌面应用

> macOS 原生 Claude Code 客户端，基于 Swift + SwiftUI 开发

## 功能概览

| 模块 | 文件 | 功能 |
|------|------|------|
| 应用入口 | `ClaudeCodeHistoryApp.swift` | SwiftUI App 主入口 |
| 主视图 | `ContentView.swift` | 三栏布局：侧边栏 + 聊天 + Artifact |
| 侧边栏 | `SidebarView.swift` | 会话列表、分组、搜索 |
| 聊天视图 | `ChatView.swift` | 对话内容渲染与交互 |
| 会话存储 | `ConversationStore.swift` | 会话数据持久化 |
| 会话命名 | `ConversationNameManager.swift` | 自动生成/管理会话名 |
| 收藏管理 | `FavoritesManager.swift` | 常用会话置顶 |
| 设置 | `SettingsView.swift` | 应用偏好设置 |
| 初次向导 | `SetupWizardView.swift` | 首次启动引导 |
| 环境检查 | `EnvironmentChecker.swift` | Node / npm / Claude 依赖检测 |
| 进程管理 | `ClaudeProcessManager.swift` | 启停 Claude Code 进程 |
| 供应商管理 | `ProviderManager.swift` | 多 API 提供商切换 |
| 斜杠命令 | `SlashCommands.swift`, `SlashCommandPalette.swift` | `/command` 快捷操作 |
| 产物面板 | `ArtifactPanel.swift`, `ArtifactDetector.swift` | 代码/文档产出物聚合 |
| 文件监听 | `FileWatcher.swift` | Claude 会话文件实时监听 |
| 信息栏 | `EHUBInfoBar.swift` | 顶部状态栏信息展示 |
| 设置存储 | `AppSettings.swift` | 设置项持久化 |
| 数据模型 | `Models.swift` | 核心数据结构 |

## 构建与运行

### 前置条件

- macOS 13+ (Ventura / Sonoma / Sequoia)
- Xcode 15+
- Xcode Command Line Tools

### 一键安装（推荐）

```bash
./install.sh
```

该脚本会：
1. 检查 macOS 与 Xcode 命令行工具
2. 把代码复制到 `$HOME/ClaudeCodeHistory`
3. 处理旧版文件移除
4. 构建应用

### 手动构建

```bash
# 打开 Xcode 项目
open ClaudeCodeHistory.xcodeproj

# 或命令行构建
xcodebuild -project ClaudeCodeHistory.xcodeproj \
  -scheme ClaudeCodeHistory \
  -configuration Release \
  build
```

### 生成应用图标

```bash
swift generate_icon.swift
```

## 目录结构

```
app/
├── ClaudeCodeHistory.xcodeproj/    Xcode 工程文件
├── ClaudeCodeHistory/              Swift 源码
│   ├── *.swift                     20 个源文件
│   ├── Assets.xcassets/            图标、颜色资源
│   └── ClaudeCodeHistory.entitlements   App Sandbox 权限声明
├── install.sh                      一键安装脚本
├── generate_icon.swift             图标生成脚本
└── README.md                       本文件
```

## 关键特性

### 会话历史管理

- 自动读取本地 Claude Code 会话目录
- 支持分组、搜索、收藏
- 文件变化实时同步

### 环境向导

首次启动时自动检查：
- Node.js 版本
- npm 可用性
- Claude Code CLI 是否安装
- API Key 配置

### 多供应商切换

支持在 Anthropic 官方 API、第三方代理之间快速切换。

### 斜杠命令

输入 `/` 唤出命令面板：
- `/clear` 清空当前会话
- `/export` 导出会话为 Markdown
- （更多命令扩展中）

### Artifact 面板

自动识别会话中产出的代码块、文档、图表，汇总到侧边面板，支持一键复制/导出。

## 应用权限（Entitlements）

应用以 App Sandbox 方式运行，申请的能力：
- 文件读写（用户明确选择的目录）
- 网络访问（调用 Claude API）

详见 `ClaudeCodeHistory.entitlements`。

## 与方法论的关系

本应用是 **EP Code AI 方法论** 的"执行终端"：

- 方法论定义**做什么**（[`../docs/chapters/`](../docs/chapters/)）
- 应用提供**怎么做**的快捷入口（斜杠命令、会话管理、环境检查）

方法论独立于应用可以实施；应用独立于方法论也可以使用。两者通过 Claude Skills（[`../skills/`](../skills/)）桥接。

## 贡献

参见项目根目录的 [`../CONTRIBUTING.md`](../CONTRIBUTING.md)。

## License

MIT
