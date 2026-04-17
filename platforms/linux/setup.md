# Linux 环境搭建指南

> Phase 2 支持平台，涵盖 Ubuntu 22+ / Debian 12+ / CentOS 9+ / Fedora 39+

## 前置条件

- 一台可上网的 Linux 机器（物理机 / 虚拟机 / WSL 均可）
- 具备 `sudo` 权限
- 任一主流发行版（参见下表支持版本）

### 发行版支持矩阵

| 发行版 | 版本 | 推荐指数 | 备注 |
|--------|------|---------|------|
| Ubuntu | 22.04 LTS / 24.04 LTS | ⭐⭐⭐⭐⭐ | 最常用 |
| Debian | 12 (Bookworm) | ⭐⭐⭐⭐ | 稳定 |
| Fedora | 39+ | ⭐⭐⭐⭐ | 新版工具 |
| CentOS Stream / Rocky / AlmaLinux | 9 | ⭐⭐⭐ | 企业常用 |
| Arch | rolling | ⭐⭐ | 高阶用户 |
| openSUSE | Leap 15.5+ | ⭐⭐ | 少数 |
| WSL2 (Ubuntu) | 22.04 | ⭐⭐⭐⭐⭐ | Windows 用户必备 |

## 一键安装脚本

复制粘贴到终端（脚本自动识别发行版）：

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/epcode-ai/ep-code-ai/main/platforms/linux/scripts/install.sh)
```

> ⚠️ 该链接需要仓库公开后才能访问。私有状态下请先 `git clone` 本仓库,再执行 `bash platforms/linux/scripts/install.sh`

## 手动安装（推荐，便于理解每一步）

### 1. 更新包管理器

```bash
# Ubuntu / Debian
sudo apt update && sudo apt upgrade -y

# Fedora
sudo dnf upgrade -y

# RHEL / CentOS / Rocky / Alma
sudo dnf upgrade -y
sudo dnf install -y epel-release

# Arch
sudo pacman -Syu --noconfirm
```

### 2. 基础工具

```bash
# Ubuntu / Debian
sudo apt install -y \
  git curl wget jq \
  build-essential \
  ca-certificates \
  gnupg lsb-release

# Fedora / RHEL
sudo dnf install -y \
  git curl wget jq \
  gcc gcc-c++ make \
  ca-certificates \
  gnupg

# Arch
sudo pacman -S --noconfirm \
  git curl wget jq base-devel \
  ca-certificates gnupg
```

### 3. Node.js（≥ 18，推荐 20 LTS）

**方式 A: 使用 NodeSource 源（推荐）**

```bash
# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Fedora / RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

**方式 B: 使用 nvm（多版本管理）**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc  # 或 ~/.zshrc
nvm install 20
nvm use 20
nvm alias default 20
```

**验证**:
```bash
node -v   # v20.x
npm -v    # 10.x
```

### 4. Python（≥ 3.10，用于部分工具）

```bash
# Ubuntu / Debian
sudo apt install -y python3 python3-pip python3-venv

# Fedora / RHEL
sudo dnf install -y python3 python3-pip

# Arch
sudo pacman -S --noconfirm python python-pip
```

### 5. GitHub CLI

```bash
# Ubuntu / Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
  sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod 644 /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | \
  sudo tee /etc/apt/sources.list.d/github-cli.list
sudo apt update
sudo apt install -y gh

# Fedora / RHEL
sudo dnf install -y 'dnf-command(config-manager)'
sudo dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
sudo dnf install -y gh

# Arch
sudo pacman -S --noconfirm github-cli
```

### 6. GitLab CLI（如公司用 GitLab）

```bash
# 从 GitHub Release 直接下载 binary
GLAB_VERSION="1.43.0"
wget "https://github.com/profclems/glab/releases/download/v${GLAB_VERSION}/glab_${GLAB_VERSION}_Linux_x86_64.tar.gz"
tar -xzf "glab_${GLAB_VERSION}_Linux_x86_64.tar.gz"
sudo mv bin/glab /usr/local/bin/
rm -rf bin "glab_${GLAB_VERSION}_Linux_x86_64.tar.gz"
```

### 7. Docker（可选，用于容器化）

```bash
# Ubuntu / Debian
sudo apt install -y docker.io
sudo usermod -aG docker $USER  # 登出再登入生效

# Fedora
sudo dnf install -y docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

## 配置 Git

