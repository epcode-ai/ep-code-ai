#!/bin/bash
set -e
CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'; BLUE='\033[0;34m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      EPCode v3.0 安装脚本               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

[[ "$(uname)" != "Darwin" ]] && echo -e "${RED}❌ 仅支持 macOS${NC}" && exit 1
xcode-select -p &>/dev/null || { echo -e "${YELLOW}⚠️  请先安装 Xcode 命令行工具: xcode-select --install${NC}"; exit 1; }

TARGET="$HOME/ClaudeCodeHistory"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ "$SCRIPT_DIR" != "$TARGET" ]; then
    [ -d "$TARGET" ] && mv "$TARGET" "$TARGET.backup.$(date +%Y%m%d_%H%M%S)"
    cp -r "$SCRIPT_DIR" "$TARGET"
fi
cd "$TARGET"

# 处理嵌套目录
[ ! -f "generate_icon.swift" ] && [ -d "EPCode-v3" ] && mv EPCode-v3/* . 2>/dev/null && rm -rf EPCode-v3

# 删除已移除的文件
rm -f ClaudeCodeHistory/TerminalPanel.swift ClaudeCodeHistory/ConversationView.swift
# 从 pbxproj 中移除引用
if grep -q "TerminalPanel\|ConversationView" ClaudeCodeHistory.xcodeproj/project.pbxproj 2>/dev/null; then
    grep -v "TerminalPanel\|ConversationView" ClaudeCodeHistory.xcodeproj/project.pbxproj > /tmp/_pbx_fix.pbxproj
    cp /tmp/_pbx_fix.pbxproj ClaudeCodeHistory.xcodeproj/project.pbxproj
    echo -e "${CYAN}🧹 已清理旧文件引用${NC}"
fi

# 生成图标
echo -e "${CYAN}🎨 生成 EP Code 图标...${NC}"
swift generate_icon.swift 2>/dev/null || echo -e "${YELLOW}⚠️  图标生成跳过（不影响编译）${NC}"

# 编译
echo -e "${CYAN}🔨 编译 Release...${NC}"
rm -rf ./build

xcodebuild -scheme ClaudeCodeHistory -configuration Release \
    -derivedDataPath ./build \
    CODE_SIGN_IDENTITY="-" CODE_SIGNING_ALLOWED=NO 2>&1 | tee /tmp/_build.log | grep -E "BUILD|error:" || true

# 严格检查编译结果
APP_BIN="./build/Build/Products/Release/ClaudeCodeHistory.app/Contents/MacOS/ClaudeCodeHistory"
if [ ! -f "$APP_BIN" ]; then
    echo ""
    echo -e "${RED}❌ 编译失败！错误信息：${NC}"
    grep "error:" /tmp/_build.log | head -10
    echo ""
    echo -e "${YELLOW}💡 尝试在 Xcode 中打开: open ClaudeCodeHistory.xcodeproj${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 编译成功${NC}"

# 安装
INSTALL="/Applications/ClaudeCodeHistory.app"
[ -d "$INSTALL" ] && rm -rf "$INSTALL"
cp -r ./build/Build/Products/Release/ClaudeCodeHistory.app "$INSTALL"
echo -e "${GREEN}✅ 已安装到 /Applications/${NC}"

echo ""
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✨ EPCode v3.0 安装完成！${NC}"
echo -e "${BLUE}══════════════════════════════════════════${NC}"
echo -e "  启动:  ${CYAN}open /Applications/ClaudeCodeHistory.app${NC}"
echo ""

read -p "立即启动？(y/n) " -n 1 -r; echo
[[ $REPLY =~ ^[Yy]$ ]] && open /Applications/ClaudeCodeHistory.app
