import Foundation

// MARK: - Artifact 数据模型

class Artifact: Identifiable, ObservableObject {
    let id = UUID().uuidString
    let type: ArtifactType
    let title: String
    let sourceCode: String
    let language: String
    @Published var isActive = false

    init(type: ArtifactType, title: String, sourceCode: String, language: String) {
        self.type = type; self.title = title; self.sourceCode = sourceCode; self.language = language
    }

    /// 生成可被 WKWebView 渲染的完整 HTML
    var renderableHTML: String {
        switch type {
        case .html:
            return wrapHTML(sourceCode)
        case .svg:
            return wrapHTML(sourceCode)
        case .react:
            return wrapReact(sourceCode)
        case .mermaid:
            return wrapMermaid(sourceCode)
        case .chart:
            return wrapHTML(sourceCode)
        }
    }

    private func wrapHTML(_ body: String) -> String {
        """
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 16px; color: #1a1a1a; background: #fff; }
        input[type=range] { width: 100%; }
        button { cursor: pointer; }
        canvas { max-width: 100%; }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
        </head>
        <body>
        \(body)
        </body>
        </html>
        """
    }

    private func wrapReact(_ code: String) -> String {
        """
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 16px; color: #1a1a1a; background: #fff; }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.9/babel.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
        </head>
        <body>
        <div id="root"></div>
        <script type="text/babel">
        const { useState, useEffect, useRef, useMemo, useCallback } = React;
        \(code)

        // 尝试找到默认导出的组件并渲染
        try {
            const lastExport = typeof App !== 'undefined' ? App :
                               typeof Component !== 'undefined' ? Component :
                               typeof Main !== 'undefined' ? Main : null;
            if (lastExport) {
                ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(lastExport));
            }
        } catch(e) { document.getElementById('root').innerHTML = '<pre style="color:red">' + e.message + '</pre>'; }
        </script>
        </body>
        </html>
        """
    }

    private func wrapMermaid(_ code: String) -> String {
        """
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <style>
        body { font-family: -apple-system, sans-serif; padding: 16px; background: #fff; display: flex; justify-content: center; }
        #mermaid-container { max-width: 100%; }
        </style>
        </head>
        <body>
        <div id="mermaid-container"></div>
        <script type="module">
        import mermaid from 'https://esm.sh/mermaid@11/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: false, theme: 'default', fontFamily: '-apple-system, sans-serif' });
        const { svg } = await mermaid.render('mermaid-svg', `\(code.replacingOccurrences(of: "`", with: "\\`"))`);
        document.getElementById('mermaid-container').innerHTML = svg;
        </script>
        </body>
        </html>
        """
    }

    enum ArtifactType: String {
        case html, svg, react, mermaid, chart

        var icon: String {
            switch self {
            case .html: return "globe"
            case .svg: return "square.on.circle"
            case .react: return "atom"
            case .mermaid: return "diagram.above.and.below.mid"
            case .chart: return "chart.bar"
            }
        }

        var label: String {
            switch self {
            case .html: return "HTML"
            case .svg: return "SVG"
            case .react: return "React"
            case .mermaid: return "Mermaid"
            case .chart: return "Chart"
            }
        }
    }
}

// MARK: - Artifact 检测器

struct ArtifactDetector {

    /// 从消息文本中检测所有可渲染的 Artifact
    static func detect(in text: String) -> [Artifact] {
        var artifacts: [Artifact] = []

        let codeBlocks = extractCodeBlocks(from: text)
        for block in codeBlocks {
            if let artifact = classify(code: block.code, language: block.language) {
                artifacts.append(artifact)
            }
        }

        return artifacts
    }

    private struct CodeBlock {
        let language: String
        let code: String
    }

