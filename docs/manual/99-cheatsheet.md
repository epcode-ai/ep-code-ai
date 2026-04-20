# 99 · 速查表 · 一页看懂

> 打印贴墙用。最常用的命令 / 文件位置 / 术语对照。

---

## 🧰 CLI 速查 · `npx epcode`

| 命令 | 做什么 | 示例 |
|------|------|------|
| `init --mode=A|B|C|D --name=<n>` | 按接入模式起项目 | `init --mode=A --name=order` |
| `adopt --level=<1..5>` | 模式 C 渐进启用 | `adopt --level=2` |
| `migrate --from=existing-code` | 模式 B 反向生成 API | - |
| `check` | 跑全部校验 | - |
| `prd <file>` | PRD 结构 + 可测性 | `prd docs/prd/v1.md` |
| `adr index [--check]` | ADR 索引重建 / 校验 | `adr index --target docs/adr/` |
| `metrics [--since]` | 四场景度量 + 看板 | `metrics --since "7 days ago"` |
| `incident new/to-requirement` | 故障处理 | `incident new --id INC-001` |
| `linkage <type>` | 跨场景联动 | `linkage release-plan --report r.md` |
| `jira sync/create-issue/list` | Jira 集成 | `jira sync bugs.md` |

---

## 📁 目录速查

```
ep-code-ai/
├── docs/
│   ├── chapters/       方法论(为什么这么做)
│   │   ├── 00-adoption/   ⭐ 接入模式(从哪读起)
│   │   ├── 01-overview/   总览
│   │   ├── 02-business/   业务篇
│   │   ├── 03-development/开发篇
│   │   ├── 04-testing/    测试篇
│   │   └── 05-operations/ 运维篇
│   ├── manual/         用户手册(怎么做)
│   ├── architecture/   架构文档
│   ├── design/ui/      UI/UX 设计 + HTML 原型
│   └── adr/            架构决策记录
├── templates/          24 个 Markdown 模板
│   ├── business/          PRD / 用户故事 / 业务规则 等
│   ├── development/       设计 / ADR / 代码评审 等
│   ├── testing/           测试策略 / 用例 / Bug 等
│   └── operations/        发布 / Runbook / 复盘 等
├── skills/             29 个 AI Prompt
├── tools/              零依赖脚本 + CLI
│   ├── cli/            epcode 命令
│   ├── cross-platform/ 15 个通用脚本
│   ├── metrics/        四场景度量
│   └── integrations/   企业系统连接器(9 个)
└── platforms/          三操作系统适配
    ├── macos/
    ├── linux/
    └── windows/
```

---

## ⌨️ 快捷键(桌面应用,Sprint 7+)

| 功能 | macOS | Linux/Win |
|------|-------|-----------|
| 新会话 | `⌘N` | `Ctrl+N` |
| 全局搜索 | `⌘K` | `Ctrl+K` |
| 设置 | `⌘,` | `Ctrl+,` |
| 切换供应商 | `⌘⇧P` | `Ctrl+Shift+P` |
| 切换角色 | `⌘⇧R` | `Ctrl+Shift+R` |
| 命令面板 | `/` | `/`(输入框首字符) |
| 发送消息 | `⌘↵` | `Ctrl+Enter` |

---

## 🧑‍🤝‍🧑 4 种接入模式速选

| 你的项目 | 选模式 | 入口 |
|---------|--------|------|
| 刚立项,未编码 | **A · 绿地** | `epcode init --mode=A` |
| 代码已写未上线 | **B · 开发中** | `epcode init --mode=B` |
| 已上线,定期迭代 | **C · 迭代中** | `epcode init --mode=C` |
| 稳态运维 1 年+ | **D · 稳态** | `epcode init --mode=D` |

详情: [docs/chapters/00-adoption/](../chapters/00-adoption/)

---

## 🔄 四场景工作流速选

| 你是 | 主要看 | CLI 高频 |
|------|--------|---------|
| 产品 / BA | [业务篇](../chapters/02-business/) | `prd` · `linkage prd-to-design` |
| 开发 | [开发篇](../chapters/03-development/) | `adr` · `check` · `linkage regression` |
| 测试 / QA | [测试篇](../chapters/04-testing/) | `prd`(可测性)· `linkage release-plan` |
| SRE / 运维 | [运维篇](../chapters/05-operations/) | `incident new` · `metrics` |

---

## 🧠 术语速查

| 术语 | 含义 |
|------|------|
| **ADR** | Architecture Decision Record · 架构决策记录 |
| **AC** | Acceptance Criteria · 验收标准 |
| **PRD** | Product Requirements Document · 产品需求文档 |
| **CR** | Change Request · 变更请求 |
| **REQ-NNN** | 需求 ID(PRD 里每个功能点) |
| **US-NNN** | User Story ID |
| **INC-xxx** | Incident 事件 / 故障编号 |
| **Runbook** | 某类告警的处置手册 |
| **Postmortem** | 故障复盘(blameless) |
| **Artifact** | AI 产出的代码 / 文档(中文称"产出物") |
| **接入模式 A/B/C/D** | 按项目阶段分的四种嵌入策略 |

---

## 🆘 常见错误 → 怎么办

| 错误 | 怎么办 |
|------|--------|
| `epcode: command not found` | 用 `npx epcode` 而不是 `epcode`;或 `npm install -g @epcode-ai/cli` |
| `fetch is not defined` | Node 版本太低,升级到 18+ |
| CI `prd-check` 失败 | 跑 `npx epcode prd <file>` 看具体问题 |
| CI `config-audit` 失败退出 2 | prod 配置里有明文敏感值 → 用 `ENC()` / `vault:` 占位 |
| Docusaurus build 报 MDX 错 | 表格里的 `<60` 要写 `&lt;60` |
| `gh pr merge` 被拒 | 检查 branch protection:Required approvals / Code Owner review |

---

## 🔗 重要链接

- 项目首页: https://github.com/epcode-ai/ep-code-ai
- 文档站: https://epcode-ai.github.io/ep-code-ai/
- HTML 原型: https://raw.githack.com/epcode-ai/ep-code-ai/main/docs/design/ui/prototype/index.html
- CHANGELOG: [../../CHANGELOG.md](../../CHANGELOG.md)
- PLAN.md(路线图): [../../PLAN.md](../../PLAN.md)
- ARCHITECTURE.md(架构): [../../ARCHITECTURE.md](../../ARCHITECTURE.md)

---

## 🎯 "我 5 分钟入门"

```bash
# 1. 看能不能跑
npx epcode --help

# 2. 起第一个项目
npx epcode init --mode=A --name=hello

# 3. 写个 PRD(复制模板填)
cd hello
cp ../templates/business/prd-template.md docs/prd/hello-v0.1.md
# ... 填内容 ...

# 4. 校验
npx epcode prd docs/prd/hello-v0.1.md

# 5. 看度量
npx epcode metrics
```

**好了,你已经在用这套方法论。**
