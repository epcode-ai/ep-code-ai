#!/usr/bin/env node
/**
 * Development metrics collector
 *
 * 从 Git 拉开发相关指标。
 *
 * 用法:
 *   node tools/metrics/development/collect.js [--since "3 months ago"] [--output METRICS-development.md]
 *
 * 采集维度:
 *   - Commit 规范率（Conventional Commits）
 *   - Commit 类型分布
 *   - 代码变更规模分布
 *   - MR 评审轮次（粗估）
 *   - ADR 产出率
 */

import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import { existsSync, readdirSync } from 'node:fs';
import { getCommits, getCommitStats, groupByConventionalType, estimateMRRounds } from '../_common/git.js';

const args = argv.slice(2);
let since = '3 months ago';
let output = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--since') { since = args[i + 1]; i++; }
  else if (args[i] === '--output') { output = args[i + 1]; i++; }
}

console.log(`🔍 采集开发度量（自 ${since}）...\n`);

// ===== 1. 所有 commit =====
const allCommits = getCommits({ since });
const nonMerge = allCommits.filter(c => !c.subject.startsWith('Merge '));

// ===== 2. Conventional Commits 规范率 =====
const { groups, nonconforming } = groupByConventionalType(allCommits);
const conformCount = nonMerge.length - nonconforming;
const conformRate = nonMerge.length > 0
  ? Math.round((conformCount / nonMerge.length) * 100)
  : 0;

// ===== 3. Commit 类型分布 =====
const typeEntries = Object.entries(groups).sort(([, a], [, b]) => b - a);

// ===== 4. 代码变更规模（采样最近 100 个非 merge commit）=====
const sample = nonMerge.slice(0, 100);
const sizeBuckets = { small: 0, medium: 0, large: 0, huge: 0 };
let totalInsertions = 0;
let totalDeletions = 0;
for (const c of sample) {
  const s = getCommitStats(c.hash);
  const changes = s.insertions + s.deletions;
  totalInsertions += s.insertions;
  totalDeletions += s.deletions;
  if (changes < 50) sizeBuckets.small++;
  else if (changes < 500) sizeBuckets.medium++;
  else if (changes < 2000) sizeBuckets.large++;
  else sizeBuckets.huge++;
}

// ===== 5. MR 评审轮次（粗估）=====
const mrStats = estimateMRRounds();

// ===== 6. ADR 产出 =====
let adrCount = 0;
const adrDirs = [
  'docs/adr',
  'examples/leave-management-system/02-development/adr',
];
for (const d of adrDirs) {
  if (existsSync(d)) {
    const files = readdirSync(d).filter(f => /^\d{4}-.+\.md$/.test(f));
    adrCount += files.length;
  }
}

// ===== 生成报告 =====
const lines = [
  '# 开发度量周报',
  '',
  `> 自动生成自 \`tools/metrics/development/collect.js\``,
  `> 数据区间：自 ${since}`,
  `> 生成时间：${new Date().toISOString().slice(0, 19)}Z`,
  '',
  '## 一、总览',
  '',
  '| 指标 | 数值 |',
  '|------|------|',
  `| 总 commit 数（不含 Merge） | ${nonMerge.length} |`,
  `| Conventional Commits 规范率 | ${conformRate}% |`,
  `| 不合规 commit | ${nonconforming} |`,
  `| Merge commit 数 | ${mrStats.mergeCount} |`,
  `| 平均每次合入包含的 commit 数 | ${mrStats.avgRounds} |`,
  `| ADR 总数（全仓库） | ${adrCount} |`,
  `| 采样 commit 的总改动行数 | +${totalInsertions} / -${totalDeletions} |`,
  '',
];

// Commit 类型分布
lines.push('## 二、Commit 类型分布（Conventional Commits）');
lines.push('');
lines.push('| 类型 | 数量 | 占合规 commit |');
lines.push('|------|------|--------------|');
for (const [type, cnt] of typeEntries) {
  const pct = conformCount > 0 ? Math.round((cnt / conformCount) * 100) : 0;
  lines.push(`| \`${type}\` | ${cnt} | ${pct}% |`);
}
if (nonconforming > 0) {
  lines.push(`| _不合规_ | ${nonconforming} | — |`);
}
lines.push('');

// 代码变更规模分布
lines.push('## 三、代码变更规模分布（采样 100 个最近 commit）');
lines.push('');
lines.push('| 规模 | 数量 | 占比 |');
lines.push('|------|------|------|');
const total = sample.length;
for (const [label, key] of [
  ['小（< 50 行）', 'small'],
  ['中（50-499 行）', 'medium'],
  ['大（500-1999 行）', 'large'],
  ['超大（≥ 2000 行）', 'huge'],
]) {
  const pct = total > 0 ? Math.round((sizeBuckets[key] / total) * 100) : 0;
  lines.push(`| ${label} | ${sizeBuckets[key]} | ${pct}% |`);
}
lines.push('');

// 基线参考
lines.push('## 四、参考基线（开发篇建议值）');
lines.push('');
lines.push('| 指标 | 期望 | 当前 | 达标 |');
lines.push('|------|------|------|------|');
lines.push(`| Conventional Commits 合规率 | ≥ 90% | ${conformRate}% | ${conformRate >= 90 ? '✅' : '⚠️'} |`);
lines.push(`| 单次 MR 合入的 commit 数 | 1-3 | ${mrStats.avgRounds || 0} | ${mrStats.avgRounds <= 3 ? '✅' : '⚠️'} |`);
lines.push(`| 单个 commit 大小 | 多数 < 500 行 | ${Math.round((sizeBuckets.small + sizeBuckets.medium) / total * 100)}% 在 < 500 行 | ${(sizeBuckets.small + sizeBuckets.medium) / total >= 0.8 ? '✅' : '⚠️'} |`);
lines.push('');

lines.push('---');
lines.push('');
lines.push('_本报告由 `tools/metrics/development/collect.js` 自动生成,请勿手动编辑。_');

const outStr = lines.join('\n');

if (output) {
  writeFileSync(output, outStr);
  console.log(`✅ 已写入 ${output}`);
} else {
  console.log(outStr);
}

console.log('');
console.log('📊 摘要:');
console.log(`   - Commit 规范率: ${conformRate}%`);
console.log(`   - ADR 总数: ${adrCount}`);
console.log(`   - 采样 commit: ${sample.length}`);
