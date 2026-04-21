import SwiftUI

/// 设置页 · 4 tab(按 Sprint 6 UI 设计稿)
///
/// 布局:
///   - 左侧导航条(180px)
///   - 右侧内容区(flex)
///
/// 四个 tab:
///   1. 通用 — 外观 / 数据 / 运行环境(合并原"外观" + "数据")
///   2. 供应商 — 原"认证" 改名
///   3. 快捷键 — 新增(只读展示)
///   4. 实验性 — 新增(beta feature flags)
struct SettingsView: View {
    @ObservedObject var settings = AppSettings.shared
    @StateObject private var checker = EnvironmentChecker.shared
    @Environment(\.dismiss) var dismiss

    @State private var selectedTab: SettingsTab = .general

    enum SettingsTab: String, CaseIterable, Identifiable {
        case general = "通用"
        case provider = "供应商"
        case shortcuts = "快捷键"
        case experimental = "实验性"
        var id: String { rawValue }

        var iconName: String {
            switch self {
            case .general: return "gear"
            case .provider: return "key.fill"
            case .shortcuts: return "command.square"
            case .experimental: return "flask"
            }
        }

        var badge: String? {
            self == .experimental ? "⚗" : nil
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            HStack(spacing: 0) {
                sideNav.frame(width: 180)
                Divider()
                ScrollView {
                    content
                        .padding(24)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
            }
        }
        .frame(width: 720, height: 560)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    // ─── 顶部标题栏 ───
    private var header: some View {
        HStack {
            Text("设置").font(.system(size: 18, weight: .semibold))
            Spacer()
            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.secondary.opacity(0.6))
                    .frame(width: 24, height: 24)
                    .background(Circle().fill(Color.secondary.opacity(0.1)))
            }.buttonStyle(.plain)
        }
        .padding(.horizontal, 20).padding(.vertical, 14)
    }

