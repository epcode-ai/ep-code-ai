#!/usr/bin/env node
/**
 * TAPD · 创建 Bug
 *
 * 用法:
 *   node create-bug.js --title "..." [--severity normal] [--priority medium] [--module "..."] [--dry-run]
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { TapdClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];
const optional = readEnv(['TAPD_WORKSPACE_ID', 'TAPD_DEFAULT_OWNER']);
const workspaceId = args.workspace || optional.TAPD_WORKSPACE_ID;

if (!args.title) {
  console.error('❌ 缺少 --title');
  exit(2);
}
if (!workspaceId) {
  console.error('❌ 缺少 --workspace 或 TAPD_WORKSPACE_ID');
  exit(2);
}

let env;
if (dryRun) {
  env = {
    TAPD_API_BASE: process.env.TAPD_API_BASE || 'https://api.tapd.cn',
    TAPD_API_USER: 'dry-run',
    TAPD_API_PASSWORD: 'dry-run',
  };
} else {
  env = requireEnv(['TAPD_API_USER', 'TAPD_API_PASSWORD'], 'TAPD create-bug');
  env.TAPD_API_BASE = process.env.TAPD_API_BASE || 'https://api.tapd.cn';
}

const client = new TapdClient({
  baseUrl: env.TAPD_API_BASE,
  user: env.TAPD_API_USER,
  password: env.TAPD_API_PASSWORD,
  workspaceId,
  dryRun,
});

const body = {
  workspace_id: workspaceId,
  title: args.title,
  description: args.description || '',
  priority: args.priority || 'medium',
  severity: args.severity || 'normal',
  module: args.module || '',
  current_owner: args.assignee || optional.TAPD_DEFAULT_OWNER || '',
};

const res = await client.post('bugs', body);
if (!res.ok) {
  console.error(`❌ 创建失败: HTTP ${res.status}`);
  console.error(res.text?.slice(0, 500));
  exit(1);
}
const id = res.data?.data?.Bug?.id || res.data?.data?.id || 'unknown';
console.log(`✅ Bug 已创建: id=${id}${dryRun ? ' (dry-run)' : ''}`);
