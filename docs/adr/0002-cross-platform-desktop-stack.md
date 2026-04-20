# ADR-0002: 跨平台桌面应用技术栈 · 混合方案 (macOS 保留 Swift + Linux/Windows 用 Tauri)

## 状态

**Proposed** — Sprint 7 提议,评审窗口至 Sprint 8 启动前

## 日期

2026-04-20

## 参与决策

| 姓名 | 角色 |
|------|------|
| 张工 | 架构师 / 主理人 |
| _(待签)_ | 评审人 |

## 背景与上下文

Phase 1 已产出 `app/ClaudeCodeHistory/` macOS Swift 骨架(22 个 .swift 文件)。
Phase 2 Sprint 7-8 计划发布三平台桌面应用 Beta。必须决定:

- **Linux / Windows 用什么技术栈?**
- **已有的 macOS Swift 代码保留还是扔掉重写?**

这个决策会影响后续 2-3 个月的开发方向和团队技能投资。

### 要解决的问题

1. 三平台(macOS/Linux/Windows)**一致体验** vs **维护成本**的平衡
2. 已有 Swift 代码(约 2500 行)是资产还是包袱
3. 未来一年的人员学习成本(Rust / Web 前端 / 各平台原生 SDK)
4. 包体积(影响下载意愿)· 性能 · 内存占用
5. 和 Phase 3 服务端 RFC(PLAN ④)的衔接

### 约束

- 团队目前 1 人主理,不能同时维护 3 套原生代码库
- 项目核心价值在**方法论 + 工具链 + Prompt**,桌面应用只是"GUI 壳",不应占用过多时间
- 零付费原则(已决定不用 Docusaurus 付费版等)
- 必须和 Sprint 6 UI 设计稿对齐(17 个原型页)

## 备选方案

### 方案 A · Tauri(Rust + Web 前端)· 一套代码跨三平台

- **优点**:
  - 包小(约 5-15MB · vs Electron 100MB+)
  - Rust 安全 + 性能好
  - 一套代码跨三平台,维护成本最低
  - Tauri 2.x 生态已稳定
- **缺点**:
  - 现有 Swift 代码**几乎全部作废**(2500 行重写,4-6 周)
  - 团队需学 Rust + Web 前端(React/Vue/Svelte 选一)
  - 原生功能集成(Touch Bar / Spotlight 等 macOS 特色)需 Rust plugin
- **包**: ~10MB
- **重写成本**: 4-6 周

### 方案 B · Electron(JS + Web 前端)· 一套代码跨三平台

- **优点**:
  - 生态最熟(VSCode / Slack / Discord / ChatGPT 桌面版 都用它)
  - 团队 Node.js 已熟,Web 前端学习曲线浅
  - 丰富的 npm 插件生态
- **缺点**:
  - 包大(100MB+)· 内存占用高(~300MB 空闲)
  - 现有 Swift 代码作废
  - Chromium 每次升级都要跟
- **包**: ~120MB
- **重写成本**: 3-4 周(比 Tauri 快,生态成熟)

### 方案 C · 保持三平台原生(Swift + WinUI3 + GTK)· 不共享代码

