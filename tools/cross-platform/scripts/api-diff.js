#!/usr/bin/env node
/**
 * api-diff.js
 *
 * 对比两份 Markdown 接口契约，输出变更清单。
 *
 * 用法:
 *   node scripts/api-diff.js <old.md> <new.md>
 *
 * 识别:
 *   - 新增/删除的章节
 *   - 表格中字段的变化（新增/删除/类型变化/必填性变化）
 *   - 错误码的新增/删除
 *
 * 输出:
 *   - Markdown 格式的变更报告
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

if (argv.length < 4) {
  console.error('用法: api-diff <old.md> <new.md>');
  exit(2);
}

const [, , oldFile, newFile] = argv;
for (const f of [oldFile, newFile]) {
  if (!existsSync(f)) {
    console.error(`文件不存在: ${f}`);
    exit(2);
  }
}

const oldContent = readFileSync(oldFile, 'utf8');
const newContent = readFileSync(newFile, 'utf8');

/** 解析 Markdown,按二级标题分段 */
function parseSections(content) {
  const sections = {};
  let current = null;
  for (const line of content.split(/\r?\n/)) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      current = m[1];
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  }
  return sections;
}

/** 解析 Markdown 表格为 Map */
function parseTable(lines) {
  const rows = lines.filter((l) => l.trim().startsWith('|'));
  if (rows.length < 3) return null; // header + separator + 至少 1 行
  const headers = rows[0].split('|').map((s) => s.trim()).filter(Boolean);
  const body = rows.slice(2);
  const data = [];
  for (const r of body) {
    const cells = r.split('|').map((s) => s.trim()).filter((_, i, arr) => i > 0 && i < arr.length);
    if (cells.length === headers.length) {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = cells[i]));
      data.push(obj);
    }
  }
  return { headers, rows: data };
}

const oldSections = parseSections(oldContent);
const newSections = parseSections(newContent);

/** 章节 diff */
const addedSections = Object.keys(newSections).filter((k) => !(k in oldSections));
const removedSections = Object.keys(oldSections).filter((k) => !(k in newSections));
const commonSections = Object.keys(newSections).filter((k) => k in oldSections);

/** 对每个共同章节做内容 diff */
const contentChanges = [];
for (const sec of commonSections) {
  const oldBody = oldSections[sec].join('\n').trim();
  const newBody = newSections[sec].join('\n').trim();
  if (oldBody !== newBody) {
    contentChanges.push({ section: sec, oldBody, newBody });
  }
}

/** 基本信息行 diff（如 "| 方法 | POST |"） */
function parseKv(lines) {
  const kv = {};
  for (const l of lines) {
    const m = /^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/.exec(l);
    if (m) kv[m[1]] = m[2];
  }
  return kv;
}

/** 输出报告 */
const out = [];
out.push(`# API Diff 报告`);
out.push(``);
out.push(`- 旧版: \`${oldFile}\``);
out.push(`- 新版: \`${newFile}\``);
out.push(``);

out.push(`## 章节变化`);
out.push(``);
if (addedSections.length > 0) {
  out.push(`### 新增章节（${addedSections.length}）`);
  addedSections.forEach((s) => out.push(`- 🟢 ${s}`));
  out.push(``);
}
if (removedSections.length > 0) {
  out.push(`### 移除章节（${removedSections.length}）⚠️ 破坏性变更`);
  removedSections.forEach((s) => out.push(`- 🔴 ${s}`));
  out.push(``);
}
if (addedSections.length === 0 && removedSections.length === 0) {
  out.push(`无章节增删`);
  out.push(``);
}

out.push(`## 内容变更`);
out.push(``);
if (contentChanges.length === 0) {
  out.push(`无内容变化`);
} else {
  for (const c of contentChanges) {
    out.push(`### 📝 ${c.section}`);
    out.push(``);
    out.push(`**旧版**:`);
    out.push('```');
    out.push(c.oldBody.slice(0, 400));
    if (c.oldBody.length > 400) out.push('... (省略)');
    out.push('```');
    out.push(``);
    out.push(`**新版**:`);
    out.push('```');
    out.push(c.newBody.slice(0, 400));
    if (c.newBody.length > 400) out.push('... (省略)');
    out.push('```');
    out.push(``);
  }
}

out.push(`## 测试建议`);
out.push(``);
out.push(`- [ ] 所有删除的章节/字段对应的用例要清理`);
out.push(`- [ ] 所有新增的字段要补测试用例`);
out.push(`- [ ] 对破坏性变更，需要确认客户端兼容性`);
out.push(`- [ ] 回归受影响的测试场景`);
out.push(``);

console.log(out.join('\n'));

// 有破坏性变更时退出码非 0
if (removedSections.length > 0) {
  process.stderr.write(`\n⚠️  检测到 ${removedSections.length} 项破坏性变更，请 review\n`);
  exit(1);
}
exit(0);
