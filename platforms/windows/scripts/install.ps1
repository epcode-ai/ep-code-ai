# Windows 一键安装脚本 (PowerShell)
# 用法:
#   pwsh ./install.ps1 [-Mode Minimal|Full]
#   或: powershell -ExecutionPolicy Bypass -File ./install.ps1

param(
    [ValidateSet("Minimal", "Full")]
    [string]$Mode = "Minimal"
)

$ErrorActionPreference = "Stop"

Write-Host "🪟 Windows 环境安装 - 模式: $Mode" -ForegroundColor Cyan

# 检查是否管理员
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]$currentUser
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  建议以管理员身份运行（某些操作需要管理员权限）" -ForegroundColor Yellow
    Write-Host "   继续执行,遇到权限问题会提示" -ForegroundColor Yellow
}

# 检查 winget 是否可用
$wingetAvailable = Get-Command winget -ErrorAction SilentlyContinue
if (-not $wingetAvailable) {
    Write-Host "❌ 未检测到 winget" -ForegroundColor Red
    Write-Host "   Windows 11 应该自带 winget,Windows 10 需要从 Microsoft Store 安装 'App Installer'" -ForegroundColor Yellow
    Write-Host "   或从 https://aka.ms/getwinget 获取" -ForegroundColor Yellow
    exit 1
}

# 最小安装
$minimalPackages = @(
    @{id="Git.Git"; name="Git"},
    @{id="Microsoft.PowerShell"; name="PowerShell 7"},
    @{id="OpenJS.NodeJS.LTS"; name="Node.js LTS"},
    @{id="Python.Python.3.12"; name="Python 3.12"},
    @{id="jqlang.jq"; name="jq"},
    @{id="GitHub.cli"; name="GitHub CLI"}
)

$fullPackages = $minimalPackages + @(
    @{id="Microsoft.WindowsTerminal"; name="Windows Terminal"},
    @{id="Microsoft.VisualStudioCode"; name="VS Code"},
    @{id="Docker.DockerDesktop"; name="Docker Desktop"}
)

$packages = if ($Mode -eq "Full") { $fullPackages } else { $minimalPackages }

foreach ($pkg in $packages) {
    Write-Host ""
    Write-Host "📦 安装 $($pkg.name) ($($pkg.id))..." -ForegroundColor Cyan
    try {
        winget install --id $pkg.id --exact --accept-source-agreements --accept-package-agreements
    } catch {
        Write-Host "⚠️  $($pkg.name) 安装失败或已安装: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 配置 Git..." -ForegroundColor Cyan
$gitUser = git config --global user.name 2>$null
if (-not $gitUser) {
    Write-Host "  请手动配置:" -ForegroundColor Yellow
    Write-Host '    git config --global user.name "你的名字"'
    Write-Host '    git config --global user.email "your@email.com"'
}

git config --global core.autocrlf true
git config --global core.longpaths true
git config --global core.quotepath false
git config --global init.defaultBranch main
Write-Host "  ✅ Git 基础配置完成" -ForegroundColor Green

Write-Host ""
Write-Host "🔐 启用 OpenSSH..." -ForegroundColor Cyan
try {
    if ($isAdmin) {
        Set-Service ssh-agent -StartupType Automatic -ErrorAction SilentlyContinue
        Start-Service ssh-agent -ErrorAction SilentlyContinue
        Write-Host "  ✅ ssh-agent 已配置" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  需要管理员权限启用 ssh-agent 服务（可稍后手动执行）" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  OpenSSH 未安装或配置失败" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========== 安装完成 ==========" -ForegroundColor Green
Write-Host ""
Write-Host "接下来请:" -ForegroundColor White
Write-Host ""
Write-Host "1. 重启终端（刷新 PATH）"
Write-Host ""
Write-Host "2. 配置 Git 用户（如未配置）:" -ForegroundColor Yellow
Write-Host '   git config --global user.name "你的名字"'
Write-Host '   git config --global user.email "your@email.com"'
Write-Host ""
Write-Host "3. 生成 SSH 密钥:" -ForegroundColor Yellow
Write-Host '   ssh-keygen -t ed25519 -C "your@email.com"'
Write-Host '   Get-Content $HOME\.ssh\id_ed25519.pub | Set-Clipboard'
Write-Host "   然后粘贴到 GitHub/GitLab 的 SSH Keys 设置"
Write-Host ""
Write-Host "4. 验证环境:" -ForegroundColor Yellow
Write-Host "   .\platforms\windows\scripts\check-environment.ps1"
Write-Host ""
if ($Mode -eq "Full") {
    Write-Host "💡 Docker Desktop 需要手动启动并完成初始配置" -ForegroundColor Yellow
}
