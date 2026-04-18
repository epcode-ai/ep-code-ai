#!/usr/bin/env node
/**
 * 禅道 · 查询 Bug 列表
 *
 * 用法:
 *   node list-bugs.js --product <id> [--status active|resolved|closed] [--limit 50] [--dry-run]
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { ZentaoClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];
const optional = readEnv(['ZENTAO_DEFAULT_PRODUCT']);
const product = args.product || optional.ZENTAO_DEFAULT_PRODUCT;
const status = args.status || 'active';
const limit = parseInt(args.limit || '50', 10);

if (!product) {
  console.error('❌ 缺少 --product 或 ZENTAO_DEFAULT_PRODUCT');
  exit(2);
}

let env;
if (dryRun) {
  env = {
    ZENTAO_BASE_URL: process.env.ZENTAO_BASE_URL || 'https://zentao.example.com',
    ZENTAO_USERNAME: 'dry-run',
    ZENTAO_PASSWORD: 'dry-run',
  };
} else {
  env = requireEnv(
    ['ZENTAO_BASE_URL', 'ZENTAO_USERNAME', 'ZENTAO_PASSWORD'],
    '禅道 list-bugs'
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

const path = `product-browse-${product}-byStatus-${status}-0-0-${limit}-1.json`;
const res = await client.get(path);

if (!res.ok) {
  console.error(`❌ 查询失败: HTTP ${res.status}`);
  exit(1);
}

if (dryRun) {
  const mock = [
    { id: 1001, title: '[mock] 登录页验证码刷新异常', severity: 2, status: 'active' },
    { id: 1002, title: '[mock] 导出 Excel 超 10MB 文件崩溃', severity: 1, status: 'active' },
    { id: 1003, title: '[mock] 列表分页在 Safari 显示错位', severity: 3, status: 'active' },
  ];
  console.log(`ℹ️  [dry-run] 模拟返回 ${mock.length} 条 Bug:\n`);
  console.log('| ID | 严重度 | 状态 | 标题 |');
  console.log('|----|--------|------|------|');
  for (const b of mock) {
    console.log(`| ${b.id} | ${b.severity} | ${b.status} | ${b.title} |`);
  }
  exit(0);
}

// 真实响应解析
let bugs = [];
try {
  // 禅道 API 返回 data 字段是 JSON 字符串
  const parsed = typeof res.data?.data === 'string' ? JSON.parse(res.data.data) : res.data?.data;
  bugs = Object.values(parsed?.bugs || {});
} catch (err) {
  console.error(`⚠️  响应解析失败: ${err.message}`);
  console.error(res.text?.slice(0, 500));
  exit(1);
}

console.log(`📋 Product ${product} · 状态=${status} · 共 ${bugs.length} 条\n`);
console.log('| ID | 严重度 | 状态 | 标题 |');
console.log('|----|--------|------|------|');
for (const b of bugs) {
  console.log(`| ${b.id} | ${b.severity} | ${b.status} | ${(b.title || '').slice(0, 60)} |`);
}
