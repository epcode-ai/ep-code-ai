#!/bin/bash
# macOS 环境检查脚本
# 用途: 验证本地开发环境是否就绪

set -u

PASS=0
FAIL=0

check() {
    local name="$1"
    local cmd="$2"
    if eval "$cmd" >/dev/null 2>&1; then
        echo "  ✅ $name"
        PASS=$((PASS + 1))
    else
        echo "  ❌ $name"
        FAIL=$((FAIL + 1))
    fi
}

echo "========== macOS 环境检查 =========="
echo ""

echo "[基础工具]"
check "Homebrew" "command -v brew"
check "Git (>= 2.30)" "git --version"
check "curl" "command -v curl"
check "jq" "command -v jq"

echo ""
echo "[运行时]"
check "Node.js (>= 18)" "node -v | grep -E 'v(1[89]|[2-9][0-9])'"
check "Python 3 (>= 3.10)" "python3 --version"

echo ""
echo "[平台工具]"
check "glab (GitLab CLI)" "command -v glab"
check "gh (GitHub CLI)" "command -v gh"

echo ""
echo "[SSH 配置]"
check "SSH 密钥存在" "[ -f ~/.ssh/id_rsa.pub ] || [ -f ~/.ssh/id_ed25519.pub ]"

echo ""
echo "========== 检查结果 =========="
echo "通过: $PASS"
echo "失败: $FAIL"

if [ $FAIL -gt 0 ]; then
    echo ""
    echo "⚠️  有项目未通过，请按 setup.md 补齐"
    exit 1
else
    echo ""
    echo "✅ 环境就绪"
fi
