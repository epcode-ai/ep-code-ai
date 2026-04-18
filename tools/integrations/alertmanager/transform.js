/**
 * Alertmanager payload → IM 消息体
 * 纯函数,无副作用,便于单测。
 *
 * Alertmanager webhook 格式:
 *   https://prometheus.io/docs/alerting/latest/configuration/#webhook_config
 */

/**
 * 构造人类可读的 Markdown 摘要
 */
export function toMarkdown(payload) {
  const status = payload.status || 'unknown'; // firing | resolved
  const alerts = payload.alerts || [];
  const icon = status === 'firing' ? '🚨' : '✅';

  const lines = [];
  lines.push(`${icon} **${status.toUpperCase()}** · 共 ${alerts.length} 条`);
  lines.push('');
  for (const a of alerts.slice(0, 5)) {
    const labels = a.labels || {};
    const ann = a.annotations || {};
    const sev = labels.severity || '-';
    const name = labels.alertname || '(unnamed)';
    lines.push(`### [${sev}] ${name}`);
    if (labels.service) lines.push(`- 服务: \`${labels.service}\``);
    if (labels.env || labels.environment) lines.push(`- 环境: \`${labels.env || labels.environment}\``);
    if (labels.instance) lines.push(`- 实例: \`${labels.instance}\``);
    if (ann.summary) lines.push(`- 摘要: ${ann.summary}`);
    if (ann.description) lines.push(`- 详情: ${ann.description}`);
    if (a.startsAt) lines.push(`- 开始: ${a.startsAt}`);
    if (a.generatorURL) lines.push(`- 链接: ${a.generatorURL}`);
    lines.push('');
  }
  if (alerts.length > 5) lines.push(`_(还有 ${alerts.length - 5} 条略)_`);
  return lines.join('\n');
}

/** 企业微信机器人 markdown 消息 */
export function toWeChat(payload) {
  return {
    msgtype: 'markdown',
    markdown: { content: toMarkdown(payload) },
  };
}

/** 钉钉机器人 markdown 消息 */
export function toDingTalk(payload) {
  const first = (payload.alerts || [])[0]?.labels?.alertname || 'Alertmanager';
  return {
    msgtype: 'markdown',
    markdown: {
      title: `[${payload.status || 'alert'}] ${first}`,
      text: toMarkdown(payload),
    },
  };
}

/** 飞书机器人 text 消息（Markdown 卡片接口更复杂,这里用 text 最小实现） */
export function toFeishu(payload) {
  return {
    msg_type: 'text',
    content: { text: toMarkdown(payload).replace(/\*\*/g, '') },
  };
}

/** Slack Incoming Webhook 格式 */
export function toSlack(payload) {
  return {
    text: toMarkdown(payload),
    mrkdwn: true,
  };
}
