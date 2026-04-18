/**
 * kubectl 调用封装
 */

import { spawnSync } from 'node:child_process';

export function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith('--')) opts[key] = true;
    else { opts[key] = next; i++; }
  }
  return opts;
}

export function baseFlags({ ns, context }) {
  const flags = [];
  if (ns) flags.push('-n', ns);
  if (context) flags.push('--context', context);
  return flags;
}

/**
 * @returns {{ ok: boolean, stdout: string, stderr: string, code: number }}
 */
export function runKubectl(args, { dryRun = false, input = null } = {}) {
  const full = ['kubectl', ...args];
  if (dryRun) {
    console.log(`[dry-run] $ ${full.join(' ')}`);
    return { ok: true, stdout: '', stderr: '', code: 0 };
  }
  const res = spawnSync(full[0], full.slice(1), {
    encoding: 'utf8',
    input: input || undefined,
    maxBuffer: 10 * 1024 * 1024,
  });
  return {
    ok: res.status === 0,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    code: res.status,
  };
}

export function ensureKubectl() {
  const r = spawnSync('kubectl', ['version', '--client=true', '-o', 'json'], { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error('❌ 未找到 kubectl,或调用失败');
    console.error(r.stderr);
    process.exit(2);
  }
}
