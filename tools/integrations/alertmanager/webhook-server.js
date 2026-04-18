#!/usr/bin/env node
/**
 * Alertmanager Webhook 接收 + 转发到 IM
 *
 * 支持 IM_WEBHOOK_WECHAT / IM_WEBHOOK_DINGTALK / IM_WEBHOOK_FEISHU / IM_WEBHOOK_SLACK
 * 任选 1-4 个配置。
 *
 * 启动:
 *   PORT=9900 IM_WEBHOOK_WECHAT=... node webhook-server.js
 *
 * Alertmanager 配置:
 *   webhook_configs:
 *     - url: http://<this-host>:9900/alerts
 */

import { createServer } from 'node:http';
import { env, exit } from 'node:process';
import { request } from '../_common/http.js';
import { toWeChat, toDingTalk, toFeishu, toSlack } from './transform.js';

const PORT = parseInt(env.PORT || '9900', 10);
const DRY = env.DRY_RUN === '1' || env.DRY_RUN === 'true';

const targets = [
  { name: 'wechat',   url: env.IM_WEBHOOK_WECHAT,   transform: toWeChat   },
  { name: 'dingtalk', url: env.IM_WEBHOOK_DINGTALK, transform: toDingTalk },
  { name: 'feishu',   url: env.IM_WEBHOOK_FEISHU,   transform: toFeishu   },
  { name: 'slack',    url: env.IM_WEBHOOK_SLACK,    transform: toSlack    },
].filter(t => t.url || DRY);

if (targets.length === 0) {
  console.error('❌ 未配置任何 IM_WEBHOOK_*（至少配一个,或设 DRY_RUN=1）');
  exit(2);
}

async function forward(payload) {
  const results = [];
  for (const t of targets) {
    const body = t.transform(payload);
    if (DRY || !t.url) {
      console.log(`[dry] ${t.name} <- ${JSON.stringify(body).slice(0, 200)}`);
      results.push({ name: t.name, status: 'dry-run' });
      continue;
    }
    try {
      const res = await request(t.url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      });
      results.push({ name: t.name, status: res.status });
    } catch (err) {
      results.push({ name: t.name, status: 'error', error: err.message });
    }
  }
  return results;
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, targets: targets.map(t => t.name), dryRun: DRY }));
    return;
  }
  if (req.method === 'POST' && req.url === '/alerts') {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', async () => {
      let payload;
      try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { res.writeHead(400); return res.end('invalid JSON'); }
      console.log(`\n📢 收到告警: status=${payload.status} alerts=${(payload.alerts || []).length}`);
      const results = await forward(payload);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, results }));
    });
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

server.listen(PORT, () => {
  console.log(`✅ Alertmanager webhook server on :${PORT}`);
  console.log(`   POST /alerts   接收 Alertmanager webhook`);
  console.log(`   GET  /health   健康检查`);
  console.log(`   DRY_RUN=${DRY ? '1' : '0'}  转发目标: ${targets.map(t => t.name).join(', ') || '(无)'}`);
});