    private static func extractCodeBlocks(from text: String) -> [CodeBlock] {
        var blocks: [CodeBlock] = []
        let pattern = "```(\\w*)\\n([\\s\\S]*?)```"
        guard let re = try? NSRegularExpression(pattern: pattern) else { return [] }
        let ns = text as NSString
        for m in re.matches(in: text, range: NSRange(location: 0, length: ns.length)) {
            let lang = m.numberOfRanges > 1 ? ns.substring(with: m.range(at: 1)).lowercased() : ""
            let code = m.numberOfRanges > 2 ? ns.substring(with: m.range(at: 2)) : ""
            if !code.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                blocks.append(CodeBlock(language: lang, code: code))
            }
        }
        return blocks
    }

    private static func classify(code: String, language: String) -> Artifact? {
        let trimmed = code.trimmingCharacters(in: .whitespacesAndNewlines)

        // SVG
        if language == "svg" || trimmed.hasPrefix("<svg") {
            let title = extractTitle(from: trimmed, tag: "title") ?? "SVG 图形"
            return Artifact(type: .svg, title: title, sourceCode: trimmed, language: "svg")
        }

        // Mermaid
        if language == "mermaid" {
            return Artifact(type: .mermaid, title: "流程图", sourceCode: trimmed, language: "mermaid")
        }

        // React / JSX
        if language == "jsx" || language == "tsx" || language == "react" {
            let title = extractComponentName(from: trimmed) ?? "React 组件"
            return Artifact(type: .react, title: title, sourceCode: trimmed, language: "jsx")
        }

        // HTML — 检测完整的 HTML 结构
        if language == "html" || (trimmed.contains("<") && trimmed.contains(">") && isRenderableHTML(trimmed)) {
            let title = extractTitle(from: trimmed, tag: "title") ?? extractTitle(from: trimmed, tag: "h1") ?? "HTML 页面"
            return Artifact(type: .html, title: title, sourceCode: trimmed, language: "html")
        }

        // JavaScript/TypeScript 中包含 DOM 操作或 Chart.js
        if (language == "javascript" || language == "js") && containsRenderableJS(trimmed) {
            let title = "交互式图表"
            let wrapped = "<script>\(trimmed)</script>"
            return Artifact(type: .chart, title: title, sourceCode: wrapped, language: "js")
        }

        return nil
    }

    private static func isRenderableHTML(_ code: String) -> Bool {
        let indicators = ["<div", "<canvas", "<input", "<button", "<style", "<script",
                          "<table", "<form", "<select", "<svg", "<h1", "<h2", "<h3",
                          "<section", "<article", "<main", "<header"]
        let matchCount = indicators.filter { code.lowercased().contains($0) }.count
        return matchCount >= 2  // 至少包含 2 个 HTML 标签才算可渲染
    }

    private static func containsRenderableJS(_ code: String) -> Bool {
        let indicators = ["document.getElementById", "document.querySelector", "Chart(",
                          "new Chart", "d3.select", "canvas", "createElement", "innerHTML"]
        return indicators.contains { code.contains($0) }
    }

    private static func extractTitle(from html: String, tag: String) -> String? {
        let pattern = "<\(tag)[^>]*>(.*?)</\(tag)>"
        guard let re = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive),
              let m = re.firstMatch(in: html, range: NSRange(location: 0, length: (html as NSString).length)),
              m.numberOfRanges > 1 else { return nil }
        let title = (html as NSString).substring(with: m.range(at: 1)).trimmingCharacters(in: .whitespacesAndNewlines)
        return title.isEmpty ? nil : String(title.prefix(40))
    }

    private static func extractComponentName(from code: String) -> String? {
        // function App() / const App = () => / export default function Xxx
        let patterns = [
            "function\\s+(\\w+)\\s*\\(",
            "const\\s+(\\w+)\\s*=\\s*\\(",
            "export\\s+default\\s+function\\s+(\\w+)",
        ]
        for pat in patterns {
            if let re = try? NSRegularExpression(pattern: pat),
               let m = re.firstMatch(in: code, range: NSRange(location: 0, length: (code as NSString).length)),
               m.numberOfRanges > 1 {
                let name = (code as NSString).substring(with: m.range(at: 1))
                if name.first?.isUppercase == true { return name }
            }
        }
        return nil
    }
}

// MARK: - ArtifactManager（全局管理当前会话的 Artifacts）

class ArtifactManager: ObservableObject {
    static let shared = ArtifactManager()

    @Published var artifacts: [Artifact] = []
    @Published var activeArtifact: Artifact? = nil
    @Published var isPanelVisible = false

    func addArtifact(_ artifact: Artifact) {
        artifacts.append(artifact)
        // 自动打开面板并显示最新的
        showArtifact(artifact)
    }

    func showArtifact(_ artifact: Artifact) {
        for a in artifacts { a.isActive = false }
        artifact.isActive = true
        activeArtifact = artifact
        isPanelVisible = true
    }

    func closePanel() {
        isPanelVisible = false
    }

    func clear() {
        artifacts.removeAll()
        activeArtifact = nil
        isPanelVisible = false
    }
}
