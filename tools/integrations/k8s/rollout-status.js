#!/usr/bin/env node
/**
 * k8s · 查 Deployment 滚动发布状态
 *
 * 用法:
 *   node rollout-status.js --ns <ns> --deployment <name> [--timeout 300] [--dry-run]
 *
 * 退出码:
 *   0 = 健康
 *   1 = 未就绪 / 进行中
 *   2 = kubectl 失败
 */

import { parseArgs, baseFlags, runKubectl, ensureKubectl } from './_kubectl.js';
import { argv, exit } from 'node:process';

const args = parseArgs(argv.slice(2));
if (!args.deployment) {
  console.error('❌ 缺少 --deployment');
  exit(2);
}
const dryRun = !!args['dry-run'];
const timeout = args.timeout || '300';

if (!dryRun) ensureKubectl();

const flags = baseFlags({ ns: args.ns, context: args.context });
const r = runKubectl(
  [...flags, 'rollout', 'status', `deployment/${args.deployment}`, `--timeout=${timeout}s`],
  { dryRun }
);

if (!r.ok) {
  console.error(`❌ rollout status 失败 (code=${r.code})`);
  console.error(r.stderr);
  exit(r.stderr.includes('not found') ? 2 : 1);
}

if (!dryRun) console.log(r.stdout.trim() || '✅ 已就绪');

// 补充打印副本数（可选）
if (!dryRun) {
  const d = runKubectl(
    [...flags, 'get', 'deployment', args.deployment, '-o', 'jsonpath={.status.replicas}/{.status.readyReplicas}'],
    {}
  );
  if (d.ok && d.stdout) console.log(`   副本: ${d.stdout}`);
}

exit(0);
