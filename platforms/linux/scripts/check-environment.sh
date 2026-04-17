#!/usr/bin/env bash
# Linux 环境检查脚本
# 支持: Ubuntu / Debian / Fedora / RHEL / CentOS / Rocky / Arch / openSUSE

set -u

# 确保在 Linux
if [ "$(uname -s)" != "Linux" ]; then
    echo "❌ 该脚本仅限 Linux 运行"
    echo "   当前系统: $(uname -s)"
    exit 1
fi

PASS=0
FAIL=0
WARN=0

check() {
    local name="$1"
    local cmd="$2"
    local severity="${3:-required}"  # required / optional
    if eval "$cmd" >/dev/null 2>&1; then
        echo "  ✅ $name"
        PASS=$((PASS + 1))
    else
        if [ "$severity" = "optional" ]; then
            echo "  ⚠️  $name (可选)"
            WARN=$((WARN + 1))
        else
            echo "  ❌ $name"
            FAIL=$((FAIL + 1))
        fi
    fi
}

# 识别发行版
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif command -v lsb_release >/dev/null 2>&1; then
        lsb_release -si | tr '[:upper:]' '[:lower:]'
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distro)

echo "========== Linux 环境检查 =========="
echo "发行版: $DISTRO"
echo "内核: $(uname -r)"
echo "架构: $(uname -m)"
echo ""

echo "[基础工具]"
check "Git (≥ 2.30)" "git --version"
check "curl" "command -v curl"
check "wget" "command -v wget"
check "jq" "command -v jq"
check "tar" "command -v tar"

echo ""
echo "[编译/构建]"
check "gcc" "command -v gcc"
check "make" "command -v make"

echo ""
echo "[运行时]"
check "Node.js (≥ 18)" "node -v | grep -qE 'v(1[89]|[2-9][0-9])'"
check "npm" "npm -v"
check "Python 3 (≥ 3.10)" "python3 -c 'import sys; assert sys.version_info >= (3,10)'"
check "pip3" "command -v pip3"

echo ""
echo "[平台工具]"
check "GitHub CLI (gh)" "command -v gh"
check "GitLab CLI (glab)" "command -v glab"
check "Docker" "command -v docker" "optional"

echo ""
echo "[SSH 配置]"
check "SSH 密钥存在" "[ -f ~/.ssh/id_rsa.pub ] || [ -f ~/.ssh/id_ed25519.pub ]"
if [ -d ~/.ssh ]; then
    actual=$(stat -c "%a" ~/.ssh 2>/dev/null || stat -f "%A" ~/.ssh 2>/dev/null)
    if [ "$actual" = "700" ]; then
        echo "  ✅ ~/.ssh 权限正确 (700)"
        PASS=$((PASS + 1))
    else
        echo "  ⚠️  ~/.ssh 权限建议 700 (当前: $actual)"
        WARN=$((WARN + 1))
    fi
fi

echo ""
echo "[Git 配置]"
check "Git user.name 已配置" "git config --global user.name"
check "Git user.email 已配置" "git config --global user.email"
check "core.autocrlf = input" "[ \"\$(git config --global core.autocrlf)\" = \"input\" ]"

echo ""
echo "[可选运行时]"
check "Node 全局: pnpm" "command -v pnpm" "optional"
check "Python: pytest" "python3 -m pytest --version" "optional"

echo ""
echo "========== 检查结果 =========="
echo "通过: $PASS"
echo "警告（可选项）: $WARN"
echo "失败（必需项）: $FAIL"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo "❌ 有必需项未通过，请按 platforms/linux/setup.md 补齐"
    exit 1
fi

echo ""
echo "✅ 环境就绪"
[ $WARN -gt 0 ] && echo "💡 有 $WARN 个可选项未装，按需补充"
exit 0
