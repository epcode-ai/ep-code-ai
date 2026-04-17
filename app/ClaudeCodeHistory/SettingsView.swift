import SwiftUI

struct SettingsView: View {
    @ObservedObject var settings = AppSettings.shared
    @StateObject private var checker = EnvironmentChecker.shared   // v4
    @Environment(\.dismiss) var dismiss
    @State private var selectedTab = 0

    // v4: 新增"认证"tab
    private let tabs = [
        ("paintbrush", "外观"),
        ("folder", "数据"),
        ("key", "认证"),       // v4 新增
    ]

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                HStack(spacing: 2) {
                    ForEach(0..<tabs.count, id: \.self) { i in
                        Button(action: { withAnimation(.easeInOut(duration: 0.2)) { selectedTab = i } }) {
                            HStack(spacing: 5) {
                                Image(systemName: tabs[i].0).font(.system(size: 11, weight: .medium))
                                Text(tabs[i].1).font(.system(size: 12, weight: .medium))
                            }
                            .foregroundColor(selectedTab == i ? .white : .secondary)
                            .padding(.horizontal, 14).padding(.vertical, 6)
                            .background(selectedTab == i ? Capsule().fill(settings.tc) : Capsule().fill(Color.clear))
                        }.buttonStyle(.plain)
                    }
                }
                .padding(3).background(Capsule().fill(Color.secondary.opacity(0.1)))

