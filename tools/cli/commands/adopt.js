/**
 * epcode adopt --level=<1..5>
 *
 * 模式 C 渐进式启用。每次执行:
 *   1. 打印本层引入的内容清单
 *   2. 在 ADOPTION-LOG.md 追加一行
 *
 * 注意: 不会覆盖现有文件,只做"通知 + 日志",实际复制由用户按清单手动
 * 做（保持可控,避免覆盖客户已有的 CI 配置）。
 */
import { existsSync, appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from './_util.js';

const LEVELS = {
  1: {
    name: '规范基础',
    introduces: [
      'Conventional Commits 规范（参考 tools/cross-platform/scripts/check-commit.js）',
      'PR/MR 模板（抄 .github/PULL_REQUEST_TEMPLATE.md 或 workflows/gitlab/.gitlab/merge_request_templates/）',
      'CI 起步 job: docs-check + commit-lint',
    ],
    avoid: '别一次性开太多门禁,先跑 2 周让团队适应',
  },
  2: {
    name: '提测门禁',
    introduces: [
      '提测申请单模板（templates/testing/submission/）',
      'CI 接 submission-check（tools/cross-platform/scripts/check-submission.js）',
      '提测达标 Checklist 融入 MR 模板',
    ],
    avoid: '别用硬阻塞太严,先做"报警"再转"硬门禁"',
  },
  3: {
    name: '测试产出标准化',
    introduces: [
      '测试策略 / 用例 / Bug 模板（templates/testing/）',
      'PRD 可测性打分（epcode prd xxx.md）',
      '需求覆盖率（tools/cross-platform/scripts/coverage-analysis.js）',
    ],
    avoid: '不要求追溯历史用例,只要求新需求走新模板',
  },
  4: {
    name: '发布与故障流程',
    introduces: [
      '发布计划模板（templates/operations/release-plan-template.md）',
      'Runbook / 故障报告 / 复盘 模板',
      '发布计划自动化(epcode linkage release-plan)',
    ],
    avoid: '稳态系统别硬推大改,能用 runbook 补齐即可',
  },
  5: {
    name: '度量闭环',
    introduces: [
      'tools/metrics/ 四场景 collect.js',
      'METRICS.md 总看板 (epcode metrics)',
      '.github/workflows/metrics-weekly.yml 每周自动生成',
    ],
    avoid: '先以"观察"为主,不要因一次数据波动就叫团队改流程',
  },
};

export async function run(args) {
  const opts = parseArgs(args);
  const level = parseInt(opts.level, 10);
  if (!LEVELS[level]) {
    console.error('用法: epcode adopt --level=<1|2|3|4|5>');
    console.error('可用层级:');
    for (const [k, v] of Object.entries(LEVELS)) console.error(`  ${k}: ${v.name}`);
    return 2;
  }
  const L = LEVELS[level];

  console.log(`\n📦 Level ${level} · ${L.name}`);
  console.log('');
  console.log('本层引入:');
  for (const x of L.introduces) console.log(`  - ${x}`);
  console.log('');
  console.log(`⚠️  避免: ${L.avoid}`);
  console.log('');

  // 更新 ADOPTION-LOG.md
  const logPath = resolve(opts.log || 'ADOPTION-LOG.md');
  if (!existsSync(logPath)) {
    console.log(`ℹ️  未找到 ADOPTION-LOG.md（${logPath}）,跳过日志写入`);
    console.log(`   如果你用 \`epcode init --mode=C\` 初始化的项目,应该在目录根下`);
    return 0;
  }
  const date = new Date().toISOString().slice(0, 10);
  const line = `| ${level} | ${date} | ${L.name} | _(填)_ | 删除本层引入文件 |\n`;
  appendFileSync(logPath, line);
  console.log(`✅ 已在 ${logPath} 追加记录`);
  console.log('');
  console.log('下一步: 按照"本层引入"清单,从 ep-code-ai 仓库拷贝对应文件到当前项目');
  return 0;
}
