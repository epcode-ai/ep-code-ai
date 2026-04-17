#!/usr/bin/env node
/**
 * check-submission.js
 *
 * 校验提测申请单 (Markdown) 的完整性，对照 templates/testing/submission/submission-template.md。
 *
 * 用法:
 *   node scripts/check-submission.js path/to/submission.md
 *
 * 校验内容:
 *   - 基本信息章节必填
 *   - 影响范围章节完整
 *   - 自测结果至少有 1 行
 *   - 提测达标 Checklist 的 4 大维度全部存在
 *
 * 退出码:
 *   0 = 达标
 *   1 = 不达标（列出缺项）
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

if (argv.length < 3) {
  console.error('用法: check-submission <file.md>');
  exit(2);
}
const file = argv[2];
if (!existsSync(file)) {
  console.error(`文件不存在: ${file}`);
  exit(2);
}

const content = readFileSync(file, 'utf8');

/** 要求的区块及最小行数 */
const REQUIRED_SECTIONS = [
  { name: '基本信息', minLines: 5, hint: '缺版本号/提测人/日期等信息' },
  { name: '本次变更内容', minLines: 2, hint: '必须说明新增/修改/修复内容' },
  { name: '影响范围', minLines: 3, hint: '必须列出直接和可能影响的模块' },
  { name: '自测结果', minLines: 2, hint: '必须有至少 1 行自测记录' },
  { name: '环境信息', minLines: 2, hint: '必须提供环境地址、账号等' },
  { name: '提测达标', minLines: 10, hint: '四大维度 checklist 缺失' },
];

/** 必须包含的 checklist 分类 */
const REQUIRED_CHECKLIST_CATEGORIES = [
  '代码层面',
  '自测层面',
  '文档层面',
  '环境层面',
];

const issues = [];

// 按二级标题切段
const sections = {};
const lines = content.split(/\r?\n/);
let current = null;
for (const line of lines) {
  const m = /^##\s+(.+?)\s*$/.exec(line);
  if (m) {
    current = m[1];
    sections[current] = [];
  } else if (current) {
    sections[current].push(line);
  }
}

// 1. 必备区块检查
for (const req of REQUIRED_SECTIONS) {
  const found = Object.keys(sections).find(
    (k) => k.includes(req.name) || req.name.includes(k)
  );
  if (!found) {
    issues.push(`❌ 缺少章节: 「${req.name}」 — ${req.hint}`);
    continue;
  }
  const body = sections[found].join('\n').trim();
  const nonEmpty = sections[found].filter((l) => l.trim()).length;
  if (nonEmpty < req.minLines) {
    issues.push(`⚠️  章节「${req.name}」内容过少（${nonEmpty} 行 < ${req.minLines}）`);
  }
}

// 2. checklist 分类检查
for (const cat of REQUIRED_CHECKLIST_CATEGORIES) {
  if (!content.includes(cat)) {
    issues.push(`❌ 提测达标 checklist 缺少分类: 「${cat}」`);
  }
}

// 3. 空 checklist（全是 [ ] 没勾）
const uncheckedCount = (content.match(/^\s*-\s*\[\s*\]/gm) || []).length;
const checkedCount = (content.match(/^\s*-\s*\[x\]/gim) || []).length;
const totalChecks = uncheckedCount + checkedCount;
if (totalChecks > 0 && checkedCount === 0) {
  issues.push(`⚠️  发现 ${totalChecks} 个 checkbox,但全部未勾选（是否填错了格式？）`);
}

// 4. 明显未填写的占位
const placeholders = [
  /\[版本号\]|\[姓名\]|\[日期\]|\[模块名\]|\[简要说明\]/g,
];
for (const p of placeholders) {
  const found = content.match(p);
  if (found && found.length >= 3) {
    issues.push(`⚠️  疑似大量未填占位符（${found.length} 处 \`${p.source.slice(0, 40)}\`）`);
  }
}

console.log(`📋 文件: ${file}`);
console.log(`📊 章节数: ${Object.keys(sections).length}`);
console.log(`☑️  已勾选: ${checkedCount} / 总 ${totalChecks}`);
console.log(`${issues.length === 0 ? '✅' : '❌'} 问题: ${issues.length}`);

if (issues.length > 0) {
  console.log('\n=== 问题清单 ===');
  for (const iss of issues) console.log(`  ${iss}`);
  console.log('\n❌ 提测不达标');
  exit(1);
}
console.log('\n✅ 提测申请单达标');
exit(0);
