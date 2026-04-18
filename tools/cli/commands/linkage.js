/**
 * epcode linkage <subcommand>   跨场景联动
 *   prd-to-design [--prd <file>] [--design <dir>]
 *   regression [--base main]
 *   release-plan --report <file> [--version vX.Y.Z]
 */
import { join } from 'node:path';
import { runScript } from './_util.js';

export async function run(args, { REPO }) {
  const sub = args[0];
  const rest = args.slice(1);
  const map = {
    'prd-to-design': 'link-prd-to-design.js',
    'regression':    'recommend-regression.js',
    'release-plan':  'generate-release-plan.js',
  };
  const script = map[sub];
  if (!script) {
    console.error('用法: epcode linkage <prd-to-design|regression|release-plan> [...args]');
    return 2;
  }
  return runScript(join(REPO, 'tools/cross-platform/scripts', script), rest, REPO);
}
