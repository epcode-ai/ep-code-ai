#!/usr/bin/env node
/**
 * 把本仓库的 Bug 报告 Markdown 同步到 Jira
 *
 * 用法:
 *   node sync-from-markdown.js path/to/bug-report.md
 *
 * 解析的 Markdown 字段:
 *   - 第一个 # 标题 → summary
 *   - "严重级别" 块的勾选项 → priority 映射
 *   - "环境信息" 表格 → environment 字段
 *   - "复现步骤" / "预期" / "实际" → description
 *
 * 环境变量:
 *   JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_DEFAULT_PROJECT
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { request, basicAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';

if (argv.length < 3) {
  console.error('用法: sync-from-markdown.js <bug-report.md>');
  exit(2);
}

const file = argv[2];
if (!existsSync(file)) {
  console.error(`❌ 文件不存在: ${file}`);
  exit(2);
}

const env = requireEnv(
  ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  'Jira sync-from-markdown'
);
const { JIRA_DEFAULT_PROJECT: project } = readEnv(['JIRA_DEFAULT_PROJECT']);
if (!project) {
  console.error('❌ 需要 JIRA_DEFAULT_PROJECT 环境变量');
  exit(2);
}

const content = readFileSync(file, 'utf8');
const lines = content.split(/\r?\n/);

// ===== 解析 =====

// 1. summary: 第一个 # 标题
let summary = '';
for (const line of lines) {
  const m = /^#\s+(?!#)(.+)/.exec(line);
  if (m) {
    summary = m[1].trim();
    break;
  }
}
if (!summary) {
  console.error('❌ 无法从 Markdown 找到标题（第一个 # 行）');
  exit(1);
}

// 2. priority: 找"严重级别"区块里被勾的选项
const prioMap = { P0: 'Highest', P1: 'High', P2: 'Medium', P3: 'Low' };
let priority = 'Medium';
const sevIdx = lines.findIndex(l => /严重级别/.test(l));
if (sevIdx !== -1) {
  for (let i = sevIdx + 1; i < Math.min(sevIdx + 15, lines.length); i++) {
    const m = /^-?\s*\[x\]\s*(?:\*\*)?(P[0-3])/.exec(lines[i]);
    if (m) {
      priority = prioMap[m[1]] || 'Medium';
      break;
    }
  }
}

// 3. description: 找"复现步骤"+"预期"+"实际"
function extractSection(heading) {
  const idx = lines.findIndex(l => new RegExp(`^##+\\s+.*${heading}`).test(l));
  if (idx === -1) return '';
  const out = [];
  for (let i = idx + 1; i < lines.length; i++) {
    if (/^##+\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

const steps = extractSection('复现步骤');
const expected = extractSection('预期');
const actual = extractSection('实际');
const env_ = extractSection('环境信息');

const descParts = [];
descParts.push(`**同步自本地 Markdown: \`${file}\`**`);
descParts.push('');
if (env_) descParts.push('## 环境\n' + env_ + '\n');
if (steps) descParts.push('## 复现步骤\n' + steps + '\n');
if (expected) descParts.push('## 预期\n' + expected + '\n');
if (actual) descParts.push('## 实际\n' + actual + '\n');
const description = descParts.join('\n');

// ===== 构造 Jira 请求 =====

const body = {
  fields: {
    project: { key: project },
    summary,
    issuetype: { name: 'Bug' },
    priority: { name: priority },
    description: {
      type: 'doc',
      version: 1,
      content: description.split(/\n\n+/).map(para => ({
        type: 'paragraph',
        content: [{ type: 'text', text: para.trim() || ' ' }],
      })).filter(p => p.content[0].text !== ' '),
    },
  },
};

console.log('📝 准备同步到 Jira:');
console.log(`   project:  ${project}`);
console.log(`   summary:  ${summary}`);
console.log(`   priority: ${priority}`);
console.log(`   desc len: ${description.length} chars`);
console.log('');

const url = `${env.JIRA_BASE_URL.replace(/\/$/, '')}/rest/api/3/issue`;

const res = await request(url, {
  method: 'POST',
  headers: {
    'Authorization': basicAuth(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (res.ok) {
  console.log('✅ 同步成功');
  console.log(`   Key:  ${res.data.key}`);
  console.log(`   URL:  ${env.JIRA_BASE_URL}/browse/${res.data.key}`);
  console.log('');
  console.log('💡 建议: 把 Jira Key 回填到 Markdown 的"关联信息"字段,便于双向追溯');
  exit(0);
} else {
  console.error(`❌ 同步失败 (HTTP ${res.status})`);
  console.error(res.text.slice(0, 1000));
  exit(1);
}
