#!/usr/bin/env node
/**
 * 发送 Slack 通知（通过 Incoming Webhook）
 *
 * 用法:
 *   node notify.js --text "..." [--title "..."] [--color good|warning|danger] [--link URL]
 *
 * 环境变量:
 *   SLACK_WEBHOOK_URL (必需)
 */

import { requireEnv } from '../_common/env.js';
import { request } from '../_common/http.js';
import { argv, exit } from 'node:process';

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (!val || val.startsWith('--')) opts[key] = true;
      else { opts[key] = val; i++; }
    }
  }
  return opts;
}

const args = parseArgs(argv.slice(2));
if (!args.text) { console.error('❌ 至少需要 --text'); exit(2); }

const env = requireEnv(['SLACK_WEBHOOK_URL'], 'Slack notify');

const colorMap = {
  good: '#36a64f',
  warning: '#ff9900',
  danger: '#cc0000',
  info: '#0088cc',
};
const color = colorMap[args.color] || args.color || colorMap.info;

// 构造 Block Kit 消息
const payload = {};

if (args.title) {
  payload.text = args.title;  // fallback text for notifications
  payload.attachments = [
    {
      color,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: args.title.slice(0, 150), emoji: true },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: args.text },
        },
      ],
    },
  ];
  if (args.link) {
    payload.attachments[0].blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '查看详情', emoji: true },
          url: args.link,
        },
      ],
    });
  }
} else {
  // 简单文本消息
  payload.text = args.text;
}

console.log('📤 发送 Slack 通知...');
const res = await request(env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (res.ok || res.text === 'ok') {
  console.log('✅ 已发送');
  exit(0);
} else {
  console.error(`❌ 发送失败 (HTTP ${res.status})`);
  console.error(res.text.slice(0, 300));
  exit(1);
}
