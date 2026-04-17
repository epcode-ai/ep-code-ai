import Foundation

// MARK: - Provider 模型

struct APIProvider: Identifiable, Codable, Equatable {
    var id: String = UUID().uuidString
    var name: String                          // 显示名：Anthropic 官方 / 硅基流动 / DeepSeek ...
    var apiKey: String                        // API Key 或 AUTH_TOKEN
    var baseURL: String                       // Base URL（空 = 官方默认）
    var model: String                         // 模型名（空 = 默认）
    var smallModel: String                    // 小模型（空 = 默认）
    var isActive: Bool = false                // 当前启用

    /// 预设 Provider 模板
    static let presets: [APIProvider] = [
        APIProvider(name: "Anthropic 官方", apiKey: "", baseURL: "", model: "", smallModel: ""),
        APIProvider(name: "Claude 账号登录", apiKey: "OAUTH", baseURL: "", model: "", smallModel: ""),
        APIProvider(name: "硅基流动", apiKey: "", baseURL: "https://api.siliconflow.cn/v1", model: "claude-sonnet-4-20250514", smallModel: "claude-haiku-4-5-20251001"),
        APIProvider(name: "DeepSeek", apiKey: "", baseURL: "https://api.deepseek.com", model: "deepseek-chat", smallModel: "deepseek-chat"),
        APIProvider(name: "阿里百炼", apiKey: "", baseURL: "https://dashscope.aliyuncs.com/apps/anthropic", model: "qwen3-coder-plus", smallModel: "qwen-flash"),
        APIProvider(name: "智谱 GLM", apiKey: "", baseURL: "https://open.bigmodel.cn/api/anthropic", model: "glm-4-plus", smallModel: "glm-4-flash"),
        APIProvider(name: "自定义", apiKey: "", baseURL: "", model: "", smallModel: ""),
    ]
}

// MARK: - Provider 管理器

class ProviderManager: ObservableObject {
    static let shared = ProviderManager()

    @Published var providers: [APIProvider] = []
    @Published var activeProvider: APIProvider?

    private let storePath: String
    private let claudeSettingsPath: String

    private init() {
        let home = FileManager.default.homeDirectoryForCurrentUser.path
        let dir = "\(home)/.claudehistory"
        storePath = "\(dir)/providers.json"
        claudeSettingsPath = "\(home)/.claude/settings.json"

        if !FileManager.default.fileExists(atPath: dir) {
            try? FileManager.default.createDirectory(atPath: dir, withIntermediateDirectories: true)
        }

        load()
    }

    // MARK: - CRUD

    func addProvider(_ provider: APIProvider) {
        var p = provider
        p.id = UUID().uuidString
        providers.append(p)
        save()
    }

    func updateProvider(_ provider: APIProvider) {
        if let idx = providers.firstIndex(where: { $0.id == provider.id }) {
            let wasActive = providers[idx].isActive
            providers[idx] = provider
            providers[idx].isActive = wasActive
            save()
            if wasActive { applyToClaudeSettings(provider) }
        }
    }

    func removeProvider(_ id: String) {
        let wasActive = providers.first(where: { $0.id == id })?.isActive ?? false
        providers.removeAll { $0.id == id }
        if wasActive { activeProvider = nil }
        save()
    }

    // MARK: - 切换激活

    func activate(_ id: String) {
        for i in providers.indices { providers[i].isActive = (providers[i].id == id) }
        activeProvider = providers.first { $0.id == id }
        save()

        if let provider = activeProvider {
            applyToClaudeSettings(provider)
        }
    }

    /// 恢复官方登录（清除 env 中的 API 配置）
    func activateOAuth() {
        for i in providers.indices { providers[i].isActive = false }
        activeProvider = nil
        save()
        clearAPIFromClaudeSettings()
    }

    // MARK: - 写入 ~/.claude/settings.json

