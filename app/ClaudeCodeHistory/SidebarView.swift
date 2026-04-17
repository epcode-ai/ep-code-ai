import SwiftUI

struct SidebarView: View {
    @EnvironmentObject var store: ConversationStore
    @EnvironmentObject var favorites: FavoritesManager
    @EnvironmentObject var settings: AppSettings
    @EnvironmentObject var processManager: ClaudeProcessManager
    @StateObject private var nameManager = ConversationNameManager.shared
    @State private var showSettings = false
    @State private var showRenameSheet = false
    @State private var renameTarget: Conversation? = nil
    @State private var renameText: String = ""
    @State private var generatingTitleFor: String? = nil
    @State private var selectedConvId: String? = nil

    var body: some View {
        VStack(spacing: 0) {
            // 新建对话
            Button(action: newChat) {
                HStack(spacing: 6) {
                    Image(systemName: "plus").font(.system(size: 12, weight: .semibold))
                    Text("新建对话").font(.system(size: 13, weight: .medium))
                }
                .frame(maxWidth: .infinity).padding(.vertical, 7)
                .background(settings.tc).foregroundColor(.white).cornerRadius(8)
            }
            .buttonStyle(.plain)
            .padding(.horizontal, 14).padding(.top, 8).padding(.bottom, 8)

            // 搜索
            HStack(spacing: 6) {
                Image(systemName: "magnifyingglass").font(.system(size: 12)).foregroundColor(.secondary.opacity(0.6))
                TextField("搜索对话...", text: $store.searchText).textFieldStyle(.plain).font(.system(size: 12.5))
                if !store.searchText.isEmpty {
                    Button(action: { store.searchText = "" }) {
                        Image(systemName: "xmark.circle.fill").font(.system(size: 12)).foregroundColor(.secondary.opacity(0.4))
                    }.buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 10).padding(.vertical, 7)
            .background(RoundedRectangle(cornerRadius: 7).fill(Color.primary.opacity(0.04)))
            .overlay(RoundedRectangle(cornerRadius: 7).strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.5))
            .padding(.horizontal, 14).padding(.bottom, 6)

            // 筛选标签（可左右滑动）
            ScrollView(.horizontal, showsIndicators: true) {
                HStack(spacing: 5) {
                    filterChip("全部", folder: "", count: store.conversations.count)
                    ForEach(store.projects) { p in filterChip(p.name, folder: p.id, count: p.count) }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 2)
            }
            .frame(height: 30)
            .padding(.bottom, 4)

            Divider().opacity(0.5)

            // 对话列表（自定义选中样式，不用系统默认蓝/橙色）
            ScrollView {
                LazyVStack(spacing: 0) {
                    ForEach(store.groupedConversations, id: \.0) { group, items in
                        // 分组标题
                        HStack(spacing: 4) {
                            if group == .favorites {
                                Image(systemName: "star.fill").font(.system(size: 8)).foregroundColor(.yellow)
                            }
                            Text(group.rawValue).font(.system(size: 10, weight: .semibold)).foregroundColor(.secondary.opacity(0.5))
                            Spacer()
                        }
                        .padding(.horizontal, 18).padding(.top, 10).padding(.bottom, 4)

                        ForEach(items) { conv in
                            convRow(conv)
                        }
                    }
                }
            }

            Divider().opacity(0.5)

            // 底部
            HStack(spacing: 0) {
                Text("\(store.filteredConversations.count)")
                    .font(.system(size: 11, weight: .medium, design: .rounded)).foregroundColor(settings.tc)
                Text(" 个对话").font(.system(size: 11)).foregroundColor(.secondary.opacity(0.6))
                Spacer()
                Button(action: { showSettings = true }) {
                    Image(systemName: "gearshape").font(.system(size: 13)).foregroundColor(.secondary.opacity(0.5))
                }.buttonStyle(.plain)
            }
            .padding(.horizontal, 14)
            .frame(height: 28)
        }
        .sheet(isPresented: $showSettings) { SettingsView().frame(minWidth: 520, minHeight: 420) }
        .sheet(isPresented: $showRenameSheet) { renameSheet }
        .onReceive(NotificationCenter.default.publisher(for: .init("epc.reloadSidebar"))) { _ in
            store.reload()
        }
    }

    // MARK: - Actions

    private func newChat() {
        selectedConvId = nil
        store.selectedConversation = nil
        processManager.startNewChat()
        // 通知 ChatView 清除 toast
        NotificationCenter.default.post(name: .clearToast, object: nil)
    }

