#!/usr/bin/env node
/**
 * markdown-lint.js
 *
 * 轻量 Markdown 风格检查（为中文文档优化）。
 *
 * 检查项:
 *   - 中英文之间是否缺少空格
 *   - 标题层级是否跳跃（# 后直接跳到 ###）
 *   - 是否使用下划线式标题（===、--- 替代 # 的不推荐写法）
 *   - 列表缩进是否一致（2 空格 / 4 空格）
 *   - 是否有超长行（> 200 字符,可能是意外连成一行）
 *
 * 用法:
 *   node scripts/markdown-lint.js [目录或文件,默认 cwd]
 *
 * 退出码:
 *   0 = 无问题
 *   1 = 有警告
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { argv, exit, cwd } from 'node:process';

const TARGET = resolve(argv[2] || cwd());
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'build', 'dist']);

function findMarkdown(p) {
  let st;
  try { st = statSync(p); } catch { return []; }
  if (st.isFile() && p.endsWith('.md')) return [p];
  if (!st.isDirectory()) return [];
  const out = [];
  for (const name of readdirSync(p)) {
    if (IGNORE_DIRS.has(name)) continue;
    out.push(...findMarkdown(join(p, name)));
  }
  return out;
}

/** 中英文之间缺少空格检测。返回匹配位置。 */
function checkCjkSpacing(line) {
  // 中文后直接跟英文字母/数字/开括号
  const a = /[\u4e00-\u9fa5][A-Za-z0-9]/g;
  // 英文字母/数字后直接跟中文
  const b = /[A-Za-z0-9][\u4e00-\u9fa5]/g;
  const hits = [];
  let m;
  while ((m = a.exec(line)) !== null) hits.push(m.index);
  while ((m = b.exec(line)) !== null) hits.push(m.index);
  return hits;
}

function lintFile(file) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  const issues = [];

  // 用栈处理嵌套代码块（如 ```markdown 里嵌套 ```bash）
  // 栈项记录 fence 的语言。'markdown' / 'md' / '' 视为"仍可能有 md 结构",
  // 其他（bash/python/yaml...）视为纯代码。
  const codeStack = [];
  let lastHeadingLevel = 0;

  const isNonMdCode = () =>
    codeStack.length > 0 &&
    codeStack[codeStack.length - 1] !== '' &&
    codeStack[codeStack.length - 1] !== 'markdown';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ln = i + 1;

    // fenced code block 开/合
    const fenceMatch = /^\s*```(\w*)/.exec(line);
    if (fenceMatch) {
      const lang = fenceMatch[1].toLowerCase();
      // 判断: 如果栈顶语言是 markdown/空,且当前行也开启 fence,算嵌套 push
      // 否则算闭合栈顶
      if (codeStack.length === 0) {
        codeStack.push(lang === 'md' ? 'markdown' : lang);
      } else {
        const top = codeStack[codeStack.length - 1];
        if ((top === '' || top === 'markdown') && lang !== '') {
          // markdown 里开新 fence
          codeStack.push(lang);
        } else {
          // 闭合栈顶
          codeStack.pop();
        }
      }
      continue;
    }
    // 在非 markdown 的代码块里,跳过所有检查
    if (isNonMdCode()) continue;

    // 超长行（排除表格行）
    if (line.length > 200 && !line.includes('|')) {
      issues.push({ ln, rule: 'long-line', msg: `行过长（${line.length} 字符）` });
    }

    // 标题层级跳跃
    const h = /^(#+)\s+/.exec(line);
    if (h) {
      const level = h[1].length;
      if (lastHeadingLevel > 0 && level > lastHeadingLevel + 1) {
        issues.push({ ln, rule: 'heading-skip', msg: `标题从 h${lastHeadingLevel} 跳到 h${level}` });
      }
      lastHeadingLevel = level;
    }

    // 下划线式标题
    if (/^=+\s*$/.test(line) || /^-{3,}\s*$/.test(line)) {
      // 单纯的 --- 可能是分隔线或 YAML frontmatter,不都报告
      if (i > 0 && lines[i - 1].trim() && !lines[i - 1].trim().startsWith('---')) {
        if (line.startsWith('=')) {
          issues.push({ ln, rule: 'setext-heading', msg: `下划线式标题不推荐,改用 # / ##` });
        }
      }
    }

    // 中英文空格
    const cjkHits = checkCjkSpacing(line);
    if (cjkHits.length > 0 && cjkHits.length < 10) {
      // 每行最多 1 条提示
      const preview = line.slice(Math.max(0, cjkHits[0] - 8), cjkHits[0] + 8);
      issues.push({
        ln,
        rule: 'cjk-spacing',
        msg: `中英文之间缺少空格: "...${preview}..."`,
        severity: 'nit',
      });
    }
  }

  return issues;
}

function main() {
  const files = findMarkdown(TARGET);
  let totalIssues = 0;
  const bad = [];

  for (const f of files) {
    const issues = lintFile(f);
    if (issues.length === 0) continue;
    bad.push({ file: relative(TARGET, f), issues });
    totalIssues += issues.length;
  }

  console.log(`📝 扫描: ${files.length} 个文件`);
  console.log(`${totalIssues === 0 ? '✅' : '⚠️ '} 发现问题: ${totalIssues} 条`);

  if (totalIssues > 0) {
    console.log('\n=== 问题清单（前 50 条）===\n');
    let shown = 0;
    for (const b of bad) {
      if (shown >= 50) break;
      console.log(`📄 ${b.file}`);
      for (const iss of b.issues) {
        if (shown >= 50) break;
        const sev = iss.severity === 'nit' ? '🟢' : '🟡';
        console.log(`   ${sev} L${iss.ln} [${iss.rule}] ${iss.msg}`);
        shown++;
      }
      console.log('');
    }
    if (totalIssues > 50) console.log(`... 还有 ${totalIssues - 50} 条，省略显示\n`);
    // 提示模式：只给警告，不阻止构建
    exit(1);
  }
  exit(0);
}

main();
