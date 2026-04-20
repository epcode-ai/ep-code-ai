# Architecture Decision Records

> 本目录由 `tools/cross-platform/scripts/generate-adr-index.js` 自动生成,请勿手动编辑索引表。
> 新增/修改 ADR 后,重跑命令即可刷新。

## 列表

| # | 标题 | 状态 | 日期 |
|---|------|------|------|
| [0001](./0001-four-adoption-modes.md) | ADR-0001: 采用 4 种接入模式作为框架一等公民 | ✅ Accepted | 2026-04-17 |
| [0002](./0002-cross-platform-desktop-stack.md) | ADR-0002: 跨平台桌面应用技术栈 · 混合方案 (macOS 保留 Swift + Linux/Windows 用 Tauri) | 📋 Proposed | 2026-04-20 |
| [0003](./0003-auto-update-strategy.md) | ADR-0003: 桌面应用自动更新策略 · GitHub Release 为源 | 📋 Proposed | 2026-04-20 |

## 怎么写新 ADR

1. 复制 `templates/development/adr-template.md` 到当前目录
2. 文件名按 `NNNN-简短描述.md`（NNNN 递增）
3. 填写内容
4. 重跑 `node tools/cross-platform/scripts/generate-adr-index.js --target docs/adr/` 刷新索引
