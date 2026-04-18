#!/usr/bin/env node
/**
 * TAPD · 查询 Bug 列表
 *
 * 用法:
 *   node list-bugs.js [--status new|in_progress|resolved|closed] [--limit 50] [--dry-run]
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { TapdClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];
const optional = readEnv(['TAPD_WORKSPACE_ID']);
const workspaceId = args.workspace || optional.TAPD_WORKSPACE_ID;
const status = args.status;
const limit = parseInt(args.limit || '50', 10);

if (!workspaceId) {
  console.error('❌ 缺少 --workspace 或 TAPD_WORKSPACE_ID');
  exit(2);
}

let env;
if (dryRun) {
  env = { TAPD_API_USER: 'dry-run', TAPD_API_PASSWORD: 'dry-run' };
} else {
  env = requireEnv(['TAPD_API_USER', 'TAPD_API_PASSWORD'], 'TAPD list-bugs');
}

const client = new TapdClient({
  baseUrl: process.env.TAPD_API_BASE,
  user: env.TAPD_API_USER,
  password: env.TAPD_API_PASSWORD,
  workspaceId,
  dryRun,
});

const params = new URLSearchParams({ workspace_id: workspaceId, limit });
if (status) params.append('status', status);

const res = await client.get(`bugs?${params.toString()}`);
if (!res.ok) {
  console.error(`❌ 查询失败: HTTP ${res.status}`);
  exit(1);
}

if (dryRun) {
  const mock = [
    { id: 'B1001', title: '[mock] 登录页验证码刷新异常', severity: 'serious', status: 'new' },
    { id: 'B1002', title: '[mock] Excel 导出超时', severity: 'fatal', status: 'in_progress' },
  ];
  console.log(`ℹ️  [dry-run] 模拟返回 ${mock.length} 条:\n`);
  console.log('| ID | 严重度 | 状态 | 标题 |');
  console.log('|----|--------|------|------|');
  for (const b of mock) console.log(`| ${b.id} | ${b.severity} | ${b.status} | ${b.title} |`);
  exit(0);
}

const bugs = (res.data?.data || []).map(x => x.Bug).filter(Boolean);
console.log(`📋 Workspace ${workspaceId} · 共 ${bugs.length} 条\n`);
console.log('| ID | 严重度 | 状态 | 标题 |');
console.log('|----|--------|------|------|');
for (const b of bugs) {
  console.log(`| ${b.id} | ${b.severity || '-'} | ${b.status || '-'} | ${(b.title || '').slice(0, 60)} |`);
}
