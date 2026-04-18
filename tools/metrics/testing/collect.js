#!/usr/bin/env node
/**
 * 测试度量周报 · 从 Git 拉数据
 *
 * 采集维度:
 *   - 测试产出 commit 数（用例 / 策略 / 报告 / 提测单 / Bug 报告相关）
 *   - 提测达标情况（提测单 commit 数）
 *   - Bug 报告 commit 数
 *   - 文件贡献者 Top-5（03-testing 下）
 *
 * 用法:
 *   node tools/metrics/testing/collect.js [--since "30 days ago"] [--output METRICS-testing.md]
 */

import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import { getCommits, runGit } from '../_common/git.js';

const args = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) args[k] = true; else { args[k] = v; i++; }
}
const since = args.since || '30 days ago';
const outputFile = args.output || 'METRICS-testing.md';

// 测试相关目录/关键词
const TEST_PATHS = [
  '**/03-testing/**',
  '**/test-cases*',
  '**/test-strategy*',
  '**/test-report*',
  '**/submission-*',
  '**/bug-*',
];

function countMatch(pattern) {
  return getCommits({ since, pathspec: pattern }).length;
}

const cases = countMatch('**/test-cases*');
const strategy = countMatch('**/test-strategy*');
const report = countMatch('**/test-report*');
const submission = countMatch('**/submission-*');
const bugReports = countMatch('**/bug-*');

const allTesting = new Set();
for (const p of TEST_PATHS) {
  for (const c of getCommits({ since, pathspec: p })) allTesting.add(c.hash);
}

// 贡献者 Top-5
const byAuthor = {};
for (const p of TEST_PATHS) {
  for (const c of getCommits({ since, pathspec: p })) {
    byAuthor[c.author] = (byAuthor[c.author] || 0) + 1;
  }
}
const topAuthors = Object.entries(byAuthor)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);

// 最近 Bug 标题（从 commit message 里找）
const bugCommits = getCommits({ since })
  .filter(c => /^(fix|bug)(\(|:)/i.test(c.subject))
  .slice(0, 10);

const lines = [];
lines.push(`# 测试度量周报`);
lines.push('');
lines.push(`- 采集窗口: since **${since}**`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`## 测试产出`);
lines.push('');
lines.push('| 类别 | commit 数 |');
lines.push('|------|----------|');
lines.push(`| 测试用例 | ${cases} |`);
lines.push(`| 测试策略 | ${strategy} |`);
lines.push(`| 测试报告 | ${report} |`);
lines.push(`| 提测申请 | ${submission} |`);
lines.push(`| Bug 报告 | ${bugReports} |`);
lines.push(`| **测试产出 commit 合计** | **${allTesting.size}** |`);
lines.push('');

lines.push(`## 最近 fix/bug 提交 (Top 10)`);
lines.push('');
if (bugCommits.length === 0) {
  lines.push('_(本时间窗无 fix/bug 提交)_');
} else {
  lines.push('| 日期 | 作者 | Subject |');
  lines.push('|------|------|---------|');
  for (const c of bugCommits) lines.push(`| ${c.date} | ${c.author} | ${c.subject.slice(0, 80)} |`);
}
lines.push('');

lines.push(`## 贡献者 Top-5（测试产出）`);
lines.push('');
if (topAuthors.length === 0) lines.push('_(无)_');
else {
  lines.push('| 作者 | commit 数 |');
  lines.push('|------|----------|');
  for (const [a, n] of topAuthors) lines.push(`| ${a} | ${n} |`);
}
lines.push('');

writeFileSync(outputFile, lines.join('\n'));
console.log(`✅ ${outputFile} · 测试产出 ${allTesting.size} commit · fix/bug ${bugCommits.length} 条`);
