#!/usr/bin/env node
/**
 * generate-adr-index.js
 *
 * 扫描目标目录下的 ADR 文件（NNNN-xxx.md）,生成或更新 README.md 索引。
 *
 * 用法:
 *   node scripts/generate-adr-index.js [--target <dir>] [--check]
 *
 *   --target  ADR 目录（默认 docs/adr/）
 *   --check   只检查,不写文件。如果现有索引和新生成的不一致,退出 1。
 *
 * 解析 ADR 格式（参照 templates/development/adr-template.md）:
 *   - 标题: 第一个 # 行,如 "# ADR-0001: ..."
 *   - 状态: "## 状态" 之后的第一个非空行（匹配 Accepted/Proposed/Deprecated/Superseded）
 *   - 日期: "## 日期" 之后的第一个非空行（YYYY-MM-DD）
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { argv, exit, cwd } from 'node:process';

// 解析参数
const args = argv.slice(2);
let target = 'docs/adr/';
let checkOnly = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target') {
    target = args[i + 1];
    i++;
  } else if (args[i] === '--check') {
    checkOnly = true;
  }
}
const TARGET = resolve(target);

if (!existsSync(TARGET) || !statSync(TARGET).isDirectory()) {
  console.error(`❌ 目录不存在: ${TARGET}`);
  exit(2);
}

// 扫 ADR 文件: 0001-xxx.md 模式
const entries = readdirSync(TARGET)
  .filter(f => /^\d{4}-.+\.md$/i.test(f) && f !== 'README.md')
  .sort();

if (entries.length === 0) {
  console.log(`ℹ️  ${TARGET} 下没有 ADR 文件（期望格式: 0001-xxx.md）`);
  exit(0);
}

// 解析每份 ADR
const records = [];
for (const file of entries) {
  const full = join(TARGET, file);
  const content = readFileSync(full, 'utf8');

  // 标题（第一个 # 行,去掉 "ADR-NNNN:" 前缀）
  let title = basename(file, '.md');
  const h1Match = content.match(/^#\s+(.+?)\s*$/m);
  if (h1Match) title = h1Match[1].trim();

  // 状态
  let status = '-';
  const statusMatch = content.match(/##\s*状态\s*\n+([\s\S]*?)(?=##|\n$)/);
  if (statusMatch) {
    const body = statusMatch[1].trim();
    // 粗暴匹配首个状态关键词
    if (/Superseded by/i.test(body)) status = `🔄 Superseded`;
    else if (/Accepted/i.test(body)) status = `✅ Accepted`;
    else if (/Proposed/i.test(body)) status = `📋 Proposed`;
    else if (/Deprecated/i.test(body)) status = `⛔ Deprecated`;
    else status = body.split('\n')[0].slice(0, 30);
  }

  // 日期
  let date = '-';
  const dateMatch = content.match(/##\s*日期\s*\n+\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) date = dateMatch[1];

  // 编号
  const num = file.match(/^(\d{4})/)[1];

  records.push({ num, file, title, status, date });
}

// 生成索引 Markdown
const indexLines = [
  '# Architecture Decision Records',
  '',
  '> 本目录由 `tools/cross-platform/scripts/generate-adr-index.js` 自动生成,请勿手动编辑索引表。',
  '> 新增/修改 ADR 后,重跑命令即可刷新。',
  '',
  '## 列表',
  '',
  '| # | 标题 | 状态 | 日期 |',
  '|---|------|------|------|',
];

for (const r of records) {
  const link = `[${r.num}](./${r.file})`;
  indexLines.push(`| ${link} | ${r.title} | ${r.status} | ${r.date} |`);
}

indexLines.push('');
indexLines.push('## 怎么写新 ADR');
indexLines.push('');
indexLines.push('1. 复制 `templates/development/adr-template.md` 到当前目录');
indexLines.push('2. 文件名按 `NNNN-简短描述.md`（NNNN 递增）');
indexLines.push('3. 填写内容');
indexLines.push(`4. 重跑 \`node tools/cross-platform/scripts/generate-adr-index.js --target ${target}\` 刷新索引`);
indexLines.push('');

const newIndex = indexLines.join('\n');

// 读现有索引
const indexPath = join(TARGET, 'README.md');
const oldIndex = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : '';

if (checkOnly) {
  if (oldIndex.trim() !== newIndex.trim()) {
    console.log('❌ 索引不是最新:');
    console.log(`   请运行: node ${argv[1].split('/').slice(-3).join('/')} --target ${target}`);
    console.log(`   然后提交 ${target}/README.md`);
    exit(1);
  }
  console.log(`✅ ${target}/README.md 索引是最新（${records.length} 条 ADR）`);
  exit(0);
}

// 写入
writeFileSync(indexPath, newIndex);
console.log(`✅ 索引已更新: ${indexPath}`);
console.log(`   ADR 数量: ${records.length}`);
for (const r of records) {
  console.log(`   - ${r.num} ${r.status.padEnd(18)} ${r.date} ${r.title.slice(0, 50)}`);
}
exit(0);
