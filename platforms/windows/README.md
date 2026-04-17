# Windows 平台适配

> **状态**: ✅ Phase 3 完成
> **支持**: Windows 10 (21H2+) / Windows 11 / WSL2

## 推荐模式

| 模式 | 推荐度 | 适合 |
|------|-------|------|
| **WSL2 + Ubuntu**（推荐） | ⭐⭐⭐⭐⭐ | 类 Unix 开发体验,用 Linux 工具链 |
| **原生 Windows + PowerShell** | ⭐⭐⭐ | 必须 Windows / .NET 开发 |
| 混合模式（WSL + Windows Terminal + VSCode Remote） | ⭐⭐⭐⭐⭐ | 日常开发最佳 |

## 内容

| 文件 | 用途 |
|------|------|
| [setup.md](./setup.md) | 完整安装指南（WSL + 原生两种方案） |
| [scripts/install.ps1](./scripts/install.ps1) | 原生 Windows 一键安装（PowerShell） |
| [scripts/check-environment.ps1](./scripts/check-environment.ps1) | 环境校验脚本 |

## 快速开始

### 方案 A: WSL2（推荐）

```powershell
# 管理员 PowerShell
wsl --install -d Ubuntu-22.04
# 重启后,进入 Ubuntu 继续按 Linux 方式配置
```

参考 [../linux/setup.md](../linux/setup.md)。

### 方案 B: 原生 Windows

```powershell
# 确保有 winget（Win11 自带，Win10 从 Microsoft Store 装 "App Installer"）

# 一键装
cd path\to\ep-code-ai
.\platforms\windows\scripts\install.ps1 -Mode Minimal
# 或
.\platforms\windows\scripts\install.ps1 -Mode Full

# 验证
.\platforms\windows\scripts\check-environment.ps1
```

## 关键配置

### Git 换行符

```powershell
# Windows 本地 CRLF,仓库 LF
git config --global core.autocrlf true
# 如果主要和 WSL/Linux 协作，可用 input
# git config --global core.autocrlf input

# 长路径支持（绕过 260 限制）
git config --global core.longpaths true
```

### Windows 长路径开启

```powershell
# 需要管理员
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWord -Force
```

## 跨平台差异速查

| 项目 | macOS | Linux | Windows |
|------|-------|-------|---------|
| 包管理器 | brew | apt/dnf/pacman | winget/choco/scoop |
| 用户目录 | `/Users/` | `/home/` | `C:\Users\` |
| 默认 shell | zsh | bash | PowerShell |
| 换行符 | LF | LF | CRLF |
| 路径分隔符 | `/` | `/` | `\`（也支持 `/`） |
| 脚本 | `.sh` | `.sh` | `.ps1` / `.bat` |
| 文件系统 | 默认不区分大小写 | 区分 | 不区分 |

## 关键适配原则

### 1. 脚本优先用 Node.js / Python

三平台原生支持,避免双版本维护:

```javascript
// tools/cross-platform/scripts/check-links.js
// ↑ 这份脚本在 macOS/Linux/Windows 都能跑
```

### 2. 必须用 shell 时，双版本

- `.sh` 版本（macOS/Linux）
- `.ps1` 版本（Windows）
- `.gitattributes` 已配置行尾符差异化

### 3. 路径处理

```javascript
// ✅ 推荐
import path from 'node:path'
const p = path.join(rootDir, "scripts", "build.sh")

// ❌ 避免
const p = rootDir + "/scripts/build.sh"
```

### 4. 路径硬编码

```
❌ /Users/xxx/...
❌ /home/xxx/...
❌ C:\Users\xxx\...
✅ $HOME / ~ / os.homedir()
```

## 测试矩阵

| 配置 | 状态 |
|------|------|
| Windows 11 + PowerShell 7 + winget | ✅ 脚本支持 |
| Windows 10 21H2 + PowerShell 5.1 + Chocolatey | 📋 脚本部分支持 |
| WSL2 + Ubuntu 22.04 | ✅ 视为 Linux |
| Windows Server 2022 | 📋 理论支持,未专门测试 |

## 常见问题

### Q: `.\platforms\windows\scripts\install.ps1` 报"无法加载,因为在此系统上禁止运行脚本"

A: PowerShell 默认不允许脚本。执行:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# 或仅当前会话
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Q: Bash 脚本 `script.sh` 在 Git Bash 里报 `\r: command not found`

A: 文件被保存成 CRLF 了。几种解法:
- 用 `dos2unix script.sh`
- Git 重新 clone（`.gitattributes` 会自动转）
- VSCode 右下角 CRLF → LF

### Q: 权限不足装不上

A: 用管理员身份打开 PowerShell:
1. Win + X
2. 选 "Windows Terminal (管理员)" 或 "PowerShell (管理员)"

## 贡献

- 测试其他 Windows 配置（如 Windows Server）
- 补充常见问题
- 优化 install.ps1 的错误处理
