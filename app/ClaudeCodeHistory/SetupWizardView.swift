import SwiftUI

// MARK: - v4 首次引导向导

enum SetupStep: Int, CaseIterable {
    case welcome = 0
    case environment = 1
    case provider = 2
    case complete = 3
}

struct SetupWizardView: View {
    @EnvironmentObject var settings: AppSettings
    @StateObject private var checker = EnvironmentChecker.shared
    @StateObject private var providerMgr = ProviderManager.shared
    @AppStorage("setupCompleted") private var setupCompleted = false
    @State private var currentStep: SetupStep = .welcome
    @State private var isAnimating = false

    @State private var showAddSheet = false
    @State private var loginInProgress = false
    @State private var loginOutput = ""

    var body: some View {
        VStack(spacing: 0) {
            stepIndicator.padding(.top, 32)
            Spacer()
            Group {
                switch currentStep {
                case .welcome:     welcomeStep
                case .environment: environmentStep
                case .provider:    providerStep
                case .complete:    completeStep
                }
            }
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
            Spacer()
            bottomNav.padding(.bottom, 32)
        }
        .padding(.horizontal, 48)
        .frame(width: 680, height: 560)
        .background(Color(nsColor: .windowBackgroundColor))
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) { isAnimating = true }
        }
        .sheet(isPresented: $showAddSheet) {
            AddProviderView(providerMgr: providerMgr, isPresented: $showAddSheet)
                .environmentObject(settings)
        }
    }

    // MARK: - 步骤指示器

    private var stepIndicator: some View {
        HStack(spacing: 8) {
            ForEach(SetupStep.allCases, id: \.rawValue) { step in
                Capsule()
                    .fill(step.rawValue <= currentStep.rawValue ? settings.tc : Color.gray.opacity(0.3))
                    .frame(width: step == currentStep ? 32 : 16, height: 4)
                    .animation(.spring(response: 0.3), value: currentStep)
            }
        }
    }

    // MARK: - Step 1: 欢迎

    private var welcomeStep: some View {
        VStack(spacing: 20) {
            ZStack {
                RoundedRectangle(cornerRadius: 24).fill(settings.tcLight).frame(width: 96, height: 96)
                Text("EP").font(.system(size: 40, weight: .bold, design: .rounded)).foregroundColor(settings.tc)
            }
            .scaleEffect(isAnimating ? 1.0 : 0.5)
            .opacity(isAnimating ? 1.0 : 0.0)

            Text("欢迎使用 EP Code")
                .font(.system(size: 28, weight: .bold, design: .rounded))
            Text("AI智能体 图形化客户端")
                .font(.system(size: 16)).foregroundColor(.secondary)
            Text("接下来检查运行环境并配置 API 接入方式")
                .font(.system(size: 13)).foregroundColor(.secondary).padding(.top, 8)
        }
    }

    // MARK: - Step 2: 环境检查

    private var environmentStep: some View {
        VStack(spacing: 24) {
            Text("环境检查").font(.system(size: 22, weight: .semibold, design: .rounded))
            VStack(spacing: 16) {
                depRow(icon: "cpu", name: "Node.js", desc: "Claude Code 运行依赖",
                       status: checker.nodeStatus) { Task { await checker.installNode() } }
                Divider().padding(.horizontal, 16)
                depRow(icon: "terminal", name: "Claude Code CLI", desc: "@anthropic-ai/claude-code",
                       status: checker.claudeStatus) { Task { await checker.installClaude() } }
            }
            .padding(20)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color(nsColor: .controlBackgroundColor)))
            .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.5))

            if !checker.installLog.isEmpty {
                ScrollView {
                    Text(checker.installLog)
                        .font(.system(size: 11, design: .monospaced)).foregroundColor(.secondary)
                        .textSelection(.enabled).frame(maxWidth: .infinity, alignment: .leading)
                }.frame(maxHeight: 100).padding(10)
                .background(RoundedRectangle(cornerRadius: 8).fill(Color.primary.opacity(0.02)))
            }
        }
        .onAppear { Task { await checker.checkAll() } }
    }

    private func depRow(icon: String, name: String, desc: String, status: DependencyStatus, install: @escaping () -> Void) -> some View {
        HStack(spacing: 14) {
            Image(systemName: icon).font(.system(size: 20)).frame(width: 36, height: 36).foregroundColor(settings.tc)
            VStack(alignment: .leading, spacing: 2) {
                Text(name).font(.system(size: 14, weight: .medium))
                Text(desc).font(.system(size: 11)).foregroundColor(.secondary)
            }
            Spacer()
            statusBadge(status, install: install)
        }
    }

    @ViewBuilder
    private func statusBadge(_ status: DependencyStatus, install: @escaping () -> Void) -> some View {
        switch status {
        case .checking: ProgressView().controlSize(.small)
        case .installed(let ver):
            HStack(spacing: 4) {
                Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                Text(ver).font(.system(size: 11, design: .monospaced)).foregroundColor(.secondary)
            }
        case .missing: Button("安装", action: install).buttonStyle(.borderedProminent).controlSize(.small).tint(settings.tc)
        case .installing: HStack(spacing: 6) { ProgressView().controlSize(.small); Text("安装中...").font(.caption).foregroundColor(.secondary) }
        case .installFailed(let msg):
            VStack(alignment: .trailing, spacing: 4) {
                Label("失败", systemImage: "exclamationmark.triangle.fill").font(.caption).foregroundColor(.red)
                Button("重试", action: install).buttonStyle(.bordered).controlSize(.mini)
            }.help(msg)
        }
    }

    // MARK: - Step 3: Provider 配置

    private var providerStep: some View {
        VStack(spacing: 20) {
            Text("配置 API Provider").font(.system(size: 22, weight: .semibold, design: .rounded))
            Text("选择 Claude Code 的 API 接入方式，支持任意厂商")
                .font(.system(size: 12)).foregroundColor(.secondary)

            ScrollView {
                VStack(spacing: 12) {
                    // OAuth 登录
                    oauthCard

                    // 已配置的 Provider 列表
                    ForEach(providerMgr.providers) { provider in
                        providerCard(provider)
                    }
                }
            }.frame(maxHeight: 260)

            if !loginOutput.isEmpty {
                Text(loginOutput).font(.system(size: 11, design: .monospaced))
                    .foregroundColor(loginOutput.contains("✅") ? .green : .secondary)
            }

            Button(action: { showAddSheet = true }) {
                HStack(spacing: 6) {
                    Image(systemName: "plus.circle.fill").font(.system(size: 14))
                    Text("添加 Provider").font(.system(size: 13, weight: .medium))
                }.foregroundColor(settings.tc)
            }.buttonStyle(.plain)
        }
        .onAppear { providerMgr.detectCurrentProvider() }
    }

    private var oauthCard: some View {
        let isOAuth = providerMgr.activeProvider == nil && providerMgr.providers.allSatisfy({ !$0.isActive })
        return HStack(spacing: 12) {
            Image(systemName: "person.crop.circle")
                .font(.system(size: 18))
                .foregroundColor(isOAuth ? .white : settings.tc)
                .frame(width: 36, height: 36)
                .background(RoundedRectangle(cornerRadius: 8).fill(isOAuth ? settings.tc : settings.tcLight))

            VStack(alignment: .leading, spacing: 2) {
                Text("Claude 账号登录").font(.system(size: 13, weight: .medium))
                Text("Pro / Team / Enterprise 订阅").font(.system(size: 10)).foregroundColor(.secondary)
            }
            Spacer()

            if isOAuth {
                Text("当前").font(.system(size: 10, weight: .medium)).foregroundColor(settings.tc)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Capsule().fill(settings.tcLight))
            } else {
                Button("切换") {
                    providerMgr.activateOAuth()
                    startLogin()
                }.buttonStyle(.bordered).controlSize(.small)
            }
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color(nsColor: .controlBackgroundColor)))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(isOAuth ? settings.tc.opacity(0.4) : Color.clear, lineWidth: 1.5))
    }

    private func providerCard(_ provider: APIProvider) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "key.fill")
                .font(.system(size: 14))
                .foregroundColor(provider.isActive ? .white : settings.tc)
                .frame(width: 36, height: 36)
                .background(RoundedRectangle(cornerRadius: 8).fill(provider.isActive ? settings.tc : settings.tcLight))

            VStack(alignment: .leading, spacing: 2) {
                Text(provider.name).font(.system(size: 13, weight: .medium))
                HStack(spacing: 6) {
                    if !provider.baseURL.isEmpty {
                        Text(provider.baseURL).font(.system(size: 9, design: .monospaced)).foregroundColor(.secondary).lineLimit(1)
                    }
                    if !provider.model.isEmpty {
                        Text(provider.model).font(.system(size: 9, design: .monospaced))
                            .padding(.horizontal, 4).padding(.vertical, 1)
                            .background(Capsule().fill(Color.primary.opacity(0.05)))
                            .foregroundColor(.secondary)
                    }
                }
            }
            Spacer()

            if provider.isActive {
                Text("启用中").font(.system(size: 10, weight: .medium)).foregroundColor(settings.tc)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Capsule().fill(settings.tcLight))
            } else {
                Button("启用") { providerMgr.activate(provider.id) }
                    .buttonStyle(.bordered).controlSize(.small)
            }

            Button(action: { providerMgr.removeProvider(provider.id) }) {
                Image(systemName: "trash").font(.system(size: 11)).foregroundColor(.secondary.opacity(0.4))
            }.buttonStyle(.plain)
        }
        .padding(14)
        .background(RoundedRectangle(cornerRadius: 12).fill(Color(nsColor: .controlBackgroundColor)))
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(provider.isActive ? settings.tc.opacity(0.4) : Color.clear, lineWidth: 1.5))
    }

    // MARK: - Step 4: 完成

    private var completeStep: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.seal.fill").font(.system(size: 56)).foregroundColor(.green)
            Text("一切就绪！").font(.system(size: 28, weight: .bold, design: .rounded))
            VStack(spacing: 8) {
                doneRow("Node.js", statusText(checker.nodeStatus))
                doneRow("Claude CLI", statusText(checker.claudeStatus))
                doneRow("API Provider", providerMgr.activeProvider?.name ?? "Claude 账号登录")
            }
            .padding(20)
            .background(RoundedRectangle(cornerRadius: 12).fill(Color(nsColor: .controlBackgroundColor)))
            Text("开始使用吧！").font(.system(size: 14)).foregroundColor(.secondary)
        }
    }

    private func doneRow(_ label: String, _ value: String) -> some View {
        HStack { Text(label).foregroundColor(.secondary).font(.system(size: 13)); Spacer()
            Text(value).font(.system(size: 13, weight: .medium, design: .monospaced)) }
    }

    private func statusText(_ s: DependencyStatus) -> String {
        switch s { case .installed(let v): return v; case .missing: return "未安装"; case .installing: return "安装中"
        case .installFailed: return "失败"; default: return "检查中" }
    }

    // MARK: - 底部导航

    private var bottomNav: some View {
        HStack {
            if currentStep != .welcome {
                Button("上一步") {
                    withAnimation(.spring(response: 0.3)) {
                        currentStep = SetupStep(rawValue: currentStep.rawValue - 1) ?? .welcome
                    }
                }.buttonStyle(.bordered)
            }
            Spacer()
            if currentStep == .complete {
                Button("开始使用") { setupCompleted = true }
                    .buttonStyle(.borderedProminent).tint(settings.tc).controlSize(.large)
            } else {
                Button("下一步") {
                    withAnimation(.spring(response: 0.3)) {
                        currentStep = SetupStep(rawValue: currentStep.rawValue + 1) ?? .complete
                    }
                }.buttonStyle(.borderedProminent).tint(settings.tc).disabled(!canProceed)
            }
        }
    }

    private var canProceed: Bool {
        switch currentStep {
        case .welcome: return true
        case .environment: return checker.allReady
        case .provider: return true
        case .complete: return true
        }
    }

    // MARK: - Login

    private func startLogin() {
        loginInProgress = true; loginOutput = "正在启动 claude login..."
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let candidates = ["\(home)/.local/bin/claude", "/usr/local/bin/claude", "/opt/homebrew/bin/claude"]
        let cp = candidates.first { FileManager.default.fileExists(atPath: $0) } ?? "\(home)/.local/bin/claude"

        Task {
            let proc = Process(); let pipe = Pipe()
            proc.executableURL = URL(fileURLWithPath: "/bin/zsh")
            proc.arguments = ["-l", "-c", "\(cp) login 2>&1"]
            proc.standardOutput = pipe; proc.standardError = pipe
            do {
                try proc.run(); proc.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                let output = String(data: data, encoding: .utf8) ?? ""
                await MainActor.run {
                    loginOutput = proc.terminationStatus == 0 ? "✅ 登录成功！" : "返回: \(output.prefix(200))"
                    loginInProgress = false
                }
            } catch {
                await MainActor.run { loginOutput = "启动失败: \(error.localizedDescription)"; loginInProgress = false }
            }
        }
    }
}

