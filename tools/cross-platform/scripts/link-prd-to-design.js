#!/usr/bin/env node
/**
 * link-prd-to-design.js
 *
 * 业务 → 开发 联动:PRD 变更时,找出可能受影响的设计文档。
 *
 * 算法:
 *   1. 找出最近一次 git 变更涉及的 PRD 文件（或 --prd 指定）
 *   2. 从 PRD 里提取 REQ-xxx / US-xxx ID
 *   3. 遍历设计目录（docs/design/ + docs/adr/ + 02-development/ 下 *.md）,
 *      找引用了相同 REQ/US ID 的文档
 *   4. 输出"受影响清单 + 建议动作"Markdown
 *
 * 用法:
 *   node link-prd-to-design.js [--prd <path>] [--design <dir>] [--since HEAD~10] [--output IMPACT.md]
 *
 * 退出码:
 *   0 = 无受影响（或未触发）
 *   1 = 有受影响文档（需评审）
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { argv, exit } from 'node:process';

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

function walk(p) {
  if (!existsSync(p)) return [];
  const s = statSync(p);
  if (s.isFile()) return [p];
  const out = [];
  (function rec(d) {
    for (const n of readdirSync(d)) {
      const full = join(d, n);
      const st = statSync(full);
      if (st.isDirectory()) rec(full);
      else if (/\.(md|markdown)$/i.test(n)) out.push(full);
    }
  })(p);
  return out;
}

const REQ_RE = /\b((?:REQ|US)[-_]?\d+)\b/gi;

const args = parseArgs(argv.slice(2));

// 1. 找 PRD 文件
let prdFiles = [];
if (args.prd) {
  prdFiles = [resolve(args.prd)];
} else {
  // 从 git 变更里找
  const since = args.since || 'HEAD~1';
  try {
    const out = execSync(`git diff --name-only ${since}..HEAD`, { encoding: 'utf8' });
    prdFiles = out.split('\n')
      .filter(l => /(prd|PRD).*\.md$/i.test(l) || /01-business.*\.md$/.test(l))
      .map(l => resolve(l));
  } catch {
    console.error(`❌ 无法从 git 找 PRD 变更。请加 --prd <path>`);
    exit(2);
  }
}
prdFiles = prdFiles.filter(existsSync);

if (prdFiles.length === 0) {
  console.log('ℹ️  本次未发现 PRD 变更（或 --prd 未指定有效文件）');
  exit(0);
}

// 2. 从 PRD 提取 ID
const changedReqs = new Set();
for (const f of prdFiles) {
  const content = readFileSync(f, 'utf8');
  let m;
  while ((m = REQ_RE.exec(content)) !== null) {
    changedReqs.add(m[1].toUpperCase().replace('_', '-'));
  }
}

if (changedReqs.size === 0) {
  console.log('ℹ️  PRD 里未识别到 REQ-xxx / US-xxx ID,无法联动');
  exit(0);
}

// 3. 遍历设计文档
const designRoots = (args.design || 'docs/design,docs/adr,examples/leave-management-system/02-development')
  .split(',').map(s => resolve(s.trim())).filter(existsSync);

const designFiles = designRoots.flatMap(r => walk(r));
const impacted = []; // { file, matched: [REQ-1, ...] }

for (const df of designFiles) {
  const content = readFileSync(df, 'utf8');
  const matched = new Set();
  let m;
  while ((m = REQ_RE.exec(content)) !== null) {
    const id = m[1].toUpperCase().replace('_', '-');
    if (changedReqs.has(id)) matched.add(id);
  }
  if (matched.size) impacted.push({ file: df, matched: [...matched].sort() });
}

// 4. 输出报告
const lines = [];
lines.push(`# 业务 → 开发 · 影响面分析`);
lines.push('');
lines.push(`- 变更的 PRD: ${prdFiles.map(f => '`' + f.split('/').slice(-3).join('/') + '`').join(', ')}`);
lines.push(`- 涉及需求 ID: ${[...changedReqs].sort().map(x => '`' + x + '`').join(', ')}`);
lines.push(`- 扫描设计目录: ${designRoots.map(d => '`' + d.split('/').slice(-2).join('/') + '`').join(', ')}`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');

if (impacted.length === 0) {
  lines.push('## ✅ 无关联设计文档');
  lines.push('');
  lines.push('但请人工确认:');
  lines.push('- 是否有未按 REQ-xxx 引用的设计需要复查');
  lines.push('- 是否应该为变更新增 ADR');
} else {
  lines.push(`## ⚠️ 受影响设计文档 (${impacted.length})`);
  lines.push('');
  lines.push('| 文档 | 匹配的需求 ID | 建议动作 |');
  lines.push('|------|--------------|---------|');
  for (const it of impacted) {
    const short = it.file.split('/').slice(-3).join('/');
    lines.push(`| \`${short}\` | ${it.matched.join(', ')} | 评审是否需同步更新 / 补 ADR |`);
  }
  lines.push('');
  lines.push(`## 建议 checklist`);
  lines.push('');
  lines.push('- [ ] 设计文档已同步修订');
  lines.push('- [ ] 如果涉及技术选型变动,补 ADR');
  lines.push('- [ ] API 契约（若有）已同步更新');
  lines.push('- [ ] 测试策略受影响方已周知（考虑触发 recommend-regression.js）');
}

const out = args.output || 'IMPACT-prd-to-design.md';
writeFileSync(out, lines.join('\n'));
console.log(`📄 ${out}`);
console.log(`   PRD: ${prdFiles.length} 份 · 需求 ID: ${changedReqs.size} 个 · 受影响设计: ${impacted.length} 份`);
exit(impacted.length > 0 ? 1 : 0);
