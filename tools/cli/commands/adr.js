/**
 * epcode adr <subcommand>
 *   index [--target <dir>] [--check]   重建 / 校验索引
 */
import { join } from 'node:path';
import { runScript, parseArgs } from './_util.js';

export async function run(args, { REPO }) {
  const sub = args[0];
  if (sub !== 'index') {
    console.error('用法: epcode adr index [--target <dir>] [--check]');
    return 2;
  }
  const rest = args.slice(1);
  const script = join(REPO, 'tools/cross-platform/scripts/generate-adr-index.js');
  return runScript(script, rest, REPO);
}