// MARK: - 添加 Provider 视图

struct AddProviderView: View {
    @ObservedObject var providerMgr: ProviderManager
    @Binding var isPresented: Bool
    @EnvironmentObject var settings: AppSettings

    @State private var name = ""
    @State private var apiKey = ""
    @State private var baseURL = ""
    @State private var model = ""
    @State private var smallModel = ""
    @State private var selectedPreset = -1
    @State private var showKey = false

    var body: some View {
        VStack(spacing: 16) {
            HStack {
                Text("添加 API Provider").font(.system(size: 15, weight: .semibold))
                Spacer()
                Button(action: { isPresented = false }) {
                    Image(systemName: "xmark").font(.system(size: 10, weight: .bold))
                        .foregroundColor(.secondary.opacity(0.5)).frame(width: 24, height: 24)
                        .background(Circle().fill(Color.secondary.opacity(0.1)))
                }.buttonStyle(.plain)
            }

            // 预设快选
            Text("快速选择预设").font(.system(size: 11)).foregroundColor(.secondary).frame(maxWidth: .infinity, alignment: .leading)
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(Array(APIProvider.presets.enumerated()), id: \.offset) { idx, preset in
                        if preset.apiKey != "OAUTH" {
                            Button(action: { applyPreset(idx) }) {
                                Text(preset.name)
                                    .font(.system(size: 11, weight: selectedPreset == idx ? .medium : .regular))
                                    .foregroundColor(selectedPreset == idx ? .white : .primary)
                                    .padding(.horizontal, 10).padding(.vertical, 5)
                                    .background(Capsule().fill(selectedPreset == idx ? settings.tc : Color.primary.opacity(0.05)))
                            }.buttonStyle(.plain)
                        }
                    }
                }
            }

