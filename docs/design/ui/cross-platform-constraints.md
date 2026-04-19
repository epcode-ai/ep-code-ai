# 三平台一致性约束

> 哪些必须三平台完全一致 / 哪些可以分平台定制 / 哪些每平台独有。

## 一、必须一致(违反 = 设计 bug)

### 1.1 信息架构

- 三栏布局(侧边栏 / 聊天 / Artifact 面板)的位置和顺序
- 设置页的 4 个 tab 顺序: General → Provider → Shortcuts → Experimental
- 首次向导 4 步的顺序: Welcome → Env Check → Provider → Done

### 1.2 关键术语(中文优先,英文为辅)

| 概念 | 用词 | 不要用 |
|------|------|--------|
| AI 一次回复 | "回复" | response / answer |
| 用户一次输入 | "消息" | prompt / query |
| 一组对话 | "会话" | conversation / chat / dialog |
| AI 输出的代码/文档 | "Artifact" | document / output / file |
| AI 服务方 | "供应商" | provider / vendor |

### 1.3 快捷键(modifier 跨平台映射)

| 功能 | macOS | Linux/Win | 备注 |
|------|-------|-----------|------|
| 新会话 | `⌘N` | `Ctrl+N` | |
| 全局搜索 | `⌘K` | `Ctrl+K` | |
| 设置 | `⌘,` | `Ctrl+,` | |
| 斜杠命令 | `/` | `/` | 在输入框首字符触发 |
| 切换供应商 | `⌘⇧P` | `Ctrl+Shift+P` | |
| 关闭当前会话 | `⌘W` | `Ctrl+W` | |
| 退出 | `⌘Q` | `Ctrl+Q` | |

> **macOS modifier (`⌘ ⇧ ⌥ ⌃`)** ↔ **Linux/Windows (`Ctrl Shift Alt Meta`)** 一对一映射

### 1.4 颜色语义

| 语义 | 颜色 | 使用场景 |
|------|------|---------|
| Primary | `#2962FF`(深蓝) | 主按钮、链接、激活状态 |
| Success | `#00C853`(绿) | 环境检查通过、操作成功 |
| Warning | `#FFB300`(琥珀) | 可降级运行的问题 |
| Error | `#D50000`(红) | 必须修复的问题、API 失败 |
| Muted | `#6B7280`(灰) | 次要文本、占位符 |

### 1.5 字体

- **正文**: 系统默认 UI 字体 (San Francisco / Segoe UI / Cantarell)
- **代码 / Artifact**: `JetBrains Mono` 12px(打包内置;系统无则降级 monospace)

---

## 二、可分平台定制

### 2.1 窗口控件位置

| 平台 | 关闭/最大/最小化 | 应用菜单 |
|------|----------------|---------|
| macOS | 左上(红黄绿) | 系统菜单栏(屏幕顶) |
| Windows | 右上(─ □ ✕) | 应用窗口内顶部 |
| Linux GNOME | 右上 | 应用窗口内顶部(汉堡菜单) |
| Linux KDE | 可配置 | 同 Windows |

### 2.2 通知样式

- macOS: 用 `UNUserNotificationCenter` 系统通知中心
- Windows: 用 toast notification (Windows 10+)
- Linux: 优先 D-Bus `org.freedesktop.Notifications`,fallback 应用内 banner

### 2.3 文件选择 / 保存对话框

- 各平台用系统原生对话框,不自绘

### 2.4 系统托盘 / 菜单栏图标

- macOS: 菜单栏(顶栏)右侧
- Windows: 系统托盘
- Linux: 应用指示器(Unity)/ 系统托盘(其他)

### 2.5 键盘菜单加速键(`Alt+F` 等)

- Windows/Linux 应用菜单显示下划线加速键
- macOS 不显示

---

## 三、每平台独有(其他平台不实现)

### 3.1 macOS 独有

- **Touch Bar 支持**(2016-2021 MacBook Pro):放常用命令快捷
- **Spotlight 集成**:Cmd+Space 搜索可命中本应用的会话(可选,Phase 3+)

### 3.2 Windows 独有

- **任务栏跳转列表**:右键应用图标显示"最近会话"
- **WSL 桥接**:检测到 WSL 时优先在 WSL 里跑 Claude Code

### 3.3 Linux 独有

- **D-Bus 服务**:暴露 RPC 接口供其他工具调用(如 i3wm 快捷键直接跑命令)

---

## 四、必须避免的反模式

| ❌ 反模式 | 为什么避免 |
|---------|----------|
| 在 macOS 用 Windows 风格关闭按钮(右上 ✕) | 视觉违和,反 macOS HIG |
| 三个平台用不同的 emoji(✅ vs ✔ vs 🆗) | 跨平台截图对比时混乱 |
| 在 Linux 用 Windows 通知 toast 样式 | 不融入桌面环境 |
| 复制 macOS 的全局菜单到 Linux/Windows 应用窗口外 | 平台习惯不同,用户找不到 |
| 不同平台快捷键不一致(如 macOS Cmd+T,Win Ctrl+N) | 跨平台用户困惑 |

---

## 五、本约束的演进

任何对本文件的改动需要 ADR(`docs/adr/`):

- 加新约束 → 标 `Status: Proposed`,2 周评审窗口
- 改约束 → 必须标明影响哪些 wireframe / 流程
- 删约束 → 在本文末尾追加 "已废止" 段,保留历史
