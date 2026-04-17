import Foundation
import Combine

/// 管理与 Claude CLI 进程的通信（v4: +EHUB 集成 +双认证模式）
class ClaudeProcessManager: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isRunning = false
    @Published var isLoading = false
    @Published var sessionId: String?
    @Published var currentProjectPath: String = ""
    @Published var error: String?
    @Published var pendingPermission: PermissionRequest?

    private var process: Process?
    private var inputPipe: Pipe?
    private var outputPipe: Pipe?
    private var errorPipe: Pipe?
    private var outputBuffer = ""
    private var currentAssistantMessage: ChatMessage?
    private var currentToolCall: ChatToolCall?
    private var toolInputBuffer = ""
    private var isInThinkingBlock = false
    private var claudePath: String

    init() {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let candidates = [
            "\(home)/.local/bin/claude",
            "/usr/local/bin/claude",
            "/opt/homebrew/bin/claude",
        ]
        claudePath = candidates.first { FileManager.default.fileExists(atPath: $0) } ?? "\(home)/.local/bin/claude"
    }

    // MARK: - 发送消息

    func sendMessage(_ text: String) {
        let userMsg = ChatMessage(role: .user, text: text)
        messages.append(userMsg)

        if isRunning, process != nil, cliReady {
            sendToStdin(text)
        } else {
            startProcess(prompt: text, resumeId: sessionId)
        }
    }

    /// 待发送的初始 prompt（等 CLI 初始化完成后发送）
    private var pendingPrompt: String? = nil
    private var cliReady = false

    /// 恢复历史对话
    func resumeSession(_ sessionId: String, projectPath: String, historyMessages: [Message]) {
        isLoading = true
        let pending = historyMessages

        // 先强制停止旧进程
        if let proc = process, proc.isRunning {
            sendToStdin("/exit")
            proc.terminate()
        }
        cleanup()

        // 重置状态
        messages.removeAll()
        currentProjectPath = projectPath
        self.sessionId = sessionId
        error = nil

        // 同步 EHUB
        Task { @MainActor in
            let ehub = EHUBManager.shared
            ehub.reset()
            ehub.setProjectPath(projectPath)
            ehub.info.sessionId = sessionId
        }

        // 启动新进程恢复会话
        startProcess(prompt: nil, resumeId: sessionId)

        // 加载历史消息到 UI
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self = self else { return }
            for msg in pending {
                let chatMsg = ChatMessage(role: msg.role == .user ? .user : .assistant, text: msg.text)
                chatMsg.isStreaming = false
                for tu in msg.toolUses {
                    let tool = ChatToolCall(toolName: tu.name, input: tu.input, status: .success)
                    chatMsg.toolCalls.append(tool)
                }
                if chatMsg.hasContent { self.messages.append(chatMsg) }
            }
            self.isLoading = false
        }
    }

    func stop() { forceStop(completion: nil) }

    private func forceStop(completion: (() -> Void)?) {
        if let proc = process {
            // 先尝试发 /exit
            if proc.isRunning { sendToStdin("/exit") }
            // 短暂等待后强制终止
            DispatchQueue.global().async {
                usleep(200_000) // 0.2s
                if proc.isRunning { proc.terminate() }
                usleep(100_000) // 0.1s 再确保
                if proc.isRunning { proc.interrupt() }
                DispatchQueue.main.async { [weak self] in
                    self?.cleanup()
                    completion?()
                }
            }
        } else {
            cleanup()
            completion?()
        }
    }

    // MARK: - 进程管理

    private func startProcess(prompt: String?, resumeId: String? = nil) {
        if let p = process, p.isRunning { p.terminate() }
        cleanupPipes()

        let proc = Process()
        proc.executableURL = URL(fileURLWithPath: claudePath)

        // 使用 -p 模式获取 stream-json 输出
        // --dangerously-skip-permissions 跳过工具权限确认，避免 CLI 挂起等待用户输入
        var args = ["-p", "--output-format", "stream-json", "--verbose", "--dangerously-skip-permissions"]
        if let rid = resumeId { args += ["--resume", rid] }
        if let p = prompt { args.append(p) }
        proc.arguments = args

        if !currentProjectPath.isEmpty && FileManager.default.fileExists(atPath: currentProjectPath) {
            proc.currentDirectoryURL = URL(fileURLWithPath: currentProjectPath)
        }

        // ── v4: 环境变量（Provider 配置已通过 ~/.claude/settings.json 生效）──
        var env = ProcessInfo.processInfo.environment
        env["TERM"] = "xterm-256color"
        env["LANG"] = "en_US.UTF-8"
        proc.environment = env

        let outPipe = Pipe(); let errPipe = Pipe(); let inPipe = Pipe()
        proc.standardOutput = outPipe; proc.standardError = errPipe; proc.standardInput = inPipe

        self.process = proc; self.inputPipe = inPipe; self.outputPipe = outPipe; self.errorPipe = errPipe
        self.outputBuffer = ""; self.currentAssistantMessage = nil; self.currentToolCall = nil
        self.toolInputBuffer = ""; self.isInThinkingBlock = false

        outPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let str = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async { self?.handleOutput(str) }
        }

        errPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty, let str = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async { self?.handleStderr(str) }
        }

        proc.terminationHandler = { [weak self] _ in
            DispatchQueue.main.async {
                self?.isRunning = false; self?.cliReady = false
                // 清理未完成的占位消息
                if let msg = self?.currentAssistantMessage {
                    msg.isStreaming = false; msg.isThinking = false
                }
                self?.cleanupEmptyMessages()
                self?.currentAssistantMessage = nil
                Task { @MainActor in EHUBManager.shared.setConnected(false) }
            }
        }

        do {
            try proc.run()
            isRunning = true; error = nil; cliReady = false

            // v4: 同步 EHUB
            Task { @MainActor in
                let ehub = EHUBManager.shared
                ehub.setConnected(true)
                if !self.currentProjectPath.isEmpty { ehub.setProjectPath(self.currentProjectPath) }
            }
        } catch {
            self.error = "启动 Claude 失败: \(error.localizedDescription)\n路径: \(claudePath)"
            isRunning = false
        }
    }

    private func sendToStdin(_ text: String) {
        guard let pipe = inputPipe else { return }
        if let data = (text + "\n").data(using: .utf8) { pipe.fileHandleForWriting.write(data) }
    }

    func respondPermission(allow: Bool) {
        sendToStdin(allow ? "y" : "n"); pendingPermission = nil
    }

    /// v4.1 发送斜杠命令到 CLI
    func sendSlashCommand(_ cmd: String) {
        let fullCmd = "/\(cmd)"

        // 某些命令需要清空本地消息列表
        let clearLocalCommands = ["clear", "reset", "new"]
        if clearLocalCommands.contains(cmd.split(separator: " ").first.map(String.init) ?? "") {
            messages.removeAll()
            sessionId = nil
        }

        if isRunning, cliReady {
            sendToStdin(fullCmd)
        } else {
            // 启动新进程发送命令
            startProcess(prompt: fullCmd, resumeId: sessionId)
        }
    }

    private func cleanup() {
        process?.terminationHandler = nil
        if let p = process, p.isRunning { p.terminate() }
        cleanupPipes(); process = nil; isRunning = false
        currentAssistantMessage = nil; currentToolCall = nil
        outputBuffer = ""; toolInputBuffer = ""; isInThinkingBlock = false
        pendingPrompt = nil; cliReady = false
        Task { @MainActor in EHUBManager.shared.setConnected(false) }
    }

    private func cleanupPipes() {
        outputPipe?.fileHandleForReading.readabilityHandler = nil
        errorPipe?.fileHandleForReading.readabilityHandler = nil
        outputPipe = nil; errorPipe = nil; inputPipe = nil
    }

    // MARK: - 新对话

    func startNewChat(projectPath: String? = nil) {
        // 强制停止旧进程
        if let proc = process, proc.isRunning {
            sendToStdin("/exit")
            proc.terminate()
        }
        cleanup()

        messages.removeAll(); sessionId = nil
        error = nil; pendingPermission = nil
        if let p = projectPath { currentProjectPath = p }
        Task { @MainActor in EHUBManager.shared.reset() }
        ArtifactManager.shared.clear()
        NotificationCenter.default.post(name: .init("epc.reloadSidebar"), object: nil)
    }

    // MARK: - 输出解析

    private func handleOutput(_ raw: String) {
        outputBuffer += raw
        while let nlRange = outputBuffer.range(of: "\n") {
            let line = String(outputBuffer[outputBuffer.startIndex..<nlRange.lowerBound])
            outputBuffer = String(outputBuffer[nlRange.upperBound...])
            let trimmed = line.trimmingCharacters(in: .whitespaces)
            if !trimmed.isEmpty { parseLine(trimmed) }
        }
    }

    private func handleStderr(_ text: String) {
        let lower = text.lowercased()
        if lower.contains("allow") && (lower.contains("y/n") || lower.contains("(y)es")) {
            DispatchQueue.main.async { [weak self] in
                if self?.pendingPermission == nil {
                    self?.pendingPermission = PermissionRequest(
                        toolName: "工具操作",
                        description: text.trimmingCharacters(in: .whitespacesAndNewlines),
                        rawJSON: [:]
                    )
                }
            }
        }
    }

    private func parseLine(_ line: String) {
        guard let data = line.data(using: .utf8),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
        let rawType = (json["type"] as? String) ?? ""

        // ── v4: 每行都推送给 EHUB ──
        Task { @MainActor in EHUBManager.shared.updateFromStreamEvent(json) }

        processJSON(rawType: rawType, json: json)
    }

    // MARK: - JSON 事件处理（核心，与 v3 一致）

    private func processJSON(rawType: String, json: [String: Any]) {
        switch rawType {

        case "system":
            if let sid = json["session_id"] as? String { sessionId = sid }
            cliReady = true
            // CLI 已初始化，如果当前没有 assistant 消息，创建一个"思考中"占位
            if currentAssistantMessage == nil {
                let msg = ChatMessage(role: .assistant, isStreaming: true)
                msg.isThinking = true
                messages.append(msg)
                currentAssistantMessage = msg
            }

        case "assistant", "message_start":
            ensureAssistantMessage()
            Task { @MainActor in EHUBManager.shared.incrementTurn() }  // v4

        case "content_block_start":
            let cbType = (json["content_block"] as? [String: Any])?["type"] as? String ?? ""
            if cbType == "thinking" {
                isInThinkingBlock = true; ensureAssistantMessage()
                currentAssistantMessage?.isThinking = true
            } else if cbType == "tool_use" {
                isInThinkingBlock = false
                let name = (json["content_block"] as? [String: Any])?["name"] as? String ?? "tool"
                let tool = ChatToolCall(toolName: name, status: .running)
                ensureAssistantMessage(); currentAssistantMessage?.toolCalls.append(tool)
                currentToolCall = tool; toolInputBuffer = ""
            } else if cbType == "text" {
                isInThinkingBlock = false; ensureAssistantMessage()
                currentAssistantMessage?.isThinking = false
            }

        case "content_block_delta":
            let delta = json["delta"] as? [String: Any]
            let deltaType = delta?["type"] as? String ?? ""
            if deltaType == "thinking_delta" || isInThinkingBlock && deltaType == "text_delta" {
                if let text = delta?["thinking"] as? String ?? delta?["text"] as? String {
                    ensureAssistantMessage(); currentAssistantMessage?.thinkingText += text
                }
            } else if deltaType == "text_delta" {
                if let text = delta?["text"] as? String {
                    ensureAssistantMessage(); currentAssistantMessage?.isThinking = false
                    currentAssistantMessage?.text += text
                }
            } else if deltaType == "input_json_delta" {
                if let partial = delta?["partial_json"] as? String {
                    toolInputBuffer += partial; currentToolCall?.input = toolInputBuffer
                }
            }

        case "content_block_stop":
            if isInThinkingBlock { isInThinkingBlock = false; currentAssistantMessage?.isThinking = false }
            if let tool = currentToolCall { tool.input = formatJSON(toolInputBuffer); toolInputBuffer = "" }
            currentToolCall = nil

        case "message_stop":
            currentAssistantMessage?.isStreaming = false; currentAssistantMessage?.isThinking = false
            cleanupEmptyMessages(); currentAssistantMessage = nil

        case "message_delta": break

        case "result":
            currentAssistantMessage?.isStreaming = false; currentAssistantMessage?.isThinking = false
            if let sid = json["session_id"] as? String { sessionId = sid }
            if let resultText = json["result"] as? String,
               let msg = currentAssistantMessage, msg.text.isEmpty { msg.text = resultText }
            cleanupEmptyMessages(); currentAssistantMessage = nil
            // 一轮对话完成后刷新侧边栏（新会话会出现在列表中）
            NotificationCenter.default.post(name: .init("epc.reloadSidebar"), object: nil)

        case "tool_result", "tool_output":
            if let output = json["output"] as? String ?? json["content"] as? String {
                if let lastTool = findLastRunningTool() { lastTool.output = output; lastTool.status = .success }
            }
            if let isError = json["is_error"] as? Bool, isError {
                if let lastTool = findLastRunningTool() { lastTool.status = .error }
            }

        default:
            if rawType.contains("permission") || json["permission"] != nil {
                let toolName = (json["tool_name"] as? String) ?? (json["name"] as? String) ?? "工具"
                let desc = (json["description"] as? String) ?? (json["message"] as? String) ?? "Claude 请求执行操作: \(toolName)"
                pendingPermission = PermissionRequest(toolName: toolName, description: desc, rawJSON: json)
            }
        }

        objectWillChange.send()
    }

    // MARK: - 辅助

    private func ensureAssistantMessage() {
        if currentAssistantMessage == nil {
            let msg = ChatMessage(role: .assistant, isStreaming: true)
            messages.append(msg); currentAssistantMessage = msg
        }
    }

    private func cleanupEmptyMessages() {
        messages.removeAll { $0.role == .assistant && !$0.hasContent && !$0.isStreaming }
    }

    private func findLastRunningTool() -> ChatToolCall? {
        for msg in messages.reversed() {
            if let tool = msg.toolCalls.last(where: { $0.status == .running }) { return tool }
        }
        return nil
    }

    private func formatJSON(_ raw: String) -> String {
        guard let data = raw.data(using: .utf8),
              let obj = try? JSONSerialization.jsonObject(with: data),
              let pretty = try? JSONSerialization.data(withJSONObject: obj, options: .prettyPrinted),
              let str = String(data: pretty, encoding: .utf8) else { return raw }
        return str
    }
}