    // ─── 左侧导航 ───
    private var sideNav: some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(SettingsTab.allCases) { tab in navItem(for: tab) }
            Spacer()
        }
        .padding(.vertical, 12)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.secondary.opacity(0.04))
    }

    private func navItem(for tab: SettingsTab) -> some View {
        let isSelected = selectedTab == tab
        return Button(action: { withAnimation(.easeInOut(duration: 0.15)) { selectedTab = tab } }) {
            HStack(spacing: 10) {
                Image(systemName: tab.iconName).font(.system(size: 12)).frame(width: 16)
                Text(tab.rawValue).font(.system(size: 13, weight: isSelected ? .semibold : .regular))
                if let badge = tab.badge { Text(badge).font(.system(size: 10)) }
                Spacer()
            }
            .foregroundColor(isSelected ? settings.tc : .primary)
            .padding(.horizontal, 14).padding(.vertical, 7)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(isSelected ? settings.tcLight : Color.clear)
                    .padding(.horizontal, 8)
            )
            .overlay(
                Rectangle()
                    .fill(isSelected ? settings.tc : Color.clear)
                    .frame(width: 3),
                alignment: .leading
            )
        }.buttonStyle(.plain)
    }

    // ─── 右侧内容 ───
    @ViewBuilder
    private var content: some View {
        switch selectedTab {
        case .general: generalTab
        case .provider: providerTab
        case .shortcuts: shortcutsTab
        case .experimental: experimentalTab
        }
    }

    // MARK: - 通用 tab

    private var generalTab: some View {
        VStack(alignment: .leading, spacing: 24) {
            section("外观") {
                row("主题色") {
                    HStack(spacing: 10) {
                        ForEach(AppThemeColor.allCases) { theme in
                            Button(action: { settings.themeColor = theme }) {
                                Circle().fill(theme.color).frame(width: 26, height: 26)
                                    .overlay(
                                        Circle()
                                            .strokeBorder(settings.themeColor == theme ? Color.primary : Color.clear, lineWidth: 2)
                                            .frame(width: 32, height: 32)
                                    )
                            }.buttonStyle(.plain).help(theme.rawValue)
                        }
                    }
                }
                row("侧边栏字号") {
                    HStack(spacing: 8) {
                        Text("A").font(.system(size: 10))
                        Slider(value: $settings.sidebarFontSize, in: 11...18, step: 0.5)
                            .frame(width: 140).tint(settings.tc)
                        Text("A").font(.system(size: 16))
                        Text(String(format: "%.0f", settings.sidebarFontSize))
                            .font(.system(size: 11, design: .monospaced))
                            .foregroundColor(settings.tc).frame(width: 20, alignment: .trailing)
                    }
                }
            }

            section("数据") {
                VStack(alignment: .leading, spacing: 10) {
                    HStack(spacing: 8) {
                        Image(systemName: "folder.fill").foregroundColor(settings.tc)
                        TextField("默认: ~/.claude/projects", text: $settings.customDataPath)
                            .textFieldStyle(.roundedBorder).font(.system(size: 12))
                        Button("浏览...") {
                            let panel = NSOpenPanel()
                            panel.canChooseDirectories = true
                            panel.canChooseFiles = false
                            if panel.runModal() == .OK, let url = panel.url {
                                settings.customDataPath = url.path
                            }
                        }.font(.system(size: 11))
                    }
                    HStack(spacing: 4) {
                        Image(systemName: "info.circle").font(.system(size: 10))
                        Text("当前: \(settings.effectiveDataPath)")
                            .font(.system(size: 10)).lineLimit(1).truncationMode(.middle)
                    }
                    .foregroundColor(.secondary).padding(.leading, 24)
                    if !settings.customDataPath.isEmpty {
                        Button(action: { settings.customDataPath = "" }) {
                            HStack(spacing: 4) {
                                Image(systemName: "arrow.uturn.backward")
                                Text("恢复默认路径")
                            }
                            .font(.system(size: 11)).foregroundColor(settings.tc)
                        }.buttonStyle(.plain).padding(.leading, 24)
                    }
                }
                row("历史保留") {
                    Picker("", selection: $settings.historyRetentionDays) {
                        Text("全部").tag(0)
                        Divider()
                        Text("最近 7 天").tag(7)
                        Text("最近 30 天").tag(30)
                        Text("最近 90 天").tag(90)
                        Text("最近 1 年").tag(365)
                    }.labelsHidden().frame(width: 160)
                }
            }

            section("运行环境") {
                envRow("Node.js", checker.nodeStatus)
                envRow("Claude Code CLI", checker.claudeStatus)
                HStack {
                    Spacer()
                    Button("重新检查") { Task { await checker.checkAll() } }
                        .buttonStyle(.bordered).controlSize(.small)
                    Button("重新运行引导") {
                        UserDefaults.standard.set(false, forKey: "setupCompleted")
                    }.buttonStyle(.bordered).controlSize(.small)
                }
            }
        }
        .onAppear { Task { await checker.checkAll() } }
    }

    // MARK: - 供应商 tab

    @StateObject private var providerMgr = ProviderManager.shared
    @State private var showAddProvider = false

    private var providerTab: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                let oauthCount = providerMgr.activeProvider == nil ? 1 : 0
                Text("已配置的供应商 (\(providerMgr.providers.count + oauthCount))")
                    .font(.system(size: 12)).foregroundColor(.secondary)
                Spacer()
                Button(action: { showAddProvider = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus").font(.system(size: 10, weight: .bold))
                        Text("添加供应商").font(.system(size: 11, weight: .medium))
                    }
                    .padding(.horizontal, 10).padding(.vertical, 5)
                    .background(Capsule().fill(settings.tc))
                    .foregroundColor(.white)
                }.buttonStyle(.plain)
            }

            // OAuth(Claude 官方)
            providerCard(
                title: "Claude 官方账号(OAuth)",
                subtitle: "通过 claude login 命令登录",
                icon: "person.crop.circle",
                isActive: providerMgr.activeProvider == nil,
                isOAuth: true,
                providerId: nil
            )

            ForEach(providerMgr.providers) { p in
                providerCard(
                    title: p.name,
                    subtitle: p.baseURL.isEmpty ? "API Key 方式" : p.baseURL,
                    icon: "key.fill",
                    isActive: p.isActive,
                    isOAuth: false,
                    providerId: p.id
                )
            }
        }
        .onAppear { providerMgr.detectCurrentProvider() }
        .sheet(isPresented: $showAddProvider) {
            AddProviderView(providerMgr: providerMgr, isPresented: $showAddProvider)
                .environmentObject(settings)
        }
    }

    @ViewBuilder
    private func providerCard(title: String, subtitle: String, icon: String, isActive: Bool, isOAuth: Bool, providerId: String?) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon).font(.system(size: 16))
                .foregroundColor(settings.tc)
                .frame(width: 28, height: 28)
                .background(Circle().fill(settings.tcLight))

            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 13, weight: .semibold))
                Text(subtitle).font(.system(size: 11, design: .monospaced))
                    .foregroundColor(.secondary).lineLimit(1)
            }
            Spacer()

            if isActive {
                Label("当前使用", systemImage: "checkmark.circle.fill")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.green)
                    .padding(.horizontal, 8).padding(.vertical, 3)
                    .background(Capsule().fill(Color.green.opacity(0.1)))
            } else if isOAuth {
                Button("登录") {
                    let home = FileManager.default.homeDirectoryForCurrentUser.path
                    runInExternalTerminal("\(home)/.local/bin/claude login")
                }.buttonStyle(.bordered).controlSize(.small)
            } else if let id = providerId {
                Button("启用") { providerMgr.activate(id) }
                    .buttonStyle(.bordered).controlSize(.small)
            }

            if let id = providerId {
                Button(action: { providerMgr.removeProvider(id) }) {
                    Image(systemName: "trash")
                        .font(.system(size: 11)).foregroundColor(.secondary.opacity(0.5))
                }.buttonStyle(.plain)
            }
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.04)))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(isActive ? settings.tc : Color.secondary.opacity(0.1),
                              lineWidth: isActive ? 1.5 : 0.5)
        )
    }

    private func envRow(_ name: String, _ status: DependencyStatus) -> some View {
        HStack {
            Text(name).font(.system(size: 12))
            Spacer()
            switch status {
            case .checking: ProgressView().controlSize(.mini)
            case .installed(let ver):
                HStack(spacing: 4) {
                    Image(systemName: "checkmark.circle.fill").foregroundColor(.green)
                    Text(ver).font(.system(size: 11, design: .monospaced)).foregroundColor(.secondary)
                }
            case .missing:
                Label("未安装", systemImage: "xmark.circle.fill")
                    .foregroundColor(.red).font(.system(size: 11))
            case .installing:
                HStack(spacing: 4) {
                    ProgressView().controlSize(.mini)
                    Text("安装中").font(.caption).foregroundColor(.secondary)
                }
            case .installFailed(let msg):
                Label("失败", systemImage: "exclamationmark.triangle.fill")
                    .foregroundColor(.orange).font(.system(size: 11)).help(msg)
            }
        }
    }

    // MARK: - 快捷键 tab

    private var shortcutsTab: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 6) {
                Image(systemName: "info.circle").font(.system(size: 11))
                Text("快捷键当前为只读,编辑功能规划在 Sprint 8+")
                    .font(.system(size: 11))
            }
            .foregroundColor(.secondary)
            .padding(8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 6).fill(Color.secondary.opacity(0.06)))

            section("会话") {
                shortcutRow("新建对话", "⌘N")
                shortcutRow("刷新列表", "⌘R")
                shortcutRow("关闭窗口", "⌘W")
            }
            section("导航") {
                shortcutRow("设置", "⌘,")
                shortcutRow("切换收藏过滤", "⌘⇧F")
                shortcutRow("停止运行", "⌘.")
            }
            section("输入") {
                shortcutRow("命令面板", "/")
                shortcutRow("发送消息", "⌘↵")
                shortcutRow("换行", "⇧↵")
            }
        }
    }

    private func shortcutRow(_ label: String, _ keys: String) -> some View {
        HStack {
            Text(label).font(.system(size: 12))
            Spacer()
            Text(keys)
                .font(.system(size: 11, design: .monospaced))
                .padding(.horizontal, 8).padding(.vertical, 2)
                .background(RoundedRectangle(cornerRadius: 4).fill(Color.secondary.opacity(0.12)))
        }
    }

    // MARK: - 实验性 tab

    @AppStorage("experimentalFeatures.fuzzyCommand") private var expFuzzyCommand: Bool = true
    @AppStorage("experimentalFeatures.longContext") private var expLongContext: Bool = false
    @AppStorage("experimentalFeatures.multimodal") private var expMultimodal: Bool = false
    @AppStorage("experimentalFeatures.debugPanel") private var expDebugPanel: Bool = false

    private var experimentalTab: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 6) {
                Text("⚠️").font(.system(size: 12))
                Text("以下功能不稳定,启用前请知悉风险")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.orange)
            }
            .padding(8)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(RoundedRectangle(cornerRadius: 6).fill(Color.orange.opacity(0.08)))

            experimentalToggle(title: "命令面板模糊搜索",
                               description: "beta · 已开启,如有问题可关",
                               isOn: $expFuzzyCommand)
            experimentalToggle(title: "AI 长上下文优化(256k → 1M)",
                               description: "beta · 可能更慢、更贵",
                               isOn: $expLongContext)
            experimentalToggle(title: "多模态输入(图片 / PDF)",
                               description: "alpha · 部分供应商不支持",
                               isOn: $expMultimodal)
            experimentalToggle(title: "调试面板(F12)",
                               description: "开发者用",
                               isOn: $expDebugPanel)
        }
    }

    private func experimentalToggle(title: String, description: String, isOn: Binding<Bool>) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.system(size: 13, weight: .medium))
                Text(description).font(.system(size: 11)).foregroundColor(.secondary)
            }
            Spacer()
            Toggle("", isOn: isOn).labelsHidden()
        }
        .padding(12)
        .background(RoundedRectangle(cornerRadius: 8).fill(Color.secondary.opacity(0.04)))
    }

    // MARK: - 通用组件

    private func section<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(.secondary)
                .textCase(.uppercase)
                .tracking(0.5)
            VStack(alignment: .leading, spacing: 10) { content() }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.04)))
                .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Color.secondary.opacity(0.08), lineWidth: 0.5))
        }
    }

    private func row<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        HStack {
            Text(label).font(.system(size: 13))
            Spacer()
            content()
        }
    }
}
