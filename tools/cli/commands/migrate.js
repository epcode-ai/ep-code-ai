/**
 * epcode migrate --from=existing-code [--src <path>] [--output docs/api/]
 *
 * 模式 B 使用。扫描 src/ 找常见 API 路由定义（Express / Fastify / FastAPI 路由注释等）,
 * 反向生成 Markdown API 契约草稿。
 *
 * 这是"启发式最小可用"版:只覆盖常见 Express router 模式 + OpenAPI JSDoc 注释。
 * 用户应基于生成草稿人工完善。
 */
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { parseArgs } from './_util.js';

const ROUTE_RE = /(router|app)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
const FASTAPI_RE = /@(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;

function walk(dir) {
  const out = [];
  (function rec(d) {
    for (const n of readdirSync(d)) {
      if (n.startsWith('.') || n === 'node_modules' || n === 'dist') continue;
      const full = join(d, n);
      const st = statSync(full);
      if (st.isDirectory()) rec(full);
      else if (/\.(ts|js|py|go|java)$/.test(n)) out.push(full);
    }
  })(dir);
  return out;
}

export async function run(args) {
  const opts = parseArgs(args);
  if (opts.from !== 'existing-code') {
    console.error('用法: epcode migrate --from=existing-code [--src src/] [--output docs/api/]');
    return 2;
  }
  const srcDir = resolve(opts.src || 'src');
  if (!existsSync(srcDir)) {
    console.error(`❌ 源目录不存在: ${srcDir}`);
    return 2;
  }
  const outDir = resolve(opts.output || 'docs/api');
  mkdirSync(outDir, { recursive: true });

  const routes = [];
  for (const f of walk(srcDir)) {
    const content = readFileSync(f, 'utf8');
    let m;
    while ((m = ROUTE_RE.exec(content)) !== null) {
      routes.push({ method: m[2].toUpperCase(), path: m[3], file: f, framework: 'express-like' });
    }
    while ((m = FASTAPI_RE.exec(content)) !== null) {
      routes.push({ method: m[2].toUpperCase(), path: m[3], file: f, framework: 'fastapi' });
    }
  }

  if (routes.length === 0) {
    console.log(`ℹ️  未识别到 HTTP 路由（Express / Fastify / FastAPI 样式）`);
    console.log(`   仍可使用 templates/testing/api-contracts/api-template.md 手动补齐`);
    return 0;
  }

  // 按 method + path 去重
  const uniq = [];
  const seen = new Set();
  for (const r of routes) {
    const k = `${r.method} ${r.path}`;
    if (seen.has(k)) continue;
    seen.add(k);
    uniq.push(r);
  }

  // 写 API 索引
  const indexPath = join(outDir, 'README.md');
  const lines = [];
  lines.push('# API 契约（反向生成草稿）');
  lines.push('');
  lines.push(`> 由 \`epcode migrate --from=existing-code\` 从 \`${srcDir}\` 反向扫描生成。`);
  lines.push(`> 共识别 ${uniq.length} 条路由。**请人工完善字段/验证规则/错误码**。`);
  lines.push('');
  lines.push('| # | Method | Path | 源文件 |');
  lines.push('|---|--------|------|-------|');
  uniq.forEach((r, i) => {
    lines.push(`| ${i + 1} | ${r.method} | \`${r.path}\` | \`${r.file.replace(srcDir + '/', '')}\` |`);
  });
  writeFileSync(indexPath, lines.join('\n'));

  console.log(`✅ 反向生成完成: ${indexPath}`);
  console.log(`   识别 ${uniq.length} 条路由（Express/Fastify/FastAPI 样式）`);
  console.log(`   下一步: 用 templates/testing/api-contracts/api-template.md 对核心接口补字段定义`);
  return 0;
}
