# Windows 环境搭建指南

> Phase 3 支持平台：Windows 10（21H2+）/ Windows 11
> 支持两种模式：**原生 Windows** 或 **WSL2**（推荐 WSL2）

## 方案选择

| 方案 | 适合 | 推荐度 |
|------|------|-------|
| **原生 Windows + PowerShell** | 必须在 Windows 下开发 / 用 .NET | ⭐⭐⭐ |
| **WSL2 + Ubuntu** | 开发类 Unix 工具,用 Linux 工具链 | ⭐⭐⭐⭐⭐ |
| 混合（WSL2 + Windows Terminal + VSCode Remote） | 日常开发 + 工具脚本 | ⭐⭐⭐⭐⭐ |

---

## 方案 A: 使用 WSL2（强烈推荐）

### 1. 启用 WSL2

以**管理员身份**打开 PowerShell：

```powershell
# Windows 11 一键安装
wsl --install

# Windows 10（21H2+）
wsl --install -d Ubuntu-22.04
```

重启后首次启动 Ubuntu,设置用户名密码。

### 2. 更新到最新版

```powershell
wsl --update
wsl --set-default-version 2
wsl --set-default Ubuntu-22.04
```

### 3. 进入 WSL,继续按 Linux 方式配置

```bash
# 在 WSL 里
cd ~
curl -O https://raw.githubusercontent.com/epcode-ai/ep-code-ai/main/platforms/linux/scripts/install.sh
bash install.sh --minimal
```

参考 [../linux/setup.md](../linux/setup.md)。

### 4. 推荐工具

- **Windows Terminal** (Microsoft Store 免费下载)
- **VSCode + Remote-WSL 插件**
- **Docker Desktop**（可选,内置 WSL2 集成）

---

## 方案 B: 原生 Windows（PowerShell）

### 1. 前置

- Windows 10 21H2+ 或 Windows 11
- PowerShell 5.1+（系统自带）或 7.x（推荐）

### 2. 安装包管理器

**方式 1: winget**（Windows 11 自带，推荐）

```powershell
winget --version  # 检查是否已有
```

**方式 2: Chocolatey**

```powershell
# 管理员 PowerShell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**方式 3: Scoop**（轻量,用户级安装）

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
iex "& {$(irm get.scoop.sh)}"
```

### 3. 基础工具

**用 winget**:

```powershell
winget install --id Git.Git -e
winget install --id Microsoft.PowerShell -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id GitHub.cli -e
winget install --id jqlang.jq -e
```

**用 Chocolatey**:

```powershell
choco install -y git pwsh nodejs-lts python jq gh
```

**用 Scoop**:

```powershell
scoop install git pwsh nodejs-lts python jq gh
```

### 4. PowerShell 7（推荐升级）

旧版 PowerShell 5.1 不够现代。升级到 PowerShell 7：

```powershell
winget install --id Microsoft.PowerShell -e
```

之后用 `pwsh` 启动 PowerShell 7（`powershell` 仍是 5.1）。

### 5. Windows Terminal（推荐）

从 Microsoft Store 免费安装。它支持：
- Tab 多标签
- 自定义配置
- 集成 WSL、PowerShell、CMD、Git Bash

### 6. 配置 Git

```powershell
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 关键: Windows 换行符策略
# Windows 原生环境用 true（本地 CRLF，提交 LF）
git config --global core.autocrlf true
# 但如果主要在 WSL 和 macOS 协作，建议 input
# git config --global core.autocrlf input

# 长路径支持（Windows 默认 260 限制）
git config --global core.longpaths true

# 中文文件名不乱码
git config --global core.quotepath false
```

### 7. SSH 密钥

```powershell
# 生成密钥
ssh-keygen -t ed25519 -C "your@email.com"

# 启动 OpenSSH Agent 服务（首次）
Set-Service ssh-agent -StartupType Automatic
Start-Service ssh-agent

# 添加密钥
ssh-add $HOME\.ssh\id_ed25519

# 复制公钥
Get-Content $HOME\.ssh\id_ed25519.pub | Set-Clipboard
# 粘贴到 GitHub/GitLab 的 SSH Keys 设置
```

### 8. 配置 GitHub CLI

```powershell
gh auth login
# 按提示选 github.com → HTTPS → 用浏览器登录
```

### 9. Node / Python 工具（可选）

```powershell
# Node 全局工具
npm install -g pnpm @playwright/test newman

# Python 工具
python -m pip install --user pytest pytest-cov tavern locust
```

### 10. 克隆本框架

