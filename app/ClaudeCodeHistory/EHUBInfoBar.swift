import SwiftUI
import Combine

// MARK: - EHUB 信息模型

struct EHUBInfo {
    var sessionId: String = ""
    var branch: String = ""
    var model: String = ""
    var tokenUsage: TokenUsage = TokenUsage()
    var projectPath: String = ""
    var isConnected: Bool = false
    var costEstimate: Double = 0
    var turnCount: Int = 0
    var startTime: Date?
}

struct TokenUsage {
    var inputTokens: Int = 0
    var outputTokens: Int = 0
    var cacheReadTokens: Int = 0
    var cacheWriteTokens: Int = 0

    var total: Int { inputTokens + outputTokens }

    var formatted: String {
        if total > 1_000_000 { return String(format: "%.1fM", Double(total) / 1_000_000) }
        if total > 1000 { return String(format: "%.1fK", Double(total) / 1000) }
        return "\(total)"
    }
}

// MARK: - EHUB Manager

@MainActor
class EHUBManager: ObservableObject {
    static let shared = EHUBManager()
    @Published var info = EHUBInfo()
    private var timer: Timer?

    /// 从 stream-json 事件提取 EHUB 信息
    func updateFromStreamEvent(_ event: [String: Any]) {
        if let sid = event["session_id"] as? String { info.sessionId = sid }
        if let model = event["model"] as? String { info.model = model }
        if let cost = event["cost_usd"] as? Double { info.costEstimate += cost }

        if let usage = event["usage"] as? [String: Any] {
            if let v = usage["input_tokens"] as? Int { info.tokenUsage.inputTokens = v }
            if let v = usage["output_tokens"] as? Int { info.tokenUsage.outputTokens = v }
            if let v = usage["cache_read_input_tokens"] as? Int { info.tokenUsage.cacheReadTokens = v }
            if let v = usage["cache_creation_input_tokens"] as? Int { info.tokenUsage.cacheWriteTokens = v }
        }
    }

    func incrementTurn() { info.turnCount += 1 }

    func setProjectPath(_ path: String) {
        info.projectPath = path
        detectBranch(at: path)
    }

    func setConnected(_ connected: Bool) {
        info.isConnected = connected
        if connected {
            if info.startTime == nil { info.startTime = Date() }
            startTimer()
        } else {
            timer?.invalidate(); timer = nil
        }
    }

    func reset() {
        let pp = info.projectPath
        timer?.invalidate(); timer = nil
        info = EHUBInfo()
        info.projectPath = pp
        detectBranch(at: pp)
    }

    private func startTimer() {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            DispatchQueue.main.async { self?.objectWillChange.send() }
        }
    }

    private func detectBranch(at path: String) {
        guard !path.isEmpty else { return }
        Task {
            let proc = Process(); let pipe = Pipe()
            proc.executableURL = URL(fileURLWithPath: "/usr/bin/git")
            proc.arguments = ["-C", path, "branch", "--show-current"]
            proc.standardOutput = pipe; proc.standardError = FileHandle.nullDevice
            do {
                try proc.run(); proc.waitUntilExit()
                let d = pipe.fileHandleForReading.readDataToEndOfFile()
                let branch = String(data: d, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
                await MainActor.run { info.branch = branch }
            } catch {}
        }
    }
}

// MARK: - EHUB 信息栏视图

struct EHUBInfoBar: View {
    @ObservedObject var ehub: EHUBManager
    @EnvironmentObject var settings: AppSettings
    @State private var isExpanded = false

