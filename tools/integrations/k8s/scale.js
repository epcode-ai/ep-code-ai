#!/usr/bin/env node
/**
 * k8s · 扩缩 Deployment 副本数
 *
 * 用法:
 *   node scale.js --ns <ns> --deployment <name> --replicas <n> [--dry-run] [--force]
 *
 * 安全约束:
 *   - 拒绝把 name 含 prod/production/live 的 Deployment 缩到 0,除非加 --force
 */

import { parseArgs, baseFlags, runKubectl, ensureKubectl } from './_kubectl.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
if (!args.deployment || args.replicas == null || args.replicas === true) {
  console.error('用法: scale --ns <ns> --deployment <name> --replicas <n> [--dry-run]');
  exit(2);
}
const dryRun = !!args['dry-run'];
const replicas = parseInt(args.replicas, 10);
if (isNaN(replicas) || replicas < 0) { console.error('❌ --replicas 必须 >= 0'); exit(2); }

// Prod 保护
if (replicas === 0 && /prod|production|live/i.test(args.deployment) && !args.force) {
  console.error(`❌ 拒绝把疑似生产 Deployment 缩到 0: ${args.deployment}`);
  console.error(`   如确认,加 --force`);
  exit(2);
}

if (!dryRun) ensureKubectl();

const flags = baseFlags({ ns: args.ns, context: args.context });
const r = runKubectl(
  [...flags, 'scale', `deployment/${args.deployment}`, `--replicas=${replicas}`],
  { dryRun }
);

if (!r.ok) {
  console.error(`❌ scale 失败 (code=${r.code})`);
  console.error(r.stderr);
  exit(1);
}

if (!dryRun) console.log(`✅ ${args.deployment} → replicas=${replicas}`);
exit(0);
