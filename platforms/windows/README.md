# Windows 环境搭建（Phase 3 - 计划中）

> 本目录为 Phase 3 占位，内容待补充

## 与 macOS/Linux 的主要差异

| 项目 | macOS/Linux | Windows |
|------|-------------|---------|
| 包管理器 | brew / apt | winget / choco / scoop |
| 用户主目录 | `/Users/` 或 `/home/` | `C:\Users\<name>` |
| 路径分隔符 | `/` | `\`（也支持 `/`） |
| 默认 shell | zsh / bash | PowerShell / cmd |
| 脚本 | `.sh` | `.ps1` / `.bat` |
| 行尾符 | LF | CRLF |

## 关键适配点

### 1. 路径处理

```javascript
// ❌ 硬编码路径分隔符
const p = __dirname + "/scripts/build.sh";

// ✅ 用 path.join
const path = require("path");
const p = path.join(__dirname, "scripts", "build.sh");
```

### 2. Shell 脚本

所有 `.sh` 脚本必须提供 `.ps1` 版本。优先用 Node.js / Python 编写（天然跨平台）。

### 3. 路径规范

- 配置文件：**用相对路径或环境变量**
- 代码：**不要硬编码 `/Users/` 或 `C:\`**

## 计划内容

- [ ] setup.md — Windows 10/11 安装指南（含 WSL 方案）
- [ ] scripts/check-environment.ps1 — 环境检查 PowerShell 脚本
- [ ] WSL 适配方案
- [ ] Git for Windows 配置（换行符、长路径）
