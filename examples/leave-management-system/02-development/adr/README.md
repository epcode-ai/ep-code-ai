# Architecture Decision Records

> 本目录由 `tools/cross-platform/scripts/generate-adr-index.js` 自动生成,请勿手动编辑索引表。
> 新增/修改 ADR 后,重跑命令即可刷新。

## 列表

| # | 标题 | 状态 | 日期 |
|---|------|------|------|
| [0001](./0001-use-postgresql.md) | ADR-0001: 使用 PostgreSQL 作为主数据库 | ✅ Accepted | 2026-04-06 |

## 怎么写新 ADR

1. 复制 `templates/development/adr-template.md` 到当前目录
2. 文件名按 `NNNN-简短描述.md`（NNNN 递增）
3. 填写内容
4. 重跑 `node tools/cross-platform/scripts/generate-adr-index.js --target examples/leave-management-system/02-development/adr/` 刷新索引
