#!/usr/bin/env node
/**
 * check-all.js
 *
 * 聚合跑所有常用检查：链接 + markdown 风格。
 * 适合 CI 和本地预提交。
 *
 * 用法:
 *   node scripts/check-all.js [target,默认当前目录]
 */

import { spawnSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit, cwd } from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = resolve(argv[2] || cwd());
const nodeExe = process.execPath;

const checks = [
  { name: 'Link check', script: 'check-links.js', required: true },
  { name: 'Markdown lint', script: 'markdown-lint.js', required: false },
];

let failed = 0;

for (const c of checks) {
  console.log(`\n\x1b[36m═══ ${c.name} ═══\x1b[0m`);
  const r = spawnSync(nodeExe, [join(__dirname, c.script), target], {
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    if (c.required) {
      failed++;
      console.log(`\x1b[31m❌ ${c.name} 失败（required）\x1b[0m`);
    } else {
      console.log(`\x1b[33m⚠️  ${c.name} 有警告\x1b[0m`);
    }
  } else {
    console.log(`\x1b[32m✅ ${c.name} 通过\x1b[0m`);
  }
}

console.log(`\n${failed === 0 ? '\x1b[32m✅ 全部通过' : '\x1b[31m❌ ' + failed + ' 项必需检查失败'}\x1b[0m`);
exit(failed === 0 ? 0 : 1);
