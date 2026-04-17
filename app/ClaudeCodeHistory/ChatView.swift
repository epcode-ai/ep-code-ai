import SwiftUI

struct ChatView: View {
    @EnvironmentObject var processManager: ClaudeProcessManager
    @EnvironmentObject var settings: AppSettings
    @EnvironmentObject var store: ConversationStore
    @EnvironmentObject var ehub: EHUBManager          // v4 新增
    @State private var inputText = ""
    @State private var toastMessage: String? = nil
    @State private var clearToastObserver: Any? = nil
    @FocusState private var isInputFocused: Bool

    // v4.1 斜杠命令面板
    @State private var showSlashPalette = false
    @State private var slashQuery = ""
    @State private var pendingCommand: SlashCommand? = nil
    @State private var commandArgInput = ""

    // v4.1 模式切换
    @AppStorage("fastMode") private var fastModeRaw = FastMode.off.rawValue
    @AppStorage("effortLevel") private var effortRaw = EffortLevel.auto.rawValue

    private var fastMode: Binding<FastMode> {
        Binding(
            get: { FastMode(rawValue: fastModeRaw) ?? .off },
            set: { fastModeRaw = $0.rawValue }
        )
    }
    private var effort: Binding<EffortLevel> {
        Binding(
            get: { EffortLevel(rawValue: effortRaw) ?? .auto },
            set: { effortRaw = $0.rawValue }
        )
    }

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Toast
                if let toast = toastMessage {
                    toastBanner(toast)
                        .transition(.move(edge: .top).combined(with: .opacity))
                        .zIndex(10)
                }

                if processManager.messages.isEmpty && !processManager.isRunning && !processManager.isLoading {
                    welcomeView
                } else {
                    messageList
                }

                if let perm = processManager.pendingPermission {
                    permissionBar(perm)
                }

                if let err = processManager.error {
                    errorBar(err)
                }

                inputBar

