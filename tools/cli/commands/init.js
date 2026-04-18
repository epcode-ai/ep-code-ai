/**
 * epcode init --mode=<A|B|C|D> --name=<project-name> [--dir .]
 *
 * 基于 tools/cli/scaffolds/mode-<a|b|c|d>/ 复制一份目录骨架到目标位置,
 * 并在复制时做变量替换 __PROJECT_NAME__ / __DATE__。
 */
import { readdirSync, statSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './_util.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run(args, { REPO }) {
  const opts = parseArgs(args);
  const mode = (opts.mode || '').toLowerCase();
  const name = opts.name;
  const outDir = resolve(opts.dir || '.');

  if (!['a', 'b', 'c', 'd'].includes(mode)) {
    console.error('用法: epcode init --mode=<A|B|C|D> --name=<project-name> [--dir <target>]');
    console.error('');
    console.error('接入模式:');
    console.error('  A · 绿地项目（从零建）— 全套上车');
    console.error('  B · 进行中项目（开发阶段）— 从现在追溯');
    console.error('  C · 运行迭代项目 — 每版本一层');
    console.error('  D · 稳态运维项目 — 仅运维场景');
    console.error('');
    console.error('详见 docs/chapters/00-adoption/');
    return 2;
  }
  if (!name) {
    console.error('❌ 缺少 --name=<project-name>');
    return 2;
  }

  const srcRoot = resolve(REPO, 'tools/cli/scaffolds', `mode-${mode}`);
  if (!existsSync(srcRoot)) {
    console.error(`❌ 脚手架未找到: ${srcRoot}`);
    return 2;
  }

  const target = join(outDir, name);
  if (existsSync(target) && !opts.force) {
    console.error(`❌ 目标目录已存在: ${target}（加 --force 覆盖）`);
    return 1;
  }

  const today = new Date().toISOString().slice(0, 10);
  let fileCount = 0;

  function walk(src, dst) {
    mkdirSync(dst, { recursive: true });
    for (const entry of readdirSync(src)) {
      const sp = join(src, entry);
      const dp = join(dst, entry);
      const st = statSync(sp);
      if (st.isDirectory()) { walk(sp, dp); continue; }
      let content = readFileSync(sp, 'utf8');
      content = content.replace(/__PROJECT_NAME__/g, name).replace(/__DATE__/g, today);
      writeFileSync(dp, content);
      fileCount++;
    }
  }

  walk(srcRoot, target);

  console.log(`✅ 已初始化 ${mode.toUpperCase()} 模式项目: ${target}`);
  console.log(`   复制 ${fileCount} 个文件`);
  console.log('');
  console.log('下一步:');
  console.log(`   cd ${target}`);
  console.log('   cat README.md   # 查看起步清单');
  if (mode === 'c') console.log('   epcode adopt --level=1   # 模式 C 渐进启用第一层');
  return 0;
}
