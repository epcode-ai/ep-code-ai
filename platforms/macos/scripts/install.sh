#!/usr/bin/env bash
# macOS 一键安装脚本
# 用法: bash install.sh [--minimal|--full]
#
#   --minimal: 只装基础（Git/Node/Python）
#   --full:    装全部（含 gh / glab / Docker Desktop）
#   默认:      minimal

set -e

MODE="${1:---minimal}"

# 仅限 macOS
if [ "$(uname -s)" != "Darwin" ]; then
    echo "❌ 该脚本仅限 macOS"
    echo "   当前系统: $(uname -s)"
    echo "   Linux 请用 platforms/linux/scripts/install.sh"
    echo "   Windows 请用 platforms/windows/scripts/install.ps1"
    exit 1
fi

# 检查 Xcode 命令行工具
if ! xcode-select -p >/dev/null 2>&1; then
    echo "⚠️  未检测到 Xcode 命令行工具"
    echo "   正在触发安装对话框..."
    xcode-select --install || true
    echo ""
    echo "请在弹出窗口中点击 '安装',完成后重新运行本脚本"
    exit 2
fi

# 检查 Homebrew
if ! command -v brew >/dev/null 2>&1; then
    echo "📦 安装 Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # 配置 PATH（Apple Silicon 和 Intel 路径不同）
    if [ -d /opt/homebrew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -d /usr/local/Homebrew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew 已安装"
fi

echo "🔄 更新 Homebrew..."
brew update || true

# 基础工具
echo "📦 安装基础工具..."
brew install --quiet \
    git curl wget jq \
    node@20 python@3.12 \
    gh glab \
    || true

# 确保 Node 20 是默认
if brew ls --versions node@20 >/dev/null 2>&1; then
    brew link --overwrite --force node@20 2>/dev/null || true
fi

if [ "$MODE" = "--full" ]; then
    echo "📦 安装完整依赖..."
    # Docker Desktop 用 cask
    brew install --cask --quiet \
        docker \
        visual-studio-code \
        || true

    # 测试工具
    brew install --quiet \
        hyperfine \
        watch \
        || true
fi

echo ""
echo "========== 安装完成 =========="
echo ""
echo "接下来请:"
echo ""
echo "1. 配置 Git（如未配置）:"
echo '   git config --global user.name "你的名字"'
echo '   git config --global user.email "your@email.com"'
echo '   git config --global core.autocrlf input'
echo ""
echo "2. 生成 SSH 密钥（如未有）:"
echo '   ssh-keygen -t ed25519 -C "your@email.com"'
echo '   pbcopy < ~/.ssh/id_ed25519.pub  # 复制后粘贴到 GitHub/GitLab'
echo ""
echo "3. 配置 GitHub CLI:"
echo "   gh auth login"
echo ""
echo "4. 验证环境:"
echo "   bash platforms/macos/scripts/check-environment.sh"
echo ""
if [ "$MODE" = "--full" ]; then
    echo "💡 Docker Desktop 需要从启动台手动启动并完成首次设置"
fi
