import Foundation
import SwiftUI

// MARK: - 主题色系统

enum AppThemeColor: String, CaseIterable, Identifiable {
    case blue = "蓝色"
    case purple = "紫色"
    case green = "绿色"
    case orange = "橙色"
    case pink = "粉色"
    case teal = "青色"
    var id: String { rawValue }

    var color: Color {
        switch self {
        case .blue:   return Color(red: 0.24, green: 0.47, blue: 0.85)
        case .purple: return Color(red: 0.56, green: 0.27, blue: 0.85)
        case .green:  return Color(red: 0.20, green: 0.65, blue: 0.45)
        case .orange: return Color(red: 0.89, green: 0.42, blue: 0.22)
        case .pink:   return Color(red: 0.85, green: 0.30, blue: 0.55)
        case .teal:   return Color(red: 0.18, green: 0.58, blue: 0.65)
        }
    }

    var lightBg: Color { color.opacity(0.06) }
    var dimBg: Color { color.opacity(0.12) }
}

// MARK: - 设置

class AppSettings: ObservableObject {
    static let shared = AppSettings()

    @AppStorage("sidebarFontSize") var sidebarFontSize: Double = 13
    @AppStorage("customDataPath") var customDataPath: String = ""
    @AppStorage("historyRetentionDays") var historyRetentionDays: Int = 0
    @AppStorage("themeColorRaw") var themeColorRaw: String = AppThemeColor.blue.rawValue {
        didSet { objectWillChange.send() }
    }

    var themeColor: AppThemeColor {
        get { AppThemeColor(rawValue: themeColorRaw) ?? .blue }
        set { themeColorRaw = newValue.rawValue }
    }

    /// 当前主题色（响应式，所有使用 @EnvironmentObject 的视图会自动更新）
    var tc: Color { themeColor.color }
    var tcLight: Color { themeColor.lightBg }
    var tcDim: Color { themeColor.dimBg }

    var effectiveDataPath: String {
        customDataPath.isEmpty ? FileManager.default.homeDirectoryForCurrentUser.path + "/.claude/projects" : customDataPath
    }

    private init() {}
}

// MARK: - 兼容性：保持旧代码中 Color.accent / Color.claudeOrange 可编译
// 注意：这些静态属性不会触发 SwiftUI 更新，新代码应使用 settings.tc

extension Color {
    static var accent: Color { AppSettings.shared.themeColor.color }
    static var accentLight: Color { AppSettings.shared.themeColor.lightBg }
    static var accentDim: Color { AppSettings.shared.themeColor.dimBg }
    static var claudeOrange: Color { AppSettings.shared.themeColor.color }
}

func runInExternalTerminal(_ command: String, cwd: String? = nil) {
    let cdPart = cwd.map { "cd \"\($0)\" && " } ?? ""
    let full = "\(cdPart)\(command)".replacingOccurrences(of: "\"", with: "\\\"")
    let script = "tell application \"Terminal\" to activate\ntell application \"Terminal\" to do script \"\(full)\""
    let proc = Process()
    proc.executableURL = URL(fileURLWithPath: "/usr/bin/osascript")
    proc.arguments = ["-e", script]
    try? proc.run()
}