                // ── v4 新增：EHUB 信息栏 ──
                EHUBInfoBar(ehub: ehub)
            }

            // Fix5: Loading 覆盖层
            if processManager.isLoading {
                Color.black.opacity(0.15).ignoresSafeArea()
                VStack(spacing: 12) {
                    ProgressView()
                        .scaleEffect(1.3)
                        .tint(settings.tc)
                    Text("正在切换会话...")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.primary.opacity(0.7))
                }
                .padding(24)
                .background(RoundedRectangle(cornerRadius: 14).fill(.ultraThinMaterial))
            }
        }
        .background(Color(nsColor: .textBackgroundColor))
        .onChange(of: processManager.sessionId) { sid in
            if sid != nil, store.selectedConversation != nil {
                let name = ConversationNameManager.shared.displayName(for: store.selectedConversation!)
                showToast("已恢复: \(name)")
            }
        }
        .onAppear {
            clearToastObserver = NotificationCenter.default.addObserver(
                forName: .clearToast, object: nil, queue: .main
            ) { _ in
                withAnimation { toastMessage = nil }
            }
            // v4.1 监听模型切换
            NotificationCenter.default.addObserver(
                forName: .init("epc.switchModel"), object: nil, queue: .main
            ) { notif in
                if let modelId = notif.object as? String {
                    processManager.sendSlashCommand("model \(modelId)")
                    showToast("已切换模型: \(modelId)")
                }
            }
        }
    }

    // MARK: - Toast

    private func showToast(_ text: String) {
        withAnimation(.easeInOut(duration: 0.3)) { toastMessage = text }
        DispatchQueue.main.asyncAfter(deadline: .now() + 10) {
            withAnimation(.easeInOut(duration: 0.3)) { if toastMessage == text { toastMessage = nil } }
        }
    }

    private func toastBanner(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "clock.arrow.circlepath").font(.system(size: 12)).foregroundColor(settings.tc)
            Text(text).font(.system(size: 12, weight: .medium)).foregroundColor(.primary)
            Spacer()
            Button(action: { withAnimation { toastMessage = nil } }) {
                Image(systemName: "xmark").font(.system(size: 9, weight: .bold)).foregroundColor(.secondary.opacity(0.5))
            }.buttonStyle(.plain)
        }
        .padding(.horizontal, 16).padding(.vertical, 10)
        .background(RoundedRectangle(cornerRadius: 10).fill(settings.tcLight))
        .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(settings.tc.opacity(0.2), lineWidth: 0.5))
        .padding(.horizontal, 24).padding(.top, 8)
    }

    // MARK: - Welcome

    private var welcomeView: some View {
        VStack(spacing: 0) {
            Spacer()
            VStack(spacing: 20) {
                ZStack {
                    RoundedRectangle(cornerRadius: 20).fill(settings.tc.opacity(0.08)).frame(width: 80, height: 80)
                    Text("EP").font(.system(size: 32, weight: .bold, design: .rounded)).foregroundColor(settings.tc)
                }
                Text("有什么可以帮你的？").font(.system(size: 22, weight: .semibold, design: .rounded))
                projectSelector
            }
            Spacer()
            HStack(spacing: 10) {
                quickChip("解释项目", icon: "building.columns")
                quickChip("修复 bug", icon: "ladybug")
                quickChip("写测试", icon: "checkmark.shield")
                quickChip("代码审查", icon: "eye")
            }.padding(.bottom, 16)
        }.frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    private var projectSelector: some View {
        Menu {
            Button("无项目") { processManager.currentProjectPath = "" }; Divider()
            ForEach(store.projects) { p in Button(p.name) { processManager.currentProjectPath = p.path } }
            Divider(); Button("选择目录...") { chooseDirectory() }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "folder.fill").font(.system(size: 12)).foregroundColor(settings.tc)
                Text(projectDisplayName).font(.system(size: 13)).foregroundColor(.primary.opacity(0.7))
                Image(systemName: "chevron.up.chevron.down").font(.system(size: 9)).foregroundColor(.secondary.opacity(0.5))
            }
            .padding(.horizontal, 14).padding(.vertical, 8)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.04)))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.5))
        }.menuStyle(.borderlessButton).fixedSize()
    }

    private func quickChip(_ text: String, icon: String) -> some View {
        Button(action: { inputText = text; sendMessage() }) {
            HStack(spacing: 5) {
                Image(systemName: icon).font(.system(size: 10)).foregroundColor(settings.tc.opacity(0.7))
                Text(text).font(.system(size: 12)).foregroundColor(.primary.opacity(0.6))
            }
            .padding(.horizontal, 12).padding(.vertical, 7)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.03)))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.5))
        }.buttonStyle(.plain)
    }

    // MARK: - Messages

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 4) {
                    ForEach(processManager.messages) { msg in ChatBubble(message: msg).id(msg.id) }
                    Color.clear.frame(height: 1).id("bottom")
                }.padding(.horizontal, 24).padding(.vertical, 16)
            }
            .onChange(of: processManager.messages.count) { _ in
                withAnimation(.easeOut(duration: 0.2)) { proxy.scrollTo("bottom", anchor: .bottom) }
            }
            .onChange(of: processManager.messages.last?.text) { _ in proxy.scrollTo("bottom", anchor: .bottom) }
        }
    }

    // MARK: - Permission / Error

    private func permissionBar(_ perm: PermissionRequest) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.shield.fill").font(.system(size: 18)).foregroundColor(.orange)
            VStack(alignment: .leading, spacing: 2) {
                Text("权限请求: \(perm.toolName)").font(.system(size: 12, weight: .semibold))
                Text(perm.description).font(.system(size: 12)).foregroundColor(.secondary).lineLimit(3)
            }
            Spacer()
            Button("拒绝") { processManager.respondPermission(allow: false) }.font(.system(size: 12))
            Button(action: { processManager.respondPermission(allow: true) }) {
                Text("允许").font(.system(size: 12, weight: .medium)).foregroundColor(.white)
                    .padding(.horizontal, 14).padding(.vertical, 5).background(settings.tc).cornerRadius(6)
            }.buttonStyle(.plain)
        }.padding(.horizontal, 20).padding(.vertical, 10).background(Color.orange.opacity(0.06))
    }

    private func errorBar(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle.fill").foregroundColor(.red.opacity(0.7))
            Text(text).font(.system(size: 12)).foregroundColor(.red.opacity(0.8)).lineLimit(2)
            Spacer()
            Button(action: { processManager.error = nil }) {
                Image(systemName: "xmark").font(.system(size: 10)).foregroundColor(.secondary)
            }.buttonStyle(.plain)
        }.padding(.horizontal, 20).padding(.vertical, 8).background(Color.red.opacity(0.05))
    }

    // MARK: - Input Bar

    private var inputBar: some View {
        VStack(spacing: 0) {
            // v4.1 斜杠命令面板（浮在输入栏上方）
            if showSlashPalette {
                SlashCommandPalette(
                    query: $slashQuery,
                    isVisible: $showSlashPalette,
                    onSelect: handleCommandSelect
                )
                .padding(.horizontal, 24)
                .padding(.bottom, 6)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }

            HStack(alignment: .center, spacing: 10) {
                if !processManager.currentProjectPath.isEmpty {
                    Button(action: { chooseDirectory() }) {
                        HStack(spacing: 4) {
                            Image(systemName: "folder.fill").font(.system(size: 11))
                            Text(URL(fileURLWithPath: processManager.currentProjectPath).lastPathComponent).font(.system(size: 11)).lineLimit(1)
                        }
                        .foregroundColor(settings.tc.opacity(0.7))
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(RoundedRectangle(cornerRadius: 6).fill(settings.tcLight))
                    }.buttonStyle(.plain)
                }

                // v4.1 速度/思考模式切换
                SpeedModeSelector(
                    fastMode: fastMode,
                    effort: effort,
                    onFastChange: { mode in processManager.sendSlashCommand("fast \(mode.rawValue)") },
                    onEffortChange: { lv in processManager.sendSlashCommand("effort \(lv.rawValue)") }
                )

                ZStack(alignment: .leading) {
                    if inputText.isEmpty {
                        Text(processManager.isRunning ? "等待回复中..." : "输入消息，按 Enter 发送...  输入 / 打开命令")
                            .font(.system(size: 14)).foregroundColor(.secondary.opacity(0.4)).padding(.leading, 4)
                    }
                    TextField("", text: $inputText)
                        .font(.system(size: 14)).textFieldStyle(.plain).focused($isInputFocused)
                        .onSubmit { handleSubmit() }
                        .onChange(of: inputText) { newValue in
                            handleInputChange(newValue)
                        }
                        .onExitCommand {
                            if showSlashPalette {
                                withAnimation(.spring(response: 0.25)) { showSlashPalette = false }
                            }
                        }
                        .disabled(processManager.isRunning || processManager.isLoading)
                }
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(nsColor: .textBackgroundColor))
                )
                .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(
                    isInputFocused ? settings.tc.opacity(0.5) : Color.primary.opacity(0.12),
                    lineWidth: isInputFocused ? 1.5 : 1
                ))
                .shadow(color: .black.opacity(isInputFocused ? 0 : 0.04), radius: 1, y: 1)

                if processManager.isRunning {
                    Button(action: { processManager.stop() }) {
                        Image(systemName: "stop.circle.fill").font(.system(size: 26)).foregroundColor(.red.opacity(0.6))
                    }.buttonStyle(.plain)
                } else {
                    Button(action: sendMessage) {
                        Image(systemName: "arrow.up.circle.fill").font(.system(size: 26))
                            .foregroundColor(canSend ? settings.tc : .secondary.opacity(0.25))
                    }.buttonStyle(.plain).disabled(!canSend)
                }
            }.padding(.horizontal, 24).padding(.vertical, 14)
        }
        .onAppear { isInputFocused = true }
        .sheet(item: $pendingCommand) { cmd in
            commandArgSheet(cmd)
        }
    }

    // MARK: - 斜杠命令处理

    private func handleInputChange(_ text: String) {
        if text.hasPrefix("/") {
            slashQuery = String(text.dropFirst())
            withAnimation(.spring(response: 0.25)) { showSlashPalette = true }
        } else if showSlashPalette {
            withAnimation(.spring(response: 0.25)) { showSlashPalette = false }
        }
    }

    private func handleSubmit() {
        if showSlashPalette {
            // 尝试匹配第一个命令直接执行
            let providerMgr = ProviderManager.shared
            let isOfficial = providerMgr.activeProvider == nil
            let available = SlashCommandRegistry.available(for: isOfficial)
            let matches = SlashCommandRegistry.search(slashQuery, in: available)
            if let first = matches.first {
                handleCommandSelect(first)
                return
            }
        }
        sendMessage()
    }

    private func handleCommandSelect(_ cmd: SlashCommand) {
        withAnimation(.spring(response: 0.25)) { showSlashPalette = false }
        inputText = ""

        if cmd.needsArg {
            // 弹出参数输入框
            commandArgInput = ""
            pendingCommand = cmd
        } else {
            // 直接发送
            processManager.sendSlashCommand(cmd.id)
            showToast("已执行 /\(cmd.id)")
        }
    }

    @ViewBuilder
    private func commandArgSheet(_ cmd: SlashCommand) -> some View {
        VStack(spacing: 14) {
            HStack {
                Image(systemName: cmd.icon).font(.system(size: 14)).foregroundColor(settings.tc)
                Text(cmd.displayName).font(.system(size: 14, weight: .semibold))
                Text("/\(cmd.id)").font(.system(size: 11, design: .monospaced)).foregroundColor(.secondary)
                Spacer()
                Button(action: { pendingCommand = nil }) {
                    Image(systemName: "xmark").font(.system(size: 10)).foregroundColor(.secondary)
                }.buttonStyle(.plain)
            }

            Text(cmd.description).font(.system(size: 11)).foregroundColor(.secondary).frame(maxWidth: .infinity, alignment: .leading)

            TextField(cmd.argPlaceholder, text: $commandArgInput)
                .textFieldStyle(.roundedBorder).font(.system(size: 13))
                .onSubmit { executeWithArg(cmd) }

            HStack {
                Button("取消") { pendingCommand = nil }.keyboardShortcut(.cancelAction)
                Spacer()
                Button("执行") { executeWithArg(cmd) }
                    .buttonStyle(.borderedProminent).tint(settings.tc)
                    .keyboardShortcut(.defaultAction)
            }
        }
        .padding(20).frame(width: 380)
    }

    private func executeWithArg(_ cmd: SlashCommand) {
        let arg = commandArgInput.trimmingCharacters(in: .whitespaces)
        let full = cmd.formatted(arg: arg)
        processManager.sendSlashCommand(String(full.dropFirst()))
        pendingCommand = nil
        showToast("已执行 \(full)")
    }

    private var canSend: Bool {
        !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !processManager.isRunning && !processManager.isLoading
    }

    private func sendMessage() {
        let text = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty, !processManager.isRunning else { return }
        inputText = ""
        processManager.sendMessage(text)
    }

    private func chooseDirectory() {
        let panel = NSOpenPanel(); panel.canChooseDirectories = true; panel.canChooseFiles = false
        if panel.runModal() == .OK, let url = panel.url {
            processManager.currentProjectPath = url.path
            ehub.setProjectPath(url.path)    // v4 新增：同步给 EHUB
        }
    }

    private var projectDisplayName: String {
        processManager.currentProjectPath.isEmpty ? "选择项目目录" : URL(fileURLWithPath: processManager.currentProjectPath).lastPathComponent
    }
}

