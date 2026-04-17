#!/usr/bin/env node
/**
 * 用 JQL 查询 Jira Issue
 *
 * 用法:
 *   node list-issues.js "<JQL>"
 *
 * 示例:
 *   node list-issues.js 'assignee = currentUser() AND status != Done'
 *   node list-issues.js 'project = PROJ AND priority = High AND created >= -7d'
 */

import { requireEnv } from '../_common/env.js';
import { request, basicAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';

if (argv.length < 3) {
  console.error('用法: list-issues.js "<JQL>"');
  console.error('');
  console.error('示例 JQL:');
  console.error('  "assignee = currentUser() AND status != Done"');
  console.error('  "project = PROJ AND priority = High"');
  console.error('  "created >= -7d ORDER BY created DESC"');
  exit(2);
}

const jql = argv[2];

const env = requireEnv(
  ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  'Jira list-issues'
);

const url = `${env.JIRA_BASE_URL.replace(/\/$/, '')}/rest/api/3/search?jql=${encodeURIComponent(jql)}&fields=summary,status,priority,assignee,updated&maxResults=50`;

console.log(`🔍 查询: ${jql}\n`);

const res = await request(url, {
  headers: {
    'Authorization': basicAuth(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
  },
});

if (!res.ok) {
  console.error(`❌ 查询失败 (HTTP ${res.status}): ${res.text.slice(0, 500)}`);
  exit(1);
}

const issues = res.data?.issues || [];
const total = res.data?.total || 0;

if (issues.length === 0) {
  console.log('无匹配 Issue');
  exit(0);
}

// 表格输出
console.log(`找到 ${total} 个 Issue，显示前 ${issues.length}:\n`);
console.log('Key'.padEnd(12) + 'Status'.padEnd(14) + 'Priority'.padEnd(10) + 'Assignee'.padEnd(20) + 'Summary');
console.log('─'.repeat(100));

for (const issue of issues) {
  const f = issue.fields;
  const key = issue.key.padEnd(12);
  const status = (f.status?.name || '-').padEnd(14).slice(0, 14);
  const priority = (f.priority?.name || '-').padEnd(10);
  const assignee = (f.assignee?.displayName || '-').padEnd(20).slice(0, 20);
  const summary = (f.summary || '').slice(0, 60);
  console.log(`${key}${status}${priority}${assignee}${summary}`);
}

console.log('');
console.log(`💡 打开浏览器: ${env.JIRA_BASE_URL}/issues/?jql=${encodeURIComponent(jql)}`);
