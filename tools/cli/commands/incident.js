/**
 * epcode incident <subcommand>
 *   new [--dir .]                         基于模板创建故障报告
 *   to-requirement --postmortem <file.md> [--target github|jira]
 */
import { join, resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { runScript, parseArgs } from './_util.js';

export async function run(args, { REPO }) {
  const sub = args[0];
  const rest = args.slice(1);
  const opts = parseArgs(rest);

  if (sub === 'to-requirement') {
    const script = join(REPO, 'tools/cross-platform/scripts/incident-to-requirement.js');
    return runScript(script, rest, REPO);
  }

  if (sub === 'new') {
    const tpl = join(REPO, 'templates/operations/incident-report-template.md');
    if (!existsSync(tpl)) {
      console.error(`❌ 模板不存在: ${tpl}`);
      return 2;
    }
    const dir = resolve(opts.dir || '.');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const id = opts.id || `INC-${date.replace(/-/g, '')}`;
    const file = join(dir, `${id}.md`);
    if (existsSync(file) && !opts.force) {
      console.error(`❌ 已存在 ${file}（加 --force 覆盖）`);
      return 1;
    }
    const tpl2 = readFileSync(tpl, 'utf8')
      .replace(/INC-\d+/g, id)
      .replace(/YYYY-MM-DD/g, date);
    writeFileSync(file, tpl2);
    console.log(`✅ 已创建 ${file}`);
    console.log(`   模板来源: templates/operations/incident-report-template.md`);
    console.log(`   下一步: 填写"影响范围/时间线/根因"后,复盘时运行:`);
    console.log(`   epcode incident to-requirement --postmortem ${file} --target github`);
    return 0;
  }

  console.error('用法: epcode incident <new | to-requirement> [...args]');
  return 2;
}
