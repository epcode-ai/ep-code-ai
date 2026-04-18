#!/usr/bin/env node
/**
 * score-testability.js
 *
 * 对 PRD 打可测性分（0-100）,作为 CI 的软门禁。
 *
 * 用法:
 *   node scripts/score-testability.js <file.md>
 *
 * 评分维度（各 20 分,共 100 分）:
 *   - 验收标准覆盖（20）
 *   - 非功能需求量化（20）
 *   - 边界条件明确（20）
 *   - 异常场景列举（20）
 *   - 数据规则完整（20）
 *
 * 退出码:
 *   0 = ≥ 80 分
 *   1 = 60-79 分
 *   2 = < 60 分
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

if (argv.length < 3) {
  console.error('用法: score-testability <file.md>');
  exit(2);
}
const file = argv[2];
if (!existsSync(file)) {
  console.error(`❌ 文件不存在: ${file}`);
  exit(2);
}
const content = readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);

// 按二级标题切段
const sections = {};
let currentH2 = null;
for (const line of lines) {
  const m = /^##\s+(.+?)\s*$/.exec(line);
  if (m) {
    currentH2 = m[1];
    sections[currentH2] = [];
  } else if (currentH2) {
    sections[currentH2].push(line);
  }
}

function findSection(keyword) {
  const name = Object.keys(sections).find(k => k.includes(keyword));
  return name ? sections[name].join('\n') : '';
}

// ===== 维度 1: 验收标准覆盖 =====
function scoreAcceptanceCoverage() {
  const funcBody = findSection('功能需求');
  if (!funcBody) return { score: 0, detail: '无"功能需求"章节' };

  // 优先匹配 REQ-XXX 模式（最常见的需求 ID 形式,支持 ### 和 #### 级）
  const reqIdMatches = funcBody.match(/^#{3,4}\s+(REQ|US)[-_]?\d+/gmi) || [];
  let totalReqs = reqIdMatches.length;
  let blocks = [];

  if (totalReqs > 0) {
    // 按 REQ-XXX 拆块
    blocks = funcBody
      .split(/^#{3,4}\s+(?=(?:REQ|US)[-_]?\d+)/gmi)
      .slice(1);
  } else {
    // 退化为 ### 标题数
    const h3Matches = funcBody.match(/^###\s+/gm) || [];
    totalReqs = h3Matches.length;
    blocks = funcBody.split(/^###\s+/m).slice(1);
  }

  if (totalReqs === 0) return { score: 6, detail: '未找到需求细则（REQ-XXX 或 ### 级）' };

  let coveredReqs = 0;
  for (const b of blocks) {
    if (/(Given|When|Then|given|when|then|前置|触发|预期|验收标准)/.test(b)) {
      coveredReqs++;
    }
  }
  const ratio = coveredReqs / totalReqs;
  const score = Math.round(ratio * 20);
  return {
    score,
    detail: `功能点 ${totalReqs} 个,有 AC 的 ${coveredReqs} 个（${Math.round(ratio * 100)}%）`,
  };
}

// ===== 维度 2: 非功能需求量化 =====
function scoreNonFunctionalQuantified() {
  const body = findSection('非功能');
  if (!body) return { score: 0, detail: '无"非功能"章节' };

  const patterns = [
    { key: '性能', patterns: [/\d+\s*(ms|毫秒|s|秒)/i, /\bQPS\b/i, /P99|P95/i] },
    { key: '并发', patterns: [/\d+\s*(并发|concurrent|连接)/i, /\bQPS\b/i] },
    { key: '容量', patterns: [/\d+\s*(KB|MB|GB|TB|条|万|百万)/i] },
    { key: '安全', patterns: [/(bcrypt|argon2|AES|RSA|HTTPS|OWASP)/i] },
    { key: '兼容性', patterns: [/(Chrome|Edge|Safari|Firefox|iOS|Android)\s*[≥>\d.]+/i] },
  ];
  let hit = 0;
  const detail = [];
  for (const p of patterns) {
    if (p.patterns.some(re => re.test(body))) {
      hit++;
      detail.push(`✓${p.key}`);
    } else {
      detail.push(`✗${p.key}`);
    }
  }
  const score = Math.round((hit / patterns.length) * 20);
  return { score, detail: detail.join(' ') };
}

// ===== 维度 3: 边界条件 =====
function scoreBoundaries() {
  const full = content;
  const boundaryKeywords = [
    /(上限|下限|最大|最小|最多|最少|临界)/,
    /(\d+\s*[-~]\s*\d+)/, // 范围
    /(≤|≥|<|>|<=|>=)\s*\d+/,
    /(不超过|至少|至多)/,
    /(空值|null|undefined)/i,
  ];
  let hit = 0;
  for (const re of boundaryKeywords) {
    if (re.test(full)) hit++;
  }
  const score = Math.round((hit / boundaryKeywords.length) * 20);
  return { score, detail: `命中 ${hit}/${boundaryKeywords.length} 类边界关键词` };
}

// ===== 维度 4: 异常场景 =====
function scoreExceptionScenarios() {
  const funcBody = findSection('功能需求');
  const fullBody = content;

  const patterns = [
    /(异常|错误|失败|故障)/,
    /(超时|timeout)/i,
    /(网络|network).{0,10}(断|异常|波动)/,
    /(并发|race|冲突)/,
    /(降级|兜底|回退|fallback)/,
  ];
  let hit = 0;
  const detail = [];
  for (const re of patterns) {
    if (re.test(funcBody) || re.test(fullBody)) {
      hit++;
    }
  }
  const score = Math.round((hit / patterns.length) * 20);
  return { score, detail: `命中 ${hit}/${patterns.length} 类异常场景` };
}

// ===== 维度 5: 数据规则 =====
function scoreDataRules() {
  const dataBody = findSection('数据') || findSection('5.');

  const patterns = [
    /(类型|type).{0,20}(string|int|decimal|enum|date|uuid|bool)/i,
    /(长度|length|字符|characters)/,
    /(必填|必选|required|非空|NOT NULL)/i,
    /(格式|format|pattern)/,
    /(默认值|default)/,
  ];
  let hit = 0;
  const detail = [];
  for (const re of patterns) {
    if (re.test(dataBody) || re.test(content)) {
      hit++;
    }
  }
  const score = Math.round((hit / patterns.length) * 20);
  return { score, detail: `命中 ${hit}/${patterns.length} 类数据规则` };
}

// ===== 汇总 =====
const dimensions = [
  { name: '验收标准覆盖', ...scoreAcceptanceCoverage() },
  { name: '非功能需求量化', ...scoreNonFunctionalQuantified() },
  { name: '边界条件明确', ...scoreBoundaries() },
  { name: '异常场景列举', ...scoreExceptionScenarios() },
  { name: '数据规则完整', ...scoreDataRules() },
];

const total = dimensions.reduce((s, d) => s + d.score, 0);

console.log(`📋 PRD 文件: ${file}`);
console.log('');
console.log(`PRD 可测性得分: ${total} / 100`);
console.log('');
console.log('维度拆解:');
for (const d of dimensions) {
  let icon = '❌';
  if (d.score >= 16) icon = '✅';
  else if (d.score >= 12) icon = '⚠️ ';
  console.log(`  ${icon} ${d.name}: ${d.score}/20  — ${d.detail}`);
}

// 给建议
const suggestions = [];
for (const d of dimensions) {
  if (d.score < 16) {
    switch (d.name) {
      case '验收标准覆盖':
        suggestions.push('补充每个功能点的 Given-When-Then 验收标准');
        break;
      case '非功能需求量化':
        suggestions.push('补充具体的 QPS/延迟/容量等数字');
        break;
      case '边界条件明确':
        suggestions.push('明确上下限、临界值、空值处理');
        break;
      case '异常场景列举':
        suggestions.push('补充网络异常、超时、并发、降级方案');
        break;
      case '数据规则完整':
        suggestions.push('明确字段的类型、长度、必填、格式');
        break;
    }
  }
}
if (suggestions.length > 0) {
  console.log('');
  console.log('建议:');
  for (const s of suggestions) console.log(`  - ${s}`);
}

console.log('');
if (total >= 80) {
  console.log('✅ 可测性良好（≥ 80）');
  exit(0);
}
if (total >= 60) {
  console.log('⚠️  可测性一般（60-79）,建议改进');
  exit(1);
}
console.log('❌ 可测性差（< 60）,建议修订后再评审');
exit(2);
