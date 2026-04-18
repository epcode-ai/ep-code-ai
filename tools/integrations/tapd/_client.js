/**
 * TAPD API 客户端
 * 文档: https://open.tapd.cn/document/api-doc/
 */

import { request, basicAuth } from '../_common/http.js';

export class TapdClient {
  constructor({ baseUrl, user, password, workspaceId, dryRun = false }) {
    this.baseUrl = (baseUrl || 'https://api.tapd.cn').replace(/\/$/, '');
    this.auth = basicAuth(user, password);
    this.workspaceId = workspaceId;
    this.dryRun = dryRun;
  }

  async post(path, body) {
    if (this.dryRun) {
      console.log(`  [dry-run] POST ${this.baseUrl}/${path}`);
      console.log(`  [dry-run] body = ${JSON.stringify(body, null, 2)}`);
      return { ok: true, status: 200, data: { data: { Bug: { id: 'DRY-RUN-1001' } } } };
    }
    return request(`${this.baseUrl}/${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Authorization': this.auth,
        'Content-Type': 'application/json',
      },
    });
  }

  async get(path) {
    if (this.dryRun) {
      console.log(`  [dry-run] GET ${this.baseUrl}/${path}`);
      return { ok: true, status: 200, data: { data: [] } };
    }
    return request(`${this.baseUrl}/${path}`, {
      headers: { 'Authorization': this.auth },
    });
  }
}

export function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next == null || next.startsWith('--')) opts[key] = true;
    else { opts[key] = next; i++; }
  }
  return opts;
}
