import SwiftUI

/// 主视图三栏布局(S7.1.1 改造)
///
/// 结构:
///   - NavigationSplitView · 原生左侧栏(会话列表)
///   - detail: 中栏(ChatView)+ 右栏(ArtifactPanel,有产出物时)
///   - toolbar 顶栏: 项目切换器 · 场景导航(业务/开发/测试/运维)· 用户头像
///
/// 说明:项目切换器 / 场景导航 当前为 placeholder(点击显示"敬请期待"),
/// 真实 ProjectStore 在 S7.3 实现,场景工作流在 S7.4 实现。
struct ContentView: View {
    @EnvironmentObject var store: ConversationStore
    @EnvironmentObject var favorites: FavoritesManager
    @EnvironmentObject var processManager: ClaudeProcessManager
    @EnvironmentObject var settings: AppSettings
    @StateObject private var artifactMgr = ArtifactManager.shared

    @State private var showComingSoon = false
    @State private var comingSoonMessage = ""

    var body: some View {
        NavigationSplitView {
            SidebarView()
                .navigationSplitViewColumnWidth(min: 260, ideal: 290, max: 340)
        } detail: {
            HStack(spacing: 0) {
                ChatView().frame(maxWidth: .infinity)

                if artifactMgr.isPanelVisible {
                    Divider()
                    ArtifactPanel(manager: artifactMgr)
                        .frame(minWidth: 320, idealWidth: 420, maxWidth: 600)
                        .transition(.move(edge: .trailing).combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.3), value: artifactMgr.isPanelVisible)
            .toolbar {
                // 左侧:项目切换器 + 场景导航
                ToolbarItemGroup(placement: .navigation) {
                    projectSwitcher
                    scenarioNav
                }

                // 右侧:Artifact / 收藏 / 刷新 / 用户菜单
                ToolbarItemGroup(placement: .automatic) {
                    Spacer()

                    Button(action: {
                        withAnimation { artifactMgr.isPanelVisible.toggle() }
                    }) {
                        Image(systemName: "rectangle.righthalf.inset.filled")
                            .foregroundColor(artifactMgr.isPanelVisible ? settings.tc : .secondary)
                    }
                    .help("显示/隐藏 产出物面板")
                    .disabled(artifactMgr.artifacts.isEmpty)

                    Button(action: { store.showFavoritesOnly.toggle() }) {
                        Image(systemName: store.showFavoritesOnly ? "star.fill" : "star")
                            .foregroundColor(store.showFavoritesOnly ? .yellow : .secondary)
                    }.help("收藏过滤 ⌘⇧F")

                    Button(action: { store.reload() }) {
                        Image(systemName: "arrow.clockwise")
                    }.help("刷新 ⌘R")

                    userChip
                }
            }
        }
        .environmentObject(artifactMgr)
        .alert("敬请期待", isPresented: $showComingSoon) {
            Button("好的", role: .cancel) {}
        } message: {
            Text(comingSoonMessage)
        }
    }

    // MARK: - 顶栏组件

    /// 项目切换器(占位 · 真实 ProjectStore 在 S7.3 实现)
    private var projectSwitcher: some View {
        Button(action: {
            comingSoonMessage = "项目列表 / 切换在 Sprint 7.3 实现。届时这里可切换多项目,每个项目带接入模式徽章。"
            showComingSoon = true
        }) {
            HStack(spacing: 6) {
                Text("🚀").font(.system(size: 12))
                Text("默认项目")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.primary)
                modeBadge(letter: "A", name: "绿地", tint: .green)
                Image(systemName: "chevron.down")
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(RoundedRectangle(cornerRadius: 6).fill(Color.secondary.opacity(0.06)))
            .overlay(
                RoundedRectangle(cornerRadius: 6)
                    .strokeBorder(Color.secondary.opacity(0.12), lineWidth: 0.5)
            )
        }.buttonStyle(.plain)
    }

    /// 场景导航 · 业务 / 开发 / 测试 / 运维
    private var scenarioNav: some View {
        HStack(spacing: 12) {
            scenarioLink(icon: "💼", name: "业务", message: "业务场景工作流在 Sprint 7.4 实现")
            scenarioLink(icon: "💻", name: "开发", message: "开发场景工作流在 Sprint 7.4 实现")
            scenarioLink(icon: "🧪", name: "测试", message: "测试场景工作流在 Sprint 7.4 实现")
            scenarioLink(icon: "🚀", name: "运维", message: "运维场景工作流在 Sprint 7.4 实现")
        }
        .padding(.leading, 8)
    }

    private func scenarioLink(icon: String, name: String, message: String) -> some View {
        Button(action: {
            comingSoonMessage = message
            showComingSoon = true
        }) {
            HStack(spacing: 4) {
                Text(icon).font(.system(size: 12))
                Text(name).font(.system(size: 12, weight: .medium))
            }
            .foregroundColor(.secondary)
        }.buttonStyle(.plain)
    }

    /// 模式徽章(A/B/C/D,4 种接入模式)
    private func modeBadge(letter: String, name: String, tint: Color) -> some View {
        Text("\(letter) · \(name)")
            .font(.system(size: 9, weight: .bold))
            .foregroundColor(tint)
            .padding(.horizontal, 5).padding(.vertical, 1)
            .background(Capsule().fill(tint.opacity(0.12)))
            .overlay(Capsule().strokeBorder(tint.opacity(0.4), lineWidth: 0.5))
    }

    /// 用户头像 chip · 点击弹菜单
    private var userChip: some View {
        Menu {
            Section("张工") {
                Text("产品 · 基础架构组")
                Text("zhang.san@company.com")
            }
            Divider()
            Button(action: {
                comingSoonMessage = "用户资料编辑在 Sprint 8 实现"
                showComingSoon = true
            }) {
                Label("我的资料", systemImage: "person.crop.circle")
            }
            Button(action: {
                comingSoonMessage = "切换角色 ⌘⇧R 在 Sprint 7.4 实现"
                showComingSoon = true
            }) {
                Label("切换角色 ⌘⇧R", systemImage: "person.2")
            }
            Button(action: {
                comingSoonMessage = "使用统计在 Sprint 8 实现"
                showComingSoon = true
            }) {
                Label("我的使用统计", systemImage: "chart.bar")
            }
            Divider()
            Button(action: {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }) {
                Label("设置 ⌘,", systemImage: "gearshape")
            }
            Divider()
            Button(role: .destructive, action: {
                comingSoonMessage = "退出登录在 Sprint 7.3 实现(LoginView 就位后)"
                showComingSoon = true
            }) {
                Label("退出登录", systemImage: "rectangle.portrait.and.arrow.right")
            }
        } label: {
            HStack(spacing: 4) {
                Circle()
                    .fill(settings.tc)
                    .frame(width: 22, height: 22)
                    .overlay(
                        Text("张")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.white)
                    )
                Text("张工").font(.system(size: 11, weight: .medium))
            }
        }
        .menuStyle(.borderlessButton)
        .menuIndicator(.hidden)
        .fixedSize()
    }
}
