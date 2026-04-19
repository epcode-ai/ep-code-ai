# Flow 04 · AI 输出 → 自动识别为 Artifact

> AI 流式输出代码块/Markdown/JSON 等结构化内容时,自动抽取为 Artifact,加进右栏。

## 主流程

```mermaid
flowchart TD
    A[AI 开始流式输出] --> B[逐 chunk 喂给 ArtifactDetector]
    B --> C{检测器实时判断}
    C -- 普通文本 --> C1[正常渲染到聊天流]
    C -- 检测到代码块 ``` --> D[判断语言 + 内容长度]
    C -- 检测到 Markdown 长文本 --> E[判断是否独立文档]
    C -- 检测到 JSON / YAML --> F[判断是否完整结构]

    D --> D1{是否值得 artifact 化?}
    D1 -- 否 (短代码 < 5 行) --> C1
    D1 -- 是 --> G[在聊天流插入 Artifact 占位卡]

    E --> E1{是否独立文档?}
    E1 -- 是 (有标题 + 章节) --> G
    E1 -- 否 --> C1

    F --> F1{结构完整?}
    F1 -- 是 --> G
    F1 -- 否 --> C1

    G --> H[Artifact 进入右栏列表,顶部高亮]
    H --> I[流式继续,Artifact 内容增量更新]
    I --> J[流结束]
    J --> K[Artifact 自动命名]
    K --> L[首次有 artifact 时,右栏自动展开]
```

## 抽取规则

### 4.1 代码块

- 触发: ` ``` ` fenced code block
- 长度门槛: ≥ 5 行 OR ≥ 200 字符
- 文件名提取: 优先从 ```language:filename 提取,否则用 `<lang>-<时间戳>.<ext>`
- 例外: 单行命令(如 `` `npm install` ``)不抽取

### 4.2 Markdown 文档

- 触发: 检测到首行 `# `(一级标题) + 至少 1 个 `## `(二级标题)
- 长度门槛: ≥ 50 行 OR ≥ 1000 字符
- 文件名: 从 H1 标题转换(slug)+ `.md`

### 4.3 结构化数据

- JSON: 完整对象 `{...}`,长度 ≥ 100 字符
- YAML: `---` 起始或显著缩进结构
- CSV: 显著表格结构

## 视觉反馈

```
聊天流中:                                    右栏 Artifacts:

🤖 11:33                                     ▾ user-stories.md  ← 新加,1.5s
  我帮你拆成 8 条 user story:                   📋 8 条 · 4KB
                                                生成于 11:35
  ┌──────────────────────────────────────┐
  │ 📄 user-stories.md                    │
  │ 8 条 user story · 已添加到右栏         │
  │ [👁 查看] [📋 复制] [💾 保存到文件]    │
  └──────────────────────────────────────┘

  生成完成。详见右侧。
```

## 占位卡的状态

```mermaid
stateDiagram-v2
    [*] --> Streaming: AI 开始流式输出代码/Markdown
    Streaming --> Streaming: 内容增量更新
    Streaming --> Complete: 流结束
    Streaming --> Cancelled: 用户取消生成
    Complete --> Renamed: 自动命名
    Renamed --> [*]
    Cancelled --> [*]: 占位卡删除,流式内容仍在聊天流
```

## 用户选项

设置 → General 提供:
- `[✓] 自动 Artifact 化 AI 输出`(默认开)
- 长度阈值可调

如果关掉,所有代码/文档都直接渲染在聊天流,右栏永远空。

## Artifact 类型与图标

| 类型 | 扩展名 | 图标 | 大纲 |
|------|--------|------|------|
| Markdown | .md | 📄 | 标题 |
| JavaScript / TypeScript | .js .ts | 💛 / 🔷 | function/class/export |
| Python | .py | 🐍 | def/class |
| JSON / YAML | .json .yml | { | 顶层 keys |
| HTML | .html | 🌐 | DOM 结构 |
| 图表 (mermaid) | .mmd | 📊 | 节点 |
| 通用 | .txt | 📝 | 无 |

## 与 Phase 1 的关系

抽取逻辑已有 `app/ClaudeCodeHistory/ArtifactDetector.swift` 雏形。本设计稿明确:

- 把"长度门槛"统一(原 Swift 版只检测代码块)
- 加 Markdown 文档抽取
- 流式更新 Artifact 内容(原 Swift 版仅在流结束时抽)