// MARK: - Chat Bubble (保持 v3 不变)

struct ChatBubble: View {
    @ObservedObject var message: ChatMessage
    @EnvironmentObject var settings: AppSettings
    @State private var showThinking = false
    @State private var copied = false

    var body: some View {
        VStack(alignment: message.role == .user ? .trailing : .leading, spacing: 6) {
            HStack(spacing: 5) {
                if message.role == .user { Spacer() }
                roleLabel
                if message.role != .user { Spacer() }
            }

            if message.role == .assistant && !message.thinkingText.isEmpty { thinkingBlock }
            if !message.text.isEmpty { messageContent }
            if message.role == .assistant { ForEach(message.toolCalls) { tool in ToolCallView(tool: tool) } }

            if !message.text.isEmpty && !message.isStreaming {
                HStack {
                    if message.role == .user { Spacer() }
                    copyButton
                    if message.role != .user { Spacer() }
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: message.role == .user ? .trailing : .leading)
        .padding(.vertical, 4)
    }

    private var roleLabel: some View {
        HStack(spacing: 5) {
            if message.role == .user {
                Text("你").font(.system(size: 11, weight: .medium)).foregroundColor(settings.tc)
            } else {
                ZStack {
                    RoundedRectangle(cornerRadius: 5).fill(settings.tc.opacity(0.1)).frame(width: 22, height: 22)
                    Text("EP").font(.system(size: 8, weight: .bold, design: .rounded)).foregroundColor(settings.tc)
                }
                Text("EP Code").font(.system(size: 11, weight: .medium)).foregroundColor(settings.tc)
                if message.isStreaming {
                    if message.isThinking {
                        HStack(spacing: 4) {
                            ProgressView().scaleEffect(0.4).frame(width: 10, height: 10).tint(settings.tc)
                            Text(message.thinkingText.isEmpty && message.text.isEmpty ? "正在连接..." : "思考中")
                                .font(.system(size: 10)).foregroundColor(settings.tc.opacity(0.7))
                        }
                    } else {
                        Circle().fill(settings.tc).frame(width: 6, height: 6).modifier(PulseAnimation())
                    }
                }
            }
        }
    }

    @ViewBuilder private var messageContent: some View {
        if message.role == .user {
            Text(message.text).font(.system(size: 14)).foregroundColor(.white)
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(RoundedRectangle(cornerRadius: 16, style: .continuous).fill(settings.tc))
                .textSelection(.enabled).frame(maxWidth: 600, alignment: .trailing)
        } else {
            VStack(alignment: .leading, spacing: 4) {
                MarkdownTextView(text: message.text).frame(maxWidth: 700, alignment: .leading)

                // v4.1 Artifact 检测 — 消息完成后检测可渲染代码
                if !message.isStreaming {
                    let artifacts = ArtifactDetector.detect(in: message.text)
                    ForEach(artifacts) { artifact in
                        ArtifactTagView(artifact: artifact)
                            .onAppear {
                                // 首次出现时自动添加到 manager
                                let mgr = ArtifactManager.shared
                                if !mgr.artifacts.contains(where: { $0.sourceCode == artifact.sourceCode }) {
                                    mgr.addArtifact(artifact)
                                }
                            }
                    }
                }
            }
        }
    }

    private var copyButton: some View {
        Button(action: {
            NSPasteboard.general.clearContents(); NSPasteboard.general.setString(message.text, forType: .string)
            copied = true; DispatchQueue.main.asyncAfter(deadline: .now() + 2) { copied = false }
        }) {
            HStack(spacing: 3) {
                Image(systemName: copied ? "checkmark" : "doc.on.doc").font(.system(size: 9))
                Text(copied ? "已复制" : "复制").font(.system(size: 10))
            }.foregroundColor(.secondary.opacity(0.5))
                .padding(.horizontal, 8).padding(.vertical, 3)
                .background(RoundedRectangle(cornerRadius: 4).fill(Color.primary.opacity(0.03)))
        }.buttonStyle(.plain)
    }

    private var thinkingBlock: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: { withAnimation(.easeInOut(duration: 0.2)) { showThinking.toggle() } }) {
                HStack(spacing: 6) {
                    Image(systemName: "brain").font(.system(size: 11)).foregroundColor(settings.tc.opacity(0.5))
                    Text(message.isThinking ? "正在思考..." : "思考过程").font(.system(size: 11, weight: .medium)).foregroundColor(.secondary)
                    if message.isThinking { ProgressView().scaleEffect(0.4).frame(width: 10, height: 10) }
                    Spacer()
                    Image(systemName: showThinking ? "chevron.up" : "chevron.down").font(.system(size: 8, weight: .bold)).foregroundColor(.secondary.opacity(0.4))
                }.padding(.horizontal, 10).padding(.vertical, 6)
            }.buttonStyle(.plain)
            if showThinking {
                Divider().opacity(0.2)
                ScrollView {
                    Text(message.thinkingText).font(.system(size: 12)).foregroundColor(.secondary.opacity(0.7))
                        .lineSpacing(2).textSelection(.enabled).padding(10).frame(maxWidth: .infinity, alignment: .leading)
                }.frame(maxHeight: 200)
            }
        }
        .background(RoundedRectangle(cornerRadius: 8).fill(settings.tc.opacity(0.03)))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(settings.tc.opacity(0.08), lineWidth: 0.5))
        .frame(maxWidth: 700)
    }
}

