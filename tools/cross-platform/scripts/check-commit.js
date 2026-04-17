#!/usr/bin/env node
/**
 * check-commit.js
 *
 * 校验提交信息是否符合 Conventional Commits 规范。
 *
 * 可在两个场景使用:
 *   1. Git hook (commit-msg): node check-commit.js "$1"（$1 是 commit msg 文件路径）
 *   2. 手动: node check-commit.js "feat: add feature"
 *
 * 规范:
 *   <type>(<scope>): <subject>
 *
 *   type: feat|fix|docs|style|refactor|perf|test|chore|revert|build|ci
 *   scope: 可选
 *   subject: 必填,不以句号结尾,首字母小写
 *
 * 退出码:
 *   0 = 合规
 *   1 = 不合规
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

const VALID_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor',
  'perf', 'test', 'chore', 'revert', 'build', 'ci',
];

if (argv.length < 3) {
  console.error('用法: check-commit <file.txt 或 直接 commit message>');
  exit(2);
}

let message;
const arg = argv.slice(2).join(' ');
if (existsSync(arg)) {
  message = readFileSync(arg, 'utf8');
} else {
  message = arg;
}

const firstLine = message.split(/\r?\n/)[0].trim();

/** 规则 */
const errors = [];

// 允许 Revert / Merge 特殊前缀
if (firstLine.startsWith('Revert "') || firstLine.startsWith('Merge ')) {
  console.log('✅ Revert/Merge 自动跳过校验');
  exit(0);
}

// 解析 <type>(<scope>)?: <subject>
const regex = /^(?<type>\w+)(?:\((?<scope>[\w\-\/.]+)\))?(?<breaking>!)?:\s+(?<subject>.+)$/;
const match = regex.exec(firstLine);

if (!match) {
  errors.push(`格式错误: 应为 "<type>(<scope>): <subject>"`);
  errors.push(`   实际: "${firstLine}"`);
} else {
  const { type, scope, subject } = match.groups;

  if (!VALID_TYPES.includes(type)) {
    errors.push(`type 不合法: "${type}"`);
    errors.push(`   允许: ${VALID_TYPES.join(', ')}`);
  }

  if (!subject || subject.length === 0) {
    errors.push(`subject 不能为空`);
  } else {
    if (subject.endsWith('.') || subject.endsWith('。')) {
      errors.push(`subject 不应以句号结尾: "${subject}"`);
    }
    if (subject.length > 100) {
      errors.push(`subject 过长（${subject.length} 字符 > 100）`);
    }
  }

  if (scope && scope.length > 50) {
    errors.push(`scope 过长（${scope.length} 字符）`);
  }
}

// body 和 footer 检查（可选）
const lines = message.split(/\r?\n/);
if (lines.length > 1 && lines[1].trim() !== '') {
  errors.push(`标题和正文之间必须有空行（第 2 行应该为空）`);
}

console.log(`📝 提交信息:`);
console.log(`   "${firstLine}"\n`);

if (errors.length > 0) {
  console.log('❌ 不符合 Conventional Commits 规范:\n');
  for (const e of errors) console.log(`   ${e}`);
  console.log('\n提示:');
  console.log('   示例: feat(auth): 新增 OAuth 登录');
  console.log('   示例: fix(order): 修复批量导出超时');
  console.log('   示例: docs(readme): 更新快速开始章节');
  console.log('   详情: docs/chapters/03-development/03-branch-strategy.md');
  exit(1);
}
console.log('✅ 提交信息符合规范');
exit(0);
