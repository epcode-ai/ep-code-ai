#!/usr/bin/env node
/**
 * 统一国内 IM 通知（企业微信 / 钉钉 / 飞书）
 *
 * 用法:
 *   node notify.js [--platform wecom|dingtalk|feishu] --text "..." [--markdown "..."] [--mention "..."]
 *
 * 环境变量:
 *   WECOM_WEBHOOK_URL            企业微信
 *   DINGTALK_WEBHOOK_URL         钉钉
 *   DINGTALK_SECRET              钉钉加签（可选）
 *   FEISHU_WEBHOOK_URL           飞书
 *   FEISHU_SECRET                飞书签名（可选）
 *
 * 自动选择:
 *   若未指定 --platform,按 WECOM > DINGTALK > FEISHU 顺序选第一个配置好的。
 */

import { readEnv } from '../_common/env.js';
import { request } from '../_common/http.js';
import { createHmac } from 'node:crypto';
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

if (!args.text && !args.markdown) {
  console.error('❌ 至少需要 --text 或 --markdown');
  exit(2);
}

const env = readEnv([
  'WECOM_WEBHOOK_URL',
  'DINGTALK_WEBHOOK_URL', 'DINGTALK_SECRET',
  'FEISHU_WEBHOOK_URL', 'FEISHU_SECRET',
]);

// 选平台
let platform = args.platform;
if (!platform) {
  if (env.WECOM_WEBHOOK_URL) platform = 'wecom';
  else if (env.DINGTALK_WEBHOOK_URL) platform = 'dingtalk';
  else if (env.FEISHU_WEBHOOK_URL) platform = 'feishu';
  else {
    console.error('❌ 未配置任何 IM 的 Webhook。设置以下之一:');
    console.error('   WECOM_WEBHOOK_URL / DINGTALK_WEBHOOK_URL / FEISHU_WEBHOOK_URL');
    exit(2);
  }
}

console.log(`📤 使用平台: ${platform}`);

let payload = null;
let url = null;
let platformName = '';

if (platform === 'wecom') {
  url = env.WECOM_WEBHOOK_URL;
  platformName = '企业微信';
  if (!url) { console.error('❌ 缺少 WECOM_WEBHOOK_URL'); exit(2); }

  if (args.markdown) {
    payload = { msgtype: 'markdown', markdown: { content: args.markdown } };
  } else {
    const textPayload = { content: args.text };
    if (args.mention) {
      textPayload.mentioned_mobile_list = args.mention.split(',').map(s => s.trim());
    }
    payload = { msgtype: 'text', text: textPayload };
  }
} else if (platform === 'dingtalk') {
  url = env.DINGTALK_WEBHOOK_URL;
  platformName = '钉钉';
  if (!url) { console.error('❌ 缺少 DINGTALK_WEBHOOK_URL'); exit(2); }

  // 加签（若配置）
  if (env.DINGTALK_SECRET) {
    const timestamp = Date.now();
    const stringToSign = `${timestamp}\n${env.DINGTALK_SECRET}`;
    const sign = encodeURIComponent(
      createHmac('sha256', env.DINGTALK_SECRET)
        .update(stringToSign).digest('base64')
    );
    url += `&timestamp=${timestamp}&sign=${sign}`;
  }

  if (args.markdown) {
    payload = {
      msgtype: 'markdown',
      markdown: {
        title: (args.text || '通知').slice(0, 30),
        text: args.markdown,
      },
    };
  } else {
    payload = { msgtype: 'text', text: { content: args.text } };
  }

  if (args.mention) {
    const at = { isAtAll: args.mention === 'all' };
    if (args.mention !== 'all') {
      at.atMobiles = args.mention.split(',').map(s => s.trim());
    }
    payload.at = at;
  }
} else if (platform === 'feishu') {
  url = env.FEISHU_WEBHOOK_URL;
  platformName = '飞书';
  if (!url) { console.error('❌ 缺少 FEISHU_WEBHOOK_URL'); exit(2); }

  // 签名（若配置）
  if (env.FEISHU_SECRET) {
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `${timestamp}\n${env.FEISHU_SECRET}`;
    const sign = createHmac('sha256', stringToSign)
      .update('').digest('base64');
    payload = { timestamp: String(timestamp), sign };
  } else {
    payload = {};
  }

  if (args.markdown) {
    payload.msg_type = 'interactive';
    payload.card = {
      elements: [
        {
          tag: 'markdown',
          content: args.markdown + (args.mention === 'all' ? '\n<at id=all></at>' : ''),
        },
      ],
    };
  } else {
    payload.msg_type = 'text';
    let content = args.text;
    if (args.mention === 'all') content += ' <at user_id="all">所有人</at>';
    payload.content = { text: content };
  }
} else {
  console.error(`❌ 未知平台: ${platform}`);
  exit(2);
}

console.log(`   → ${platformName}`);

const res = await request(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

if (res.ok) {
  // 每个平台的成功标志不一样,看 body
  const code = res.data?.errcode ?? res.data?.code ?? 0;
  if (code === 0) {
    console.log('✅ 已发送');
    exit(0);
  } else {
    console.error(`❌ ${platformName} 返回错误: ${res.data?.errmsg || res.data?.msg || res.text}`);
    exit(1);
  }
} else {
  console.error(`❌ 发送失败 (HTTP ${res.status})`);
  console.error(res.text.slice(0, 300));
  exit(1);
}
