import SwiftUI

// MARK: - 斜杠命令浮动面板

struct SlashCommandPalette: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var query: String
    @Binding var isVisible: Bool
    let onSelect: (SlashCommand) -> Void

    @State private var selectedIndex = 0
    @StateObject private var providerMgr = ProviderManager.shared

    private var isOfficial: Bool {
        providerMgr.activeProvider == nil  // nil 表示使用 OAuth
    }

    private var filteredCommands: [SlashCommand] {
        let available = SlashCommandRegistry.available(for: isOfficial)
        return SlashCommandRegistry.search(query, in: available)
    }

    private var grouped: [(SlashCommand.Category, [SlashCommand])] {
        let dict = Dictionary(grouping: filteredCommands, by: \.category)
        return SlashCommand.Category.allCases.compactMap { cat in
            guard let items = dict[cat], !items.isEmpty else { return nil }
            return (cat, items)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            // 头部提示
            HStack(spacing: 6) {
                Image(systemName: "command").font(.system(size: 10)).foregroundColor(.secondary)
                Text("斜杠命令").font(.system(size: 10, weight: .medium)).foregroundColor(.secondary)
                Spacer()
                Text("↑↓ 选择 · Enter 确认 · Esc 取消")
                    .font(.system(size: 9)).foregroundColor(.secondary.opacity(0.6))
            }
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(Color.primary.opacity(0.03))

            Divider()

            // 命令列表
            if filteredCommands.isEmpty {
                emptyState
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 0) {
                            ForEach(Array(grouped.enumerated()), id: \.offset) { _, group in
                                // 分组标题
                                Text(group.0.rawValue)
                                    .font(.system(size: 9, weight: .semibold))
                                    .foregroundColor(.secondary.opacity(0.6))
                                    .padding(.horizontal, 12).padding(.top, 8).padding(.bottom, 3)

                                // 命令行
                                ForEach(group.1) { cmd in
                                    commandRow(cmd, isSelected: globalIndex(of: cmd) == selectedIndex)
                                        .id(cmd.id)
                                        .onTapGesture { selectCommand(cmd) }
                                }
                            }
                        }
                    }
                    .frame(maxHeight: 280)
                    .onChange(of: selectedIndex) { newValue in
                        if newValue < filteredCommands.count {
                            withAnimation(.easeOut(duration: 0.1)) {
                                proxy.scrollTo(filteredCommands[newValue].id, anchor: .center)
                            }
                        }
                    }
                }
            }
        }
        .background(RoundedRectangle(cornerRadius: 10).fill(Color(nsColor: .controlBackgroundColor)))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.5)
        )
        .shadow(color: .black.opacity(0.1), radius: 12, y: 4)
        .frame(width: 420)
        .onChange(of: query) { _ in selectedIndex = 0 }
        .onChange(of: isVisible) { vis in if vis { selectedIndex = 0 } }
        .onAppear { installKeyMonitor() }
        .onDisappear { removeKeyMonitor() }
    }

    // MARK: - 键盘事件监听（兼容 macOS 13+）

    @State private var keyMonitor: Any? = nil

    private func installKeyMonitor() {
        removeKeyMonitor()
        keyMonitor = NSEvent.addLocalMonitorForEvents(matching: .keyDown) { event in
            guard isVisible else { return event }

            switch event.keyCode {
            case 125: // 下箭头
                let count = filteredCommands.count
                if count > 0 { selectedIndex = (selectedIndex + 1) % count }
                return nil
            case 126: // 上箭头
                let count = filteredCommands.count
                if count > 0 { selectedIndex = (selectedIndex - 1 + count) % count }
                return nil
            case 36: // Enter
                if !filteredCommands.isEmpty && selectedIndex < filteredCommands.count {
                    selectCommand(filteredCommands[selectedIndex])
                }
                return nil
            case 53: // Escape
                withAnimation(.spring(response: 0.25)) { isVisible = false }
                return nil
            default:
                return event
            }
        }
    }

    private func removeKeyMonitor() {
        if let monitor = keyMonitor {
            NSEvent.removeMonitor(monitor)
            keyMonitor = nil
        }
    }

    private func commandRow(_ cmd: SlashCommand, isSelected: Bool) -> some View {
        HStack(spacing: 10) {
            Image(systemName: cmd.icon)
                .font(.system(size: 12))
                .foregroundColor(isSelected ? .white : settings.tc)
                .frame(width: 24, height: 24)
                .background(
                    RoundedRectangle(cornerRadius: 6)
                        .fill(isSelected ? settings.tc : settings.tcLight)
                )

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 6) {
                    Text(cmd.displayName).font(.system(size: 12, weight: .medium))
                    Text("/\(cmd.id)")
                        .font(.system(size: 10, design: .monospaced))
                        .foregroundColor(.secondary.opacity(0.7))
                }
                Text(cmd.description)
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            if cmd.needsArg {
                Text("需参数")
                    .font(.system(size: 9))
                    .foregroundColor(.secondary.opacity(0.6))
                    .padding(.horizontal, 5).padding(.vertical, 1)
                    .background(Capsule().fill(Color.primary.opacity(0.05)))
            }
        }
        .padding(.horizontal, 12).padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(isSelected ? settings.tc.opacity(0.08) : Color.clear)
                .padding(.horizontal, 4)
        )
        .contentShape(Rectangle())
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "magnifyingglass").font(.system(size: 20)).foregroundColor(.secondary.opacity(0.4))
            Text("无匹配命令").font(.system(size: 12)).foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity).padding(.vertical, 28)
    }

    // MARK: - 键盘/选择逻辑

    func moveSelection(by delta: Int) {
        let count = filteredCommands.count
        guard count > 0 else { return }
        selectedIndex = (selectedIndex + delta + count) % count
    }

    func confirmSelection() {
        guard !filteredCommands.isEmpty, selectedIndex < filteredCommands.count else { return }
        selectCommand(filteredCommands[selectedIndex])
    }

    private func selectCommand(_ cmd: SlashCommand) {
        onSelect(cmd)
        isVisible = false
    }

    private func globalIndex(of cmd: SlashCommand) -> Int {
        filteredCommands.firstIndex(where: { $0.id == cmd.id }) ?? -1
    }
}