    private func selectConversation(_ conv: Conversation) {
        guard selectedConvId != conv.id else { return }
        selectedConvId = conv.id
        store.selectConversation(conv)
        let historyMessages = store.loadMessages(conv.filePath)
        processManager.resumeSession(conv.id, projectPath: conv.projectPath, historyMessages: historyMessages)
    }

    // ─── 重命名 ───
    private var renameSheet: some View {
        VStack(spacing: 16) {
            HStack {
                Text("重命名对话").font(.system(size: 14, weight: .semibold))
                Spacer()
                Button(action: { showRenameSheet = false }) {
                    Image(systemName: "xmark").font(.system(size: 10, weight: .bold))
                        .foregroundColor(.secondary.opacity(0.5)).frame(width: 24, height: 24)
                        .background(Circle().fill(Color.secondary.opacity(0.1)))
                }.buttonStyle(.plain)
            }
            TextField("输入新名称", text: $renameText).textFieldStyle(.roundedBorder).font(.system(size: 13)).onSubmit { confirmRename() }
            HStack {
                Button("取消") { showRenameSheet = false }.keyboardShortcut(.cancelAction)
                Spacer()
                if let t = renameTarget, nameManager.hasCustomName(t.id) {
                    Button("恢复默认") { nameManager.removeName(for: t.id); showRenameSheet = false }
                }
                Button("确认") { confirmRename() }.keyboardShortcut(.defaultAction).buttonStyle(.borderedProminent).tint(settings.tc)
            }
        }.padding(20).frame(width: 360)
    }

    private func confirmRename() {
        if let t = renameTarget, !renameText.trimmingCharacters(in: .whitespaces).isEmpty {
            nameManager.setName(renameText.trimmingCharacters(in: .whitespaces), for: t.id)
        }
        showRenameSheet = false
    }

    // ─── 筛选 ───
    private func filterChip(_ name: String, folder: String, count: Int) -> some View {
        let active = store.selectedProject == folder
        return Button(action: { store.selectedProject = folder }) {
            HStack(spacing: 3) {
                Text(name).font(.system(size: 10.5, weight: active ? .medium : .regular))
                if count > 0 { Text("\(count)").font(.system(size: 9, weight: .medium, design: .rounded)).foregroundColor(active ? settings.tc : .secondary.opacity(0.4)) }
            }
            .padding(.horizontal, 9).padding(.vertical, 4)
            .background(active ? settings.tcDim : Color.primary.opacity(0.03))
            .foregroundColor(active ? settings.tc : .secondary.opacity(0.7)).cornerRadius(6)
            .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(active ? settings.tc.opacity(0.2) : Color.clear, lineWidth: 0.5))
        }.buttonStyle(.plain)
    }

    // ─── 对话行（自定义选中背景，主题色浅色）───
    private func convRow(_ conv: Conversation) -> some View {
        let fs = CGFloat(settings.sidebarFontSize)
        let isFav = favorites.isFavorite(conv.id)
        let sel = selectedConvId == conv.id

        return ConvRowView(conv: conv, fontSize: fs, isFav: isFav, isSelected: sel,
                           displayName: nameManager.displayName(for: conv),
                           relTime: relTime(conv.lastModified),
                           settings: settings, favorites: favorites,
                           onTap: { selectConversation(conv) },
                           onFavToggle: { favorites.toggle(conv.id) })
        .contextMenu {
            Button(action: { renameTarget = conv; renameText = nameManager.customNames[conv.id] ?? String(conv.topic.prefix(30)); showRenameSheet = true }) {
                Label("重命名", systemImage: "pencil")
            }
            Button(action: {
                generatingTitleFor = conv.id
                nameManager.generateTitle(for: conv, messages: store.loadMessages(conv.filePath)) { _ in generatingTitleFor = nil }
            }) { Label("AI 生成标题", systemImage: "sparkles") }
            Divider()
            Button(action: { favorites.toggle(conv.id) }) { Label(isFav ? "取消收藏" : "收藏", systemImage: isFav ? "star.slash" : "star") }
            Button(action: { exportConversation(conv) }) { Label("导出 Markdown", systemImage: "square.and.arrow.up") }
            Button(action: { NSPasteboard.general.clearContents(); NSPasteboard.general.setString(conv.id, forType: .string) }) { Label("复制 ID", systemImage: "doc.on.doc") }
            Divider()
            Button(action: { NSWorkspace.shared.selectFile(conv.filePath, inFileViewerRootedAtPath: "") }) { Label("Finder 中显示", systemImage: "folder") }
        }
    }

    private func relTime(_ d: Date) -> String {
        let diff = Date().timeIntervalSince(d)
        if diff < 60 { return "刚刚" }; if diff < 3600 { return "\(Int(diff/60))分钟前" }
        if diff < 86400 { return "\(Int(diff/3600))小时前" }; if diff < 604800 { return "\(Int(diff/86400))天前" }
        let f = DateFormatter(); f.dateFormat = "M月d日"; return f.string(from: d)
    }
}

