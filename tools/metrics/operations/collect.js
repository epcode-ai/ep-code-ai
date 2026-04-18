#!/usr/bin/env node
/**
 * 运维度量周报 · 从 Git 拉数据
 *
 * 采集维度:
 *   - 发布计划 / Runbook / 故障报告 / 复盘 commit 数
 *   - revert commit 数（粗估回滚次数）
 *   - hotfix 数（subject 含 hotfix/emergency 的 commit）
 *   - 故障响应: 从复盘文档数 + revert 数估算
 *
 * 用法:
 *   node tools/metrics/operations/collect.js [--since "30 days ago"] [--output METRICS-operations.md]
 */

import { writeFileSync } from 'node:fs';
import { argv } from 'node:process';
import { getCommits } from '../_common/git.js';

const args = {};
for (let i = 0; i < argv.length; i++) {
  if (!argv[i].startsWith('--')) continue;
  const k = argv[i].slice(2);
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) args[k] = true; else { args[k] = v; i++; }
}
const since = args.since || '30 days ago';
const outputFile = args.output || 'METRICS-operations.md';

const OPS_PATHS = [
  '**/04-operations/**',
  '**/runbook*',
  '**/release-plan*',
  '**/postmortem*',
  '**/incident*',
];

function count(p) { return getCommits({ since, pathspec: p }).length; }

const runbook = count('**/runbook*');
const releasePlan = count('**/release-plan*');
const postmortem = count('**/postmortem*');
const incident = count('**/incident*');

const allCommits = getCommits({ since });
const reverts = allCommits.filter(c => /^revert\b/i.test(c.subject)).length;
const hotfixes = allCommits.filter(c => /hotfix|emergency|紧急/i.test(c.subject)).length;

const opsUnique = new Set();
for (const p of OPS_PATHS) for (const c of getCommits({ since, pathspec: p })) opsUnique.add(c.hash);

const byAuthor = {};
for (const p of OPS_PATHS) {
  for (const c of getCommits({ since, pathspec: p })) {
    byAuthor[c.author] = (byAuthor[c.author] || 0) + 1;
  }
}
const topAuthors = Object.entries(byAuthor).sort((a, b) => b[1] - a[1]).slice(0, 5);

const lines = [];
lines.push(`# 运维度量周报`);
lines.push('');
lines.push(`- 采集窗口: since **${since}**`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');

lines.push(`## 运维产出`);
lines.push('');
lines.push('| 类别 | commit 数 |');
lines.push('|------|----------|');
lines.push(`| Runbook | ${runbook} |`);
lines.push(`| 发布计划 | ${releasePlan} |`);
lines.push(`| 故障报告 | ${incident} |`);
lines.push(`| 复盘 | ${postmortem} |`);
lines.push(`| **运维产出 commit 合计** | **${opsUnique.size}** |`);
lines.push('');

lines.push(`## 稳定性指标（粗估）`);
lines.push('');
lines.push('| 指标 | 值 | 说明 |');
lines.push('|------|----|------|');
lines.push(`| 回滚数 | ${reverts} | subject 以 \`Revert\` 开头的 commit |`);
lines.push(`| Hotfix 数 | ${hotfixes} | subject 含 hotfix/emergency/紧急 的 commit |`);
lines.push(`| 复盘产出 | ${postmortem} | 如复盘数 < 故障数,提示复盘欠账 |`);
lines.push('');

lines.push(`## 贡献者 Top-5（运维产出）`);
lines.push('');
if (topAuthors.length === 0) lines.push('_(无)_');
else {
  lines.push('| 作者 | commit 数 |');
  lines.push('|------|----------|');
  for (const [a, n] of topAuthors) lines.push(`| ${a} | ${n} |`);
}
lines.push('');

writeFileSync(outputFile, lines.join('\n'));
console.log(`✅ ${outputFile} · 运维产出 ${opsUnique.size} commit · 回滚 ${reverts} · Hotfix ${hotfixes}`);
