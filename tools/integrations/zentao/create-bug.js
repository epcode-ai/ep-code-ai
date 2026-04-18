#!/usr/bin/env node
/**
 * 禅道 · 创建 Bug
 *
 * 用法:
 *   node create-bug.js --product <id> --title "..." [--severity 1-4] [--priority 1-4]
 *                      [--steps "..."] [--type codeerror] [--dry-run]
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { ZentaoClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];

const optional = readEnv(['ZENTAO_DEFAULT_PRODUCT']);
const product = args.product || optional.ZENTAO_DEFAULT_PRODUCT;

if (!args.title) {
  console.error('❌ 缺少 --title');
  exit(2);
}
if (!product) {
  console.error('❌ 缺少 --product 或 ZENTAO_DEFAULT_PRODUCT');
  exit(2);
}

let env;
if (dryRun) {
  env = {
    ZENTAO_BASE_URL: process.env.ZENTAO_BASE_URL || 'https://zentao.example.com',
    ZENTAO_USERNAME: process.env.ZENTAO_USERNAME || 'dry-run',
    ZENTAO_PASSWORD: process.env.ZENTAO_PASSWORD || 'dry-run',
  };
} else {
  env = requireEnv(
    ['ZENTAO_BASE_URL', 'ZENTAO_USERNAME', 'ZENTAO_PASSWORD'],
    '禅道 create-bug'
  );
}

const client = new ZentaoClient({
  baseUrl: env.ZENTAO_BASE_URL,
  username: env.ZENTAO_USERNAME,
  password: env.ZENTAO_PASSWORD,
  dryRun,
});

try {
  await client.login();
} catch (err) {
  console.error(`❌ 登录失败: ${err.message}`);
  exit(1);
}

const body = {
  product,
  title: args.title,
  severity: args.severity || '3',
  pri: args.priority || '3',
  type: args.type || 'codeerror',
  steps: args.steps || '',
  openedBuild: args.build || 'trunk',
};

const res = await client.post('bug-create.json', body);
if (!res.ok) {
  console.error(`❌ 创建失败: HTTP ${res.status}`);
  console.error(res.text?.slice(0, 500));
  exit(1);
}

if (dryRun) {
  console.log('✅ [dry-run] 已打印请求,未实际调用');
} else {
  console.log(`✅ Bug 已创建: id=${res.data?.id || res.data?.result || '(未知)'}`);
  console.log(`   ${env.ZENTAO_BASE_URL}/bug-view-${res.data?.id || '?'}.html`);
}
