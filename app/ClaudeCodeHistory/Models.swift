import Foundation

// MARK: - v2 原有模型（保持不变）

struct Conversation: Identifiable, Hashable {
    let id: String
    let project: String
    let projectFolder: String
    let projectPath: String
    let topic: String
    let messageCount: Int
    let lastModified: Date
    let createdAt: Date
    let filePath: String
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
    static func == (l: Conversation, r: Conversation) -> Bool { l.id == r.id }
}

struct Message: Identifiable {
    let id = UUID()
    let role: MessageRole
    let text: String
    let toolUses: [ToolUse]
    let timestamp: Date?
}

enum MessageRole: String { case user, assistant }

struct ToolUse: Identifiable {
    let id = UUID()
    let name: String
    let input: String
}

struct Project: Identifiable, Hashable {
    let id: String
    let name: String
    let path: String
    let count: Int
}

enum TimeGroup: String, CaseIterable {
    case favorites = "收藏"
    case today = "今天"
    case yesterday = "昨天"
    case thisWeek = "本周"
    case thisMonth = "本月"
    case older = "更早"

    static func group(for date: Date) -> TimeGroup {
        let cal = Calendar.current; let now = Date()
        if cal.isDateInToday(date) { return .today }
        if cal.isDateInYesterday(date) { return .yesterday }
        if date >= cal.date(byAdding: .day, value: -7, to: now)! { return .thisWeek }
        if date >= cal.date(byAdding: .month, value: -1, to: now)! { return .thisMonth }
        return .older
    }
}

// MARK: - v3 聊天模型

/// 聊天消息
class ChatMessage: Identifiable, ObservableObject {
    let id = UUID()
    let role: ChatRole
    @Published var text: String                     // 最终显示文本
    @Published var thinkingText: String             // 思考过程（折叠显示）
    @Published var isStreaming: Bool
    @Published var isThinking: Bool                 // 当前是否在思考阶段
    @Published var toolCalls: [ChatToolCall]
    let timestamp: Date

    init(role: ChatRole, text: String = "", isStreaming: Bool = false) {
        self.role = role
        self.text = text
        self.thinkingText = ""
        self.isStreaming = isStreaming
        self.isThinking = false
        self.toolCalls = []
        self.timestamp = Date()
    }

    /// 是否有实质内容（非空消息）
    var hasContent: Bool {
        !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ||
        !toolCalls.isEmpty ||
        !thinkingText.isEmpty
    }
}

enum ChatRole: String {
    case user, assistant, system
}

/// 工具调用
class ChatToolCall: Identifiable, ObservableObject {
    let id = UUID()
    let toolName: String
    @Published var input: String
    @Published var output: String
    @Published var status: ToolCallStatus

    init(toolName: String, input: String = "", output: String = "", status: ToolCallStatus = .running) {
        self.toolName = toolName
        self.input = input
        self.output = output
        self.status = status
    }
}

enum ToolCallStatus: String {
    case running, success, error, pending
}

/// 权限请求
struct PermissionRequest: Identifiable {
    let id = UUID()
    let toolName: String
    let description: String
    let rawJSON: [String: Any]
}

// MARK: - App 模式
enum AppMode {
    case chat
    case history
}
