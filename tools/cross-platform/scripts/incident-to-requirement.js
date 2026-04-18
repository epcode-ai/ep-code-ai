#!/usr/bin/env node
/**
 * incident-to-requirement.js
 *
 * 运维 → 业务 联动:故障复盘 postmortem.md 的改进项 → 自动建 Issue 到需求池。
 *
 * 算法:
 *   1. 解析 postmortem.md,找"改进项 / 行动项 / Action Items"章节
 *   2. 抽取条目(支持 "- [ ] xxx" 或 "| # | 行动项 | 负责人 | Due | 状态 |" 表格)
 *   3. 输出:
 *      - Markdown 清单（用 Jira/GitHub/GitLab 哪种由用户决定）
 *      - 调用 tools/integrations/jira/sync-from-markdown.js 的 payload 文件
 *      - 或 GitHub Issue 批量创建命令(gh issue create)
 *
 * 用法:
 *   node incident-to-requirement.js --postmortem <file.md> [--output ACTIONS.md] [--target jira|github]
 *   node incident-to-requirement.js --postmortem <file.md> --dry-run --target github
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
if (!args.postmortem) {
  console.error('用法: incident-to-requirement --postmortem <file.md> [--target jira|github]');
  exit(2);
}
if (!existsSync(args.postmortem)) {
  console.error(`❌ 文件不存在: ${args.postmortem}`);
  exit(2);
}

const content = readFileSync(args.postmortem, 'utf8');
const lines = content.split(/\r?\n/);

// 找"改进项 / 行动项 / Action Items" 章节
const SEC_RE = /^#{1,3}\s*.*(改进项|行动项|Action\s*Items?|后续改进|跟进)/i;

let start = -1, end = lines.length;
for (let i = 0; i < lines.length; i++) {
  if (SEC_RE.test(lines[i])) { start = i; break; }
}
if (start === -1) {
  console.log('ℹ️  未找到"改进项/行动项/Action Items"章节');
  exit(0);
}
// 下一个同级或更高级标题处结束
const startLevel = (/^(#+)/.exec(lines[start]) || ['', '###'])[1].length;
for (let i = start + 1; i < lines.length; i++) {
  const m = /^(#+)\s/.exec(lines[i]);
  if (m && m[1].length <= startLevel) { end = i; break; }
}

// 过滤掉子章节里明显是"模板说明/自检/原则"的部分
const SKIP_SUBSEC_RE = /(SMART|自检|原则|模板|说明|Checklist\s*说明)/i;
const rawLines = lines.slice(start + 1, end);
const keptLines = [];
let skipMode = false;
let subHeaderLevel = startLevel;
for (const ln of rawLines) {
  const sh = /^(#+)\s+(.+)$/.exec(ln);
  if (sh && sh[1].length > startLevel) {
    skipMode = SKIP_SUBSEC_RE.test(sh[2]);
    continue;
  }
  if (sh && sh[1].length <= startLevel) break;
  if (!skipMode) keptLines.push(ln);
}
const block = keptLines.join('\n');

// 抽取条目
const items = [];

// 1) checkbox 列表
const cbRe = /^\s*-\s*\[\s*[x ]?\s*\]\s*(.+)$/gm;
let m;
while ((m = cbRe.exec(block)) !== null) {
  items.push({ title: m[1].trim(), source: 'checkbox' });
}

// 2) 表格（第一列序号,第二列行动项）
const tableRows = block.split('\n').filter(l => /^\s*\|.+\|.+\|/.test(l));
for (const row of tableRows) {
  if (/^\s*\|\s*-/.test(row)) continue; // 分隔行
  const cells = row.split('|').map(s => s.trim()).filter(Boolean);
  if (cells.length < 2) continue;
  // 跳过表头
  if (/^#$|序号|行动项|Action/i.test(cells[0])) continue;
  const title = cells[1];
  if (!title || /行动项|Action/i.test(title)) continue;
  const owner = cells[2];
  const due = cells[3];
  items.push({ title, owner, due, source: 'table' });
}

// 去重
const uniq = [];
const seen = new Set();
for (const it of items) {
  const k = it.title.toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  uniq.push(it);
}

if (uniq.length === 0) {
  console.log('ℹ️  未抽到改进项');
  exit(0);
}

// 故障标题/ID
const incidentTitle = (/^#\s+(.+)/m.exec(content) || [,'(故障复盘)'])[1];
const postmortemId = (/(POST-?\d+|INC-?\d+)/i.exec(content) || [])[1];

const target = args.target || 'markdown';
const out = args.output || 'INCIDENT-ACTIONS.md';
const dryRun = !!args['dry-run'];

const md = [];
md.push(`# 故障改进项 → 需求池`);
md.push('');
md.push(`- 源文件: \`${args.postmortem}\``);
md.push(`- 故障: ${incidentTitle}${postmortemId ? ' · ' + postmortemId : ''}`);
md.push(`- 改进项数量: **${uniq.length}**`);
md.push(`- 目标系统: ${target}`);
md.push(`- 生成时间: ${new Date().toISOString().slice(0, 10)}`);
md.push('');
md.push('| # | 行动项 | 负责人 | Due | 建议标题 |');
md.push('|---|--------|--------|-----|----------|');
uniq.forEach((it, i) => {
  const issueTitle = `[Incident] ${incidentTitle} · ${it.title.slice(0, 60)}`;
  md.push(`| ${i + 1} | ${it.title.slice(0, 80)} | ${it.owner || '-'} | ${it.due || '-'} | ${issueTitle} |`);
});
md.push('');

if (target === 'github') {
  md.push('## 批量创建 GitHub Issue');
  md.push('');
  md.push('```bash');
  md.push(`# 需要 gh CLI 已登录`);
  for (const it of uniq) {
    const title = `[Incident] ${incidentTitle.slice(0, 30)} · ${it.title.slice(0, 40)}`.replace(/"/g, '\\"');
    const body = `来源: ${args.postmortem}\\n\\n${it.title}\\n\\n负责人: ${it.owner || '未定'}\\nDue: ${it.due || '未定'}`;
    md.push(`gh issue create --title "${title}" --body "${body}" --label incident-follow-up`);
  }
  md.push('```');
} else if (target === 'jira') {
  md.push('## 批量同步到 Jira');
  md.push('');
  md.push('将下面的 Markdown 保存为 `incident-actions.md`,用:');
  md.push('');
  md.push('```bash');
  md.push('node tools/integrations/jira/sync-from-markdown.js --file incident-actions.md --project YOUR_PROJECT --type Task');
  md.push('```');
  md.push('');
  md.push('### sync Payload');
  md.push('');
  for (const it of uniq) {
    md.push(`## ${`[Incident] ${incidentTitle.slice(0, 40)} · ${it.title.slice(0, 50)}`}`);
    md.push('');
    md.push(`- 负责人: ${it.owner || '未定'}`);
    md.push(`- Due: ${it.due || '未定'}`);
    md.push(`- 来源: ${args.postmortem}`);
    md.push('');
    md.push(it.title);
    md.push('');
  }
}

writeFileSync(out, md.join('\n'));
console.log(`📄 ${out}`);
console.log(`   故障: ${incidentTitle.slice(0, 50)}`);
console.log(`   改进项: ${uniq.length} 个 · 目标: ${target}${dryRun ? ' (dry-run)' : ''}`);
exit(0);
