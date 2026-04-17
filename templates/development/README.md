# 开发场景模板库

> 配合 [开发篇](../../docs/chapters/03-development/) 使用的现成模板

## 模板清单

| 模板 | 用途 | 何时使用 |
|------|------|---------|
| [概要设计文档](./design-doc-template.md) | 架构/模块设计 | 新模块开工前 |
| [ADR（架构决策记录）](./adr-template.md) | 记录重要技术决策 | 做关键选型时 |
| [代码评审 Checklist](./code-review-checklist.md) | 评审标准化 | 每次 MR/PR 评审 |
| [Release Note / CHANGELOG](./release-note-template.md) | 发版说明 | 每次发版 |
| [依赖升级提案](./dependency-upgrade-template.md) | 依赖重大升级 | 主版本升级 / 安全修复 |

## 使用建议

### 谁用什么

| 角色 | 推荐使用 |
|------|---------|
| 架构师 | 设计文档 + ADR |
| Tech Lead | 全部 |
| 开发 | 代码评审 + Release Note |
| DevOps | Release Note + 依赖升级 |

### 怎么组织

建议在项目仓库内创建：

```
your-project/
├── docs/
│   ├── design/              ← 概要设计文档
│   │   ├── v1.2-order-export.md
│   │   └── v1.3-payment-refactor.md
│   ├── adr/                 ← ADR 列表
│   │   ├── 0001-use-postgresql.md
│   │   ├── 0002-adopt-clean-arch.md
│   │   └── README.md       ← ADR 索引
│   └── upgrades/            ← 依赖升级提案
│       └── 2026-04-node20.md
├── CHANGELOG.md             ← 累计变更日志
└── .gitlab/
    └── merge_request_templates/
        └── Default.md       ← MR 模板（用 code-review-checklist）
```

## 相关资源

- [开发篇总览](../../docs/chapters/03-development/)
- [GitLab MR 模板](../../workflows/gitlab/merge_request_template.md)
- [开发 → 测试 契约](../../docs/chapters/04-testing/03-roles-contracts/dev-contract.md)
