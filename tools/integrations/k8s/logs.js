#!/usr/bin/env node
/**
 * k8s · 拉 Pod 日志
 *
 * 用法:
 *   node logs.js --ns <ns> --pod <name>                    # 单 Pod
 *   node logs.js --ns <ns> --label app=xxx [--tail 500] [--since 5m]
 *
 * 选项:
 *   --tail N        尾部 N 行（默认 200）
 *   --since <dur>   时间窗（5m / 1h）
 *   --previous      上一次容器的日志（崩溃后用）
 *   --dry-run
 */

import { parseArgs, baseFlags, runKubectl, ensureKubectl } from './_kubectl.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
if (!args.pod && !args.label) {
  console.error('用法: logs --ns <ns> --pod <name>  或  --label app=xxx');
  exit(2);
}
const dryRun = !!args['dry-run'];
if (!dryRun) ensureKubectl();

const flags = baseFlags({ ns: args.ns, context: args.context });
const extras = [];
if (args.tail) extras.push(`--tail=${args.tail}`); else extras.push('--tail=200');
if (args.since) extras.push(`--since=${args.since}`);
if (args.previous) extras.push('--previous');

if (args.pod) {
  const r = runKubectl([...flags, 'logs', args.pod, ...extras], { dryRun });
  if (!r.ok) { console.error(r.stderr); exit(1); }
  if (!dryRun) process.stdout.write(r.stdout);
  exit(0);
}

// 按 label 多 Pod 聚合
const list = runKubectl(
  [...flags, 'get', 'pods', '-l', args.label, '-o', 'jsonpath={.items[*].metadata.name}'],
  { dryRun }
);
if (!list.ok) { console.error(list.stderr); exit(1); }
if (dryRun) exit(0);

const names = list.stdout.trim().split(/\s+/).filter(Boolean);
if (names.length === 0) { console.error(`❌ 未找到 Pod (label=${args.label})`); exit(1); }

console.log(`📋 匹配 ${names.length} 个 Pod,按顺序输出:\n`);
for (const name of names) {
  console.log(`\n================ ${name} ================`);
  const r = runKubectl([...flags, 'logs', name, ...extras], {});
  if (!r.ok) { console.error(`  ⚠️ ${name}: ${r.stderr.trim()}`); continue; }
  process.stdout.write(r.stdout);
}
exit(0);