// MARK: - 快速/思考模式切换按钮组

struct SpeedModeSelector: View {
    @EnvironmentObject var settings: AppSettings
    @Binding var fastMode: FastMode
    @Binding var effort: EffortLevel
    let onFastChange: (FastMode) -> Void
    let onEffortChange: (EffortLevel) -> Void
    @State private var showEffortMenu = false

    var body: some View {
        HStack(spacing: 4) {
            // 快速开关
            Button(action: {
                let newMode: FastMode = fastMode == .on ? .off : .on
                fastMode = newMode
                onFastChange(newMode)
            }) {
                HStack(spacing: 3) {
                    Image(systemName: fastMode == .on ? "bolt.fill" : "bolt")
                        .font(.system(size: 10))
                    Text(fastMode == .on ? "快速" : "标准")
                        .font(.system(size: 10, weight: .medium))
                }
                .foregroundColor(fastMode == .on ? .white : .secondary)
                .padding(.horizontal, 7).padding(.vertical, 4)
                .background(
                    RoundedRectangle(cornerRadius: 5)
                        .fill(fastMode == .on ? settings.tc : Color.primary.opacity(0.06))
                )
            }.buttonStyle(.plain)

            // 思考强度
            Menu {
                ForEach(EffortLevel.allCases, id: \.self) { level in
                    Button(action: {
                        effort = level
                        onEffortChange(level)
                    }) {
                        HStack {
                            Image(systemName: level.icon)
                            Text(level.displayName)
                            if effort == level { Image(systemName: "checkmark") }
                        }
                    }
                }
            } label: {
                HStack(spacing: 3) {
                    Image(systemName: effort.icon).font(.system(size: 10))
                    Text(effort.displayName).font(.system(size: 10, weight: .medium))
                    Image(systemName: "chevron.down").font(.system(size: 7))
                }
                .foregroundColor(.secondary)
                .padding(.horizontal, 7).padding(.vertical, 4)
                .background(RoundedRectangle(cornerRadius: 5).fill(Color.primary.opacity(0.06)))
            }
            .menuStyle(.borderlessButton)
            .fixedSize()
        }
    }
}

// MARK: - 模型选择下拉（EHUB 模型 chip 用）

struct ModelPickerMenu: View {
    @EnvironmentObject var settings: AppSettings
    let currentModel: String
    let onSelect: (ModelPreset) -> Void

    var body: some View {
        Menu {
            ForEach(ModelPreset.all) { preset in
                Button(action: { onSelect(preset) }) {
                    HStack {
                        Text(preset.displayName)
                        Text("— \(preset.description)").foregroundColor(.secondary)
                        if currentModel.contains(preset.shortName.lowercased()) || currentModel.contains(preset.id) {
                            Image(systemName: "checkmark")
                        }
                    }
                }
            }
        } label: {
            HStack(spacing: 3) {
                Image(systemName: "cpu").font(.system(size: 8))
                Text(shortDisplay).font(.system(size: 9, design: .monospaced))
                Image(systemName: "chevron.down").font(.system(size: 6))
            }
            .foregroundColor(.secondary)
            .padding(.horizontal, 5).padding(.vertical, 1)
            .background(Capsule().fill(Color.primary.opacity(0.06)))
        }
        .menuStyle(.borderlessButton)
        .fixedSize()
    }

    private var shortDisplay: String {
        if currentModel.isEmpty { return "模型" }
        if currentModel.contains("opus") { return "Opus" }
        if currentModel.contains("sonnet") { return "Sonnet" }
        if currentModel.contains("haiku") { return "Haiku" }
        return String(currentModel.prefix(10))
    }
}