    var body: some View {
        VStack(spacing: 0) {
            Divider()

            // 紧凑行
            HStack(spacing: 0) {
                Circle()
                    .fill(ehub.info.isConnected ? Color.green : Color.gray.opacity(0.5))
                    .frame(width: 6, height: 6).padding(.trailing, 6)

                if !ehub.info.branch.isEmpty {
                    chip(icon: "arrow.triangle.branch", text: ehub.info.branch)
                }
                if !ehub.info.sessionId.isEmpty {
                    chip(icon: "number", text: String(ehub.info.sessionId.prefix(8)))
                }
                if ehub.info.tokenUsage.total > 0 {
                    chip(icon: "gauge.with.dots.needle.33percent", text: ehub.info.tokenUsage.formatted + " tok")
                }
                if !ehub.info.model.isEmpty {
                    // v4.1 点击切换模型
                    ModelPickerMenu(currentModel: ehub.info.model) { preset in
                        NotificationCenter.default.post(name: .init("epc.switchModel"), object: preset.id)
                    }
                }
                if ehub.info.turnCount > 0 {
                    chip(icon: "arrow.2.squarepath", text: "\(ehub.info.turnCount) 轮")
                }

                Spacer()

                if ehub.info.costEstimate > 0 {
                    Text(String(format: "$%.4f", ehub.info.costEstimate))
                        .font(.system(size: 10, design: .monospaced)).foregroundColor(.secondary).padding(.trailing, 6)
                }
                if let start = ehub.info.startTime {
                    Text(elapsed(since: start))
                        .font(.system(size: 10, design: .monospaced)).foregroundColor(.secondary).padding(.trailing, 6)
                }

                Button(action: { withAnimation(.spring(response: 0.2)) { isExpanded.toggle() } }) {
                    Image(systemName: isExpanded ? "chevron.down" : "chevron.up")
                        .font(.system(size: 9, weight: .semibold)).foregroundColor(.secondary)
                }.buttonStyle(.plain).frame(width: 20, height: 20)
            }
            .padding(.horizontal, 12)
            .frame(height: 28)
            .background(Color(nsColor: .controlBackgroundColor).opacity(0.4))

            // 展开详情
            if isExpanded {
                expandedView.transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func chip(icon: String, text: String) -> some View {
        HStack(spacing: 3) {
            Image(systemName: icon).font(.system(size: 8))
            Text(text).font(.system(size: 10, design: .monospaced)).lineLimit(1)
        }
        .foregroundColor(.secondary)
        .padding(.horizontal, 6).padding(.vertical, 2)
        .background(Capsule().fill(Color.gray.opacity(0.08)))
        .padding(.trailing, 4)
    }

    private var expandedView: some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider()
            row("Session ID", ehub.info.sessionId.isEmpty ? "—" : ehub.info.sessionId)
            row("项目路径", ehub.info.projectPath.isEmpty ? "—" : ehub.info.projectPath)
            row("Git 分支", ehub.info.branch.isEmpty ? "—" : ehub.info.branch)
            row("模型", ehub.info.model.isEmpty ? "—" : ehub.info.model)
            Divider()
            HStack(spacing: 16) {
                tokenCol("输入", ehub.info.tokenUsage.inputTokens)
                tokenCol("输出", ehub.info.tokenUsage.outputTokens)
                tokenCol("缓存读", ehub.info.tokenUsage.cacheReadTokens)
                tokenCol("缓存写", ehub.info.tokenUsage.cacheWriteTokens)
                tokenCol("轮次", ehub.info.turnCount)
            }
            HStack {
                Spacer()
                Button(action: copyInfo) { Label("复制", systemImage: "doc.on.clipboard") }.buttonStyle(.bordered).controlSize(.small)
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
        .background(Color(nsColor: .controlBackgroundColor).opacity(0.6))
    }

    private func row(_ label: String, _ value: String) -> some View {
        HStack(spacing: 6) {
            Text(label).font(.system(size: 10)).foregroundColor(.secondary).frame(width: 60, alignment: .trailing)
            Text(value).font(.system(size: 10, design: .monospaced)).textSelection(.enabled).lineLimit(1)
        }
    }

    private func tokenCol(_ label: String, _ count: Int) -> some View {
        VStack(spacing: 2) {
            Text(fmtTok(count)).font(.system(size: 11, weight: .medium, design: .monospaced))
            Text(label).font(.system(size: 9)).foregroundColor(.secondary)
        }
    }

    private func shortModel(_ m: String) -> String {
        if m.contains("opus") { return "Opus" }
        if m.contains("sonnet") { return "Sonnet" }
        if m.contains("haiku") { return "Haiku" }
        return String(m.prefix(12))
    }

    private func fmtTok(_ c: Int) -> String {
        if c > 1_000_000 { return String(format: "%.1fM", Double(c) / 1_000_000) }
        if c > 1000 { return String(format: "%.1fK", Double(c) / 1000) }
        return "\(c)"
    }

    private func elapsed(since d: Date) -> String {
        let s = Int(Date().timeIntervalSince(d))
        let m = s / 60; let sec = s % 60
        return m > 60 ? "\(m/60)h\(m%60)m" : "\(m):\(String(format: "%02d", sec))"
    }

    private func copyInfo() {
        let t = """
        Session: \(ehub.info.sessionId)
        Branch:  \(ehub.info.branch)
        Model:   \(ehub.info.model)
        Project: \(ehub.info.projectPath)
        Tokens:  \(ehub.info.tokenUsage.total) (in:\(ehub.info.tokenUsage.inputTokens) out:\(ehub.info.tokenUsage.outputTokens))
        Cost:    $\(String(format: "%.4f", ehub.info.costEstimate))
        Turns:   \(ehub.info.turnCount)
        """
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(t, forType: .string)
    }
}