// 通知名
extension Notification.Name {
    static let clearToast = Notification.Name("clearToast")
}

func exportConversation(_ conv: Conversation) {
    let store = ConversationStore(); store.reload()
    let messages = store.loadMessages(conv.filePath)
    let df = DateFormatter(); df.dateFormat = "yyyy-MM-dd HH:mm"
    let nm = ConversationNameManager.shared
    var md = "# \(nm.displayName(for: conv))\n\n"
    md += "> **项目**: \(conv.project)  \n> **ID**: `\(conv.id)`  \n> **消息数**: \(conv.messageCount)  \n\n---\n\n"
    for msg in messages {
        md += msg.role == .user ? "## 用户\n" : "## EP Code\n"
        if let ts = msg.timestamp { md += "*\(df.string(from: ts))*\n\n" }
        md += "\(msg.text)\n\n---\n\n"
    }
    let panel = NSSavePanel()
    panel.nameFieldStringValue = String(nm.displayName(for: conv).prefix(40)).replacingOccurrences(of: "/", with: "_") + ".md"
    panel.allowedContentTypes = [.plainText]
    if panel.runModal() == .OK, let url = panel.url { try? md.write(to: url, atomically: true, encoding: .utf8) }
}

// MARK: - 对话卡片（带 hover 效果）

private struct ConvRowView: View {
    let conv: Conversation
    let fontSize: CGFloat
    let isFav: Bool
    let isSelected: Bool
    let displayName: String
    let relTime: String
    let settings: AppSettings
    let favorites: FavoritesManager
    let onTap: () -> Void
    let onFavToggle: () -> Void

    @State private var isHovered = false

    var body: some View {
        HStack(spacing: 6) {
            RoundedRectangle(cornerRadius: 1.5)
                .fill(isSelected ? settings.tc : Color.clear)
                .frame(width: 3, height: 28)

            VStack(alignment: .leading, spacing: 3) {
                Text(displayName)
                    .font(.system(size: fontSize, weight: .medium))
                    .lineLimit(2)

                HStack(spacing: 6) {
                    Text(conv.project)
                        .font(.system(size: max(9, fontSize - 3.5), design: .monospaced))
                        .foregroundColor(.secondary.opacity(0.5))
                        .padding(.horizontal, 4).padding(.vertical, 1)
                        .background(Color.secondary.opacity(0.06)).cornerRadius(3)
                    Text("\(conv.messageCount) 条")
                        .font(.system(size: max(9, fontSize - 3.5)))
                        .foregroundColor(.secondary.opacity(0.4))
                    Spacer()
                    Text(relTime)
                        .font(.system(size: max(9, fontSize - 3.5)))
                        .foregroundColor(.secondary.opacity(0.35))
                }
            }

            Button(action: onFavToggle) {
                Image(systemName: isFav ? "star.fill" : "star")
                    .font(.system(size: 10))
                    .foregroundColor(isFav ? .yellow : .secondary.opacity(isHovered ? 0.4 : 0.2))
            }.buttonStyle(.plain)
        }
        .padding(.vertical, 5).padding(.horizontal, 10)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(isSelected ? settings.tc.opacity(0.1) : (isHovered ? Color.primary.opacity(0.04) : Color.clear))
        )
        .padding(.horizontal, 6)
        .contentShape(Rectangle())
        .onTapGesture { onTap() }
        .onHover { hovering in
            withAnimation(.easeInOut(duration: 0.15)) { isHovered = hovering }
        }
        .cursor(isHovered ? .pointingHand : .arrow)
    }
}

extension View {
    func cursor(_ cursor: NSCursor) -> some View {
        onHover { inside in
            if inside { cursor.push() } else { NSCursor.pop() }
        }
    }
}
