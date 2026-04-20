# 00 · 安装(三平台)

> **目标**: 10 分钟内,装好 CLI + 桌面应用 + 能跑 `epcode --help`。
>
> **三种使用方式,按需选**:
> 1. **只用 CLI**(最快,1 分钟)· 适合开发 / 自动化
> 2. **CLI + 文档站**(看方法论)· 推荐新用户
> 3. **完整桌面应用**(GUI)· Sprint 7 起可用

---

## 一、前置依赖(所有方式都需要)

| 工具 | 最低版本 | 检查命令 |
|------|---------|---------|
| **Node.js** | 18.0+ | `node --version` |
| **Git** | 2.30+ | `git --version` |
| **Claude Code** | 1.0+ | `claude --version` |

如果缺,按下面平台章节的"前置安装"装。

---

## 二、macOS 安装

### 2.1 前置(用 Homebrew)

```bash
# 装 Node + Git
brew install node git

# 装 Claude Code
npm install -g @anthropic-ai/claude-code

# 如果需要(首次用 Xcode 工具)
xcode-select --install
```

### 2.2 装 epcode CLI

**方式 A · 用 npx(推荐,无需 clone)**:

```bash
# 直接跑,不装
npx epcode --help
npx epcode init --mode=A --name=my-project
```

**方式 B · clone 仓库本地跑**:

```bash
git clone https://github.com/epcode-ai/ep-code-ai.git
cd ep-code-ai
node tools/cli/bin/epcode.js --help
```

### 2.3 装桌面应用(Sprint 7 之后)

```bash
# 从 GitHub Releases 下载最新 .dmg
# https://github.com/epcode-ai/ep-code-ai/releases

# 双击 .dmg → 拖到 Applications → 首次打开右键"打开"绕过 Gatekeeper
```

### 2.4 验证

```bash
npx epcode --help
# 应看到 10 个子命令:init / adopt / migrate / check / prd / adr / metrics / incident / linkage / jira

node tools/cross-platform/scripts/check-all.js
# 应看到"✅ 全部通过"
```

---

## 三、Linux 安装(Ubuntu / Debian)

### 3.1 前置

```bash
# Node 18+ (官方 APT 源)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install -y git

# Claude Code
sudo npm install -g @anthropic-ai/claude-code
```

### 3.2 装 CLI

同 macOS 2.2 节,`npx epcode` 或 clone 都可以。

### 3.3 一键脚本(本仓库提供)

```bash
git clone https://github.com/epcode-ai/ep-code-ai.git
cd ep-code-ai
bash platforms/linux/scripts/install.sh
```

### 3.4 桌面应用(Sprint 8 之后)

```bash
# AppImage(通用,不依赖包管理器)
wget https://github.com/epcode-ai/ep-code-ai/releases/latest/download/ep-code-ai-linux-x86_64.AppImage
chmod +x ep-code-ai-linux-x86_64.AppImage
./ep-code-ai-linux-x86_64.AppImage

# 或 .deb(Ubuntu/Debian)
sudo dpkg -i ep-code-ai-linux-amd64.deb
```

### 3.5 验证

```bash
bash platforms/linux/scripts/check-environment.sh
# 应看到各项依赖 ✅
```

---

## 四、Windows 安装

### 4.1 前置

**推荐 PowerShell 管理员窗口**执行:

```powershell
# 用 winget
winget install OpenJS.NodeJS
winget install Git.Git

# 装 Claude Code
npm install -g @anthropic-ai/claude-code
```

### 4.2 装 CLI

```powershell
# 方式 A · npx
npx epcode --help

# 方式 B · clone
git clone https://github.com/epcode-ai/ep-code-ai.git
cd ep-code-ai
node tools\cli\bin\epcode.js --help
```

### 4.3 一键脚本(本仓库提供)

```powershell
git clone https://github.com/epcode-ai/ep-code-ai.git
cd ep-code-ai
.\platforms\windows\scripts\install.ps1
```

### 4.4 桌面应用(Sprint 8 之后)

```powershell
# 从 GitHub Releases 下 .msi
# 双击运行安装向导
```

### 4.5 验证

```powershell
.\platforms\windows\scripts\check-environment.ps1
```

### 4.6 WSL 用户

如果用 WSL 2,**建议直接在 WSL 里跑 Linux 版本**(第 3 节),体验更顺。
Windows 原生版在 PowerShell / cmd 里跑,适合不想装 WSL 的用户。

---

## 五、首次启动(装完后做这三件事)

### 5.1 检查环境

```bash
# 自动检测 Node / npm / git / Claude Code 等
npx epcode check
```

如有异常,按提示修复。

### 5.2 第一个项目

```bash
# 用 A 模式(绿地)初始化
npx epcode init --mode=A --name=hello-epcode
cd hello-epcode
cat README.md   # 看起步清单
```

### 5.3 看看命令能干什么

```bash
# PRD 结构校验(对任意 .md)
npx epcode prd docs/prd/hello.md

# 四场景度量 + 看板
npx epcode metrics --since "7 days ago"

# 命令面板(字面意思:打开所有子命令)
npx epcode --help
```

---

## 六、配置 AI 供应商(首次使用前)

**桌面应用**: 首次启动的 Setup Wizard 第 3 步自动引导。

**纯 CLI 用户**: 只要你的本机的 `claude` CLI 已登录(`claude auth login`),本仓库的脚本就会用它。

如果想用不同供应商(Bedrock / Vertex / 代理),参考 Claude Code 官方文档: https://docs.anthropic.com/claude-code

---

## 七、完全离线可跑

以下场景**不需要网络**:
- `epcode init` / `epcode adopt` / `epcode migrate`
- `epcode check` · `epcode prd` · `epcode adr index` · `epcode metrics`
- 所有 `tools/cross-platform/scripts/*.js`

需要网络的:
- 调 AI (Claude / Bedrock 等)
- `epcode jira sync` · 同步到企业系统
- `npx epcode`(首次下载 npm 包)· 装完后可离线

---

## 八、下一步

- 📘 手册: [99-cheatsheet.md](./99-cheatsheet.md) 一页速查表
- 📖 方法论: [docs/chapters/00-adoption/](../chapters/00-adoption/) 看你的项目该用哪种模式
- 🧰 命令: `npx epcode --help` 看所有子命令
- 🆘 问题: [GitHub Issues](https://github.com/epcode-ai/ep-code-ai/issues)
