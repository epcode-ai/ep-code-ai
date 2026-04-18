#!/usr/bin/env node
/**
 * TAPD · 批量同步 Markdown Bug
 *
 * 用法:
 *   node sync-from-markdown.js --file bugs.md [--workspace <id>] [--dry-run]
 */

import { readFileSync, existsSync } from 'node:fs';
import { requireEnv, readEnv } from '../_common/env.js';
import { TapdClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];
const optional = readEnv(['TAPD_WORKSPACE_ID', 'TAPD_DEFAULT_OWNER']);
const workspaceId = args.workspace || optional.TAPD_WORKSPACE_ID;

if (!args.file) {
  console.error('❌ 缺少 --file');
  exit(2);
}
if (!existsSync(args.file)) {
  console.error(`❌ 文件不存在: ${args.file}`);
  exit(2);
}
if (!workspaceId) {
  console.error('❌ 缺少 --workspace 或 TAPD_WORKSPACE_ID');
  exit(2);
}

const content = readFileSync(args.file, 'utf8');
const blocks = content.split(/^##\s+(?=BUG[-_]?\d+)/m).slice(1);
if (blocks.length === 0) {
  console.log('ℹ️  未发现 Bug 块');
  exit(0);
}

function parseBlock(block) {
  const lines = block.split(/\r?\n/);
  const h = /^(BUG[-_]?\d+):\s*(.+)/.exec(lines[0].trim());
  const meta = {};
  for (const ln of lines) {
    const m = /^\s*-\s*([^:：]+)[:：]\s*(.+)/.exec(ln);
    if (m) meta[m[1].trim()] = m[2].trim();
  }
  return {
    id: h?.[1],
    title: h?.[2] || lines[0].trim(),
    description: block.trim(),
    meta,
  };
}

let env;
if (dryRun) env = { TAPD_API_USER: 'dry-run', TAPD_API_PASSWORD: 'dry-run' };
else env = requireEnv(['TAPD_API_USER', 'TAPD_API_PASSWORD'], 'TAPD sync');

const client = new TapdClient({
  baseUrl: process.env.TAPD_API_BASE,
  user: env.TAPD_API_USER,
  password: env.TAPD_API_PASSWORD,
  workspaceId,
  dryRun,
});

let ok = 0, fail = 0;
for (const blk of blocks) {
  const b = parseBlock(blk);
  console.log(`\n→ ${b.id || '(no id)'}: ${b.title.slice(0, 60)}`);
  const body = {
    workspace_id: workspaceId,
    title: b.title,
    description: b.description,
    priority: b.meta['优先级'] || b.meta['priority'] || 'medium',
    severity: b.meta['严重度'] || b.meta['severity'] || 'normal',
    module: b.meta['模块'] || '',
    current_owner: optional.TAPD_DEFAULT_OWNER || '',
  };
  try {
    const res = await client.post('bugs', body);
    if (res.ok) { ok++; console.log(`  ✅ 已创建`); }
    else { fail++; console.log(`  ❌ HTTP ${res.status}`); }
  } catch (err) {
    fail++; console.log(`  ❌ ${err.message}`);
  }
}

console.log(`\n📊 成功 ${ok} / 失败 ${fail}${dryRun ? ' (dry-run)' : ''}`);
exit(fail > 0 ? 1 : 0);