    private func applyToClaudeSettings(_ provider: APIProvider) {
        // OAuth 模式不写 env
        if provider.apiKey == "OAUTH" {
            clearAPIFromClaudeSettings()
            return
        }

        var settings = readClaudeSettings()
        var env = settings["env"] as? [String: Any] ?? [:]

        // 写入 API 配置
        if !provider.apiKey.isEmpty {
            env["ANTHROPIC_AUTH_TOKEN"] = provider.apiKey
        } else {
            env.removeValue(forKey: "ANTHROPIC_AUTH_TOKEN")
            env.removeValue(forKey: "ANTHROPIC_API_KEY")
        }

        if !provider.baseURL.isEmpty {
            env["ANTHROPIC_BASE_URL"] = provider.baseURL
        } else {
            env.removeValue(forKey: "ANTHROPIC_BASE_URL")
        }

        if !provider.model.isEmpty {
            env["ANTHROPIC_MODEL"] = provider.model
        } else {
            env.removeValue(forKey: "ANTHROPIC_MODEL")
        }

        if !provider.smallModel.isEmpty {
            env["ANTHROPIC_SMALL_FAST_MODEL"] = provider.smallModel
        } else {
            env.removeValue(forKey: "ANTHROPIC_SMALL_FAST_MODEL")
        }

        settings["env"] = env
        writeClaudeSettings(settings)
    }

    private func clearAPIFromClaudeSettings() {
        var settings = readClaudeSettings()
        var env = settings["env"] as? [String: Any] ?? [:]

        env.removeValue(forKey: "ANTHROPIC_AUTH_TOKEN")
        env.removeValue(forKey: "ANTHROPIC_API_KEY")
        env.removeValue(forKey: "ANTHROPIC_BASE_URL")
        env.removeValue(forKey: "ANTHROPIC_MODEL")
        env.removeValue(forKey: "ANTHROPIC_SMALL_FAST_MODEL")

        settings["env"] = env.isEmpty ? nil : env
        writeClaudeSettings(settings)
    }

    // MARK: - 读写 ~/.claude/settings.json（保留其他配置不动）

    private func readClaudeSettings() -> [String: Any] {
        guard let data = FileManager.default.contents(atPath: claudeSettingsPath),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
        else { return [:] }
        return json
    }

    private func writeClaudeSettings(_ settings: [String: Any]) {
        let fm = FileManager.default
        let dir = (claudeSettingsPath as NSString).deletingLastPathComponent
        if !fm.fileExists(atPath: dir) {
            try? fm.createDirectory(atPath: dir, withIntermediateDirectories: true)
        }
        if let data = try? JSONSerialization.data(withJSONObject: settings, options: [.prettyPrinted, .sortedKeys]) {
            fm.createFile(atPath: claudeSettingsPath, contents: data)
        }
    }

    // MARK: - 从当前 settings.json 检测活跃 Provider

    func detectCurrentProvider() {
        let settings = readClaudeSettings()
        let env = settings["env"] as? [String: Any] ?? [:]
        let currentKey = env["ANTHROPIC_AUTH_TOKEN"] as? String ?? env["ANTHROPIC_API_KEY"] as? String ?? ""
        let currentURL = env["ANTHROPIC_BASE_URL"] as? String ?? ""

        if currentKey.isEmpty && currentURL.isEmpty {
            // 官方 OAuth
            for i in providers.indices { providers[i].isActive = false }
            activeProvider = nil
            return
        }

        // 匹配已有 Provider
        for i in providers.indices {
            let match = providers[i].apiKey == currentKey ||
                        (!providers[i].baseURL.isEmpty && currentURL.contains(providers[i].baseURL))
            providers[i].isActive = match
            if match { activeProvider = providers[i] }
        }
    }

    // MARK: - 持久化（providers 列表）

    private func load() {
        guard let data = FileManager.default.contents(atPath: storePath),
              let list = try? JSONDecoder().decode([APIProvider].self, from: data)
        else { return }
        providers = list
        activeProvider = providers.first { $0.isActive }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(providers) {
            FileManager.default.createFile(atPath: storePath, contents: data)
        }
    }
}
