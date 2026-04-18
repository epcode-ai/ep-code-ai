#!/usr/bin/env node
/**
 * generate-dashboard.js
 *
 * 汇总各场景 METRICS-*.md → METRICS.md 总看板。
 *
 * 工作流:
 *   1. 先跑 tools/metrics/collect.js --since <窗口>
 *   2. 读各场景生成的 METRICS-*.md
 *   3. 提取关键数字(正则)拼成顶层摘要表
 *   4. 各场景内容以 "折叠 details" 方式附在下方
 *
 * 用法:
 *   node tools/metrics/generate-dashboard.js [--since "7 days ago"] [--output METRICS.md] [--skip-collect]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';

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
const output = resolve(args.output || 'METRICS.md');
const skipCollect = !!args['skip-collect'];

// 1. 先跑 collect（除非 --skip-collect）
if (!skipCollect) {
  console.log('▶ 采集各场景度量...');
  const r = spawnSync('node', [join(__dirname, 'collect.js'), '--since', since], {
    encoding: 'utf8',
    stdio: 'inherit',
  });
  if (r.status !== 0) {
    console.error('⚠️  部分场景采集失败,继续生成看板');
  }
}

// 2. 读各 METRICS-*.md
const sections = [
  { name: '业务', file: 'METRICS-business.md',    icon: '💼' },
  { name: '开发', file: 'METRICS-development.md', icon: '💻' },
  { name: '测试', file: 'METRICS-testing.md',     icon: '🧪' },
  { name: '运维', file: 'METRICS-operations.md',  icon: '🚀' },
];

function summary(content) {
  if (!content) return { pairs: [] };
  const pairs = [];
  const re = /^\|\s*\*?\*?\s*([^|]+?)\s*\*?\*?\s*\|\s*\*?\*?\s*(\d+(?:\.\d+)?%?)\s*\*?\*?\s*\|/gm;
  let m;
  while ((m = re.exec(content)) !== null) {
    const k = m[1].trim();
    const v = m[2].trim();
    // 跳过表头
    if (/^-+$/.test(k) || /^指标$|^类别$|^Key$|^项目$/i.test(k)) continue;
    pairs.push([k, v]);
  }
  return { pairs };
}

const dashboardLines = [];
dashboardLines.push(`# 📊 EP Code AI · 度量看板`);
dashboardLines.push('');
dashboardLines.push(`> 窗口: **${since}** · 生成时间: ${new Date().toISOString().slice(0, 10)}`);
dashboardLines.push('');
dashboardLines.push('本看板由 `tools/metrics/generate-dashboard.js` 汇总四大场景 `METRICS-*.md` 生成。');
dashboardLines.push('');

dashboardLines.push(`## 场景关键指标`);
dashboardLines.push('');

for (const s of sections) {
  const p = resolve(s.file);
  if (!existsSync(p)) {
    dashboardLines.push(`### ${s.icon} ${s.name}`);
    dashboardLines.push('');
    dashboardLines.push(`_(${s.file} 不存在,跳过)_`);
    dashboardLines.push('');
    continue;
  }
  const content = readFileSync(p, 'utf8');
  const { pairs } = summary(content);

  dashboardLines.push(`### ${s.icon} ${s.name}`);
  dashboardLines.push('');
  if (pairs.length === 0) {
    dashboardLines.push('_(无可提取指标)_');
  } else {
    dashboardLines.push('| 指标 | 值 |');
    dashboardLines.push('|------|-----|');
    for (const [k, v] of pairs.slice(0, 8)) {
      dashboardLines.push(`| ${k} | ${v} |`);
    }
  }
  dashboardLines.push('');
  dashboardLines.push(`<details>`);
  dashboardLines.push(`<summary>完整 ${s.file}</summary>`);
  dashboardLines.push('');
  dashboardLines.push(content);
  dashboardLines.push('');
  dashboardLines.push(`</details>`);
  dashboardLines.push('');
}

dashboardLines.push(`## 联动脚本（Sprint 4 产出）`);
dashboardLines.push('');
dashboardLines.push('| 场景 → | 脚本 | 作用 |');
dashboardLines.push('|--------|------|------|');
dashboardLines.push('| 业务 → 开发 | `link-prd-to-design.js` | PRD 变更 → 影响面 |');
dashboardLines.push('| 开发 → 测试 | `recommend-regression.js` | git diff → 回归用例推荐 |');
dashboardLines.push('| 测试 → 运维 | `generate-release-plan.js` | 测试报告 → 发布计划草稿 |');
dashboardLines.push('| 运维 → 业务 | `incident-to-requirement.js` | 复盘改进项 → Jira/GH Issue |');
dashboardLines.push('');

writeFileSync(output, dashboardLines.join('\n'));
console.log(`\n✅ 度量看板: ${output}`);
console.log(`   ${sections.filter(s => existsSync(resolve(s.file))).length}/${sections.length} 场景有数据`);
