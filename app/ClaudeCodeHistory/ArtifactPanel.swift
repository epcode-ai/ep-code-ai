import SwiftUI
import WebKit

// MARK: - Artifact 面板（右侧分屏）

struct ArtifactPanel: View {
    @ObservedObject var manager: ArtifactManager
    @EnvironmentObject var settings: AppSettings
    @State private var showPopoutWindow = false

    var body: some View {
        VStack(spacing: 0) {
            // 顶部工具栏
            header

            Divider()

            // WebView 渲染区域
            if let artifact = manager.activeArtifact {
                ArtifactWebView(html: artifact.renderableHTML)
                    .id(artifact.id)  // 切换时重新加载
            } else {
                emptyState
            }

            Divider()

            // Artifact 切换列表（底部缩略）
            if manager.artifacts.count > 1 {
                artifactList
            }
        }
        .background(Color(nsColor: .windowBackgroundColor))
    }

    // MARK: - 头部工具栏

    private var header: some View {
        HStack(spacing: 8) {
            // 类型图标
            if let a = manager.activeArtifact {
                Image(systemName: a.type.icon)
                    .font(.system(size: 12))
                    .foregroundColor(settings.tc)
                    .frame(width: 24, height: 24)
                    .background(RoundedRectangle(cornerRadius: 5).fill(settings.tcLight))
            }

            // 标题
            VStack(alignment: .leading, spacing: 0) {
                Text(manager.activeArtifact?.title ?? "Artifact")
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(1)
                if let a = manager.activeArtifact {
                    Text(a.type.label)
                        .font(.system(size: 9))
                        .foregroundColor(.secondary)
                }
            }

            Spacer()

            // 弹出独立窗口
            Button(action: popout) {
                Image(systemName: "arrow.up.left.and.arrow.down.right")
                    .font(.system(size: 10))
            }
            .buttonStyle(.plain).foregroundColor(.secondary)
            .help("在独立窗口中打开")

            // 下载
            Button(action: downloadHTML) {
                Image(systemName: "arrow.down.circle")
                    .font(.system(size: 10))
            }
            .buttonStyle(.plain).foregroundColor(.secondary)
            .help("下载为 HTML 文件")

            // 复制源码
            Button(action: copySource) {
                Image(systemName: "doc.on.doc")
                    .font(.system(size: 10))
            }
            .buttonStyle(.plain).foregroundColor(.secondary)
            .help("复制源码")

            // 关闭
            Button(action: { manager.closePanel() }) {
                Image(systemName: "xmark")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundColor(.secondary.opacity(0.5))
                    .frame(width: 20, height: 20)
                    .background(Circle().fill(Color.secondary.opacity(0.08)))
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 12).padding(.vertical, 8)
    }

    // MARK: - 空状态

    private var emptyState: some View {
        VStack(spacing: 12) {
            Image(systemName: "rectangle.3.group")
                .font(.system(size: 32))
                .foregroundColor(.secondary.opacity(0.3))
            Text("Artifact 面板")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            Text("Claude 返回 HTML/SVG/React 代码时\n会自动在这里渲染预览")
                .font(.system(size: 11))
                .foregroundColor(.secondary.opacity(0.6))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }

    // MARK: - Artifact 切换列表

    private var artifactList: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                ForEach(manager.artifacts) { artifact in
                    Button(action: { manager.showArtifact(artifact) }) {
                        HStack(spacing: 4) {
                            Image(systemName: artifact.type.icon).font(.system(size: 9))
                            Text(artifact.title).font(.system(size: 10)).lineLimit(1)
                        }
                        .foregroundColor(artifact.isActive ? .white : .secondary)
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(
                            Capsule().fill(artifact.isActive ? settings.tc : Color.primary.opacity(0.05))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 12).padding(.vertical, 6)
        }
        .background(Color.primary.opacity(0.02))
    }

    // MARK: - 操作

    private func popout() {
        guard let artifact = manager.activeArtifact else { return }
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 800, height: 600),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered, defer: false
        )
        window.center()
        window.title = artifact.title
        window.contentView = NSHostingView(rootView:
            ArtifactWebView(html: artifact.renderableHTML)
                .frame(minWidth: 400, minHeight: 300)
        )
        window.makeKeyAndOrderFront(nil)
    }

    private func downloadHTML() {
        guard let artifact = manager.activeArtifact else { return }
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.html]
        panel.nameFieldStringValue = "\(artifact.title).html"
        panel.begin { response in
            if response == .OK, let url = panel.url {
                try? artifact.renderableHTML.write(to: url, atomically: true, encoding: .utf8)
            }
        }
    }

    private func copySource() {
        guard let artifact = manager.activeArtifact else { return }
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(artifact.sourceCode, forType: .string)
    }
}

// MARK: - WKWebView 包装

struct ArtifactWebView: NSViewRepresentable {
    let html: String

    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.setValue(false, forKey: "drawsBackground")  // 透明背景
        return webView
    }

    func updateNSView(_ webView: WKWebView, context: Context) {
        webView.loadHTMLString(html, baseURL: nil)
    }
}

// MARK: - 消息内 Artifact 标签卡

struct ArtifactTagView: View {
    let artifact: Artifact
    @EnvironmentObject var settings: AppSettings

    var body: some View {
        Button(action: {
            ArtifactManager.shared.showArtifact(artifact)
        }) {
            HStack(spacing: 6) {
                Image(systemName: artifact.type.icon)
                    .font(.system(size: 11))
                    .foregroundColor(settings.tc)

                Text(artifact.title)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.primary)
                    .lineLimit(1)

                Text("— 点击查看")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 10).padding(.vertical, 6)
            .background(
                RoundedRectangle(cornerRadius: 8)
                    .fill(settings.tcLight)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .strokeBorder(settings.tc.opacity(0.2), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
        .padding(.top, 6)
    }
}
