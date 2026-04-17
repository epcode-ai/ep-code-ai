# Claude Skills / Prompt 库

> 把方法论中 24 个核心 AI Prompt 文件化，便于**复制即用**、**版本管理**、**团队共享**。

## 两种使用方式

### 1. 作为 Prompt 片段（最常用）

直接打开对应 `.md` 文件，复制内容到 Claude / ChatGPT / 其他 LLM 对话框，替换变量后使用。

### 2. 作为 Claude Code Skills（高级）

带有 YAML frontmatter 的文件可以直接作为 [Claude Code Skill](https://docs.claude.com/en/docs/claude-code/skills) 使用：

```bash
# 在你的项目根目录
cp -r skills/business/prompts ~/.claude/skills/
```

然后在 Claude Code 里通过 Skill 工具调用。

## 目录结构

```
skills/
├── business/           业务场景（7 个 Prompt）
│   ├── README.md
│   └── prompts/
│       ├── prd-testability-check.md
│       ├── user-story-split.md
│       ├── business-rule-to-table.md
│       ├── requirement-conflict-check.md
│       ├── change-impact-analysis.md
│       ├── interview-summary.md
│       └── competitor-analysis.md
│
├── development/        开发场景（9 个 Prompt）
│   ├── README.md
│   └── prompts/
│       ├── code-review.md
│       ├── api-doc-from-code.md
│       ├── unit-test-from-contract.md
│       ├── sql-optimize.md
│       ├── refactor.md
│       ├── error-triage.md
│       ├── tech-decision.md
│       ├── translate-code.md
│       └── log-analysis.md
│
├── testing/            测试场景（5 个 Prompt）
│   ├── README.md
│   └── prompts/
│       ├── test-review.md
│       ├── test-case-gen.md
│       ├── api-diff.md
│       ├── test-report.md
│       └── bug-summary.md
│
└── operations/         运维场景（8 个 Prompt）
    ├── README.md
    └── prompts/
        ├── log-analysis.md
        ├── alert-correlation.md
        ├── incident-diagnosis.md
        ├── runbook-generation.md
        ├── postmortem-draft.md
        ├── capacity-forecast.md
        ├── chaos-experiment-design.md
        └── config-audit.md
```

## Prompt 文件结构约定

每个 Prompt 文件包含：

```markdown
---
name: skill-name
description: 一句话说明这个 Skill 做什么
version: 1.0
category: business|development|testing|operations
---

# [Skill 标题]

## 用途

## 使用场景

## Prompt 本体

## 使用示例

## 变更历史
```

## 使用原则

### DO

- ✅ 给足上下文
- ✅ 分步骤用，不要一次到位
- ✅ 让 AI 自我检查
- ✅ 明确输出格式
- ✅ 保留 Prompt 原文用于复现

### DON'T

- ❌ 不要让 AI 做决策
- ❌ 不要输入涉密信息
- ❌ 不要直接采纳未审核的输出
- ❌ 不要替代人际协调

## 相关资源

- [业务篇 · AI 辅助](../docs/chapters/02-business/05-ai-assistance.md)
- [开发篇 · AI 辅助](../docs/chapters/03-development/05-ai-assistance.md)
- [测试篇 · AI 嵌入（见各 gate 文档）](../docs/chapters/04-testing/)
- [运维篇 · AI 辅助](../docs/chapters/05-operations/05-ai-assistance.md)

## 贡献

- 新增 Prompt 要遵循现有文件结构
- 改动已有 Prompt 要递增版本号
- 在 CHANGELOG 记录变更（后续补充）