struct PulseAnimation: ViewModifier {
    @State private var on = false
    func body(content: Content) -> some View {
        content.scaleEffect(on ? 1.3 : 0.8).opacity(on ? 1 : 0.5)
            .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: on).onAppear { on = true }
    }
}

// MARK: - Markdown (保持 v3 不变)

struct MarkdownTextView: View {
    let text: String
    var body: some View {
        let segs = parseSegments(text)
        VStack(alignment: .leading, spacing: 8) {
            ForEach(Array(segs.enumerated()), id: \.offset) { _, s in
                if s.isCode { codeBlock(s.text, language: s.language) }
                else { Text(mdAttr(s.text)).font(.system(size: 14)).lineSpacing(3).textSelection(.enabled) }
            }
        }
    }
    private func codeBlock(_ code: String, language: String) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text(language.isEmpty ? "code" : language).font(.system(size: 10, weight: .medium, design: .monospaced)).foregroundColor(.secondary.opacity(0.6))
                Spacer()
                Button(action: { NSPasteboard.general.clearContents(); NSPasteboard.general.setString(code, forType: .string) }) {
                    HStack(spacing: 3) { Image(systemName: "doc.on.doc").font(.system(size: 9)); Text("复制").font(.system(size: 10)) }.foregroundColor(.secondary.opacity(0.5))
                }.buttonStyle(.plain)
            }.padding(.horizontal, 12).padding(.vertical, 6).background(Color.primary.opacity(0.06))
            ScrollView(.horizontal, showsIndicators: false) {
                Text(code).font(.system(size: 12.5, design: .monospaced)).foregroundColor(.primary.opacity(0.85)).textSelection(.enabled).padding(12)
            }
        }
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.03)))
        .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.5))
    }
    private func mdAttr(_ t: String) -> AttributedString {
        (try? AttributedString(markdown: t, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace))) ?? AttributedString(t)
    }
    struct Seg { let text: String; let isCode: Bool; let language: String }
    private func parseSegments(_ text: String) -> [Seg] {
        var r: [Seg] = []; let pat = "```(\\w*)\\n([\\s\\S]*?)```"
        guard let re = try? NSRegularExpression(pattern: pat) else { return [Seg(text: text, isCode: false, language: "")] }
        let ns = text as NSString; var last = 0
        for m in re.matches(in: text, range: NSRange(location: 0, length: ns.length)) {
            if m.range.location > last { let b = ns.substring(with: NSRange(location: last, length: m.range.location - last)).trimmingCharacters(in: .whitespacesAndNewlines); if !b.isEmpty { r.append(Seg(text: b, isCode: false, language: "")) } }
            let lang = m.numberOfRanges > 1 ? ns.substring(with: m.range(at: 1)) : ""; let code = m.numberOfRanges > 2 ? ns.substring(with: m.range(at: 2)) : ""
            r.append(Seg(text: code.trimmingCharacters(in: .newlines), isCode: true, language: lang)); last = m.range.location + m.range.length
        }
        if last < ns.length { let rest = ns.substring(from: last).trimmingCharacters(in: .whitespacesAndNewlines); if !rest.isEmpty { r.append(Seg(text: rest, isCode: false, language: "")) } }
        if r.isEmpty { r.append(Seg(text: text, isCode: false, language: "")) }; return r
    }
}