            Divider()

            field("名称", text: $name, placeholder: "我的 Provider")
            field("Base URL", text: $baseURL, placeholder: "https://api.example.com/v1", mono: true)

            VStack(alignment: .leading, spacing: 4) {
                Text("API Key").font(.system(size: 11, weight: .medium)).foregroundColor(.secondary)
                HStack {
                    if showKey {
                        TextField("sk-...", text: $apiKey).font(.system(size: 12, design: .monospaced)).textFieldStyle(.roundedBorder)
                    } else {
                        SecureField("sk-...", text: $apiKey).font(.system(size: 12, design: .monospaced)).textFieldStyle(.roundedBorder)
                    }
                    Button(action: { showKey.toggle() }) {
                        Image(systemName: showKey ? "eye.slash" : "eye").font(.system(size: 12))
                    }.buttonStyle(.borderless)
                }
            }

            HStack(spacing: 12) {
                field("模型", text: $model, placeholder: "claude-sonnet-4-20250514", mono: true)
                field("小模型（可选）", text: $smallModel, placeholder: "haiku", mono: true)
            }

            Divider()

            HStack {
                Button("取消") { isPresented = false }.keyboardShortcut(.cancelAction)
                Spacer()
                Button("添加并启用") { addAndActivate() }
                    .buttonStyle(.borderedProminent).tint(settings.tc)
                    .disabled(name.isEmpty || apiKey.isEmpty)
                    .keyboardShortcut(.defaultAction)
            }
        }
        .padding(24).frame(width: 480)
    }

    private func field(_ label: String, text: Binding<String>, placeholder: String, mono: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label).font(.system(size: 11, weight: .medium)).foregroundColor(.secondary)
            TextField(placeholder, text: text)
                .font(.system(size: 12, design: mono ? .monospaced : .default))
                .textFieldStyle(.roundedBorder)
        }
    }

    private func applyPreset(_ idx: Int) {
        selectedPreset = idx
        let p = APIProvider.presets[idx]
        name = p.name; baseURL = p.baseURL; model = p.model; smallModel = p.smallModel
    }

    private func addAndActivate() {
        let p = APIProvider(name: name, apiKey: apiKey, baseURL: baseURL, model: model, smallModel: smallModel)
        providerMgr.addProvider(p)
        if let added = providerMgr.providers.last { providerMgr.activate(added.id) }
        isPresented = false
    }
}
