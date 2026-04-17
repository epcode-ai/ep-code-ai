#!/usr/bin/env node
/**
 * check-links.js
 *
 * 校验 Markdown 文件中的相对链接是否可达。
 * 自动跳过代码块里的 [text](url) 样例。
 *
 * 用法:
 *   node scripts/check-links.js [目标目录,默认当前目录]
 *
 * 退出码:
 *   0 = 所有链接正常
 *   1 = 有断链
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { argv, exit, cwd } from 'node:process';

const ROOT = resolve(argv[2] || cwd());
const LINK_RE = /\[([^\]\n]+)\]\(([^)\n]+)\)/g;
// 代码块（fenced + inline）
const FENCED_RE = /```[\s\S]*?```/gm;
const INLINE_RE = /`[^`\n]+`/g;

const IGNORE_DIRS = new Set(['.git', 'node_modules', '.idea', '.vscode', 'build', 'dist', 'DerivedData']);

/** 递归查找所有 .md 文件 */
function findMarkdown(dir) {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (IGNORE_DIRS.has(name)) continue;
      results.push(...findMarkdown(full));
    } else if (st.isFile() && name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

/** 清理代码块 */
function stripCode(content) {
  return content.replace(FENCED_RE, '').replace(INLINE_RE, '');
}

/** 是否为外链/锚点/mailto */
function isExternal(target) {
  return (
    target.startsWith('http://') ||
    target.startsWith('https://') ||
    target.startsWith('mailto:') ||
    target.startsWith('#') ||
    target.startsWith('<') // <URL> 占位
  );
}

function main() {
  const files = findMarkdown(ROOT);
  const broken = [];
  let total = 0;

  for (const file of files) {
    let content;
    try { content = readFileSync(file, 'utf8'); } catch { continue; }
    const cleaned = stripCode(content);

    let m;
    while ((m = LINK_RE.exec(cleaned)) !== null) {
      const [_, text, target] = m;
      if (isExternal(target)) continue;

      const path = target.split('#')[0];
      if (!path) continue;
      total += 1;

      const abs = resolve(dirname(file), path);
      try {
        statSync(abs);
      } catch {
        broken.push({
          file: relative(ROOT, file),
          target,
          text: text.slice(0, 40),
        });
      }
    }
  }

  console.log(`📝 扫描文件: ${files.length}`);
  console.log(`🔗 相对链接: ${total}`);
  console.log(`${broken.length === 0 ? '✅' : '❌'} 断链: ${broken.length}`);

  if (broken.length > 0) {
    console.log('\n=== 断链详情 ===\n');
    for (const b of broken) {
      console.log(`  ${b.file}`);
      console.log(`    → '${b.target}'  (文本: ${b.text})\n`);
    }
    exit(1);
  }
  exit(0);
}

main();
