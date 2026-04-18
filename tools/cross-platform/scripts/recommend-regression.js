#!/usr/bin/env node
/**
 * recommend-regression.js
 *
 * 开发 → 测试 联动:git diff + 用例关联表 → 推荐该回归的用例 ID。
 *
 * 算法:
 *   1. 取 git diff 的文件列表（基线: --base,默认 main）
 *   2. 从每个变更文件里抽"关联标识":
 *      - 文件路径里的模块段（如 src/payment/xx.ts → module:payment）
 *      - 文件里的 REQ-xxx / US-xxx 注释
 *      - commit message 里出现的 REQ-xxx / US-xxx
 *   3. 扫描用例目录,匹配用例文件里引用了上述标识的
 *   4. 输出推荐回归清单
 *
 * 用法:
 *   node recommend-regression.js [--base main] [--cases <dir>] [--output REGRESSION.md]
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename, dirname } from 'node:path';
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
      else if (/\.(md|markdown|ya?ml)$/i.test(n)) out.push(full);
    }
  })(p);
  return out;
}

const args = parseArgs(argv.slice(2));
const base = args.base || 'main';
const casesDir = resolve(args.cases || 'examples/leave-management-system/03-testing');
const output = args.output || 'REGRESSION.md';

const REQ_RE = /\b((?:REQ|US)[-_]?\d+)\b/gi;

// 1. git diff
let changedFiles = [];
try {
  const out = execSync(`git diff --name-only ${base}...HEAD`, { encoding: 'utf8' });
  changedFiles = out.split('\n').filter(Boolean);
} catch (e) {
  console.error(`❌ git diff ${base}...HEAD 失败: ${e.message}`);
  exit(2);
}
if (changedFiles.length === 0) {
  console.log('ℹ️  本次无变更,无需回归');
  exit(0);
}

// 2. 抽取关联标识
const modules = new Set();
const reqIds = new Set();

for (const f of changedFiles) {
  // 模块（路径第 2 段,如 src/payment/ → payment; examples/leave-management-system/02-development/ → leave-management-system）
  const parts = f.split('/');
  if (parts.length >= 2) modules.add(parts[1]);
  if (parts[0] === 'src' || parts[0] === 'app' || parts[0] === 'lib') {
    if (parts[1]) modules.add(parts[1]);
  }

  // 文件内 REQ/US ID
  if (existsSync(f)) {
    try {
      const content = readFileSync(f, 'utf8');
      let m;
      while ((m = REQ_RE.exec(content)) !== null) {
        reqIds.add(m[1].toUpperCase().replace('_', '-'));
      }
    } catch { /* binary / too large */ }
  }
}

// commit message 里的 REQ
try {
  const msgs = execSync(`git log --format=%B ${base}...HEAD`, { encoding: 'utf8' });
  let m;
  while ((m = REQ_RE.exec(msgs)) !== null) {
    reqIds.add(m[1].toUpperCase().replace('_', '-'));
  }
} catch { /* ignore */ }

// 3. 扫用例
if (!existsSync(casesDir)) {
  console.error(`❌ 用例目录不存在: ${casesDir}`);
  exit(2);
}
const caseFiles = walk(casesDir);

const byReq = new Map();    // reqId → Set<file>
const byModule = new Map(); // module → Set<file>
for (const cf of caseFiles) {
  const content = readFileSync(cf, 'utf8');
  // REQ 匹配
  let m;
  while ((m = REQ_RE.exec(content)) !== null) {
    const id = m[1].toUpperCase().replace('_', '-');
    if (reqIds.has(id)) {
      if (!byReq.has(id)) byReq.set(id, new Set());
      byReq.get(id).add(cf);
    }
  }
  // 模块匹配（用例文件路径 / 文件内容里提到模块名）
  for (const mod of modules) {
    if (cf.includes(`/${mod}/`) || content.includes(mod)) {
      if (!byModule.has(mod)) byModule.set(mod, new Set());
      byModule.get(mod).add(cf);
    }
  }
}

const allRecommended = new Set();
for (const s of byReq.values()) for (const f of s) allRecommended.add(f);
for (const s of byModule.values()) for (const f of s) allRecommended.add(f);

// 4. 输出
const lines = [];
lines.push(`# 回归用例推荐`);
lines.push('');
lines.push(`- 基线: \`${base}\``);
lines.push(`- 变更文件: **${changedFiles.length}**`);
lines.push(`- 涉及需求 ID: ${reqIds.size > 0 ? [...reqIds].sort().map(x => '`' + x + '`').join(', ') : '(无)'}`);
lines.push(`- 涉及模块: ${modules.size > 0 ? [...modules].sort().slice(0, 10).map(x => '`' + x + '`').join(', ') : '(无)'}`);
lines.push(`- 推荐回归: **${allRecommended.size}** 份用例文件`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');

if (byReq.size > 0) {
  lines.push(`## 按需求 ID 匹配`);
  lines.push('');
  lines.push('| 需求 ID | 用例文件 |');
  lines.push('|---------|---------|');
  for (const [id, files] of [...byReq].sort()) {
    for (const f of files) {
      lines.push(`| ${id} | \`${f.split('/').slice(-3).join('/')}\` |`);
    }
  }
  lines.push('');
}

if (byModule.size > 0) {
  lines.push(`## 按模块匹配`);
  lines.push('');
  lines.push('| 模块 | 用例文件 |');
  lines.push('|------|---------|');
  for (const [mod, files] of [...byModule].sort()) {
    for (const f of files) {
      lines.push(`| ${mod} | \`${f.split('/').slice(-3).join('/')}\` |`);
    }
  }
  lines.push('');
}

if (allRecommended.size === 0) {
  lines.push(`## ℹ️ 未匹配到任何用例`);
  lines.push('');
  lines.push('可能原因:');
  lines.push('- 变更不涉及业务逻辑（如文档 / 配置）');
  lines.push('- 用例里未按 REQ-xxx 或模块名打标签,无法机器关联');
  lines.push('- 建议: 推行"用例 frontmatter 写 requirements: [REQ-xxx]"约定');
}

writeFileSync(output, lines.join('\n'));
console.log(`🎯 推荐回归: ${allRecommended.size} 份用例`);
console.log(`   ${output}`);
exit(0);
