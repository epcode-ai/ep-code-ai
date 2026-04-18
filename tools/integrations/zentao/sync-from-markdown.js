#!/usr/bin/env node
/**
 * 禅道 · 从 Markdown 批量同步 Bug
 *
 * 用法:
 *   node sync-from-markdown.js --file bugs.md --product <id> [--dry-run]
 *
 * Markdown 格式:
 *   ## BUG-001: 标题
 *
 *   - 严重度: 2
 *   - 优先级: 3
 *   - 模块: 用户中心
 *
 *   ### 重现步骤
 *   1. ...
 */

import { readFileSync, existsSync } from 'node:fs';
import { requireEnv, readEnv } from '../_common/env.js';
import { ZentaoClient, parseArgs } from './_client.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
const dryRun = !!args['dry-run'];
const optional = readEnv(['ZENTAO_DEFAULT_PRODUCT']);
const product = args.product || optional.ZENTAO_DEFAULT_PRODUCT;

if (!args.file) {
  console.error('❌ 缺少 --file <bugs.md>');
  exit(2);
}
if (!existsSync(args.file)) {
  console.error(`❌ 文件不存在: ${args.file}`);
  exit(2);
}
if (!product) {
  console.error('❌ 缺少 --product 或 ZENTAO_DEFAULT_PRODUCT');
  exit(2);
}

const content = readFileSync(args.file, 'utf8');

// 切块: 以 ## BUG-xxx 为分隔
const blocks = content.split(/^##\s+(?=BUG[-_]?\d+)/m).slice(1);
if (blocks.length === 0) {
  console.log(`ℹ️  未发现 Bug 块（格式: "## BUG-001: 标题"）`);
  exit(0);
}

function parseBlock(block) {
  const lines = block.split(/\r?\n/);
  const headerMatch = /^(BUG[-_]?\d+):\s*(.+)/.exec(lines[0].trim());
  const id = headerMatch ? headerMatch[1] : null;
  const title = headerMatch ? headerMatch[2].trim() : lines[0].trim();
  const meta = {};
  for (const ln of lines) {
    const m = /^\s*-\s*([^:：]+)[:：]\s*(.+)/.exec(ln);
    if (m) meta[m[1].trim()] = m[2].trim();
  }
  // 正文: 从 ### 开始
  const bodyStart = lines.findIndex(l => /^###\s+/.test(l));
  const steps = bodyStart >= 0 ? lines.slice(bodyStart).join('\n') : '';
  return { id, title, meta, steps };
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
    '禅道 sync'
  );
}

const client = new ZentaoClient({
  baseUrl: env.ZENTAO_BASE_URL,
  username: env.ZENTAO_USERNAME,
  password: env.ZENTAO_PASSWORD,
  dryRun,
});
await client.login();

let ok = 0, fail = 0;
for (const blk of blocks) {
  const bug = parseBlock(blk);
  console.log(`\n→ ${bug.id || '(no id)'}: ${bug.title.slice(0, 60)}`);
  const body = {
    product,
    title: bug.title,
    severity: bug.meta['严重度'] || bug.meta['severity'] || '3',
    pri: bug.meta['优先级'] || bug.meta['priority'] || '3',
    type: bug.meta['类型'] || 'codeerror',
    steps: bug.steps,
    openedBuild: bug.meta['版本'] || 'trunk',
  };
  try {
    const res = await client.post('bug-create.json', body);
    if (res.ok) {
      ok++;
      console.log(`  ✅ 已创建 (id=${res.data?.id || 'dry-run'})`);
    } else {
      fail++;
      console.log(`  ❌ 失败: HTTP ${res.status}`);
    }
  } catch (err) {
    fail++;
    console.log(`  ❌ 错误: ${err.message}`);
  }
}

console.log(`\n📊 同步完成: 成功 ${ok} / 失败 ${fail}${dryRun ? ' (dry-run)' : ''}`);
exit(fail > 0 ? 1 : 0);
