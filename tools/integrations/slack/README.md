# Slack 集成

把本框架与 Slack 打通，做发版通知、故障告警、测试进度推送等。

## 能做什么

| 脚本 | 用途 |
|------|------|
| [notify.js](./notify.js) | 通用消息发送（支持富文本 Block Kit） |
| [send-release-note.js](./send-release-note.js) | 从 Release Note Markdown 生成 Slack 消息 |

## 环境变量

**方式 1: Incoming Webhook**（最简单）

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000/B00000/xxx
```

获取: Slack 工作区 → 管理 → 自定义集成 → Incoming Webhooks → 新增。

**方式 2: Bot Token**（功能更全，如需上传文件）

```bash
SLACK_BOT_TOKEN=xoxb-xxx
SLACK_DEFAULT_CHANNEL=#dev-notify
```

本脚本主要用方式 1（够用、免费、无 OAuth 烦恼）。

## 使用示例

### 发送简单消息

```bash
node tools/integrations/slack/notify.js \
  --text "v1.2.0 发布完成，灰度 100%"
```

### 发送富文本（Block Kit）

```bash
node tools/integrations/slack/notify.js \
  --title "📢 v1.2.0 发布" \
  --text "批量导出订单 + 性能优化" \
  --color good \
  --link "https://github.com/.../releases/v1.2.0"
```

`--color`: `good`（绿）/ `warning`（黄）/ `danger`（红）

### 从 Release Note 发

```bash
node tools/integrations/slack/send-release-note.js \
  --file examples/leave-management-system/02-development/release-note-v1.0.md
```

脚本会解析 Markdown 里的"新增/修复/破坏性变更"等段落,发成结构化 Slack 消息。

## 典型场景

### 1. CI 失败通知

```yaml
- name: Notify Slack on failure
  if: failure()
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  run: |
    node tools/integrations/slack/notify.js \
      --title "❌ CI failed on ${{ github.ref }}" \
      --text "${{ github.event.head_commit.message }}" \
      --color danger \
      --link "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

### 2. 发版自动通告

```bash
# 在 tag 触发的 workflow 里
node tools/integrations/slack/send-release-note.js \
  --file "release-note-${GITHUB_REF_NAME}.md"
```

### 3. 测试每日进度（配合 cron）

```bash
# 每天 18:00 推送今日测试情况
node tools/integrations/slack/notify.js \
  --title "📊 今日测试汇总" \
  --text "通过 $PASS / 失败 $FAIL / 新 Bug $NEW_BUGS"
```

## 关于企业微信 / 钉钉 / 飞书

如果你们公司用不了 Slack,见 [../im/](../im/)。

## 安全

- **不要在代码仓库里硬编码 Webhook URL**,用环境变量
- Webhook URL 本身就是凭证,泄漏等于被控制发消息
- 用 `.env` 本地开发，CI 用 Secret
- 出现泄漏立即去 Slack 后台 Revoke

## 相关资源

- [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks)
- [Block Kit Builder](https://app.slack.com/block-kit-builder)
- [Slack API 文档](https://api.slack.com/)
