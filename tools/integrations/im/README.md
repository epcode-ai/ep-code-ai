# 国内 IM 集成（企业微信 / 钉钉 / 飞书）

通过机器人 Webhook 往群里发消息。三大主流 IM 统一在一个 notify.js 里处理。

## 能做什么

| 脚本 | 用途 |
|------|------|
| [notify.js](./notify.js) | 通用通知（自动识别企业微信 / 钉钉 / 飞书） |

## 环境变量

根据你用的 IM，设置对应 Webhook URL：

```bash
# 企业微信（WeCom）
WECOM_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# 钉钉（DingTalk）
DINGTALK_WEBHOOK_URL=https://oapi.dingtalk.com/robot/send?access_token=xxx
# 钉钉加签（如启用了加签校验）
DINGTALK_SECRET=SEC_xxx

# 飞书（Feishu / Lark）
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
# 飞书签名校验（如启用）
FEISHU_SECRET=xxx
```

**三个设置任一即可**，notify.js 自动选用。

## 获取 Webhook

### 企业微信

1. 群设置 → 群机器人 → 添加
2. 复制 Webhook 地址

### 钉钉

1. 群设置 → 智能群助手 → 添加机器人 → 自定义（Webhook 接入）
2. 安全设置勾"加签"（强烈推荐），复制 secret
3. 复制 Webhook

### 飞书

1. 群设置 → 群机器人 → 添加机器人 → 自定义机器人
2. 复制 Webhook
3. 推荐开启"签名校验",复制 secret

## 使用示例

### 发送简单文本

```bash
# 自动选择可用的 IM（按 WECOM > DINGTALK > FEISHU 优先级）
node tools/integrations/im/notify.js \
  --text "v1.2.0 已发布到灰度"

# 显式指定
node tools/integrations/im/notify.js \
  --platform wecom \
  --text "..."
```

### 带 @ 提及（各家不同）

```bash
# 企业微信: @手机号
node tools/integrations/im/notify.js \
  --platform wecom \
  --text "注意: 线上告警" \
  --mention "13800138000"

# 钉钉: @手机号 或 @all
node tools/integrations/im/notify.js \
  --platform dingtalk \
  --text "紧急" \
  --mention "all"

# 飞书: @open_id 或 @all
node tools/integrations/im/notify.js \
  --platform feishu \
  --text "测试完成" \
  --mention "all"
```

### 发送 Markdown（企业微信/飞书支持）

```bash
node tools/integrations/im/notify.js \
  --platform wecom \
  --markdown "# 发布通知\n\n* v1.2.0 上线\n* 负责人: @张三"
```

## 典型场景

### 1. CI 失败通知

```yaml
- name: Notify WeCom on failure
  if: failure()
  env:
    WECOM_WEBHOOK_URL: ${{ secrets.WECOM_WEBHOOK_URL }}
  run: |
    node tools/integrations/im/notify.js \
      --text "CI 失败: ${{ github.ref }} - 请检查"
```

### 2. 线上告警转发

配合监控系统（Prometheus Alertmanager）,把告警转到企业微信群。

### 3. 发版通知

```bash
node tools/integrations/im/notify.js \
  --text "v1.2.0 发布完成,灰度 100%"
```

## 三家 IM 的差异

| 特性 | 企业微信 | 钉钉 | 飞书 |
|------|---------|------|------|
| 文本消息 | ✅ | ✅ | ✅ |
| Markdown | ✅（有限） | ✅（有限） | ✅ |
| @ 提及 | 手机号 | 手机号 / all | open_id / all |
| 签名校验 | 无 | 加签（推荐） | 签名（推荐） |
| 消息频率限制 | 20/分钟 | 20/分钟 | 100/分钟（群） |
| 消息大小 | 4096 字符 | 12000 字符 | 30000 字符 |

## 安全

- Webhook URL 本身就是凭证,不要硬编码或泄漏
- 钉钉/飞书强烈建议开启**签名校验**,防止被别人伪造发消息
- 泄漏立即去 IM 后台删除机器人

## 相关资源

- [企业微信机器人文档](https://developer.work.weixin.qq.com/document/path/91770)
- [钉钉自定义机器人](https://open.dingtalk.com/document/robots/custom-robot-access)
- [飞书自定义机器人](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)
