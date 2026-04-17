#!/usr/bin/env node
/**
 * 把本地 Markdown 发布成 Confluence 页面（新建或更新）
 *
 * 用法:
 *   node publish-markdown.js --file <md> --title "..." [--space KEY] [--parent-id N] [--page-id N]
 *
 *   --file        本地 Markdown 路径（必填）
 *   --title       页面标题（新建时必填）
 *   --space       Space Key（默认读 CONFLUENCE_SPACE）
 *   --parent-id   父页面 ID（新建时可选，不传则建在 Space 根）
 *   --page-id     已有页面 ID（传了就更新而不是新建）
 *
 * 注意:
 *   本脚本的 Markdown → Confluence Storage Format 转换是简化版。
 *   支持: 标题 / 粗体 / 斜体 / 内联代码 / 代码块 / 链接 / 列表 / 表格
 *   不支持: 图片上传 / Mermaid / 复杂 HTML
 */

import { requireEnv, readEnv } from '../_common/env.js';
import { request, basicAuth } from '../_common/http.js';
import { argv, exit } from 'node:process';
import { readFileSync, existsSync } from 'node:fs';

function parseArgs(args) {
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1];
      if (!val || val.startsWith('--')) { opts[key] = true; }
      else { opts[key] = val; i++; }
    }
  }
  return opts;
}

const args = parseArgs(argv.slice(2));

if (!args.file) { console.error('❌ 缺少 --file'); exit(2); }
if (!existsSync(args.file)) { console.error(`❌ 文件不存在: ${args.file}`); exit(2); }

const env = requireEnv(
  ['CONFLUENCE_BASE_URL', 'CONFLUENCE_EMAIL', 'CONFLUENCE_API_TOKEN'],
  'Confluence publish'
);
const { CONFLUENCE_SPACE } = readEnv(['CONFLUENCE_SPACE']);
const space = args.space || CONFLUENCE_SPACE;

if (!args['page-id'] && !space) {
  console.error('❌ 新建页面需要 --space 或 CONFLUENCE_SPACE');
  exit(2);
}
if (!args['page-id'] && !args.title) {
  console.error('❌ 新建页面需要 --title');
  exit(2);
}

const md = readFileSync(args.file, 'utf8');

// ===== Markdown → Confluence Storage Format =====

function htmlEscape(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function mdToConfluence(input) {
  const lines = input.split(/\r?\n/);
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeBuf = [];
  let inList = null; // 'ul' or 'ol'
  let inTable = false;
  let tableHeader = false;

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
      tableHeader = false;
    }
  }

  for (const line of lines) {
    // 代码块切换
    if (/^```/.test(line)) {
      if (!inCode) {
        flushList(); flushTable();
        inCode = true;
        codeLang = line.slice(3).trim() || 'text';
        codeBuf = [];
      } else {
        out.push(`<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${htmlEscape(codeLang)}</ac:parameter><ac:plain-text-body><![CDATA[${codeBuf.join('\n')}]]></ac:plain-text-body></ac:structured-macro>`);
        inCode = false;
      }
      continue;
    }
    if (inCode) { codeBuf.push(line); continue; }

    // 表格
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      if (/^[-:\s|]+$/.test(line)) {
        tableHeader = true;
        continue;
      }
      if (!inTable) {
        flushList();
        out.push('<table><tbody>');
        inTable = true;
      }
      const tag = (tableHeader && out[out.length - 1] === '<table><tbody>') ? 'th' : 'td';
      // 简化: 第一行默认 th
      const firstRow = !out[out.length - 1].includes('</tr>');
      const cellTag = firstRow ? 'th' : 'td';
      out.push('<tr>' + cells.map(c => `<${cellTag}>${inlineMd(c)}</${cellTag}>`).join('') + '</tr>');
      continue;
    } else if (inTable) {
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
    const ul = /^(\s*)[-*+]\s+(.+)$/.exec(line);
    if (ul) {
      if (inList !== 'ul') { flushList(); out.push('<ul>'); inList = 'ul'; }
      out.push(`<li>${inlineMd(ul[2].trim())}</li>`);
      continue;
    }

    // 有序列表
    const ol = /^(\s*)\d+\.\s+(.+)$/.exec(line);
    if (ol) {
      if (inList !== 'ol') { flushList(); out.push('<ol>'); inList = 'ol'; }
      out.push(`<li>${inlineMd(ol[2].trim())}</li>`);
      continue;
    }

    flushList();

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

function inlineMd(s) {
  // 转义 HTML 先
  s = htmlEscape(s);
  // 内联代码
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  // 粗体
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // 斜体
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // 链接
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

const storage = mdToConfluence(md);

const baseUrl = env.CONFLUENCE_BASE_URL.replace(/\/$/, '');
const authHeader = basicAuth(env.CONFLUENCE_EMAIL, env.CONFLUENCE_API_TOKEN);

if (args['page-id']) {
  // 更新已有页面
  console.log(`🔄 更新页面 ${args['page-id']}`);
  // 先获取当前版本
  const getRes = await request(`${baseUrl}/rest/api/content/${args['page-id']}?expand=version`, {
    headers: { Authorization: authHeader },
  });
  if (!getRes.ok) {
    console.error(`❌ 获取页面失败 (HTTP ${getRes.status})`);
    console.error(getRes.text.slice(0, 300));
    exit(1);
  }
  const currentVersion = getRes.data.version.number;
  const title = args.title || getRes.data.title;

  const res = await request(`${baseUrl}/rest/api/content/${args['page-id']}`, {
    method: 'PUT',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      version: { number: currentVersion + 1 },
      title,
      type: 'page',
      body: { storage: { value: storage, representation: 'storage' } },
    }),
  });
  if (res.ok) {
    console.log(`✅ 页面已更新至 v${currentVersion + 1}`);
    console.log(`   URL: ${baseUrl}/pages/viewpage.action?pageId=${args['page-id']}`);
  } else {
    console.error(`❌ 更新失败 (HTTP ${res.status}): ${res.text.slice(0, 300)}`);
    exit(1);
  }
} else {
  // 新建页面
  console.log(`📝 新建页面 "${args.title}" 到 Space ${space}`);
  const body = {
    type: 'page',
    title: args.title,
    space: { key: space },
    body: { storage: { value: storage, representation: 'storage' } },
  };
  if (args['parent-id']) {
    body.ancestors = [{ id: String(args['parent-id']) }];
  }
  const res = await request(`${baseUrl}/rest/api/content`, {
    method: 'POST',
    headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) {
    console.log('✅ 创建成功');
    console.log(`   ID:  ${res.data.id}`);
    console.log(`   URL: ${baseUrl}${res.data._links?.webui || ''}`);
  } else {
    console.error(`❌ 创建失败 (HTTP ${res.status})`);
    console.error(res.text.slice(0, 500));
    exit(1);
  }
}
