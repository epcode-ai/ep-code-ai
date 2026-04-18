#!/usr/bin/env node
/**
 * generate-release-plan.js
 *
 * 测试 → 运维 联动:测试报告 test-report.md → 发布计划草稿。
 *
 * 算法:
 *   1. 解析测试报告,提取关键字段:
 *      - 用例通过率 / 覆盖率
 *      - 遗留 Bug（按严重度 S1-S4 分布）
 *      - 版本号
 *   2. 根据规则推导灰度节奏:
 *      - S1 = 0 & 通过率 ≥ 95% → 常规三段灰度（1% → 10% → 100%）
 *      - S2 ≤ 2 & 通过率 ≥ 90% → 保守灰度（1% → 5% → 25% → 100%）
 *      - 否则 → 建议延期发布,整改后复测
 *   3. 输出 Markdown 发布计划（基于 templates/operations/release-plan-template.md 结构）
 *
 * 用法:
 *   node generate-release-plan.js --report <test-report.md> [--version v1.2.0] [--output release-plan.md]
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { argv, exit } from 'node:process';

function parseArgs(a) {
  const o = {};
  for (let i = 0; i < a.length; i++) {
    if (!a[i].startsWith('--')) continue;
    const k = a[i].slice(2);
    const v = a[i + 1];
    if (!v || v.startsWith('--')) o[k] = true;
    else { o[k] = v; i++; }
  }
  return o;
}

const args = parseArgs(argv.slice(2));
if (!args.report) {
  console.error('用法: generate-release-plan --report <test-report.md> [--version vX.Y.Z]');
  exit(2);
}
if (!existsSync(args.report)) {
  console.error(`❌ 测试报告不存在: ${args.report}`);
  exit(2);
}

const content = readFileSync(args.report, 'utf8');

function firstNum(re) {
  const m = re.exec(content);
  return m ? parseFloat(m[1]) : null;
}

// 提取字段（尽量宽松,允许不同报告风格）
const passRate = firstNum(/通过率[^\d]*(\d+(?:\.\d+)?)\s*%/) ??
                 firstNum(/pass\s*rate[^\d]*(\d+(?:\.\d+)?)\s*%/i);
const coverage = firstNum(/覆盖率[^\d]*(\d+(?:\.\d+)?)\s*%/) ??
                 firstNum(/coverage[^\d]*(\d+(?:\.\d+)?)\s*%/i);

const sev = { S1: 0, S2: 0, S3: 0, S4: 0 };
for (const k of Object.keys(sev)) {
  const m = new RegExp(`${k}\\s*[:：|]\\s*(\\d+)`, 'i').exec(content);
  if (m) sev[k] = parseInt(m[1], 10);
  else {
    // 尝试表格形式 | S1 | 0 |
    const m2 = new RegExp(`\\|\\s*${k}\\s*\\|\\s*(\\d+)\\s*\\|`, 'i').exec(content);
    if (m2) sev[k] = parseInt(m2[1], 10);
  }
}

// 版本
let version = args.version;
if (!version) {
  const m = /v\d+\.\d+\.\d+/.exec(content);
  version = m ? m[0] : 'v0.0.0';
}

// 规则推导
let strategy, stages, canRelease;
if (sev.S1 === 0 && (passRate ?? 0) >= 95) {
  canRelease = true;
  strategy = '常规灰度（质量达标）';
  stages = [
    { name: '灰度 1', percent: 1, duration: '2 小时', gate: '错误率 < 0.1%,P99 无劣化' },
    { name: '灰度 2', percent: 10, duration: '4 小时', gate: '错误率 < 0.1%,关键业务正常' },
    { name: '全量', percent: 100, duration: '-', gate: '持续观察 24h' },
  ];
} else if (sev.S1 === 0 && sev.S2 <= 2 && (passRate ?? 0) >= 90) {
  canRelease = true;
  strategy = '保守灰度（有 S2 遗留,小步推进）';
  stages = [
    { name: '灰度 1', percent: 1, duration: '4 小时', gate: '无新增 S1/S2' },
    { name: '灰度 2', percent: 5, duration: '8 小时', gate: '错误率 < 0.2%' },
    { name: '灰度 3', percent: 25, duration: '12 小时', gate: '错误率 < 0.15%' },
    { name: '全量', percent: 100, duration: '-', gate: '持续观察 48h' },
  ];
} else {
  canRelease = false;
  strategy = '⛔ 不建议发布（质量未达标）';
  stages = [];
}

const now = new Date().toISOString().slice(0, 10);
const lines = [];
lines.push(`# 发布计划 · ${version}`);
lines.push('');
lines.push(`> 🤖 由 \`generate-release-plan.js\` 从测试报告自动生成,请人工评审后执行。`);
lines.push(`> 源报告: \`${args.report}\` · 生成时间: ${now}`);
lines.push('');

lines.push(`## 一、测试结论摘要`);
lines.push('');
lines.push('| 指标 | 值 |');
lines.push('|------|-----|');
lines.push(`| 通过率 | ${passRate != null ? passRate + '%' : '(未识别)'} |`);
lines.push(`| 覆盖率 | ${coverage != null ? coverage + '%' : '(未识别)'} |`);
lines.push(`| 遗留 S1（致命） | ${sev.S1} |`);
lines.push(`| 遗留 S2（严重） | ${sev.S2} |`);
lines.push(`| 遗留 S3（一般） | ${sev.S3} |`);
lines.push(`| 遗留 S4（轻微） | ${sev.S4} |`);
lines.push(`| **发布建议** | **${canRelease ? '✅ 可发布' : '❌ 暂缓发布'}** |`);
lines.push(`| **灰度策略** | ${strategy} |`);
lines.push('');

if (!canRelease) {
  lines.push(`## 二、阻塞原因`);
  lines.push('');
  if (sev.S1 > 0) lines.push(`- ❌ 遗留 S1 致命 Bug ${sev.S1} 个,必须修复`);
  if ((passRate ?? 0) < 90) lines.push(`- ❌ 通过率 ${passRate}% 未达 90% 基线`);
  if (sev.S2 > 2) lines.push(`- ⚠️ S2 严重 Bug ${sev.S2} 个,超过 2 个保守基线`);
  lines.push('');
  lines.push(`## 三、整改 Checklist`);
  lines.push('');
  lines.push(`- [ ] 修复所有 S1 Bug`);
  lines.push(`- [ ] 复测受影响用例,达到通过率门槛`);
  lines.push(`- [ ] 重跑 \`generate-release-plan.js\` 产生新版计划`);
} else {
  lines.push(`## 二、灰度节奏`);
  lines.push('');
  lines.push('| 阶段 | 流量占比 | 持续 | 准入 gate |');
  lines.push('|------|---------|------|----------|');
  for (const s of stages) {
    lines.push(`| ${s.name} | ${s.percent}% | ${s.duration} | ${s.gate} |`);
  }
  lines.push('');
  lines.push(`## 三、回滚预案`);
  lines.push('');
  lines.push(`- 触发条件: 任一 gate 不达标 / 任一 S1 新增 / 业务方紧急叫停`);
  lines.push(`- 回滚方式: 流量回切上一个版本（< 5 分钟）或走 runbook`);
  lines.push(`- 负责人: 版本发布人 + SRE on-call`);
  lines.push('');
  lines.push(`## 四、观察指标`);
  lines.push('');
  lines.push(`- 错误率 (5xx / 总请求)`);
  lines.push(`- P99 延迟`);
  lines.push(`- 关键业务转化率（下单 / 支付 / 登录）`);
  lines.push(`- 日志错误关键字新增趋势`);
  lines.push('');
  lines.push(`## 五、责任人`);
  lines.push('');
  lines.push(`- 发布人: _(填)_ `);
  lines.push(`- 值班 SRE: _(填)_ `);
  lines.push(`- 业务方 on-call: _(填)_ `);
}

const out = args.output || `release-plan-${version}.md`;
writeFileSync(out, lines.join('\n'));
console.log(`📄 ${out}`);
console.log(`   版本: ${version} · 通过率: ${passRate ?? '?'}% · S1=${sev.S1} S2=${sev.S2} · ${canRelease ? '✅ 可发布' : '❌ 暂缓'}`);
exit(canRelease ? 0 : 1);
