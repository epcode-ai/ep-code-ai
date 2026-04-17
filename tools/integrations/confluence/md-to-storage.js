#!/usr/bin/env node
/**
 * Markdown → Confluence Storage Format 转换器（独立工具）
 *
 * 用法:
 *   node md-to-storage.js <file.md>    → stdout 输出 XHTML
 *
 * 与 publish-markdown.js 共用相同的转换逻辑,但只做"转换"不做"发布"。
 * 便于与 Confluence MCP 或其他工具组合使用。
 */

import { readFileSync, existsSync } from 'node:fs';
import { argv, exit, stdout } from 'node:process';

if (argv.length < 3) {
  console.error('用法: md-to-storage.js <file.md>');
  exit(2);
}
const file = argv[2];
if (!existsSync(file)) {
  console.error(`❌ 文件不存在: ${file}`);
  exit(2);
}

const md = readFileSync(file, 'utf8');

function htmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineMd(s) {
  s = htmlEscape(s);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function mdToConfluence(input) {
  const lines = input.split(/\r?\n/);
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inList = null;
  let inTable = false;
  let tableFirstRow = true;

  function flushList() {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  }

  function flushTable() {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
      tableFirstRow = true;
    }
  }

  for (const line of lines) {
    // 代码块
    if (/^```/.test(line)) {
      if (!inCode) {
        flushList();
        flushTable();
        inCode = true;
        codeLang = line.slice(3).trim() || 'text';
        codeBuf = [];
      } else {
        out.push(
          `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${htmlEscape(codeLang)}</ac:parameter><ac:plain-text-body><![CDATA[${codeBuf.join('\n')}]]></ac:plain-text-body></ac:structured-macro>`
        );
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    // 表格
    if (/^\s*\|.*\|\s*$/.test(line) && !/^\s*\|[-:\s|]+\|\s*$/.test(line)) {
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      if (!inTable) {
        flushList();
        out.push('<table><tbody>');
        inTable = true;
        tableFirstRow = true;
      }
      const tag = tableFirstRow ? 'th' : 'td';
      tableFirstRow = false;
      out.push('<tr>' + cells.map(c => `<${tag}>${inlineMd(c)}</${tag}>`).join('') + '</tr>');
      continue;
    }
    if (/^\s*\|[-:\s|]+\|\s*$/.test(line)) {
      // 分隔线,跳过
      continue;
    }
    if (inTable) {
      flushTable();
    }

    // 标题
    const h = /^(#{1,6})\s+(.+)$/.exec(line);
    if (h) {
      flushList();
      const level = h[1].length;
      out.push(`<h${level}>${inlineMd(h[2].trim())}</h${level}>`);
      continue;
    }

    // 无序列表
    const ul = /^\s*[-*+]\s+(.+)$/.exec(line);
    if (ul) {
      if (inList !== 'ul') {
        flushList();
        out.push('<ul>');
        inList = 'ul';
      }
      out.push(`<li>${inlineMd(ul[1].trim())}</li>`);
      continue;
    }

    // 有序列表
    const ol = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ol) {
      if (inList !== 'ol') {
        flushList();
        out.push('<ol>');
        inList = 'ol';
      }
      out.push(`<li>${inlineMd(ol[1].trim())}</li>`);
      continue;
    }

    flushList();

    // blockquote 简化
    if (/^>\s?/.test(line)) {
      out.push(`<blockquote><p>${inlineMd(line.replace(/^>\s?/, ''))}</p></blockquote>`);
      continue;
    }

    // 水平线
    if (/^---+\s*$/.test(line)) {
      out.push('<hr/>');
      continue;
    }

    // 空行
    if (line.trim() === '') {
      out.push('');
      continue;
    }

    // 普通段落
    out.push(`<p>${inlineMd(line)}</p>`);
  }

  flushList();
  flushTable();
  return out.join('\n');
}

const result = mdToConfluence(md);
stdout.write(result);
