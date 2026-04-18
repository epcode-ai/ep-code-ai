#!/usr/bin/env node
/**
 * bug-trend.js
 *
 * 读 Bug JSON 数据（来源: Jira / 禅道 / TAPD 导出）,生成 Markdown 表格 + ASCII 趋势图。
 *
 * 用法:
 *   node bug-trend.js --file bugs.json [--period day|week|month] [--output METRICS-bugs.md]
 *
 * 输入 JSON 格式（兼容 3 种来源,自动识别）:
 *   [
 *     { "id": "B-1", "severity": 1, "status": "closed",
 *       "createdAt": "2026-04-01", "closedAt": "2026-04-05" },
 *     ...
 *   ]
 *
 * 字段同义词（自动归一）:
 *   severity: severity | 严重度 | 级别 （1 最严重 ... 4 最轻）
 *   status:   status   | 状态   | 当前状态
 *   createdAt: createdAt | created | openedDate | 创建时间
 *   closedAt:  closedAt | resolved | closedDate | 关闭时间
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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
if (!args.file) {
  console.error('用法: bug-trend --file <bugs.json> [--period week] [--output METRICS-bugs.md]');
  exit(2);
}
if (!existsSync(args.file)) {
  console.error(`❌ 文件不存在: ${args.file}`);
  exit(2);
}

const period = args.period || 'week';
const outputFile = args.output || 'METRICS-bugs.md';

// 解析 + 归一
const raw = JSON.parse(readFileSync(args.file, 'utf8'));
const bugs = (Array.isArray(raw) ? raw : raw.data || raw.bugs || []).map(b => ({
  id: b.id || b.key || b.bugId,
  severity: Number(b.severity || b['严重度'] || b.level || 3),
  status: (b.status || b['状态'] || 'open').toString().toLowerCase(),
  createdAt: b.createdAt || b.created || b.openedDate || b['创建时间'],
  closedAt: b.closedAt || b.resolved || b.closedDate || b['关闭时间'],
}));

if (bugs.length === 0) {
  console.log('ℹ️  没有 Bug 数据');
  exit(0);
}

// 分组键
function keyOf(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  if (period === 'day') return d.toISOString().slice(0, 10);
  if (period === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  // week: ISO 周
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

const opened = {}, closed = {};
for (const b of bugs) {
  const ck = keyOf(b.createdAt);
  if (ck) opened[ck] = (opened[ck] || 0) + 1;
  if (b.closedAt) {
    const xk = keyOf(b.closedAt);
    if (xk) closed[xk] = (closed[xk] || 0) + 1;
  }
}
const periods = [...new Set([...Object.keys(opened), ...Object.keys(closed)])].sort();

// 严重度分布
const bySeverity = {};
for (const b of bugs) {
  const sev = `S${b.severity}`;
  bySeverity[sev] = (bySeverity[sev] || 0) + 1;
}

// 未关闭
const openCount = bugs.filter(b => !b.closedAt && !['closed', 'resolved', 'fixed'].includes(b.status)).length;

// ASCII bar
function bar(n, max, width = 20) {
  if (max === 0) return '';
  const len = Math.round((n / max) * width);
  return '█'.repeat(len) + '░'.repeat(width - len);
}
const maxVal = Math.max(...periods.map(p => Math.max(opened[p] || 0, closed[p] || 0)), 1);

// 输出
const lines = [];
lines.push(`# Bug 趋势周报`);
lines.push('');
lines.push(`- 数据源: ${args.file}`);
lines.push(`- 聚合周期: ${period}`);
lines.push(`- Bug 总数: ${bugs.length}`);
lines.push(`- 未关闭: **${openCount}**`);
lines.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`## 严重度分布`);
lines.push('');
lines.push('| 严重度 | 数量 | 占比 |');
lines.push('|--------|------|------|');
for (const sev of Object.keys(bySeverity).sort()) {
  const n = bySeverity[sev];
  lines.push(`| ${sev} | ${n} | ${(n / bugs.length * 100).toFixed(1)}% |`);
}
lines.push('');
lines.push(`## 趋势（按${period}）`);
lines.push('');
lines.push('```');
lines.push('周期             新增                     关闭');
for (const p of periods) {
  const o = opened[p] || 0, c = closed[p] || 0;
  lines.push(`${p.padEnd(12)} ${String(o).padStart(3)} ${bar(o, maxVal, 15)} ${String(c).padStart(3)} ${bar(c, maxVal, 15)}`);
}
lines.push('```');
lines.push('');
lines.push(`## 明细表`);
lines.push('');
lines.push('| 周期 | 新增 | 关闭 | 净增 |');
lines.push('|------|------|------|------|');
for (const p of periods) {
  const o = opened[p] || 0, c = closed[p] || 0;
  lines.push(`| ${p} | ${o} | ${c} | ${o - c > 0 ? '+' + (o - c) : o - c} |`);
}
lines.push('');

writeFileSync(outputFile, lines.join('\n'));
console.log(`✅ 已输出: ${outputFile}`);
console.log(`   Bug 总数: ${bugs.length} · 未关闭: ${openCount} · 周期数: ${periods.length}`);
