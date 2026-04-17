#!/usr/bin/env node
/**
 * 创建一个 Jira Issue
 *
 * 用法:
 *   node create-issue.js --project PROJ --type Bug --summary "..." [--description "..."] [--priority High]
 *
 * 参数:
 *   --project    项目 Key（默认读 JIRA_DEFAULT_PROJECT）
 *   --type       Issue 类型（Bug / Task / Story / ...,默认 Task）
 *   --summary    标题（必填）
 *   --description 正文（可选）
 *   --priority   优先级（Highest/High/Medium/Low/Lowest,默认 Medium）
 *   --labels     标签,逗号分隔
 *   --assignee   指派人的 accountId（Cloud）或 username（Server）
 */

import { requireEnv } from '../_common/env.js';
import { request, basicAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1];
      if (!val || val.startsWith('--')) {
        opts[key] = true;
      } else {
        opts[key] = val;
        i++;
      }
    }
  }
  return opts;
}

const args = parseArgs(argv.slice(2));

const env = requireEnv(
  ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
  'Jira create-issue'
);

const project = args.project || process.env.JIRA_DEFAULT_PROJECT;
if (!project) {
  console.error('❌ 缺少 --project 或 JIRA_DEFAULT_PROJECT');
  exit(2);
}
if (!args.summary) {
  console.error('❌ 缺少 --summary');
  exit(2);
}

const issueType = args.type || 'Task';
const priority = args.priority || 'Medium';

// 构造 request body（Jira Cloud REST API v3）
const body = {
  fields: {
    project: { key: project },
    summary: args.summary,
    issuetype: { name: issueType },
    priority: { name: priority },
  },
};

// description 需要 ADF 格式（Atlassian Document Format）
if (args.description) {
  body.fields.description = {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: args.description }],
      },
    ],
  };
}

if (args.labels) {
  body.fields.labels = args.labels.split(',').map(s => s.trim());
}
if (args.assignee) {
  body.fields.assignee = { accountId: args.assignee };
}

const url = `${env.JIRA_BASE_URL.replace(/\/$/, '')}/rest/api/3/issue`;

console.log(`📝 创建 Issue at ${url}`);
console.log(`   project: ${project}, type: ${issueType}, priority: ${priority}`);
console.log(`   summary: ${args.summary}`);

const res = await request(url, {
  method: 'POST',
  headers: {
    'Authorization': basicAuth(env.JIRA_EMAIL, env.JIRA_API_TOKEN),
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

if (res.ok) {
  const issue = res.data;
  console.log(`\n✅ 创建成功`);
  console.log(`   Key:  ${issue.key}`);
  console.log(`   ID:   ${issue.id}`);
  console.log(`   URL:  ${env.JIRA_BASE_URL}/browse/${issue.key}`);
  exit(0);
} else {
  console.error(`\n❌ 创建失败 (HTTP ${res.status})`);
  if (res.data?.errors) {
    for (const [field, msg] of Object.entries(res.data.errors)) {
      console.error(`   ${field}: ${msg}`);
    }
  } else if (res.data?.errorMessages) {
    for (const m of res.data.errorMessages) console.error(`   ${m}`);
  } else {
    console.error(`   ${res.text.slice(0, 500)}`);
  }
  exit(1);
}
