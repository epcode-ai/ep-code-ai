import SwiftUI

// MARK: - 斜杠命令数据模型

struct SlashCommand: Identifiable, Equatable {
    let id: String          // 命令名（不带斜杠），如 "clear"
    let displayName: String // 显示名，如 "清空对话"
    let icon: String        // SF Symbol
    let description: String // 描述
    let category: Category  // 分类
    let requiresOfficial: Bool  // 是否需要官方 API
    let needsArg: Bool      // 是否需要参数
    let argPlaceholder: String  // 参数占位符

    enum Category: String, CaseIterable {
        case session = "会话"
        case config = "配置"
        case dev = "开发"
        case project = "项目"
        case diagnostic = "诊断"
    }

    /// 发送给 CLI 的完整命令
    func formatted(arg: String = "") -> String {
        needsArg && !arg.isEmpty ? "/\(id) \(arg)" : "/\(id)"
    }
}

// MARK: - 预设命令库

struct SlashCommandRegistry {
    static let all: [SlashCommand] = [
        // 会话
        .init(id: "clear", displayName: "清空对话", icon: "trash",
              description: "清空当前对话历史，释放上下文",
              category: .session, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "compact", displayName: "压缩上下文", icon: "rectangle.compress.vertical",
              description: "压缩对话节省 token，可附聚焦说明",
              category: .session, requiresOfficial: false, needsArg: true, argPlaceholder: "可选：聚焦说明"),
        .init(id: "context", displayName: "查看上下文", icon: "square.grid.3x3",
              description: "可视化当前上下文占用和优化建议",
              category: .session, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "rewind", displayName: "回退对话", icon: "arrow.uturn.backward",
              description: "回退对话或代码到之前某个点",
              category: .session, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "branch", displayName: "分叉对话", icon: "arrow.triangle.branch",
              description: "从当前节点分叉出新对话",
              category: .session, requiresOfficial: false, needsArg: true, argPlaceholder: "可选：分支名"),

        // 配置
        .init(id: "model", displayName: "切换模型", icon: "cpu",
              description: "选择或切换 AI 模型",
              category: .config, requiresOfficial: false, needsArg: true, argPlaceholder: "模型名"),
        .init(id: "fast", displayName: "快速模式", icon: "bolt",
              description: "切换快速模式开关",
              category: .config, requiresOfficial: false, needsArg: true, argPlaceholder: "on / off"),
        .init(id: "effort", displayName: "思考强度", icon: "brain",
              description: "设置模型思考强度",
              category: .config, requiresOfficial: false, needsArg: true, argPlaceholder: "low/medium/high/max"),
        .init(id: "memory", displayName: "记忆管理", icon: "doc.text",
              description: "编辑 CLAUDE.md 和自动记忆",
              category: .config, requiresOfficial: false, needsArg: false, argPlaceholder: ""),

        // 开发
        .init(id: "plan", displayName: "规划模式", icon: "list.clipboard",
              description: "进入 plan 模式规划任务",
              category: .dev, requiresOfficial: false, needsArg: true, argPlaceholder: "可选：任务描述"),
        .init(id: "diff", displayName: "查看差异", icon: "plus.forwardslash.minus",
              description: "打开交互式 diff 查看器",
              category: .dev, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "init", displayName: "初始化项目", icon: "doc.badge.plus",
              description: "为项目生成 CLAUDE.md",
              category: .dev, requiresOfficial: false, needsArg: false, argPlaceholder: ""),

        // 项目
        .init(id: "add-dir", displayName: "添加目录", icon: "folder.badge.plus",
              description: "为当前会话添加可访问目录",
              category: .project, requiresOfficial: false, needsArg: true, argPlaceholder: "目录路径"),
        .init(id: "permissions", displayName: "工具权限", icon: "lock.shield",
              description: "管理工具允许/询问/拒绝规则",
              category: .project, requiresOfficial: false, needsArg: false, argPlaceholder: ""),

        // 诊断
        .init(id: "status", displayName: "状态", icon: "info.circle",
              description: "查看版本/模型/账户/连接状态",
              category: .diagnostic, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "doctor", displayName: "诊断", icon: "stethoscope",
              description: "诊断安装和设置问题",
              category: .diagnostic, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
        .init(id: "cost", displayName: "费用统计", icon: "dollarsign.circle",
              description: "查看 token 用量统计",
              category: .diagnostic, requiresOfficial: false, needsArg: false, argPlaceholder: ""),
    ]

    /// 根据 Provider 类型过滤可用命令
    static func available(for isOfficial: Bool) -> [SlashCommand] {
        all.filter { !$0.requiresOfficial || isOfficial }
    }

    /// 模糊搜索
    static func search(_ query: String, in commands: [SlashCommand]) -> [SlashCommand] {
        if query.isEmpty { return commands }
        let q = query.lowercased()
        return commands.filter { cmd in
            cmd.id.lowercased().contains(q) ||
            cmd.displayName.contains(query) ||
            cmd.description.contains(query)
        }
    }
}

// MARK: - 模型预设

struct ModelPreset: Identifiable, Equatable {
    let id: String
    let displayName: String
    let shortName: String
    let description: String

    static let all: [ModelPreset] = [
        .init(id: "claude-opus-4-5", displayName: "Claude Opus 4.5", shortName: "Opus", description: "最强推理，复杂任务"),
        .init(id: "claude-sonnet-4-5", displayName: "Claude Sonnet 4.5", shortName: "Sonnet", description: "平衡性能和速度"),
        .init(id: "claude-haiku-4-5", displayName: "Claude Haiku 4.5", shortName: "Haiku", description: "最快速度，日常任务"),
    ]
}

// MARK: - 快速/思考模式

enum FastMode: String, CaseIterable {
    case off = "off"
    case on = "on"

    var displayName: String { self == .on ? "快速" : "标准" }
    var icon: String { self == .on ? "bolt.fill" : "bolt" }
}

enum EffortLevel: String, CaseIterable {
    case low, medium, high, max, auto

    var displayName: String {
        switch self {
        case .low: return "低"
        case .medium: return "中"
        case .high: return "高"
        case .max: return "极限"
        case .auto: return "自动"
        }
    }

    var icon: String {
        switch self {
        case .low: return "tortoise"
        case .medium: return "hare"
        case .high: return "brain"
        case .max: return "brain.head.profile"
        case .auto: return "sparkles"
        }
    }
}
