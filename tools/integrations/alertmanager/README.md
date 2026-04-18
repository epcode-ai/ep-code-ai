# Alertmanager 告警转发

> Sprint 3 产出。把 Prometheus Alertmanager 的 webhook 转发到企业微信/钉钉/飞书/Slack。

## 能力

| 脚本 | 作用 |
|------|------|
| `webhook-server.js` | 本地 HTTP 服务,接收 Alertmanager webhook 并转发 |
| `transform.js` | 纯函数: Alertmanager JSON → 各 IM 消息体（可单独用） |
| `test-fire.js` | 模拟 Alertmanager 推一条告警到 webhook-server(用于自测) |

## 启动

```bash
PORT=9900 \
IM_WEBHOOK_WECHAT=https://qyapi.weixin.qq.com/... \
IM_WEBHOOK_DINGTALK=https://oapi.dingtalk.com/... \
IM_WEBHOOK_SLACK=https://hooks.slack.com/... \
node tools/integrations/alertmanager/webhook-server.js
```

在 `alertmanager.yml` 里配置:

```yaml
receivers:
  - name: epcode-bridge
    webhook_configs:
      - url: http://<host>:9900/alerts
        send_resolved: true
```

## 消息示例（企业微信 Markdown）

```
🚨 [FIRING · critical] HighErrorRate
- 服务: payment
- 环境: prod
- 触发时间: 2026-04-18 14:02 CST
- 描述: P99 错误率 > 5% 已持续 5 分钟
- 链接: https://grafana.example.com/d/xxx
```

## Dry-run / 本地自测

```bash
# 1. 启动 webhook-server（DRY_RUN=1 不真发,只打日志）
DRY_RUN=1 node tools/integrations/alertmanager/webhook-server.js

# 2. 另一个终端推一条模拟告警
node tools/integrations/alertmanager/test-fire.js
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `PORT` | 监听端口,默认 9900 |
| `IM_WEBHOOK_WECHAT` | 企业微信机器人 URL（可选） |
| `IM_WEBHOOK_DINGTALK` | 钉钉机器人 URL（可选） |
| `IM_WEBHOOK_FEISHU` | 飞书机器人 URL（可选） |
| `IM_WEBHOOK_SLACK` | Slack Incoming Webhook URL（可选） |
| `DRY_RUN` | `1` 时仅打印不外发 |

至少配置一个 IM_WEBHOOK_* 即可转发到该平台。
