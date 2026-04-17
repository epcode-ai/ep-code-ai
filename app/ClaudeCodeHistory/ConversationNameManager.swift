import Foundation

class ConversationNameManager: ObservableObject {
    static let shared = ConversationNameManager()
    @Published var customNames: [String: String] = [:]

    private let dirPath: String
    private let filePath: String

    private init() {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        dirPath = "\(home)/.claudehistory"
        filePath = "\(home)/.claudehistory/names.json"
        load()
    }

    func displayName(for conv: Conversation) -> String {
        if let custom = customNames[conv.id], !custom.isEmpty { return custom }
        return String(conv.topic.prefix(30))
    }

    func setName(_ name: String, for sessionId: String) {
        customNames[sessionId] = name
        save()
    }

    func removeName(for sessionId: String) {
        customNames.removeValue(forKey: sessionId)
        save()
    }

    func hasCustomName(_ sessionId: String) -> Bool {
        guard let name = customNames[sessionId] else { return false }
        return !name.isEmpty
    }

    func generateTitle(for conv: Conversation, messages: [Message], completion: @escaping (String) -> Void) {
        let context = messages.prefix(4).map { msg in
            let role = msg.role == .user ? "用户" : "Claude"
            return "\(role): \(String(msg.text.prefix(200)))"
        }.joined(separator: "\n")

        let prompt = "根据以下对话内容，生成一个简短的中文标题（10字以内），只输出标题文字：\n\n\(context)"

        DispatchQueue.global(qos: .userInitiated).async {
            let proc = Process()
            proc.executableURL = URL(fileURLWithPath: "/Users/zhangkunshi/.local/bin/claude")
            proc.arguments = ["-p", prompt, "--output-format", "text"]
            let pipe = Pipe()
            proc.standardOutput = pipe
            proc.standardError = FileHandle.nullDevice
            do {
                try proc.run()
                proc.waitUntilExit()
                let data = pipe.fileHandleForReading.readDataToEndOfFile()
                if let result = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines), !result.isEmpty {
                    DispatchQueue.main.async {
                        self.setName(result, for: conv.id)
                        completion(result)
                    }
                }
            } catch {
                print("AI 标题生成失败: \(error)")
            }
        }
    }

    private func load() {
        guard FileManager.default.fileExists(atPath: filePath),
              let data = FileManager.default.contents(atPath: filePath),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let names = json["names"] as? [String: String] else { return }
        customNames = names
    }

    private func save() {
        let fm = FileManager.default
        if !fm.fileExists(atPath: dirPath) { try? fm.createDirectory(atPath: dirPath, withIntermediateDirectories: true) }
        let json: [String: Any] = ["names": customNames, "updatedAt": ISO8601DateFormatter().string(from: Date())]
        if let data = try? JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted, .sortedKeys]) {
            fm.createFile(atPath: filePath, contents: data)
        }
    }
}
