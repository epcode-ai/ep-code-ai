#!/usr/bin/env node
/**
 * 把 Confluence 页面拉成 Markdown
 *
 * 用法:
 *   node fetch-page.js --page-id <id> [--output <file>]
 *
 * 注意:
 *   Confluence → Markdown 的转换是**有损**的。
 *   复杂宏、附件、嵌入图片等不会完整保留。
 *   适合: 初次把 Wiki 内容迁到 Git 管理。
 *   不适合: 频繁双向同步。
 */

import { requireEnv } from '../_common/env.js';
import { request, basicAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';
import { writeFileSync } from 'node:fs';

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (!val || val.startsWith('--')) opts[key] = true;
      else { opts[key] = val; i++; }
    }
  }
  return opts;
}

const args = parseArgs(argv.slice(2));
if (!args['page-id']) {
  console.error('用法: fetch-page.js --page-id <id> [--output <file>]');
  exit(2);
}

const env = requireEnv(
  ['CONFLUENCE_BASE_URL', 'CONFLUENCE_EMAIL', 'CONFLUENCE_API_TOKEN'],
  'Confluence fetch'
);

const baseUrl = env.CONFLUENCE_BASE_URL.replace(/\/$/, '');
const authHeader = basicAuth(env.CONFLUENCE_EMAIL, env.CONFLUENCE_API_TOKEN);

// expand=body.storage 拿 Confluence Storage Format（XHTML）
// expand=body.view 拿渲染后的 HTML
const url = `${baseUrl}/rest/api/content/${args['page-id']}?expand=body.storage,version,space`;

const res = await request(url, { headers: { Authorization: authHeader } });
if (!res.ok) {
  console.error(`❌ 获取页面失败 (HTTP ${res.status}): ${res.text.slice(0, 300)}`);
  exit(1);
}

const page = res.data;
const title = page.title;
const version = page.version.number;
const storage = page.body?.storage?.value || '';
const space = page.space?.key || '';

// ===== Storage Format → Markdown（简化转换）=====

function storageToMarkdown(html) {
  let md = html;

  // 代码块宏
  md = md.replace(
    /<ac:structured-macro\s+ac:name="code"[^>]*>[\s\S]*?<ac:parameter\s+ac:name="language">([^<]*)<\/ac:parameter>[\s\S]*?<ac:plain-text-body>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/ac:plain-text-body>[\s\S]*?<\/ac:structured-macro>/g,
    (_, lang, code) => `\n\`\`\`${lang}\n${code}\n\`\`\`\n`
  );

  // 标题
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

  // 段落
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');

  // 列表
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');

  // 格式
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // 链接
  md = md.replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // 简化表格（非完美）
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, inner) => {
    const rows = [];
    const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rm;
    while ((rm = rowRe.exec(inner)) !== null) {
      const cells = [];
      const cellRe = /<(td|th)[^>]*>([\s\S]*?)<\/\1>/gi;
      let cm;
      while ((cm = cellRe.exec(rm[1])) !== null) {
        cells.push(cm[2].trim().replace(/<[^>]+>/g, ''));
      }
      rows.push(cells);
    }
    if (rows.length === 0) return '';
    const out = [];
    out.push('| ' + rows[0].join(' | ') + ' |');
    out.push('| ' + rows[0].map(() => '---').join(' | ') + ' |');
    for (let i = 1; i < rows.length; i++) {
      out.push('| ' + rows[i].join(' | ') + ' |');
    }
    return '\n' + out.join('\n') + '\n';
  });

  // 清理剩余 HTML 标签
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');
  md = md.replace(/<[^>]+>/g, '');

  // 解码 HTML 实体
  md = md.replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"')
         .replace(/&#39;/g, "'")
         .replace(/&nbsp;/g, ' ');

  // 多空行合并
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

const md = storageToMarkdown(storage);

const header = `# ${title}\n\n` +
  `<!-- 从 Confluence 同步 -->\n` +
  `<!-- Space: ${space} | Page ID: ${args['page-id']} | 版本: ${version} -->\n\n`;

const final = header + md + '\n';

if (args.output) {
  writeFileSync(args.output, final);
  console.log(`✅ 已保存到 ${args.output}`);
  console.log(`   标题: ${title}`);
  console.log(`   Space: ${space}`);
  console.log(`   版本: ${version}`);
  console.log(`   字节: ${final.length}`);
} else {
  process.stdout.write(final);
}
