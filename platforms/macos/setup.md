# macOS 环境搭建指南

> Phase 1 优先支持平台

## 前置条件

- macOS 12+ (Monterey / Ventura / Sonoma)
- 已安装 Homebrew

## 安装 Homebrew（如未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 基础工具

```bash
# 版本管理
brew install git

# 跨平台运行时
brew install node          # Node.js（脚本、自动化、工具）
brew install python@3.12   # Python 3.12

# CLI 工具
brew install jq            # JSON 处理
brew install yq            # YAML 处理

# GitLab CLI（对应你们公司用 GitLab）
brew install glab

# 可选：GitHub CLI（跨仓库协作时用）
brew install gh
```

## 配置 Git

```bash
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 强制 LF 换行，避免跨平台问题
git config --global core.autocrlf input

# 解决中文文件名乱码
git config --global core.quotepath false
```

## SSH 密钥配置（首次）

```bash
# 生成密钥
ssh-keygen -t ed25519 -C "your@email.com"

# 加入钥匙串
ssh-add --apple-use-keychain ~/.ssh/id_ed25519

# 复制公钥，粘贴到 GitLab/GitHub 的 SSH Keys 设置
pbcopy < ~/.ssh/id_ed25519.pub
```

## 配置 GitLab CLI

```bash
# 登录 GitLab（替换为你们公司的 GitLab 地址）
glab auth login --hostname gitlab.yourcompany.com

# 验证
glab auth status
```

## Python 测试工具（可选）

```bash
# pytest 生态
python3 -m pip install pytest pytest-cov pytest-asyncio
python3 -m pip install requests httpx

# API 测试
python3 -m pip install tavern

# 性能测试
python3 -m pip install locust
```

## Node.js 测试工具（可选）

```bash
# 安装 pnpm
npm install -g pnpm

# 全局工具
npm install -g newman          # Postman CLI
npm install -g @playwright/test # E2E 测试
```

## 克隆本框架

```bash
# 建议路径：~/work/test-management-framework
mkdir -p ~/work && cd ~/work
git clone git@github.com:<你的用户名>/test-management-framework.git
cd test-management-framework
```

## 常用路径（macOS）

| 用途 | 路径 |
|------|------|
| 用户主目录 | `~` 或 `/Users/<name>` |
| 项目根目录（建议） | `~/work/` |
| 临时文件 | `/tmp/` |
| Homebrew | `/opt/homebrew/`（Apple Silicon）或 `/usr/local/`（Intel） |

## 常用命令对照（macOS）

| 操作 | 命令 |
|------|------|
| 列目录 | `ls -la` |
| 读文件 | `cat file` |
| 搜索内容 | `grep -rn "pattern" .` |
| 复制文件夹 | `cp -r src dst` |
| 设置环境变量 | `export VAR=value` |
| 启动 Node 脚本 | `node script.js` |
| 启动 Python 脚本 | `python3 script.py` |

## macOS 特有注意事项

### 1. 文件系统大小写不敏感

默认 macOS 不区分大小写（`File.md` 和 `file.md` 是同一个文件）。Linux 服务器区分，所以：
- 代码仓库中统一使用 **全小写 kebab-case**
- 避免出现只有大小写不同的两个文件

### 2. .DS_Store 文件

macOS 会在每个目录生成 `.DS_Store`，记得：
- 全局 `.gitignore` 添加此项
- 本仓库 `.gitignore` 已包含

### 3. 默认 shell 是 zsh

- 配置文件：`~/.zshrc`
- 脚本编写时优先用 `#!/bin/bash`（兼容性更好）

## 验证安装

```bash
# 运行检查脚本
bash scripts/check-environment.sh
```

预期输出全绿表示环境就绪。

## 下一步

- 阅读 [docs/01-overview](../../docs/01-overview/) 理解整体架构
- 阅读 [docs/04-gates/submission-gate.md](../../docs/04-gates/submission-gate.md) 理解提测达标
- 参考 [workflows/gitlab](../../workflows/gitlab/) 在你的 GitLab 仓库配置模板
