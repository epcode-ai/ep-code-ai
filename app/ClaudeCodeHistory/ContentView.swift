import SwiftUI

struct ContentView: View {
    @EnvironmentObject var store: ConversationStore
    @EnvironmentObject var favorites: FavoritesManager
    @EnvironmentObject var processManager: ClaudeProcessManager
    @EnvironmentObject var settings: AppSettings
    @StateObject private var artifactMgr = ArtifactManager.shared

    var body: some View {
        NavigationSplitView {
            SidebarView()
                .navigationSplitViewColumnWidth(min: 260, ideal: 290, max: 340)
                .toolbar {
                    ToolbarItem(placement: .automatic) { Spacer() }
                }
        } detail: {
            HStack(spacing: 0) {
                // 对话区域
                ChatView()
                    .frame(maxWidth: .infinity)

                // Artifact 面板（右侧分屏）
                if artifactMgr.isPanelVisible {
                    Divider()

                    ArtifactPanel(manager: artifactMgr)
                        .frame(minWidth: 320, idealWidth: 420, maxWidth: 600)
                        .transition(.move(edge: .trailing).combined(with: .opacity))
                }
            }
            .animation(.spring(response: 0.3), value: artifactMgr.isPanelVisible)
            .toolbar {
                ToolbarItemGroup(placement: .automatic) {
                    Spacer()

                    // Artifact 面板切换
                    Button(action: {
                        withAnimation { artifactMgr.isPanelVisible.toggle() }
                    }) {
                        Image(systemName: "rectangle.righthalf.inset.filled")
                            .foregroundColor(artifactMgr.isPanelVisible ? settings.tc : .secondary)
                    }
                    .help("显示/隐藏 Artifact 面板")
                    .disabled(artifactMgr.artifacts.isEmpty)

                    Button(action: { store.showFavoritesOnly.toggle() }) {
                        Image(systemName: store.showFavoritesOnly ? "star.fill" : "star")
                            .foregroundColor(store.showFavoritesOnly ? .yellow : .secondary)
                    }
                    Button(action: { store.reload() }) {
                        Image(systemName: "arrow.clockwise")
                    }
                }
            }
        }
        .environmentObject(artifactMgr)
    }
}
