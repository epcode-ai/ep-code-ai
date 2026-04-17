import SwiftUI

@main
struct ClaudeCodeHistoryApp: App {
    @StateObject private var store = ConversationStore()
    @StateObject private var favorites = FavoritesManager.shared
    @StateObject private var settings = AppSettings.shared
    @StateObject private var processManager = ClaudeProcessManager()
    @StateObject private var ehub = EHUBManager.shared       // v4 新增
    @State private var fileWatcher: FileWatcher?
    @AppStorage("setupCompleted") private var setupCompleted = false  // v4 新增

    var body: some Scene {
        WindowGroup {
            Group {
                if setupCompleted {
                    ContentView()
                        .environmentObject(store)
                        .environmentObject(favorites)
                        .environmentObject(settings)
                        .environmentObject(processManager)
                        .environmentObject(ehub)               // v4 新增
                        .tint(AppSettings.shared.themeColor.color)
                        .frame(minWidth: 900, minHeight: 600)
                        .onAppear {
                            store.reload()
                            fileWatcher = FileWatcher(path: AppSettings.shared.effectiveDataPath) {
                                store.reload()
                            }
                        }
                } else {
                    // v4 新增：首次引导
                    SetupWizardView()
                        .environmentObject(settings)
                        .tint(AppSettings.shared.themeColor.color)
                }
            }
        }
        .windowStyle(.titleBar)
        .defaultSize(width: 1200, height: 800)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("新建对话") { processManager.startNewChat() }
                    .keyboardShortcut("n", modifiers: .command)
            }
            CommandGroup(after: .toolbar) {
                Button("刷新列表") { store.reload() }.keyboardShortcut("r", modifiers: .command)
                Button("切换收藏") { store.showFavoritesOnly.toggle() }.keyboardShortcut("f", modifiers: [.command, .shift])
                Divider()
                Button("停止") { processManager.stop() }.keyboardShortcut(".", modifiers: .command).disabled(!processManager.isRunning)
            }
            // v4 新增
            CommandGroup(after: .appSettings) {
                Button("重新运行引导向导") { setupCompleted = false }
            }
        }
        Settings { SettingsView() }
    }
}

extension Notification.Name {
    static let terminalRunCommand = Notification.Name("terminalRunCommand")
    static let exportConversation = Notification.Name("exportConversation")
}
