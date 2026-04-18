#!/usr/bin/env node
/**
 * Business metrics collector
 *
 * 从 Git log 拉业务相关指标,生成 Markdown 报告。
 *
 * 用法:
 *   node tools/metrics/business/collect.js [--since "3 months ago"] [--output METRICS-business.md]
 *
 * 采集维度（只从 Git 拉,不依赖 Jira）:
 *   - PRD / 业务文档变更次数
 *   - CR 提交次数（含 "CR-" 或 "变更" 关键词）
 *   - 需求模板使用情况
 *   - PRD 修订周期
 */

import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import { getCommits } from '../_common/git.js';

// 解析参数
const args = argv.slice(2);
let since = '3 months ago';
let output = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--since') { since = args[i + 1]; i++; }
  else if (args[i] === '--output') { output = args[i + 1]; i++; }
}

console.log(`🔍 采集业务度量（自 ${since}）...\n`);

// ===== 1. PRD 相关变更 =====
const prdCommits = getCommits({
  since,
  pathspec: 'docs/prd/ docs/chapters/02-business/ templates/business/ examples/**/01-business/',
});

// ===== 2. CR 提交 =====
const allCommits = getCommits({ since });
const crCommits = allCommits.filter(c =>
  /CR[-_]\d|变更请求|change[- ]request|需求变更/i.test(c.subject)
);

// ===== 3. 业务文档 diff（按 commit 数） =====
const docsByMonth = {};
for (const c of prdCommits) {
  const month = c.date.slice(0, 7); // YYYY-MM
  docsByMonth[month] = (docsByMonth[month] || 0) + 1;
}

// ===== 4. 作者分布 =====
const authorStats = {};
for (const c of prdCommits) {
  authorStats[c.author] = (authorStats[c.author] || 0) + 1;
}

// ===== 生成报告 =====
const lines = [
  '# 业务度量周报',
  '',
  `> 自动生成自 \`tools/metrics/business/collect.js\``,
  `> 数据区间：自 ${since}`,
  `> 生成时间：${new Date().toISOString().slice(0, 19)}Z`,
  '',
  '## 一、总览',
  '',
  '| 指标 | 数值 |',
  '|------|------|',
  `| 业务文档相关 commit | ${prdCommits.length} |`,
  `| CR（变更请求）相关 commit | ${crCommits.length} |`,
  `| 业务侧贡献者 | ${Object.keys(authorStats).length} 人 |`,
  `| CR 占业务 commit 比 | ${prdCommits.length > 0 ? Math.round((crCommits.length / prdCommits.length) * 100) : 0}% |`,
  '',
];

// 按月
lines.push('## 二、业务文档按月变更');
lines.push('');
lines.push('| 月份 | commit 数 |');
lines.push('|------|-----------|');
const months = Object.keys(docsByMonth).sort();
for (const m of months) {
  lines.push(`| ${m} | ${docsByMonth[m]} |`);
}
if (months.length === 0) lines.push('| —  | 无业务文档变更 |');
lines.push('');

// 作者
lines.push('## 三、业务侧贡献者（Top 10）');
lines.push('');
lines.push('| 作者 | 提交数 |');
lines.push('|------|--------|');
const authors = Object.entries(authorStats)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 10);
for (const [name, cnt] of authors) {
  lines.push(`| ${name} | ${cnt} |`);
}
if (authors.length === 0) lines.push('| — | 无数据 |');
lines.push('');

// CR 清单
lines.push('## 四、最近 10 次 CR / 变更相关 commit');
lines.push('');
if (crCommits.length === 0) {
  lines.push('_无_');
} else {
  for (const c of crCommits.slice(0, 10)) {
    lines.push(`- \`${c.date}\` ${c.author}: ${c.subject}`);
  }
}
lines.push('');

// 基线参考
lines.push('## 五、参考基线（业务篇建议值）');
lines.push('');
lines.push('| 指标 | 期望范围 | 说明 |');
lines.push('|------|---------|------|');
lines.push('| 版本内 CR 次数 | ≤ 3 | 过多说明需求不稳定 |');
lines.push('| 紧急变更占比 | ≤ 10% | 过高说明计划不充分 |');
lines.push('| 变更驳回率 | 30-50% | 过低说明把关不严 |');
lines.push('');

lines.push('---');
lines.push('');
lines.push('_本报告由 `tools/metrics/business/collect.js` 自动生成,请勿手动编辑。_');

const out = lines.join('\n');

if (output) {
  writeFileSync(output, out);
  console.log(`✅ 已写入 ${output}`);
} else {
  console.log(out);
}

console.log('');
console.log('📊 摘要:');
console.log(`   - 业务文档 commit: ${prdCommits.length}`);
console.log(`   - CR 相关 commit: ${crCommits.length}`);
console.log(`   - 贡献者: ${Object.keys(authorStats).length}`);
