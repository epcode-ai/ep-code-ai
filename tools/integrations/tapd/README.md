# TAPD 集成

> Sprint 3 产出。基于 TAPD 开放 API（https://open.tapd.cn/）,零依赖。

## 能力

| 脚本 | 作用 |
|------|------|
| `create-bug.js` | 创建 Bug |
| `list-bugs.js` | 查询 Bug 列表 |
| `sync-from-markdown.js` | 批量把 Markdown Bug 同步到 TAPD |

## 环境变量

```bash
TAPD_API_BASE=https://api.tapd.cn        # 默认值
TAPD_API_USER=<client_id>                # 应用 ClientID
TAPD_API_PASSWORD=<client_secret>        # 应用 ClientSecret
TAPD_WORKSPACE_ID=<项目ID>               # TAPD 项目 ID
```

鉴权用 Basic Auth（`TAPD_API_USER:TAPD_API_PASSWORD`）。

## Dry-run

```bash
node tools/integrations/tapd/create-bug.js --dry-run \
  --title "支付页在 iOS 16 白屏" --severity serious --priority high
```

## Markdown 同步格式

同 Zentao,以 `## BUG-xxx: 标题` 分块,下方用 `- 字段: 值` 列元数据,`###` 标题下是正文。

## TAPD 字段映射

| TAPD 字段 | 来源 |
|-----------|------|
| `title` | 标题 |
| `description` | 全部正文（Markdown 原文）|
| `priority` | `优先级` 字段,默认 medium |
| `severity` | `严重度` 字段,默认 normal |
| `module` | `模块` 字段 |
| `current_owner` | 默认 `TAPD_DEFAULT_OWNER` 环境变量 |
