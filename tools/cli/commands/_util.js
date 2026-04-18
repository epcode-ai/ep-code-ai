/**
 * 子命令共用工具
 */
import { spawnSync } from 'node:child_process';

export function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq > 0) {
        opts[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const key = a.slice(2);
        const next = argv[i + 1];
        if (next == null || next.startsWith('--')) opts[key] = true;
        else { opts[key] = next; i++; }
      }
    } else {
      opts._.push(a);
    }
  }
  return opts;
}

export function runScript(scriptPath, args, cwd) {
  const r = spawnSync('node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
  });
  return r.status ?? 1;
}
