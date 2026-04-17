import Foundation
import Combine

class ConversationStore: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var projects: [Project] = []
    @Published var selectedConversation: Conversation?
    @Published var selectedMessages: [Message] = []
    @Published var searchText: String = ""
    @Published var selectedProject: String = ""
    @Published var showFavoritesOnly: Bool = false

    func reload() {
        let all = loadAllConversations()
        conversations = all
        var pm: [String: (String, String, Int)] = [:]
        for c in all {
            if let e = pm[c.projectFolder] { pm[c.projectFolder] = (e.0, e.1, e.2 + 1) }
            else { pm[c.projectFolder] = (c.project, c.projectPath, 1) }
        }
        projects = pm.map { Project(id: $0.key, name: $0.value.0, path: $0.value.1, count: $0.value.2) }.sorted { $0.count > $1.count }
    }

    var filteredConversations: [Conversation] {
        var list = conversations
        if showFavoritesOnly { list = list.filter { FavoritesManager.shared.isFavorite($0.id) } }
        if !selectedProject.isEmpty { list = list.filter { $0.projectFolder == selectedProject } }
        if !searchText.isEmpty {
            let q = searchText.lowercased()
            list = list.filter { $0.topic.lowercased().contains(q) || $0.project.lowercased().contains(q) }
        }
        return list
    }

    var groupedConversations: [(TimeGroup, [Conversation])] {
        let favs = FavoritesManager.shared
        let filtered = filteredConversations
        let favItems = filtered.filter { favs.isFavorite($0.id) }
        let nonFav = filtered.filter { !favs.isFavorite($0.id) }
        var result: [(TimeGroup, [Conversation])] = []
        if !favItems.isEmpty && !showFavoritesOnly { result.append((.favorites, favItems)) }
        let grouped = Dictionary(grouping: showFavoritesOnly ? filtered : nonFav) { TimeGroup.group(for: $0.lastModified) }
        for g in TimeGroup.allCases where g != .favorites {
            if let items = grouped[g], !items.isEmpty { result.append((g, items)) }
        }
        return result
    }

    func selectConversation(_ conv: Conversation) {
        selectedConversation = conv
        selectedMessages = loadMessages(conv.filePath)
    }

    private func loadAllConversations() -> [Conversation] {
        let fm = FileManager.default; let dir = AppSettings.shared.effectiveDataPath
        guard fm.fileExists(atPath: dir), let folders = try? fm.contentsOfDirectory(atPath: dir) else { return [] }
        let retention = AppSettings.shared.historyRetentionDays
        let cutoff: Date? = retention > 0 ? Calendar.current.date(byAdding: .day, value: -retention, to: Date()) : nil
        var result: [Conversation] = []
        for folder in folders {
            let fp = "\(dir)/\(folder)"
            var isDir: ObjCBool = false
            guard fm.fileExists(atPath: fp, isDirectory: &isDir), isDir.boolValue,
                  let files = try? fm.contentsOfDirectory(atPath: fp) else { continue }
            for file in files where file.hasSuffix(".jsonl") {
                let path = "\(fp)/\(file)"
                guard let attrs = try? fm.attributesOfItem(atPath: path),
                      let mod = attrs[.modificationDate] as? Date, let create = attrs[.creationDate] as? Date else { continue }
                if let c = cutoff, mod < c { continue }
                let entries = parseJSONL(path); guard !entries.isEmpty else { continue }
                let s = extractSummary(entries)
                result.append(Conversation(id: String(file.dropLast(6)), project: projectName(folder),
                    projectFolder: folder, projectPath: projectPath(folder),
                    topic: s.0, messageCount: s.1, lastModified: s.2 ?? mod, createdAt: s.3 ?? create, filePath: path))
            }
        }
        return result.sorted { $0.lastModified > $1.lastModified }
    }

    private func parseJSONL(_ p: String) -> [[String: Any]] {
        guard let d = FileManager.default.contents(atPath: p), let c = String(data: d, encoding: .utf8) else { return [] }
        return c.split(separator: "\n").compactMap { (try? JSONSerialization.jsonObject(with: $0.data(using: .utf8)!)) as? [String: Any] }
    }

    private func extractSummary(_ e: [[String: Any]]) -> (String, Int, Date?, Date?) {
        var msg = "", cnt = 0, first: Date?, last: Date?
        for entry in e {
            if entry["type"] as? String == "summary" { msg = (entry["summary"] as? String) ?? ""; continue }
            let role = (entry["role"] as? String) ?? (entry["type"] as? String) ?? ""
            if let ts = parseTS(entry["timestamp"] ?? entry["createdAt"]) { if first == nil { first = ts }; last = ts }
            if (role == "human" || role == "user") && msg.isEmpty { msg = extractText(entry) }
            if ["human", "user", "assistant"].contains(role) { cnt += 1 }
        }
        return (msg.isEmpty ? "无标题对话" : String(msg.prefix(200)), cnt, first, last)
    }

    func loadMessages(_ path: String) -> [Message] {
        parseJSONL(path).compactMap { e in
            let role = (e["role"] as? String) ?? (e["type"] as? String) ?? ""
            guard ["human", "user", "assistant"].contains(role) else { return nil }
            let mr: MessageRole = (role == "human" || role == "user") ? .user : .assistant
            let t = extractText(e), tools = extractTools(e), ts = parseTS(e["timestamp"] ?? e["createdAt"])
            return (t.isEmpty && tools.isEmpty) ? nil : Message(role: mr, text: t, toolUses: tools, timestamp: ts)
        }
    }

    private func extractText(_ e: [String: Any]) -> String {
        let c = (e["message"] as? [String: Any])?["content"] ?? e["content"]
        if let s = c as? String { return s }
        if let a = c as? [[String: Any]] { return a.compactMap { $0["type"] as? String == "text" ? $0["text"] as? String : nil }.joined(separator: "\n") }
        return ""
    }

    private func extractTools(_ e: [String: Any]) -> [ToolUse] {
        let c = (e["message"] as? [String: Any])?["content"] ?? e["content"]
        guard let a = c as? [[String: Any]] else { return [] }
        return a.compactMap { guard $0["type"] as? String == "tool_use" else { return nil }
            let inp = ($0["input"]).flatMap { try? JSONSerialization.data(withJSONObject: $0) }.flatMap { String(data: $0, encoding: .utf8) } ?? ""
            return ToolUse(name: ($0["name"] as? String) ?? "工具", input: String(inp.prefix(400)))
        }
    }

    private func parseTS(_ v: Any?) -> Date? {
        guard let s = v as? String else { return nil }
        let f = ISO8601DateFormatter(); f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f.date(from: s) ?? { f.formatOptions = [.withInternetDateTime]; return f.date(from: s) }()
    }

    private func projectName(_ f: String) -> String {
        f.replacingOccurrences(of: "^-", with: "/", options: .regularExpression).replacingOccurrences(of: "-", with: "/")
            .split(separator: "/").filter { $0 != "Users" && $0 != "home" && !$0.isEmpty }.suffix(2).joined(separator: "/")
    }
    private func projectPath(_ f: String) -> String {
        // 文件夹名如 -Users-john-projects-my-app 中 - 既是路径分隔符也可能是文件名的一部分
        // 通过逐段尝试找到真实存在的路径
        let raw = f.replacingOccurrences(of: "^-", with: "/", options: .regularExpression)
        let parts = raw.split(separator: "-", omittingEmptySubsequences: false).map(String.init)
        return resolvePath(parts: parts)
    }

    private func resolvePath(parts: [String]) -> String {
        // 从左到右贪心匹配：尝试把相邻 parts 用 "-" 连接，检查路径是否存在
        let fm = FileManager.default
        var current = ""
        var remaining = parts

        while !remaining.isEmpty {
            let next = remaining.removeFirst()
            let trySlash = current.isEmpty ? next : current + "/" + next
            let tryDash = current + "-" + next

            if !current.isEmpty && fm.fileExists(atPath: tryDash) && !fm.fileExists(atPath: trySlash) {
                current = tryDash
            } else if fm.fileExists(atPath: trySlash) {
                current = trySlash
            } else if !current.isEmpty && remaining.isEmpty {
                // 最后一段，优先尝试 /
                let slashExists = fm.fileExists(atPath: trySlash)
                current = slashExists ? trySlash : tryDash
            } else {
                current = trySlash
            }
        }
        return current
    }
}