// MARK: - Tool Call (保持 v3 不变)

struct ToolCallView: View {
    @ObservedObject var tool: ChatToolCall
    @EnvironmentObject var settings: AppSettings
    @State private var isExpanded = false
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button(action: { withAnimation(.easeInOut(duration: 0.2)) { isExpanded.toggle() } }) {
                HStack(spacing: 8) {
                    statusIcon; Text(tool.toolName).font(.system(size: 12, weight: .medium, design: .monospaced)).foregroundColor(.primary.opacity(0.7))
                    if tool.status == .running { ProgressView().scaleEffect(0.5).frame(width: 12, height: 12) }; Spacer()
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down").font(.system(size: 9, weight: .bold)).foregroundColor(.secondary.opacity(0.4))
                }.padding(.horizontal, 12).padding(.vertical, 8)
            }.buttonStyle(.plain)
            if isExpanded {
                Divider().opacity(0.3)
                VStack(alignment: .leading, spacing: 8) {
                    if !tool.input.isEmpty { VStack(alignment: .leading, spacing: 4) { Text("输入").font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary.opacity(0.5)); ScrollView(.horizontal, showsIndicators: false) { Text(tool.input).font(.system(size: 11, design: .monospaced)).foregroundColor(.primary.opacity(0.7)).textSelection(.enabled) }.frame(maxHeight: 120) } }
                    if !tool.output.isEmpty { VStack(alignment: .leading, spacing: 4) { Text("输出").font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary.opacity(0.5)); ScrollView { Text(tool.output).font(.system(size: 11, design: .monospaced)).foregroundColor(.primary.opacity(0.7)).textSelection(.enabled).frame(maxWidth: .infinity, alignment: .leading) }.frame(maxHeight: 200) } }
                }.padding(12)
            }
        }.frame(maxWidth: 700)
        .background(RoundedRectangle(cornerRadius: 8).fill(toolBg)).overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(toolBorder, lineWidth: 0.5))
    }
    private var statusIcon: some View {
        Group { switch tool.status {
        case .running: Image(systemName: "gearshape.fill").foregroundColor(settings.tc.opacity(0.6))
        case .success: Image(systemName: "checkmark.circle.fill").foregroundColor(.green.opacity(0.6))
        case .error: Image(systemName: "xmark.circle.fill").foregroundColor(.red.opacity(0.6))
        case .pending: Image(systemName: "clock.fill").foregroundColor(.orange.opacity(0.6))
        }}.font(.system(size: 12))
    }
    private var toolBg: Color { switch tool.status { case .running: return settings.tc.opacity(0.03); case .success: return .green.opacity(0.02); case .error: return .red.opacity(0.03); case .pending: return .orange.opacity(0.03) } }
    private var toolBorder: Color { switch tool.status { case .running: return settings.tc.opacity(0.1); case .success: return .green.opacity(0.08); case .error: return .red.opacity(0.1); case .pending: return .orange.opacity(0.1) } }
}
