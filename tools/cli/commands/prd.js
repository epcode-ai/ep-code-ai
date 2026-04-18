/**
 * epcode prd <file.md>
 * 依次跑 check-prd + score-testability,输出综合报告。
 */
import { join } from 'node:path';
import { runScript, parseArgs } from './_util.js';

export async function run(args, { REPO }) {
  const opts = parseArgs(args);
  const file = opts._[0];
  if (!file) {
    console.error('用法: epcode prd <file.md>');
    return 2;
  }
  console.log(`\n▶ 1/2 结构校验 (check-prd)\n`);
  const r1 = runScript(join(REPO, 'tools/cross-platform/scripts/check-prd.js'), [file], REPO);
  console.log(`\n▶ 2/2 可测性打分 (score-testability)\n`);
  const r2 = runScript(join(REPO, 'tools/cross-platform/scripts/score-testability.js'), [file], REPO);
  // 硬错误之一返回 2,有 warning 返回 1,全通过 0
  if (r1 === 2 || r2 === 2) return 2;
  if (r1 === 1 || r2 === 1) return 1;
  return 0;
}
