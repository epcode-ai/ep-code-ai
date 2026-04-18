import { join } from 'node:path';
import { runScript } from './_util.js';

export async function run(args, { REPO }) {
  const script = join(REPO, 'tools/cross-platform/scripts/check-all.js');
  return runScript(script, args, REPO);
}