- **优点**: 每平台最佳体验
- **缺点**:
  - **三套代码库**,维护成本 3x
  - 一个功能要实现 3 次,UI 更新要同步 3 次
  - 需要 3 种技术栈专家(Swift / C# / C++ 或 Vala)
- **重写成本**: 实质是继续 Swift(保持) + WinUI3 全新 + GTK 全新 = 6+ 周

### 方案 D · 混合方案(**选此**):macOS 保留 Swift + Linux/Windows 用 Tauri

- **优点**:
  - **macOS Swift 代码不浪费**(Phase 1 投入保留)
  - Linux/Windows 用 Tauri 快速起步(2-3 周)
  - 设计稿(Sprint 6 17 原型)是**两套实现共同源**
  - 未来 Tauri 版本稳定后,macOS 可平滑切 Tauri 实现大一统(保留选择权)
  - 团队学习新栈(Rust)规模小,先从 Linux/Win 开始,macOS 继续维护已会的 Swift
- **缺点**:
  - 短期**维护两套代码**
  - 两套实现可能出现功能漂移,需要设计稿严格约束 + 定期对齐
  - Sprint 7 实际分两条线(macOS Swift 调整 + Tauri 从零起)
- **包**: macOS DMG ~20MB + Tauri ~10MB · 各平台独立安装
- **重写成本**: macOS Swift 调整 2 周 + Tauri Linux/Win 3 周 = **总 5 周,可并行缩到 3 周**

## 决定

采用 **方案 D · 混合方案**:
- **macOS**(Sprint 7): 继续用现有 Swift,按 UI 设计稿调整,Beta 打包
- **Linux/Windows**(Sprint 8): 用 Tauri 从零开始,参照同一份 UI 设计稿
- **共同源**: `docs/design/ui/prototype/` 作为两套实现的**权威 UI 规范**
- **长期选项**: 12 个月内观察 Tauri 版是否在功能完整度和性能上**追平** Swift 版;若是,考虑 macOS 也切 Tauri 实现统一

## 后果

### 正面

- **资产保护**: Swift 代码不浪费,Phase 1 投入延续
- **快速多平台**: Linux/Win 用 Tauri 从零起,速度比原生快 2-3 倍
- **低团队学习成本**: Rust 只在 Tauri 侧学,macOS 侧继续 Swift
- **未来可统一**: 保留 12 个月后切换到统一 Tauri 方案的选项
- **设计稿 ROI 最大化**: 17 个原型两套实现都参照,设计稿的价值放大 2 倍

### 负面

- **维护两套代码**至少 12 个月(直到决定是否大一统)
- **功能漂移风险**:macOS 可能先发新功能,Linux/Win 跟不上
  - **缓解**: 所有新功能必须先改设计稿 → 两个 issue(macOS 实现 + Tauri 实现)同时开
- **测试负担**: CI 要跑两套 build + 两套测试
- **CHANGELOG 复杂**: 记录"macOS 侧改了什么 · Tauri 侧改了什么"

### 需持续关注

- **每月对齐一次**:看 macOS 和 Tauri 版本功能 gap,写到 PLAN.md 的"待对齐清单"
- **Tauri 版本成熟度**:等 Tauri v3 发布(预计 2026 年底)时重新评估是否大一统
- **用户反馈**:如果两套体验差异太大,提前切换统一方案

### 技术栈细化(Tauri 侧)

- **后端**: Rust + Tauri v2.x
- **前端**: **Svelte 5 + TypeScript**(选 Svelte 理由: 包更小 / 语法更接近 HTML 原型 / 不强制虚拟 DOM / 团队学习曲线最浅)
- **样式**: CSS · 复用 `docs/design/ui/prototype/styles.css` 的 design tokens
- **状态管理**: Svelte stores(原生,不引入 Redux 类库)
- **HTTP/AI 调用**: 统一走 Rust 侧 command(避免前端处理 API Key)

## 实施路径

### Sprint 7(本 Sprint)· 只做规划

- ✅ 写本 ADR
- ✅ 写 ADR-0003 自动更新策略
- ✅ 写 Swift 改造清单(`docs/design/ui/swift-refactor-plan.md`)
- ✅ 写 macOS 打包 workflow(无签名 Beta)
- ❌ 实际修改 Swift 代码 · 留给 Sprint 7.x 实施

### Sprint 8 · Linux/Win Tauri 项目起步

- 新建 `app-tauri/` 目录
- Tauri 初始化 + Svelte 骨架
- 实现主视图三栏 + 首次启动向导 + 设置页(3 个最核心页面)
- Linux AppImage / Windows MSI 打包 workflow

### Sprint 9-10 · 两平台功能追平 macOS

- Tauri 补齐所有 17 个页面
- macOS Swift 完成设计稿对齐
- 统一 Release v1.0

## 相关

- Sprint 6 ⑥ [UI/UX 设计稿](../design/ui/) · 两套实现的共同源
- [ADR-0003](./0003-auto-update-strategy.md) · 自动更新策略
- [swift-refactor-plan.md](../design/ui/swift-refactor-plan.md) · Swift 改造清单
- PLAN.md Phase 2 Sprint 7-8 · 实施时间表