```bash
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 强制 LF（关键！跨平台一致性）
git config --global core.autocrlf input

# 中文文件名不乱码
git config --global core.quotepath false

# 默认分支名
git config --global init.defaultBranch main

# 拉取时 rebase
git config --global pull.rebase true
```

## SSH 密钥配置

```bash
# 生成密钥（如还没有）
ssh-keygen -t ed25519 -C "your@email.com"

# 启动 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 查看公钥,复制粘贴到 GitHub/GitLab SSH Keys
cat ~/.ssh/id_ed25519.pub
```

### 跨平台注意

Linux 的 `~/.ssh/` 权限必须严格:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/config  # 如有
```

## 配置 GitHub CLI

```bash
gh auth login
# 选 github.com → HTTPS → Login with a web browser
# （Linux 可能要粘贴 one-time code 到浏览器）
```

## Python 测试工具（可选）

```bash
# pytest 生态
python3 -m pip install --user pytest pytest-cov pytest-asyncio requests httpx

# API 测试
python3 -m pip install --user tavern

# 性能测试
python3 -m pip install --user locust
```

## Node.js 全局工具（可选）

```bash
# 安装 pnpm
npm install -g pnpm

# API 测试
npm install -g newman

# E2E 测试
npm install -g @playwright/test
npx playwright install --with-deps  # 安装浏览器
```

## 克隆本框架

```bash
mkdir -p ~/work && cd ~/work
git clone git@github.com:epcode-ai/ep-code-ai.git
cd ep-code-ai
```

## Linux 常用路径

| 用途 | 路径 |
|------|------|
| 用户主目录 | `/home/<name>` 或 `~` |
| 配置 | `~/.config/` |
| 缓存 | `~/.cache/` |
| 数据 | `~/.local/share/` |
| 全局 bin | `/usr/local/bin/`（推荐）或 `/usr/bin/` |
| 全局 config | `/etc/` |
| 临时 | `/tmp/`（重启清空） |

## Linux 特有注意

### 1. 文件系统大小写敏感

与 macOS 默认不同，Linux **严格区分大小写**。
- ✅ 建议统一用小写 kebab-case 命名
- `File.md` 和 `file.md` 是两个不同的文件

### 2. 换行符

Linux 原生 LF，不会遇到 CRLF 问题。但 Git 配置仍要设:
```bash
git config --global core.autocrlf input
```

### 3. Shell

默认通常是 `bash`，部分发行版是 `dash`（/bin/sh）。
- 脚本用 `#!/usr/bin/env bash` 确保一致
- 避免使用 bash-only 特性时请用 `#!/bin/sh`

### 4. 权限与 root

- 不要 `sudo` 运行 npm / pip（会导致权限错乱）
- 用 `nvm` / `--user` 标志安装到用户空间

## 验证安装

```bash
cd ~/work/ep-code-ai
bash platforms/linux/scripts/check-environment.sh
```

预期输出全绿。

## 发行版差异速查

| 任务 | Ubuntu/Debian | Fedora/RHEL | Arch |
|------|--------------|-------------|------|
| 装包 | `apt install` | `dnf install` | `pacman -S` |
| 卸载 | `apt remove` | `dnf remove` | `pacman -R` |
| 更新 | `apt upgrade` | `dnf upgrade` | `pacman -Syu` |
| 搜索 | `apt search` | `dnf search` | `pacman -Ss` |
| 查包信息 | `apt show` | `dnf info` | `pacman -Si` |
| 服务启停 | `systemctl` | `systemctl` | `systemctl` |
| 防火墙 | `ufw` | `firewalld` | `iptables/ufw` |

## 下一步

- 阅读 [docs/chapters/01-overview](../../docs/chapters/01-overview/) 理解整体架构
- 阅读 [docs/chapters/04-testing/04-gates/submission-gate.md](../../docs/chapters/04-testing/04-gates/submission-gate.md) 理解提测达标
- 参考 [workflows/gitlab](../../workflows/gitlab/) 在你的 GitLab 仓库配置模板

## 与 macOS 的差异

参考 [../macos/setup.md](../macos/setup.md) 对照阅读。主要差异：

| 项目 | macOS | Linux |
|------|-------|-------|
| 包管理器 | Homebrew | apt / dnf / pacman |
| 用户目录 | `/Users/` | `/home/` |
| 文件系统 | 默认不区分大小写 | 区分大小写 |
| 默认 shell | zsh | bash（部分 dash） |
| SSH 权限检查 | 宽松 | 严格（700/600） |
