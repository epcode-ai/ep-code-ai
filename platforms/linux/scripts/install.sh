#!/usr/bin/env bash
# Linux 一键安装脚本
# 用法: bash install.sh [--minimal|--full]
#
#   --minimal: 只装基础（Git / Node / Python）
#   --full:    装全部（含 gh / glab / Docker）
#   默认:      minimal

set -e

MODE="${1:---minimal}"

if [ "$(uname -s)" != "Linux" ]; then
    echo "❌ 该脚本仅限 Linux"
    exit 1
fi

# 识别发行版
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
    VERSION=$VERSION_ID
else
    echo "❌ 无法识别发行版"
    exit 1
fi

echo "🐧 检测到发行版: $DISTRO $VERSION"
echo "📦 安装模式: $MODE"
echo ""

# 需要 sudo
if [ "$EUID" -ne 0 ]; then
    SUDO="sudo"
else
    SUDO=""
fi

install_apt() {
    echo "🔄 更新 apt 索引..."
    $SUDO apt update

    echo "📦 安装基础工具..."
    $SUDO apt install -y git curl wget jq build-essential ca-certificates gnupg lsb-release

    echo "📦 安装 Node.js 20..."
    if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE 'v(2[0-9]|[3-9][0-9])'; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
        $SUDO apt install -y nodejs
    else
        echo "   Node.js 已安装: $(node -v)"
    fi

    echo "📦 安装 Python 3..."
    $SUDO apt install -y python3 python3-pip python3-venv

    if [ "$MODE" = "--full" ]; then
        echo "📦 安装 GitHub CLI..."
        type -p gh >/dev/null || {
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
                $SUDO dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            $SUDO chmod 644 /usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | \
                $SUDO tee /etc/apt/sources.list.d/github-cli.list >/dev/null
            $SUDO apt update
            $SUDO apt install -y gh
        }

        echo "📦 安装 Docker..."
        $SUDO apt install -y docker.io
        $SUDO usermod -aG docker "$USER" || true
    fi
}

install_dnf() {
    echo "🔄 更新包..."
    $SUDO dnf upgrade -y --refresh || true

    echo "📦 安装基础工具..."
    $SUDO dnf install -y git curl wget jq gcc gcc-c++ make ca-certificates gnupg

    echo "📦 安装 Node.js 20..."
    if ! command -v node >/dev/null 2>&1 || ! node -v | grep -qE 'v(2[0-9])'; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | $SUDO bash -
        $SUDO dnf install -y nodejs
    fi

    echo "📦 安装 Python 3..."
    $SUDO dnf install -y python3 python3-pip

    if [ "$MODE" = "--full" ]; then
        echo "📦 安装 GitHub CLI..."
        $SUDO dnf install -y 'dnf-command(config-manager)'
        $SUDO dnf config-manager --add-repo https://cli.github.com/packages/rpm/gh-cli.repo
        $SUDO dnf install -y gh

        echo "📦 安装 Docker..."
        $SUDO dnf install -y docker
        $SUDO systemctl enable --now docker
        $SUDO usermod -aG docker "$USER" || true
    fi
}

install_pacman() {
    echo "🔄 更新包..."
    $SUDO pacman -Syu --noconfirm

    echo "📦 安装基础工具..."
    $SUDO pacman -S --noconfirm --needed git curl wget jq base-devel ca-certificates gnupg

    echo "📦 安装 Node.js + Python..."
    $SUDO pacman -S --noconfirm --needed nodejs npm python python-pip

    if [ "$MODE" = "--full" ]; then
        echo "📦 安装 GitHub CLI..."
        $SUDO pacman -S --noconfirm --needed github-cli

        echo "📦 安装 Docker..."
        $SUDO pacman -S --noconfirm --needed docker
        $SUDO systemctl enable --now docker
        $SUDO usermod -aG docker "$USER" || true
    fi
}

case "$DISTRO" in
    ubuntu|debian)
        install_apt
        ;;
    fedora|rhel|centos|rocky|almalinux)
        install_dnf
        ;;
    arch|manjaro|endeavouros)
        install_pacman
        ;;
    *)
        echo "⚠️  暂不支持的发行版: $DISTRO"
        echo "   请参考 platforms/linux/setup.md 手动安装"
        exit 2
        ;;
esac

echo ""
echo "========== 安装完成 =========="
echo ""
echo "接下来请运行:"
echo "  bash platforms/linux/scripts/check-environment.sh"
echo ""
echo "然后配置 Git:"
echo '  git config --global user.name "你的名字"'
echo '  git config --global user.email "your@email.com"'
echo '  git config --global core.autocrlf input'
echo ""
if [ "$MODE" = "--full" ]; then
    echo "⚠️  Docker 权限需要重新登录生效（usermod 加组）"
fi