```powershell
New-Item -ItemType Directory -Path $HOME\work -Force
cd $HOME\work
git clone git@github.com:epcode-ai/ep-code-ai.git
cd ep-code-ai
```

---

## Windows 常用路径

| 用途 | 路径 |
|------|------|
| 用户主目录 | `C:\Users\<name>` 或 `$HOME` 或 `$env:USERPROFILE` |
| AppData 漫游 | `$env:APPDATA` |
| AppData 本地 | `$env:LOCALAPPDATA` |
| 系统环境变量 | 系统属性 → 高级 → 环境变量 |
| 临时 | `$env:TEMP` |

## Windows 特有注意

### 1. 换行符（CRLF 地狱）

Windows 原生用 CRLF。跨平台协作时：
- Git 配置 `core.autocrlf = true` (Windows 本地 CRLF,仓库 LF)
- 或 `input` (本地也 LF,与 macOS/Linux 协作更好)
- `.gitattributes` 里对 `.ps1/.bat` 强制 CRLF (已配置)

### 2. 路径分隔符

```powershell
# PowerShell 兼容 / 和 \，优先用 /
$path = Join-Path $HOME "scripts\build.ps1"  # 或
$path = "$HOME/scripts/build.ps1"
```

### 3. 执行策略

PowerShell 默认不允许脚本执行。解决:

```powershell
# 仅当前会话（最安全）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 永久（用户级）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4. 大小写不敏感

Windows 默认不区分大小写。与 Linux 协作时:
- **始终用全小写 kebab-case 命名**
- 避免只有大小写不同的文件

### 5. 长路径（260 字符限制）

Windows 默认限制路径 260 字符。开启长路径:

```powershell
# 注册表设置（需管理员）
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWord -Force

# Git 也要开
git config --global core.longpaths true
```

### 6. 杀毒软件/Defender

Windows Defender 会扫描所有文件,影响 Node/Python 性能。可以把开发目录加白名单:

```powershell
Add-MpPreference -ExclusionPath "$HOME\work"
```

### 7. 换行符常见问题

**问题**: Bash 脚本在 Windows 换行符是 CRLF,WSL/Linux 执行报错 `\r: command not found`

**解决**:
- Git 自动转换（`.gitattributes` 已配置 `.sh` 为 LF）
- 如果已经被污染,用 `dos2unix script.sh` 修复

## 验证安装

```powershell
# 在 PowerShell 中运行
cd $HOME\work\ep-code-ai
.\platforms\windows\scripts\check-environment.ps1
```

预期输出全绿。

## 发行版对照速查

| 任务 | winget | Chocolatey | Scoop |
|------|--------|-----------|-------|
| 装包 | `winget install` | `choco install` | `scoop install` |
| 卸载 | `winget uninstall` | `choco uninstall` | `scoop uninstall` |
| 更新 | `winget upgrade` | `choco upgrade all` | `scoop update *` |
| 搜索 | `winget search` | `choco search` | `scoop search` |

## 跨 macOS/Linux/Windows 的脚本开发建议

见 [../../CONTRIBUTING.md#跨平台要求](../../CONTRIBUTING.md)。

关键原则:
- 脚本**优先用 Node.js / Python**（三平台原生支持）
- 必须用 shell 时,同时提供 `.sh` 和 `.ps1` 版本
- 代码路径处理用 `path.join()`，不硬编码 `/` 或 `\`

## 下一步

- 阅读 [../../docs/chapters/01-overview](../../docs/chapters/01-overview/)
- 阅读 [../../docs/chapters/04-testing/04-gates/submission-gate.md](../../docs/chapters/04-testing/04-gates/submission-gate.md)
- 参考 [../../workflows/gitlab](../../workflows/gitlab/) 配置研发平台

## 与 macOS / Linux 的差异

| 项目 | macOS | Linux | Windows |
|------|-------|-------|---------|
| 包管理器 | Homebrew | apt / dnf / pacman | winget / Choco / Scoop |
| 用户目录 | `/Users/` | `/home/` | `C:\Users\` |
| 默认 shell | zsh | bash | PowerShell / cmd |
| 换行符 | LF | LF | CRLF（历史） |
| 路径分隔符 | `/` | `/` | `\` （也支持 `/`） |
| 脚本扩展名 | `.sh` | `.sh` | `.ps1` / `.bat` |
| 文件系统 | 默认不区分大小写 | 区分 | 不区分 |
| SSH 配置 | `~/.ssh/` | `~/.ssh/`（严格权限） | `$HOME\.ssh\` |