                HStack {
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark").font(.system(size: 10, weight: .bold))
                            .foregroundColor(.secondary.opacity(0.5))
                            .frame(width: 24, height: 24)
                            .background(Circle().fill(Color.secondary.opacity(0.1)))
                    }.buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 24).padding(.top, 20).padding(.bottom, 16)
            Divider().padding(.horizontal, 20)

            Group {
                switch selectedTab {
                case 0: appearanceTab
                case 1: dataTab
                case 2: authTab       // v4 新增
                default: EmptyView()
                }
            }
            .padding(.horizontal, 24).padding(.vertical, 20)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        }
        .frame(width: 520, height: 480)   // v4: 稍微加高以容纳新tab内容
        .background(Color(nsColor: .windowBackgroundColor))
    }

    // ─── 外观（保持 v3 不变）───
    private var appearanceTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            settingsSection("主题色") {
                HStack(spacing: 12) {
                    ForEach(AppThemeColor.allCases) { theme in
                        Button(action: { settings.themeColor = theme }) {
                            VStack(spacing: 6) {
                                Circle().fill(theme.color).frame(width: 32, height: 32)
                                    .overlay(Circle().strokeBorder(Color.white, lineWidth: settings.themeColor == theme ? 2 : 0))
                                    .overlay(Circle().strokeBorder(settings.themeColor == theme ? theme.color : Color.clear, lineWidth: 3).frame(width: 40, height: 40))
                                Text(theme.rawValue).font(.system(size: 10))
                                    .foregroundColor(settings.themeColor == theme ? theme.color : .secondary)
                            }
                        }.buttonStyle(.plain)
                    }
                }
            }
            settingsSection("侧边栏") {
                settingsRow("对话列表字号") {
                    HStack(spacing: 10) {
                        Text("A").font(.system(size: 10)).foregroundColor(.secondary)
                        Slider(value: $settings.sidebarFontSize, in: 11...18, step: 0.5).frame(width: 140).tint(settings.tc)
                        Text("A").font(.system(size: 16)).foregroundColor(.secondary)
                        Text(String(format: "%.0f", settings.sidebarFontSize))
                            .font(.system(size: 12, design: .monospaced)).foregroundColor(settings.tc).frame(width: 24, alignment: .trailing)
                    }
                }
            }
        }
    }

    // ─── 数据（保持 v3 不变）───
    private var dataTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            settingsSection("数据目录") {
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 8) {
                        Image(systemName: "folder.fill").foregroundColor(settings.tc).frame(width: 20)
                        TextField("默认: ~/.claude/projects", text: $settings.customDataPath)
                            .textFieldStyle(.roundedBorder).font(.system(size: 12))
                        Button("浏览...") {
                            let panel = NSOpenPanel(); panel.canChooseDirectories = true; panel.canChooseFiles = false
                            if panel.runModal() == .OK, let url = panel.url { settings.customDataPath = url.path }
                        }.font(.system(size: 12))
                    }
                    HStack(spacing: 4) {
                        Image(systemName: "info.circle").font(.system(size: 10)).foregroundColor(.secondary.opacity(0.5))
                        Text("当前: \(settings.effectiveDataPath)")
                            .font(.system(size: 10)).foregroundColor(.secondary.opacity(0.5)).lineLimit(1).truncationMode(.middle)
                    }.padding(.leading, 28)
                    if !settings.customDataPath.isEmpty {
                        Button(action: { settings.customDataPath = "" }) {
                            HStack(spacing: 4) { Image(systemName: "arrow.uturn.backward"); Text("恢复默认路径") }
                                .font(.system(size: 11)).foregroundColor(settings.tc)
                        }.buttonStyle(.plain).padding(.leading, 28)
                    }
                }
            }
            settingsSection("历史保留") {
                settingsRow("显示范围") {
                    Picker("", selection: $settings.historyRetentionDays) {
                        Text("全部").tag(0); Divider()
                        Text("最近 7 天").tag(7); Text("最近 30 天").tag(30)
                        Text("最近 90 天").tag(90); Text("最近 1 年").tag(365)
                    }.labelsHidden().frame(width: 160)
                }
            }
        }
    }

    // ─── v4 新增：Provider tab ───
    @StateObject private var providerMgr = ProviderManager.shared
    @AppStorage("setupCompleted") private var setupCompleted = false
    @State private var showAddProvider = false

    private var authTab: some View {
        VStack(alignment: .leading, spacing: 20) {
            // 当前 Provider
            settingsSection("API Provider") {
                // OAuth
                HStack(spacing: 10) {
                    Image(systemName: "person.crop.circle").font(.system(size: 14)).foregroundColor(settings.tc)
                    Text("Claude 账号登录").font(.system(size: 12))
                    Spacer()
                    if providerMgr.activeProvider == nil {
                        Text("当前").font(.system(size: 10, weight: .medium)).foregroundColor(settings.tc)
                            .padding(.horizontal, 7).padding(.vertical, 2)
                            .background(Capsule().fill(settings.tcLight))
                    } else {
                        Button("切换") { providerMgr.activateOAuth() }.buttonStyle(.bordered).controlSize(.mini)
                    }
                    Button("登录") {
                        let home = FileManager.default.homeDirectoryForCurrentUser.path
                        runInExternalTerminal("\(home)/.local/bin/claude login")
                    }.buttonStyle(.bordered).controlSize(.mini)
                }

                Divider()

                // Provider 列表
                ForEach(providerMgr.providers) { p in
                    HStack(spacing: 10) {
                        Image(systemName: "key.fill").font(.system(size: 12)).foregroundColor(settings.tc)
                        VStack(alignment: .leading, spacing: 1) {
                            Text(p.name).font(.system(size: 12, weight: .medium))
                            if !p.baseURL.isEmpty {
                                Text(p.baseURL).font(.system(size: 9, design: .monospaced)).foregroundColor(.secondary).lineLimit(1)
                            }
                        }
                        Spacer()
                        if p.isActive {
                            Text("启用中").font(.system(size: 10, weight: .medium)).foregroundColor(settings.tc)
                                .padding(.horizontal, 7).padding(.vertical, 2)
                                .background(Capsule().fill(settings.tcLight))
                        } else {
                            Button("启用") { providerMgr.activate(p.id) }.buttonStyle(.bordered).controlSize(.mini)
                        }
                        Button(action: { providerMgr.removeProvider(p.id) }) {
                            Image(systemName: "trash").font(.system(size: 10)).foregroundColor(.secondary.opacity(0.4))
                        }.buttonStyle(.plain)
                    }
                }

                Button(action: { showAddProvider = true }) {
                    HStack(spacing: 4) {
                        Image(systemName: "plus.circle.fill").font(.system(size: 11))
                        Text("添加 Provider").font(.system(size: 11, weight: .medium))
                    }.foregroundColor(settings.tc)
                }.buttonStyle(.plain)
            }

            // 环境状态
            settingsSection("运行环境") {
                envRow("Node.js", checker.nodeStatus)
                envRow("Claude Code CLI", checker.claudeStatus)
                HStack {
                    Spacer()
                    Button("重新检查") { Task { await checker.checkAll() } }.buttonStyle(.bordered).controlSize(.small)
                    Button("重新运行引导") { setupCompleted = false }.buttonStyle(.bordered).controlSize(.small)
                }
            }
        }
        .onAppear {
            Task { await checker.checkAll() }
            providerMgr.detectCurrentProvider()
        }
        .sheet(isPresented: $showAddProvider) {
            AddProviderView(providerMgr: providerMgr, isPresented: $showAddProvider)
                .environmentObject(settings)
        }
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
            case .missing: Label("未安装", systemImage: "xmark.circle.fill").foregroundColor(.red).font(.system(size: 11))
            case .installing:
                HStack(spacing: 4) { ProgressView().controlSize(.mini); Text("安装中").font(.caption).foregroundColor(.secondary) }
            case .installFailed(let msg):
                Label("失败", systemImage: "exclamationmark.triangle.fill").foregroundColor(.orange).font(.system(size: 11)).help(msg)
            }
        }
    }

    // ─── 通用组件（保持 v3 不变）───
    private func settingsSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title).font(.system(size: 12, weight: .semibold)).foregroundColor(settings.tc).textCase(.uppercase).tracking(0.5)
            VStack(alignment: .leading, spacing: 10) { content() }
                .padding(14).frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 10).fill(Color.secondary.opacity(0.04)))
                .overlay(RoundedRectangle(cornerRadius: 10).strokeBorder(Color.secondary.opacity(0.08), lineWidth: 0.5))
        }
    }

    private func settingsRow<Content: View>(_ label: String, @ViewBuilder content: () -> Content) -> some View {
        HStack { Text(label).font(.system(size: 13)); Spacer(); content() }
    }
}
