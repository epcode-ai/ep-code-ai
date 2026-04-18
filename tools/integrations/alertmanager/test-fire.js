#!/usr/bin/env node
/**
 * 向本地 webhook-server 推一条模拟的 Alertmanager 告警,用于自测。
 *
 * 用法:
 *   node test-fire.js [--url http://localhost:9900/alerts] [--status firing|resolved]
 */

import { argv, exit } from 'node:process';
import { request } from '../_common/http.js';

const args = {};
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) { args[argv[i].slice(2)] = argv[i + 1]; i++; }
}

const url = args.url || 'http://localhost:9900/alerts';
const status = args.status || 'firing';

const payload = {
  version: '4',
  status,
  receiver: 'epcode-bridge',
  alerts: [
    {
      status,
      labels: {
        alertname: 'HighErrorRate',
        severity: 'critical',
        service: 'payment',
        env: 'prod',
        instance: 'payment-7-abc',
      },
      annotations: {
        summary: '支付服务 P99 错误率 > 5% 持续 5 分钟',
        description: '当前值 7.3%,阈值 5%',
      },
      startsAt: new Date().toISOString(),
      generatorURL: 'https://grafana.example.com/d/payment',
    },
    {
      status,
      labels: { alertname: 'DBConnectionsHigh', severity: 'warning', service: 'db', env: 'prod' },
      annotations: { summary: 'MySQL 活动连接数 920/1000' },
      startsAt: new Date().toISOString(),
    },
  ],
};

try {
  const res = await request(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
  });
  console.log(`✅ HTTP ${res.status}`);
  console.log(res.text?.slice(0, 500));
} catch (err) {
  console.error(`❌ ${err.message}`);
  exit(1);
}
