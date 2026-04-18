#!/usr/bin/env node
/**
 * 统一度量入口 · 一次跑全部场景 collect.js
 *
 * 用法:
 *   node tools/metrics/collect.js [--since "7 days ago"] [--out-dir .]
 *
 * 等效于依次跑:
 *   - tools/metrics/business/collect.js
 *   - tools/metrics/development/collect.js
 *   - tools/metrics/testing/collect.js
 *   - tools/metrics/operations/collect.js
 */

import { spawnSync } from 'node:child_process';
import { argv, exit } from 'node:process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const k = a[i].slice(2);
    const v = a[i + 1];
    if (!v || v.startsWith('--')) o[k] = true;
    else { o[k] = v; i++; }
  }
  return o;
}

const args = parseArgs(argv.slice(2));
const since = args.since || '7 days ago';
const outDir = resolve(args['out-dir'] || '.');

const scenarios = [
  { name: 'business',    script: 'business/collect.js',    output: 'METRICS-business.md' },
  { name: 'development', script: 'development/collect.js', output: 'METRICS-development.md' },
  { name: 'testing',     script: 'testing/collect.js',     output: 'METRICS-testing.md' },
  { name: 'operations',  script: 'operations/collect.js',  output: 'METRICS-operations.md' },
];

const results = [];
for (const s of scenarios) {
  const script = join(__dirname, s.script);
  const outputPath = join(outDir, s.output);
  console.log(`\n▶ ${s.name} ...`);
  const r = spawnSync('node', [script, '--since', since, '--output', outputPath], {
    encoding: 'utf8',
    stdio: 'inherit',
  });
  results.push({ ...s, ok: r.status === 0, code: r.status });
}

console.log('\n========= 汇总 =========');
for (const r of results) {
  console.log(`  ${r.ok ? '✅' : '❌'} ${r.name.padEnd(12)} → ${r.output}`);
}
const failed = results.filter(r => !r.ok).length;
exit(failed > 0 ? 1 : 0);
