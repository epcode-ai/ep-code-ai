#!/usr/bin/env node
/**
 * coverage-analysis.js
 *
 * 分析 "需求 ↔ 用例" 映射,找出未被用例覆盖的需求。
 *
 * 用法:
 *   node coverage-analysis.js --req <需求目录或文件> --cases <用例目录或文件> [--output COVERAGE.md]
 *
 * 规则（基于约定）:
 *   - 需求 ID 匹配: REQ-\d+  或  US-\d+（在 PRD 的 #### 或 ### 标题中）
 *   - 用例里引用需求: 任意位置出现 "REQ-xxx" / "US-xxx" 或 Frontmatter `requirements: [REQ-1, ...]`
 *
 * 输出:
 *   - 覆盖率 = 被用例引用的需求数 / 需求总数
 *   - 未覆盖需求清单
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
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

const args = parseArgs(argv.slice(2));
if (!args.req || !args.cases) {
  console.error('用法: coverage-analysis --req <path> --cases <path> [--output COVERAGE.md]');
  exit(2);
}

function walk(path) {
  const abs = resolve(path);
  if (!existsSync(abs)) {
    console.error(`❌ 路径不存在: ${abs}`);
    exit(2);
  }
  const st = statSync(abs);
  if (st.isFile()) return [abs];
  const out = [];
  (function rec(p) {
    for (const name of readdirSync(p)) {
      const full = join(p, name);
      const s = statSync(full);
      if (s.isDirectory()) rec(full);
      else if (/\.(md|markdown|yaml|yml|json)$/i.test(name)) out.push(full);
    }
  })(abs);
  return out;
}

const REQ_RE = /\b((?:REQ|US)[-_]?\d+)\b/gi;

// 提取需求
const reqFiles = walk(args.req);
const requirements = new Map(); // id -> { title, file }
for (const f of reqFiles) {
  const content = readFileSync(f, 'utf8');
  // 从标题行提取
  for (const line of content.split(/\r?\n/)) {
    const m = /^#{2,5}\s+((?:REQ|US)[-_]?\d+)[:：]?\s*(.*)/i.exec(line);
    if (m) {
      const id = m[1].toUpperCase().replace('_', '-');
      if (!requirements.has(id)) requirements.set(id, { title: m[2].trim() || id, file: f });
    }
  }
}

if (requirements.size === 0) {
  console.log(`ℹ️  未在 ${args.req} 找到需求 ID（格式: REQ-1 / US-1）`);
  exit(0);
}

// 提取用例里引用的需求
const caseFiles = walk(args.cases);
const covered = new Set();      // 只计需求表里有的
const unknownRefs = new Set();  // 用例引用了但需求表里没有的（悬空引用）
const caseToReqs = new Map();   // file -> Set<reqId>
for (const f of caseFiles) {
  const content = readFileSync(f, 'utf8');
  const refs = new Set();
  let m;
  while ((m = REQ_RE.exec(content)) !== null) {
    const id = m[1].toUpperCase().replace('_', '-');
    refs.add(id);
    if (requirements.has(id)) covered.add(id);
    else unknownRefs.add(id);
  }
  if (refs.size) caseToReqs.set(f, refs);
}

const total = requirements.size;
const hit = covered.size;
const rate = total === 0 ? 0 : (hit / total * 100);
const uncovered = [...requirements.entries()].filter(([id]) => !covered.has(id));

const lines = [];
lines.push(`# 需求覆盖率分析`);
lines.push('');
lines.push(`- 需求源: ${args.req}`);
lines.push(`- 用例源: ${args.cases}`);
lines.push(`- 需求总数: **${total}**`);
lines.push(`- 被覆盖: **${hit}**`);
lines.push(`- 覆盖率: **${rate.toFixed(1)}%**`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');

if (uncovered.length > 0) {
  lines.push(`## ⚠️ 未覆盖需求 (${uncovered.length})`);
  lines.push('');
  lines.push('| 需求 ID | 标题 | 来源文件 |');
  lines.push('|---------|------|---------|');
  for (const [id, info] of uncovered) {
    lines.push(`| ${id} | ${info.title.slice(0, 60)} | \`${info.file.split('/').slice(-3).join('/')}\` |`);
  }
  lines.push('');
} else {
  lines.push('## ✅ 所有需求均被用例覆盖');
  lines.push('');
}

if (unknownRefs.size > 0) {
  lines.push(`## ⚠️ 悬空引用 (${unknownRefs.size})`);
  lines.push('');
  lines.push('下列 ID 在用例中出现但未在需求源中找到,可能是：需求已废弃 / 拼错 / 需求源路径不全。');
  lines.push('');
  for (const id of [...unknownRefs].sort()) lines.push(`- ${id}`);
  lines.push('');
}

lines.push(`## 用例 → 需求映射`);
lines.push('');
lines.push('| 用例文件 | 引用需求 |');
lines.push('|---------|---------|');
for (const [f, refs] of caseToReqs) {
  lines.push(`| \`${f.split('/').slice(-3).join('/')}\` | ${[...refs].sort().join(', ')} |`);
}

const out = args.output || 'COVERAGE.md';
writeFileSync(out, lines.join('\n'));
console.log(`📊 需求总数 ${total} · 覆盖 ${hit} (${rate.toFixed(1)}%) · 未覆盖 ${uncovered.length}`);
console.log(`✅ 报告已输出: ${out}`);

// 退出码: 全部覆盖=0,有未覆盖=1（CI 软门禁）
exit(uncovered.length > 0 ? 1 : 0);
