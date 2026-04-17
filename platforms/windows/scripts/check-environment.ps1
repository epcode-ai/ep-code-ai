# Windows 环境检查脚本 (PowerShell)
# 用法:
#   pwsh ./check-environment.ps1
#   或: powershell -ExecutionPolicy Bypass -File ./check-environment.ps1

$ErrorActionPreference = "Stop"

# 仅限 Windows
if ($PSVersionTable.Platform -ne $null -and $PSVersionTable.Platform -ne 'Win32NT') {
    Write-Host "❌ 该脚本仅限 Windows" -ForegroundColor Red
    exit 1
}

$pass = 0
$fail = 0
$warn = 0

function Test-Command {
    param(
        [string]$Name,
        [scriptblock]$Cmd,
        [string]$Severity = "required"
    )
    try {
        $null = & $Cmd 2>$null
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Host "  ✅ $Name" -ForegroundColor Green
            $script:pass++
            return
        }
    } catch {
        # fall through
    }
    if ($Severity -eq "optional") {
        Write-Host "  ⚠️  $Name (可选)" -ForegroundColor Yellow
        $script:warn++
    } else {
        Write-Host "  ❌ $Name" -ForegroundColor Red
        $script:fail++
    }
}

function Test-NodeVersion {
    try {
        $version = node --version 2>$null
        if ($version -match '^v(\d+)\.') {
            $major = [int]$Matches[1]
            if ($major -ge 18) {
                Write-Host "  ✅ Node.js ($version)" -ForegroundColor Green
                $script:pass++
                return
            }
        }
        Write-Host "  ❌ Node.js 需 ≥ 18 (当前: $version)" -ForegroundColor Red
        $script:fail++
    } catch {
        Write-Host "  ❌ Node.js 未安装" -ForegroundColor Red
        $script:fail++
    }
}

function Test-PythonVersion {
    $cmds = @('python', 'python3')
    foreach ($cmd in $cmds) {
        try {
            $version = & $cmd --version 2>$null
            if ($version -match 'Python (\d+)\.(\d+)') {
                $major = [int]$Matches[1]
                $minor = [int]$Matches[2]
                if ($major -eq 3 -and $minor -ge 10) {
                    Write-Host "  ✅ Python 3 ($version via $cmd)" -ForegroundColor Green
                    $script:pass++
                    return
                }
            }
        } catch {
            continue
        }
    }
    Write-Host "  ❌ Python 3 (≥ 3.10) 未找到" -ForegroundColor Red
    $script:fail++
}

Write-Host "========== Windows 环境检查 ==========" -ForegroundColor Cyan
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"
Write-Host "架构: $([System.Environment]::Is64BitOperatingSystem | ForEach-Object { if ($_) { '64-bit' } else { '32-bit' } })"
Write-Host ""

Write-Host "[包管理器] (至少一个)" -ForegroundColor White
Test-Command -Name "winget" -Cmd { winget --version } -Severity "optional"
Test-Command -Name "Chocolatey (choco)" -Cmd { choco --version } -Severity "optional"
Test-Command -Name "Scoop" -Cmd { scoop --version } -Severity "optional"

Write-Host ""
Write-Host "[基础工具]" -ForegroundColor White
Test-Command -Name "Git" -Cmd { git --version }
Test-Command -Name "curl" -Cmd { curl --version }
Test-Command -Name "jq" -Cmd { jq --version }

Write-Host ""
Write-Host "[运行时]" -ForegroundColor White
Test-NodeVersion
Test-Command -Name "npm" -Cmd { npm --version }
Test-PythonVersion

Write-Host ""
Write-Host "[平台工具]" -ForegroundColor White
Test-Command -Name "GitHub CLI (gh)" -Cmd { gh --version }
Test-Command -Name "GitLab CLI (glab)" -Cmd { glab --version } -Severity "optional"

Write-Host ""
Write-Host "[SSH 配置]" -ForegroundColor White
$sshDir = Join-Path $HOME ".ssh"
$sshEd25519 = Join-Path $sshDir "id_ed25519.pub"
$sshRsa = Join-Path $sshDir "id_rsa.pub"
if ((Test-Path $sshEd25519) -or (Test-Path $sshRsa)) {
    Write-Host "  ✅ SSH 公钥存在" -ForegroundColor Green
    $pass++
} else {
    Write-Host "  ❌ SSH 公钥缺失,需执行 ssh-keygen" -ForegroundColor Red
    $fail++
}

# 检查 OpenSSH 服务
$sshAgent = Get-Service ssh-agent -ErrorAction SilentlyContinue
if ($sshAgent) {
    if ($sshAgent.Status -eq "Running") {
        Write-Host "  ✅ ssh-agent 服务运行中" -ForegroundColor Green
        $pass++
    } else {
        Write-Host "  ⚠️  ssh-agent 服务未运行（可选）" -ForegroundColor Yellow
        $warn++
    }
} else {
    Write-Host "  ⚠️  ssh-agent 服务未安装（可用 Git Bash 代替）" -ForegroundColor Yellow
    $warn++
}

Write-Host ""
Write-Host "[Git 配置]" -ForegroundColor White
Test-Command -Name "user.name 已配置" -Cmd { git config --global user.name }
Test-Command -Name "user.email 已配置" -Cmd { git config --global user.email }

$autocrlf = git config --global core.autocrlf 2>$null
if ($autocrlf -eq "true" -or $autocrlf -eq "input") {
    Write-Host "  ✅ core.autocrlf = $autocrlf" -ForegroundColor Green
    $pass++
} else {
    Write-Host "  ⚠️  core.autocrlf 未设置（建议 true 或 input）" -ForegroundColor Yellow
    $warn++
}

$longpaths = git config --global core.longpaths 2>$null
if ($longpaths -eq "true") {
    Write-Host "  ✅ core.longpaths = true" -ForegroundColor Green
    $pass++
} else {
    Write-Host "  ⚠️  core.longpaths 未开启（Windows 260 路径限制）" -ForegroundColor Yellow
    $warn++
}

Write-Host ""
Write-Host "[Windows 特定]" -ForegroundColor White
$longPathReg = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
    -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
if ($longPathReg -and $longPathReg.LongPathsEnabled -eq 1) {
    Write-Host "  ✅ Windows 长路径已启用" -ForegroundColor Green
    $pass++
} else {
    Write-Host "  ⚠️  Windows 长路径未启用（260 字符限制）" -ForegroundColor Yellow
    $warn++
}

# WSL 检测
$wslExists = Get-Command wsl -ErrorAction SilentlyContinue
if ($wslExists) {
    Write-Host "  ✅ WSL 可用" -ForegroundColor Green
    $pass++
} else {
    Write-Host "  ⚠️  WSL 未安装（开发建议装，非必须）" -ForegroundColor Yellow
    $warn++
}

Write-Host ""
Write-Host "========== 检查结果 ==========" -ForegroundColor Cyan
Write-Host "通过: $pass" -ForegroundColor Green
Write-Host "警告（可选项）: $warn" -ForegroundColor Yellow
Write-Host "失败（必需项）: $fail" -ForegroundColor Red

if ($fail -gt 0) {
    Write-Host ""
    Write-Host "❌ 有必需项未通过，请按 platforms/windows/setup.md 补齐" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ 环境就绪" -ForegroundColor Green
if ($warn -gt 0) {
    Write-Host "💡 有 $warn 个可选项未配置,按需补充" -ForegroundColor Yellow
}
exit 0
