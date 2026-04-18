/**
 * 禅道 API 客户端封装
 * - 处理 sessionID 鉴权流程
 * - 提供 get/post 快捷方法
 */

import { request } from '../_common/http.js';

export class ZentaoClient {
  constructor({ baseUrl, username, password, dryRun = false }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.username = username;
    this.password = password;
    this.dryRun = dryRun;
    this.sessionID = null;
    this.sessionName = null;
  }

  async login() {
    if (this.dryRun) {
      this.sessionID = 'DRY-RUN-SESSION';
      this.sessionName = 'sessionid';
      return;
    }
    // 1. 获取 sessionID
    const cfgRes = await request(`${this.baseUrl}/api.php?m=user-login-apiGetConfig.json`);
    if (!cfgRes.ok) throw new Error(`禅道获取 sessionID 失败: ${cfgRes.status}`);
    const cfg = cfgRes.data;
    this.sessionName = cfg.sessionName;
    this.sessionID = cfg.sessionID;
    // 2. 登录
    const loginUrl = `${this.baseUrl}/user-login.json?${this.sessionName}=${this.sessionID}`;
    const form = new URLSearchParams({ account: this.username, password: this.password });
    const loginRes = await request(loginUrl, {
      method: 'POST',
      body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (!loginRes.ok || (loginRes.data && loginRes.data.status === 'failed')) {
      throw new Error(`禅道登录失败: ${loginRes.text?.slice(0, 200)}`);
    }
  }

  _url(path) {
    const sep = path.includes('?') ? '&' : '?';
    return `${this.baseUrl}/${path}${sep}${this.sessionName}=${this.sessionID}`;
  }

  async get(path) {
    if (this.dryRun) {
      console.log(`  [dry-run] GET ${this._url(path)}`);
      return { ok: true, status: 200, data: { dryRun: true } };
    }
    return request(this._url(path));
  }

  async post(path, body) {
    if (this.dryRun) {
      console.log(`  [dry-run] POST ${this._url(path)}`);
      console.log(`  [dry-run] body = ${JSON.stringify(body, null, 2)}`);
      return { ok: true, status: 200, data: { id: 'DRY-RUN-ID' } };
    }
    const form = new URLSearchParams();
    for (const [k, v] of Object.entries(body || {})) {
      form.append(k, v == null ? '' : String(v));
    }
    return request(this._url(path), {
      method: 'POST',
      body: form.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    if (next == null || next.startsWith('--')) {
      opts[key] = true;
    } else {
      opts[key] = next;
      i++;
    }
  }
  return opts;
}
