import Foundation

// MARK: - 环境检查：Node.js + Claude Code CLI

enum DependencyStatus: Equatable {
    case checking
    case installed(version: String)
    case missing
    case installing
    case installFailed(String)
}

@MainActor
class EnvironmentChecker: ObservableObject {
    static let shared = EnvironmentChecker()

    @Published var nodeStatus: DependencyStatus = .checking
    @Published var claudeStatus: DependencyStatus = .checking
    @Published var installLog: String = ""

    var allReady: Bool {
        if case .installed = nodeStatus, case .installed = claudeStatus { return true }
        return false
    }

    // MARK: - 全量检查

    func checkAll() async {
        nodeStatus = .checking
        claudeStatus = .checking
        installLog = ""
        await checkNode()
        await checkClaude()
    }

    // MARK: - Node.js

    func checkNode() async {
        nodeStatus = .checking
        let paths = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
        ]
        // 先 which
        if let ver = await shell("node --version") {
            nodeStatus = .installed(version: ver.trimmingCharacters(in: .whitespacesAndNewlines))
            return
        }
        // 检查已知路径
        for p in paths where FileManager.default.fileExists(atPath: p) {
            if let ver = await shell("\(p) --version") {
                nodeStatus = .installed(version: ver.trimmingCharacters(in: .whitespacesAndNewlines))
                return
            }
        }
        // nvm
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let nvmDir = "\(home)/.nvm/versions/node"
        if FileManager.default.fileExists(atPath: nvmDir),
           let vers = try? FileManager.default.contentsOfDirectory(atPath: nvmDir),
           let latest = vers.sorted().last {
            let bin = "\(nvmDir)/\(latest)/bin/node"
            if let ver = await shell("\(bin) --version") {
                nodeStatus = .installed(version: ver.trimmingCharacters(in: .whitespacesAndNewlines))
                return
            }
        }
        nodeStatus = .missing
    }

    // MARK: - Claude Code CLI

    func checkClaude() async {
        claudeStatus = .checking
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let candidates = [
            "\(home)/.local/bin/claude",
            "/usr/local/bin/claude",
            "/opt/homebrew/bin/claude",
        ]
        for p in candidates where FileManager.default.fileExists(atPath: p) {
            if let ver = await shell("\(p) --version 2>/dev/null") {
                let v = ver.trimmingCharacters(in: .whitespacesAndNewlines)
                claudeStatus = .installed(version: v.isEmpty ? "已安装" : v)
                return
            }
        }
        if let p = await shell("which claude 2>/dev/null") {
            let path = p.trimmingCharacters(in: .whitespacesAndNewlines)
            if !path.isEmpty, let ver = await shell("\(path) --version 2>/dev/null") {
                claudeStatus = .installed(version: ver.trimmingCharacters(in: .whitespacesAndNewlines))
                return
            }
        }
        claudeStatus = .missing
    }

    // MARK: - 安装 Node.js

    func installNode() async {
        nodeStatus = .installing
        log("🔍 检查 Homebrew...")

        let brewPath: String
        if FileManager.default.fileExists(atPath: "/opt/homebrew/bin/brew") {
            brewPath = "/opt/homebrew/bin/brew"
        } else if FileManager.default.fileExists(atPath: "/usr/local/bin/brew") {
            brewPath = "/usr/local/bin/brew"
        } else {
            log("❌ 未找到 Homebrew")
            nodeStatus = .installFailed("请先安装 Homebrew:\n/bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
            return
        }
        log("✅ 找到 Homebrew: \(brewPath)")
        log("📦 正在安装 Node.js...")

        if let _ = await shellWithLog("\(brewPath) install node 2>&1") {
            log("✅ Node.js 安装完成")
            await checkNode()
        } else {
            log("❌ Node.js 安装失败")
            nodeStatus = .installFailed("brew install node 失败，请手动安装")
        }
    }

    // MARK: - 安装 Claude Code CLI

    func installClaude() async {
        guard case .installed = nodeStatus else {
            claudeStatus = .installFailed("请先安装 Node.js")
            return
        }
        claudeStatus = .installing
        log("📦 正在安装 Claude Code CLI...")

        let npmPath: String
        if let p = await shell("which npm 2>/dev/null") {
            npmPath = p.trimmingCharacters(in: .whitespacesAndNewlines)
        } else if FileManager.default.fileExists(atPath: "/opt/homebrew/bin/npm") {
            npmPath = "/opt/homebrew/bin/npm"
        } else {
            claudeStatus = .installFailed("未找到 npm")
            return
        }

        log("执行: \(npmPath) install -g @anthropic-ai/claude-code")
        if let out = await shellWithLog("\(npmPath) install -g @anthropic-ai/claude-code 2>&1"), !out.contains("ERR!") {
            log("✅ Claude Code CLI 安装完成")
            await checkClaude()
        } else {
            log("❌ 安装失败")
            claudeStatus = .installFailed("npm install -g 失败。\n请在终端手动执行:\nnpm install -g @anthropic-ai/claude-code")
        }
    }

    // MARK: - Shell 工具

    private func shell(_ command: String) async -> String? {
        await withCheckedContinuation { cont in
            let proc = Process(); let pipe = Pipe()
            proc.executableURL = URL(fileURLWithPath: "/bin/zsh")
            proc.arguments = ["-l", "-c", command]
            proc.standardOutput = pipe; proc.standardError = pipe
            proc.environment = ProcessInfo.processInfo.environment
            do {
                try proc.run(); proc.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                cont.resume(returning: proc.terminationStatus == 0 ? String(data: data, encoding: .utf8) : nil)
            } catch { cont.resume(returning: nil) }
        }
    }

    private func shellWithLog(_ command: String) async -> String? {
        await withCheckedContinuation { cont in
            let proc = Process(); let pipe = Pipe()
            proc.executableURL = URL(fileURLWithPath: "/bin/zsh")
            proc.arguments = ["-l", "-c", command]
            proc.standardOutput = pipe; proc.standardError = pipe
            proc.environment = ProcessInfo.processInfo.environment
            pipe.fileHandleForReading.readabilityHandler = { [weak self] h in
                let d = h.availableData; guard !d.isEmpty, let s = String(data: d, encoding: .utf8) else { return }
                DispatchQueue.main.async { self?.log(s) }
            }
            do {
                try proc.run(); proc.waitUntilExit()
                pipe.fileHandleForReading.readabilityHandler = nil
                cont.resume(returning: proc.terminationStatus == 0 ? "OK" : nil)
            } catch { pipe.fileHandleForReading.readabilityHandler = nil; cont.resume(returning: nil) }
        }
    }

    private func log(_ text: String) {
        installLog += text
        if !text.hasSuffix("\n") { installLog += "\n" }
    }
}
