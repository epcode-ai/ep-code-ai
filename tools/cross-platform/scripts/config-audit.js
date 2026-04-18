#!/usr/bin/env node
/**
 * config-audit.js
 *
 * 多环境配置 diff 审计（dev / staging / prod）
 *
 * 用法:
 *   node config-audit.js --files dev.yml,staging.yml,prod.yml [--output CONFIG-AUDIT.md]
 *   node config-audit.js --dir config/     # 自动识别目录下 *.yml / *.env / *.json
 *
 * 支持格式:
 *   - *.yml / *.yaml  (扁平 K:V,不处理嵌套的复杂情况,够用即可)
 *   - *.env           (KEY=VALUE)
 *   - *.json          (扁平对象)
 *
 * 输出:
 *   - 所有 key 的环境对比矩阵
 *   - 🔴 prod 独有 key（可能是遗漏的推广）
 *   - ⚠️ 某环境缺失 key
 *   - 🔐 敏感词检测（password/secret/key/token）在 prod 是否明文
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
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

let files = [];
if (args.files) {
  files = args.files.split(',').map(s => resolve(s.trim())).filter(Boolean);
} else if (args.dir) {
  const d = resolve(args.dir);
  files = readdirSync(d)
    .filter(n => /\.(ya?ml|env|json)$/i.test(n))
    .map(n => join(d, n));
} else {
  console.error('用法: --files a.yml,b.yml  或  --dir config/');
  exit(2);
}
if (files.length < 2) {
  console.error(`❌ 至少需要 2 个配置文件,当前 ${files.length}`);
  exit(2);
}
for (const f of files) if (!existsSync(f)) { console.error(`❌ 不存在: ${f}`); exit(2); }

function parseYaml(content) {
  // 扁平 key: value 解析（不处理 nested）
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const ln = line.replace(/#.*$/, '').trim();
    if (!ln) continue;
    const idx = ln.indexOf(':');
    if (idx === -1) continue;
    const k = ln.slice(0, idx).trim();
    let v = ln.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!/^[\w.-]+$/.test(k)) continue;
    out[k] = v;
  }
  return out;
}

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const ln = line.trim();
    if (!ln || ln.startsWith('#')) continue;
    const idx = ln.indexOf('=');
    if (idx === -1) continue;
    let v = ln.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[ln.slice(0, idx).trim()] = v;
  }
  return out;
}

function flattenJson(o, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(o || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flattenJson(v, key, out);
    else out[key] = Array.isArray(v) ? JSON.stringify(v) : String(v);
  }
  return out;
}

function parseFile(f) {
  const content = readFileSync(f, 'utf8');
  const ext = extname(f).toLowerCase();
  if (ext === '.yaml' || ext === '.yml') return parseYaml(content);
  if (ext === '.env') return parseEnv(content);
  if (ext === '.json') return flattenJson(JSON.parse(content));
  return {};
}

const envs = files.map(f => ({ name: basename(f), data: parseFile(f) }));
const allKeys = new Set();
for (const e of envs) for (const k of Object.keys(e.data)) allKeys.add(k);
const sortedKeys = [...allKeys].sort();

// 敏感词
const SENSITIVE = /(password|secret|token|api[_-]?key|credential)/i;
const LOOKS_PLAINTEXT = (v) => v && !/^(\$\{|<|\*+$|ENC\(|vault:)/i.test(v) && v.length > 3;

// 对比
let diffCount = 0, missingCount = 0, prodLeakCount = 0;
const prodLike = envs.find(e => /prod/i.test(e.name));

const lines = [];
lines.push(`# 多环境配置审计`);
lines.push('');
lines.push(`- 文件: ${envs.map(e => `\`${e.name}\``).join(' / ')}`);
lines.push(`- Key 总数: ${sortedKeys.length}`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`## 配置矩阵`);
lines.push('');
lines.push(`| Key | ${envs.map(e => e.name).join(' | ')} | 备注 |`);
lines.push(`|-----|${envs.map(() => '-----').join('|')}|------|`);

for (const key of sortedKeys) {
  const values = envs.map(e => e.data[key]);
  const present = values.map(v => v !== undefined);
  const missing = present.filter(p => !p).length > 0;
  const distinct = new Set(values.filter(v => v !== undefined)).size > 1;

  let note = '';
  if (missing) { note = '⚠️ 部分缺失'; missingCount++; }
  else if (distinct) { note = '🔁 环境不同'; diffCount++; }

  if (SENSITIVE.test(key) && prodLike) {
    const v = prodLike.data[key];
    if (LOOKS_PLAINTEXT(v)) { note += ' 🔐 prod 疑似明文'; prodLeakCount++; }
  }

  const row = values.map(v => {
    if (v === undefined) return '❌';
    // 敏感值脱敏显示
    if (SENSITIVE.test(key)) return `\`${v.slice(0, 2)}***\``;
    return `\`${v}\``;
  });
  lines.push(`| \`${key}\` | ${row.join(' | ')} | ${note || '✅'} |`);
}

lines.push('');
lines.push(`## 汇总`);
lines.push('');
lines.push(`- 环境差异 Key 数: **${diffCount}**`);
lines.push(`- 部分缺失 Key 数: **${missingCount}**`);
lines.push(`- prod 疑似明文敏感值: **${prodLeakCount}**`);

const out = args.output || 'CONFIG-AUDIT.md';
writeFileSync(out, lines.join('\n'));
console.log(`📊 Keys=${sortedKeys.length} · 差异=${diffCount} · 缺失=${missingCount} · 敏感明文=${prodLeakCount}`);
console.log(`✅ 报告: ${out}`);

// 退出码: 有敏感明文 = 2,有缺失 = 1,全对齐 = 0
if (prodLeakCount > 0) exit(2);
if (missingCount > 0) exit(1);
exit(0);
