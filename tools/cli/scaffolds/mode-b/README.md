# __PROJECT_NAME__ · 接入模式 B · 开发中项目（追溯补齐）

> 本目录由 `epcode init --mode=B --name=__PROJECT_NAME__` 于 __DATE__ 生成。

## 核心策略: "两条腿走路"

- ❌ **不追溯历史**: 已写的代码不重新评审
- ✅ **从今天开始**: 新提交、新变更都走规范
- 🟡 **关键部分补齐**: 补 3-5 个核心 PRD + 提测单模板,其他进 backlog

## 起步清单（按优先级）

| # | 动作 | 时间 | 谁做 |
|---|------|------|------|
| 1 | 跑本脚手架 → 目录已建好 | 已完成 | - |
| 2 | 找 3-5 个核心场景,补 PRD 简版（用 `templates/business/prd-template.md`） | 1-2 天 | 产品 |
| 3 | 建立提测达标 Checklist + MR 模板（从 ep-code-ai 抄） | 1 小时 | 测试 |
| 4 | 从下个 MR 开始强制走新规范（CI 接 prd-check / submission-check） | 持续 | 全员 |
| 5 | 旧代码技术债列到 `BACKLOG.md`,每迭代消化 2-3 条 | 持续 | - |
| 6 | 可选: `epcode migrate --from=existing-code` 从 API 代码反向生成 Markdown | 2-4h | 开发 |

## 为什么选 B

- 代码已开始写,但还没上线
- 有零散 PRD / 设计,不完整
- 团队愿意改进流程,但不能推倒重来

## 文件

```
__PROJECT_NAME__/
├── docs/prd/              补齐核心 PRD
├── docs/design/           关键设计追溯
├── BACKLOG.md             技术债 + 文档欠账
├── .github/workflows/     CI 门禁从下个 MR 启用
└── MIGRATION-PLAN.md      本目录建设计划
```

## ⚠️ 常见坑

- **不要要求追溯所有历史文档** —— 团队会抵触
- **先从硬门禁入手**（CI + PR 模板 + 提测单）→ 自然带动文档补齐
