#!/usr/bin/env node
/**
 * epcode · EP Code AI 统一 CLI
 *
 * 所有子命令都只是对 tools/ 下现成脚本的薄封装,保持零依赖。
 */

import { spawn, spawnSync } from 'node:child_process';
import { argv, exit } from 'node:process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..', '..');

const VERSION = '0.6.0';

// 子命令注册
const commands = {
  init:     { mod: '../commands/init.js',     desc: '按接入模式初始化项目（--mode=A|B|C|D --name=xxx）' },
  adopt:    { mod: '../commands/adopt.js',    desc: '模式 C 渐进启用（--level=1..5）' },
  migrate:  { mod: '../commands/migrate.js',  desc: '模式 B 从现存代码反向补齐骨架' },
  check:    { mod: '../commands/check.js',    desc: '跑聚合质量校验（check-all + 可选子集）' },
  prd:      { mod: '../commands/prd.js',      desc: 'PRD 结构校验 + 可测性打分' },
  adr:      { mod: '../commands/adr.js',      desc: 'ADR 索引重建 / 校验（--target <dir> [--check]）' },
  metrics:  { mod: '../commands/metrics.js',  desc: '四场景度量采集 + 汇总看板（--since "7 days ago"）' },
  incident: { mod: '../commands/incident.js', desc: '故障处理: new | to-requirement' },
  linkage:  { mod: '../commands/linkage.js',  desc: '跨场景联动: prd-to-design | regression | release-plan' },
  jira:     { mod: '../commands/jira.js',     desc: 'Jira: sync | create-issue | list' },
};

function printHelp() {
  console.log(`epcode v${VERSION} · EP Code AI CLI`);
  console.log('');
  console.log('用法:');
  console.log('  npx epcode <command> [options]');
  console.log('  或: node tools/cli/bin/epcode.js <command> [options]');
  console.log('');
  console.log('命令:');
  const pad = Math.max(...Object.keys(commands).map(k => k.length));
  for (const [name, info] of Object.entries(commands)) {
    console.log(`  ${name.padEnd(pad)}  ${info.desc}`);
  }
  console.log('');
  console.log('通用选项:');
  console.log('  -h, --help       显示帮助');
  console.log('  -v, --version    打印版本');
  console.log('');
  console.log('示例:');
  console.log('  epcode init --mode=A --name=my-new-app');
  console.log('  epcode prd docs/prd/v1.0.md');
  console.log('  epcode adr index --target docs/adr/');
  console.log('  epcode metrics --since "7 days ago"');
  console.log('  epcode check');
}

const args = argv.slice(2);
if (args.length === 0 || args[0] === '-h' || args[0] === '--help') {
  printHelp();
  exit(0);
}
if (args[0] === '-v' || args[0] === '--version') {
  console.log(`epcode v${VERSION}`);
  exit(0);
}

const cmdName = args[0];
const cmd = commands[cmdName];
if (!cmd) {
  console.error(`❌ 未知命令: ${cmdName}`);
  console.error('运行 `epcode --help` 查看所有命令');
  exit(2);
}

const modPath = resolve(__dirname, cmd.mod);
if (!existsSync(modPath)) {
  console.error(`❌ 命令模块未找到: ${modPath}`);
  exit(2);
}

// 动态加载命令模块（ES Module）
const mod = await import(modPath);
try {
  const code = await mod.run(args.slice(1), { REPO });
  exit(code || 0);
} catch (err) {
  console.error(`❌ 执行 \`epcode ${cmdName}\` 失败: ${err.message}`);
  if (process.env.DEBUG) console.error(err.stack);
  exit(1);
}
