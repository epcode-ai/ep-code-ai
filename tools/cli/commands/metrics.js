/**
 * epcode metrics [--since "7 days ago"] [--dashboard-only]
 *   默认 = collect + generate-dashboard
 *   --dashboard-only 仅用当前 METRICS-*.md 重新汇总
 */
import { join } from 'node:path';
import { runScript, parseArgs } from './_util.js';

export async function run(args, { REPO }) {
  const opts = parseArgs(args);
  if (opts['dashboard-only']) {
    return runScript(
      join(REPO, 'tools/metrics/generate-dashboard.js'),
      ['--skip-collect', ...rebuild(opts, ['since', 'output'])],
      REPO
    );
  }
  return runScript(
    join(REPO, 'tools/metrics/generate-dashboard.js'),
    rebuild(opts, ['since', 'output']),
    REPO
  );
}

function rebuild(opts, keys) {
  const out = [];
  for (const k of keys) {
    if (opts[k] != null && opts[k] !== true) {
      out.push(`--${k}`, String(opts[k]));
    }
  }
  return out;
}
