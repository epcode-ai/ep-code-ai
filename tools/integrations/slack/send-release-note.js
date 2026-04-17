#!/usr/bin/env node
/**
 * 解析 Release Note Markdown,发送结构化 Slack 消息
 *
 * 用法:
 *   node send-release-note.js --file release-note.md [--link URL]
 *
 * 解析:
 *   - 第一个 # 标题 → Slack header
 *   - ## 新增 / ## 修复 / ## 破坏性变更 等段落 → 分 section
 */

import { requireEnv } from '../_common/env.js';
import { request } from '../_common/http.js';
import { argv, exit } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';

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
if (!args.file) { console.error('❌ 缺少 --file'); exit(2); }
if (!existsSync(args.file)) { console.error(`❌ 文件不存在: ${args.file}`); exit(2); }

const env = requireEnv(['SLACK_WEBHOOK_URL'], 'Slack release note');

const md = readFileSync(args.file, 'utf8');
const lines = md.split(/\r?\n/);

// 解析 title
let title = '新版本发布';
for (const line of lines) {
  const m = /^#\s+(?!#)(.+)/.exec(line);
  if (m) { title = m[1].trim(); break; }
}

// 解析 section（## xxx）
const sections = {};
let currentSection = null;
for (const line of lines) {
  const m = /^##\s+(.+)$/.exec(line);
  if (m) {
    currentSection = m[1].trim();
    sections[currentSection] = [];
    continue;
  }
  if (currentSection) sections[currentSection].push(line);
}

// 构造 Slack Block Kit
const blocks = [
  {
    type: 'header',
    text: { type: 'plain_text', text: `🚀 ${title}`, emoji: true },
  },
];

const interestingSections = ['新增', 'Added', '修复', 'Fixed', '变更', 'Changed', '破坏性变更', 'Breaking Changes'];

for (const sec of interestingSections) {
  const body = sections[sec];
  if (!body) continue;
  const text = body.filter(l => l.trim()).slice(0, 10).join('\n');
  if (!text) continue;

  const isBreaking = sec.includes('破坏') || sec.toLowerCase().includes('breaking');
  const icon = isBreaking ? '⚠️' : sec.includes('修复') || sec.toLowerCase().includes('fix') ? '🔧' : '✨';

  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: `*${icon} ${sec}*\n${text}`.slice(0, 3000),
    },
  });
}

if (args.link) {
  blocks.push({
    type: 'actions',
    elements: [{
      type: 'button',
      text: { type: 'plain_text', text: '查看完整 Release Note', emoji: true },
      url: args.link,
    }],
  });
}

const payload = {
  text: `🚀 ${title}`,
  attachments: [{ color: '#36a64f', blocks }],
};

console.log(`📤 发送 Release 通知: ${title}`);
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
