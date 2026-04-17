# Linux 平台适配

> **状态**: ✅ Phase 2 完成
> **支持发行版**: Ubuntu / Debian / Fedora / RHEL / CentOS / Rocky / Arch

## 内容

| 文件 | 用途 |
|------|------|
| [setup.md](./setup.md) | 手动安装完整指南（推荐阅读） |
| [scripts/install.sh](./scripts/install.sh) | 一键安装脚本 |
| [scripts/check-environment.sh](./scripts/check-environment.sh) | 环境校验脚本 |

## 快速开始

### 方式 A: 手动按步骤（推荐新手）

阅读 [setup.md](./setup.md),按步骤执行。

### 方式 B: 一键安装

```bash
git clone git@github.com:epcode-ai/ep-code-ai.git
cd ep-code-ai
bash platforms/linux/scripts/install.sh --minimal
# 或
bash platforms/linux/scripts/install.sh --full
```

### 验证

```bash
bash platforms/linux/scripts/check-environment.sh
```

## 与 macOS 的差异

详见 [setup.md 末尾对照表](./setup.md#与-macos-的差异)。主要差异:

| 项目 | macOS | Linux |
|------|-------|-------|
| 包管理器 | Homebrew | apt / dnf / pacman |
| 用户目录 | `/Users/` | `/home/` |
| 默认 shell | zsh | bash |
| 文件系统 | 默认不区分大小写 | 区分大小写 |
| SSH 权限 | 宽松 | 严格（700 必需） |

## 发行版支持矩阵

| 发行版 | 版本 | 状态 |
|--------|------|------|
| Ubuntu | 22.04 / 24.04 | ✅ 支持 |
| Debian | 12 | ✅ 支持 |
| Fedora | 39+ | ✅ 支持 |
| CentOS Stream / Rocky / Alma | 9 | 📋 脚本支持（未专门测试） |
| Arch | rolling | 📋 脚本支持（未专门测试） |
| openSUSE | 15.5+ | ❌ 未支持（install.sh 会退出并提示） |
| WSL2 (Ubuntu) | 22.04+ | ✅ 当作 Ubuntu 处理 |

## 贡献

如果你用的是未支持的发行版，欢迎提 PR:
1. 扩展 `scripts/install.sh` 的 `case` 分支
2. 在 `setup.md` 里补对应的包管理器命令
3. 在本 README 矩阵里标注
