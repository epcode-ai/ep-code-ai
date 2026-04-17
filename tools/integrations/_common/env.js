/**
 * 环境变量读取工具
 * 提供清晰的错误提示,告诉用户缺了哪个 env
 */

import { env, exit } from 'node:process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * 从 .env 文件加载（如存在），但不覆盖已有的环境变量
 */
export function loadDotenv(file = '.env') {
  const p = resolve(file);
  if (!existsSync(p)) return;
  const content = readFileSync(p, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    // 剥离引号
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in env)) env[key] = value;
  }
}

/**
 * 读取必需环境变量。缺失时给清晰错误并退出。
 *
 * @param {string[]} keys 需要的 env key 列表
 * @param {string} [context] 报错上下文（如"Jira 集成"）
 */
export function requireEnv(keys, context = '') {
  loadDotenv();
  const missing = keys.filter(k => !env[k]);
  if (missing.length > 0) {
    console.error(`\n❌ ${context ? context + ' ' : ''}缺少必需环境变量:\n`);
    for (const k of missing) console.error(`   - ${k}`);
    console.error(`\n提示:`);
    console.error(`   1. 直接在命令前加: ${missing.map(k => `${k}=xxx`).join(' ')} node script.js`);
    console.error(`   2. 或在项目根创建 .env 文件,包含上述变量`);
    console.error(`   3. 或在 shell 里 export 好再运行\n`);
    exit(2);
  }
  const result = {};
  for (const k of keys) result[k] = env[k];
  return result;
}

/**
 * 读取可选环境变量,返回 { key: value | undefined }
 */
export function readEnv(keys) {
  loadDotenv();
  const result = {};
  for (const k of keys) result[k] = env[k];
  return result;
}
