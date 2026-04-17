#!/usr/bin/env node
/**
 * 批量创建本框架推荐的 GitLab scoped labels
 *
 * 用法:
 *   node create-labels.js [--only type,priority,status] [--dry-run]
 *
 * 环境变量:
 *   GITLAB_BASE_URL, GITLAB_TOKEN, GITLAB_PROJECT_ID
 */

import { requireEnv } from '../_common/env.js';
import { request, bearerAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (!val || val.startsWith('--')) opts[key] = true;
      else { opts[key] = val; i++; }
    }
  }
  return opts;
}

const args = parseArgs(argv.slice(2));
const onlyGroups = args.only ? args.only.split(',').map(s => s.trim()) : null;
const dryRun = !!args['dry-run'];

const env = requireEnv(
  ['GITLAB_BASE_URL', 'GITLAB_TOKEN', 'GITLAB_PROJECT_ID'],
  'GitLab create-labels'
);

// 标签定义（与 workflows/gitlab/gitlab-labels.md 一致）
const LABELS = {
  type: [
    { name: '类型::feat', color: '#28a745', description: '新功能' },
    { name: '类型::fix', color: '#d73a4a', description: 'Bug 修复' },
    { name: '类型::refactor', color: '#0075ca', description: '重构' },
    { name: '类型::docs', color: '#7057ff', description: '文档' },
    { name: '类型::test', color: '#008672', description: '测试' },
    { name: '类型::chore', color: '#cfd3d7', description: '杂项' },
  ],
  priority: [
    { name: '优先级::P0', color: '#b60205', description: '阻塞级' },
    { name: '优先级::P1', color: '#d93f0b', description: '严重' },
    { name: '优先级::P2', color: '#fbca04', description: '一般' },
    { name: '优先级::P3', color: '#c5def5', description: '轻微' },
  ],
  status: [
    { name: '状态::待评审', color: '#e4e669', description: '需求/用例/提测待评审' },
    { name: '状态::开发中', color: '#1d76db', description: '开发进行中' },
    { name: '状态::待测试', color: '#0e8a16', description: '已提测' },
    { name: '状态::测试中', color: '#5319e7', description: '测试进行中' },
    { name: '状态::待修复', color: '#d73a4a', description: 'Bug 待开发处理' },
    { name: '状态::修复中', color: '#f9d0c4', description: '开发修复中' },
    { name: '状态::待回归', color: '#fef2c0', description: '修复完待回归' },
    { name: '状态::已关闭', color: '#c5def5', description: '已完成' },
    { name: '状态::挂起', color: '#cfd3d7', description: '暂不处理' },
  ],
  special: [
    { name: 'Bug', color: '#d73a4a', description: 'Bug' },
    { name: '提测', color: '#0e8a16', description: '提测单' },
    { name: '回归', color: '#fbca04', description: '回归测试' },
    { name: '线上问题', color: '#b60205', description: '线上故障' },
    { name: '技术债', color: '#f9d0c4', description: '技术债务' },
  ],
};

// 过滤
const groups = onlyGroups
  ? Object.fromEntries(Object.entries(LABELS).filter(([k]) => onlyGroups.includes(k)))
  : LABELS;

const allLabels = Object.values(groups).flat();

console.log(`📝 GitLab: ${env.GITLAB_BASE_URL}`);
console.log(`   Project: ${env.GITLAB_PROJECT_ID}`);
console.log(`   分组: ${Object.keys(groups).join(', ')}`);
console.log(`   标签数: ${allLabels.length}${dryRun ? ' [DRY RUN]' : ''}\n`);

if (dryRun) {
  console.log('仅预览（--dry-run），不创建:\n');
  for (const l of allLabels) {
    console.log(`  🎨 ${l.name.padEnd(20)} ${l.color} ${l.description}`);
  }
  exit(0);
}

const projectId = encodeURIComponent(env.GITLAB_PROJECT_ID);
const baseUrl = env.GITLAB_BASE_URL.replace(/\/$/, '');
const authHeader = { 'PRIVATE-TOKEN': env.GITLAB_TOKEN };

let created = 0;
let updated = 0;
let failed = 0;

for (const label of allLabels) {
  const body = JSON.stringify({
    name: label.name,
    color: label.color,
    description: label.description,
  });

  const res = await request(
    `${baseUrl}/api/v4/projects/${projectId}/labels`,
    {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body,
    }
  );

  if (res.ok) {
    console.log(`  ✅ 创建 ${label.name}`);
    created++;
  } else if (res.status === 409 || res.data?.message?.toString().includes('taken')) {
    // 已存在 → 尝试 PUT 更新
    const updRes = await request(
      `${baseUrl}/api/v4/projects/${projectId}/labels/${encodeURIComponent(label.name)}`,
      {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body,
      }
    );
    if (updRes.ok) {
      console.log(`  🔄 更新 ${label.name}`);
      updated++;
    } else {
      console.log(`  ⚠️  ${label.name} 已存在,更新失败`);
      failed++;
    }
  } else {
    console.log(`  ❌ ${label.name} 失败 (HTTP ${res.status}): ${res.data?.message || res.text.slice(0, 100)}`);
    failed++;
  }
}

console.log('');
console.log(`📊 汇总: 创建 ${created} · 更新 ${updated} · 失败 ${failed}`);
exit(failed > 0 ? 1 : 0);
