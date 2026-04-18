#!/usr/bin/env node
/**
 * check-prd.js
 *
 * 校验一份 PRD (Markdown) 是否符合 templates/business/prd-template.md 的结构要求。
 *
 * 用法:
 *   node scripts/check-prd.js <file.md>
 *
 * 校验内容:
 *   - 必备一级章节是否齐全
 *   - 每个功能点是否有验收标准（含 Given-When-Then）
 *   - 非功能需求是否量化（性能/安全/兼容性有数字）
 *   - 模糊词检测（快/友好/合理/尽量/等等）
 *   - 是否有变更历史
 *
 * 退出码:
 *   0 = 通过
 *   1 = 有 warning
 *   2 = 有 error（必备章节缺失等硬错误）
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

if (argv.length < 3) {
  console.error('用法: check-prd <file.md>');
  exit(2);
}
const file = argv[2];
if (!existsSync(file)) {
  console.error(`❌ 文件不存在: ${file}`);
  exit(2);
}
const content = readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);

// 必备一级章节（至少 7/9 算通过,避免过于死板）
const REQUIRED_SECTIONS = [
  { keyword: '概述', severity: 'error' },
  { keyword: '用户', severity: 'error' }, // 用户与场景
  { keyword: '功能需求', severity: 'error' },
  { keyword: '非功能', severity: 'error' }, // 非功能需求
  { keyword: '数据', severity: 'warning' }, // 数据规则
  { keyword: '交互', severity: 'warning' }, // 交互设计
  { keyword: '依赖', severity: 'warning' }, // 对依赖方的要求
  { keyword: '风险', severity: 'warning' }, // 风险与边界
  { keyword: '变更历史', severity: 'warning' },
];

// 模糊词（按严重度分）
const FUZZY_WORDS = {
  error: ['尽量', '适当', '差不多', '等等', '之类'],
  warning: ['快', '慢', '好', '合理', '友好', '便捷', '简洁', '优秀', '完善'],
};

// 单位/量化标识
const QUANTIFY_PATTERNS = [
  /\b\d+\s*(ms|秒|s|min|分钟|hour|小时|天|周|月)\b/i,
  /\b\d+\s*(QPS|TPS|req\/s|rps)\b/i,
  /\b\d+\s*%/,
  /P99|P95|P50/,
  /\b\d+\s*(KB|MB|GB|TB|字节)\b/i,
  /\b\d+\s*条\b/,
];

const errors = [];
const warnings = [];

// ===== 章节检查 =====
const foundH2 = [];
let currentH2 = null;
const sectionRanges = {}; // title → [startLine, endLine]

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const h2 = /^##\s+(.+?)\s*$/.exec(line);
  if (h2) {
    if (currentH2) sectionRanges[currentH2].end = i;
    currentH2 = h2[1];
    foundH2.push(currentH2);
    sectionRanges[currentH2] = { start: i, end: lines.length };
  }
}
if (currentH2) sectionRanges[currentH2].end = lines.length;

for (const req of REQUIRED_SECTIONS) {
  const found = foundH2.some(h => h.includes(req.keyword));
  if (!found) {
    if (req.severity === 'error') {
      errors.push({
        type: '必备章节缺失',
        section: '—',
        desc: `缺少"${req.keyword}"相关章节`,
        suggest: `请按 templates/business/prd-template.md 补上包含"${req.keyword}"的一级/二级章节`,
      });
    } else {
      warnings.push({
        type: '推荐章节缺失',
        section: '—',
        desc: `未发现"${req.keyword}"相关章节`,
        suggest: `建议补充`,
      });
    }
  }
}

// ===== 功能需求的 AC 检查 =====
const funcSection = foundH2.find(h => h.includes('功能需求'));
if (funcSection) {
  const { start, end } = sectionRanges[funcSection];
  const body = lines.slice(start, end).join('\n');
  // 找 REQ-XXX 或 ### 子章节
  const reqBlocks = body.split(/\n###\s+/).slice(1);
  const gwtRegex = /(Given|When|Then|given|when|then|前置|触发|预期)/;
  for (const block of reqBlocks) {
    const title = block.split('\n')[0].trim();
    if (!gwtRegex.test(block)) {
      warnings.push({
        type: '缺少验收标准',
        section: `功能需求 / ${title}`,
        desc: '未发现 Given-When-Then 或前置/触发/预期格式',
        suggest: '每个功能点应有明确的验收标准',
      });
    }
  }
}

// ===== 非功能需求的量化检查 =====
const nonFuncSection = foundH2.find(h => h.includes('非功能'));
if (nonFuncSection) {
  const { start, end } = sectionRanges[nonFuncSection];
  const body = lines.slice(start, end).join('\n');
  const hasQuantify = QUANTIFY_PATTERNS.some(p => p.test(body));
  if (!hasQuantify) {
    warnings.push({
      type: '非功能需求未量化',
      section: '非功能需求',
      desc: '未检测到具体数字 + 单位（如 QPS / ms / %）',
      suggest: '至少标明一个定量指标',
    });
  }
}

// ===== 模糊词检测 =====
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // 跳过代码块
  if (/^```/.test(line.trim())) continue;

  for (const word of FUZZY_WORDS.error) {
    // 模糊词必须以独立词出现（前后有中文/空格/标点）
    const re = new RegExp(`(^|[\\s\\u4e00-\\u9fa5,。、（）:;:])${word}([\\s\\u4e00-\\u9fa5,。、（）:;:]|$)`);
    if (re.test(line) && line.length < 200) {
      errors.push({
        type: '模糊词（硬）',
        section: `L${i + 1}`,
        desc: `出现"${word}":${line.slice(0, 80).trim()}`,
        suggest: '用具体数字或可测试的描述替换',
      });
      break;
    }
  }
  for (const word of FUZZY_WORDS.warning) {
    const re = new RegExp(`(^|[\\s\\u4e00-\\u9fa5,。、（）:;:])${word}([\\s\\u4e00-\\u9fa5,。、（）:;:]|$)`);
    if (re.test(line) && line.length < 200) {
      warnings.push({
        type: '模糊词',
        section: `L${i + 1}`,
        desc: `出现"${word}":${line.slice(0, 80).trim()}`,
        suggest: '考虑用具体描述替换',
      });
      break;
    }
  }
}

// ===== 变更历史检查 =====
const changeLogFound = foundH2.some(h => h.includes('变更历史'));
if (!changeLogFound) {
  warnings.push({
    type: '缺少变更历史',
    section: '—',
    desc: '未发现变更历史章节',
    suggest: '添加版本 / 日期 / 变更内容表格',
  });
}

// ===== 输出 =====
console.log(`📋 PRD 文件: ${file}`);
console.log(`📊 章节数: ${foundH2.length}`);
console.log('');

function printIssues(items, label, icon) {
  if (items.length === 0) return;
  console.log(`\n${icon} ${label} (${items.length}):`);
  console.log('| # | 章节 | 类型 | 描述 | 建议 |');
  console.log('|---|------|------|------|------|');
  let i = 0;
  for (const it of items.slice(0, 40)) {
    i++;
    const pad = (s) => String(s || '').replace(/\|/g, '\\|').slice(0, 80);
    console.log(`| ${i} | ${pad(it.section)} | ${pad(it.type)} | ${pad(it.desc)} | ${pad(it.suggest)} |`);
  }
  if (items.length > 40) console.log(`| ... | ... | ... | 还有 ${items.length - 40} 条 | - |`);
}

printIssues(errors, 'Errors', '❌');
printIssues(warnings, 'Warnings', '⚠️');

console.log('');
if (errors.length > 0) {
  console.log(`❌ 校验不通过: ${errors.length} 个错误, ${warnings.length} 个警告`);
  exit(2);
}
if (warnings.length > 0) {
  console.log(`⚠️  基本合格,有 ${warnings.length} 个建议改进项`);
  exit(1);
}
console.log('✅ PRD 完整,无问题');
exit(0);
