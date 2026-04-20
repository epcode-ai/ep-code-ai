# 📊 EP Code AI · 度量看板

> 窗口: **60 days ago** · 生成时间: 2026-04-20

本看板由 `tools/metrics/generate-dashboard.js` 汇总四大场景 `METRICS-*.md` 生成。

## 场景关键指标

### 💼 业务

| 指标 | 值 |
|------|-----|
| 业务文档相关 commit | 7 |
| CR（变更请求）相关 commit | 0 |
| CR 占业务 commit 比 | 0% |
| 2026-04 | 7 |
| zhangkunshi | 5 |
| JohnC-stack | 2 |

<details>
<summary>完整 METRICS-business.md</summary>

# 业务度量周报

> 自动生成自 `tools/metrics/business/collect.js`
> 数据区间：自 60 days ago
> 生成时间：2026-04-20T08:14:06Z

## 一、总览

| 指标 | 数值 |
|------|------|
| 业务文档相关 commit | 7 |
| CR（变更请求）相关 commit | 0 |
| 业务侧贡献者 | 2 人 |
| CR 占业务 commit 比 | 0% |

## 二、业务文档按月变更

| 月份 | commit 数 |
|------|-----------|
| 2026-04 | 7 |

## 三、业务侧贡献者（Top 10）

| 作者 | 提交数 |
|------|--------|
| zhangkunshi | 5 |
| JohnC-stack | 2 |

## 四、最近 10 次 CR / 变更相关 commit

_无_

## 五、参考基线（业务篇建议值）

| 指标 | 期望范围 | 说明 |
|------|---------|------|
| 版本内 CR 次数 | ≤ 3 | 过多说明需求不稳定 |
| 紧急变更占比 | ≤ 10% | 过高说明计划不充分 |
| 变更驳回率 | 30-50% | 过低说明把关不严 |

---

_本报告由 `tools/metrics/business/collect.js` 自动生成,请勿手动编辑。_

</details>

### 💻 开发

| 指标 | 值 |
|------|-----|
| 总 commit 数（不含 Merge） | 49 |
| Conventional Commits 规范率 | 88% |
| 不合规 commit | 6 |
| Merge commit 数 | 9 |
| 平均每次合入包含的 commit 数 | 1.0 |
| ADR 总数（全仓库） | 1 |
| `feat` | 15 |
| `fix` | 13 |

<details>
<summary>完整 METRICS-development.md</summary>

# 开发度量周报

> 自动生成自 `tools/metrics/development/collect.js`
> 数据区间：自 60 days ago
> 生成时间：2026-04-20T08:14:07Z

## 一、总览

| 指标 | 数值 |
|------|------|
| 总 commit 数（不含 Merge） | 49 |
| Conventional Commits 规范率 | 88% |
| 不合规 commit | 6 |
| Merge commit 数 | 9 |
| 平均每次合入包含的 commit 数 | 1.0 |
| ADR 总数（全仓库） | 1 |
| 采样 commit 的总改动行数 | +60294 / -501 |

## 二、Commit 类型分布（Conventional Commits）

| 类型 | 数量 | 占合规 commit |
|------|------|--------------|
| `feat` | 15 | 35% |
| `fix` | 13 | 30% |
| `docs` | 10 | 23% |
| `test` | 4 | 9% |
| `chore` | 1 | 2% |
| _不合规_ | 6 | — |

## 三、代码变更规模分布（采样 100 个最近 commit）

| 规模 | 数量 | 占比 |
|------|------|------|
| 小（< 50 行） | 20 | 41% |
| 中（50-499 行） | 6 | 12% |
| 大（500-1999 行） | 11 | 22% |
| 超大（≥ 2000 行） | 12 | 24% |

## 四、参考基线（开发篇建议值）

| 指标 | 期望 | 当前 | 达标 |
|------|------|------|------|
| Conventional Commits 合规率 | ≥ 90% | 88% | ⚠️ |
| 单次 MR 合入的 commit 数 | 1-3 | 1.0 | ✅ |
| 单个 commit 大小 | 多数 < 500 行 | 53% 在 < 500 行 | ⚠️ |

---

_本报告由 `tools/metrics/development/collect.js` 自动生成,请勿手动编辑。_

</details>

### 🧪 测试

| 指标 | 值 |
|------|-----|
| 测试用例 | 2 |
| 测试策略 | 1 |
| 测试报告 | 3 |
| 提测申请 | 5 |
| Bug 报告 | 4 |
| 测试产出 commit 合计 | 7 |
| zhangkunshi | 13 |
| JohnC-stack | 3 |

<details>
<summary>完整 METRICS-testing.md</summary>

# 测试度量周报

- 采集窗口: since **60 days ago**
- 生成时间: 2026-04-20

## 测试产出

| 类别 | commit 数 |
|------|----------|
| 测试用例 | 2 |
| 测试策略 | 1 |
| 测试报告 | 3 |
| 提测申请 | 5 |
| Bug 报告 | 4 |
| **测试产出 commit 合计** | **7** |

## 最近 fix/bug 提交 (Top 10)

| 日期 | 作者 | Subject |
|------|------|---------|
| 2026-04-20 | JohnC-stack | fix(architecture): 数据流改为业务分叉到开发+测试并行(非串行链) (#23) |
| 2026-04-20 | JohnC-stack | fix(sprint-6): 原型深度打磨 + 补齐 4 种接入模式入口(A/B/C/D) (#21) |
| 2026-04-18 | JohnC-stack | fix(ci): submission-check 排除 docs/chapters/ 方法论文章 (#14) |
| 2026-04-18 | JohnC-stack | fix(docs): submission-gate L102 长行改短 (#13) |
| 2026-04-18 | JohnC-stack | fix(docs-site): 忽略 broken links + 外部代码文件链接转 GitHub URL (#12) |
| 2026-04-18 | JohnC-stack | fix(docs): 转义 Markdown 表格中的 <NN 为 HTML entity (#11) |
| 2026-04-18 | JohnC-stack | fix(docs-site): 锁定 Docusaurus 3.8.1 + webpack 5.97.1 (#10) |
| 2026-04-18 | JohnC-stack | fix(docs-site): 升级 Docusaurus 3.5 → 3.7 (#9) |
| 2026-04-18 | JohnC-stack | fix(docs-site): 修正 Docusaurus doc IDs (自动剥离数字前缀) (#8) |
| 2026-04-18 | JohnC-stack | fix(ci): pages workflow 去掉 cache 依赖 lockfile (#7) |

## 贡献者 Top-5（测试产出）

| 作者 | commit 数 |
|------|----------|
| zhangkunshi | 13 |
| JohnC-stack | 3 |


</details>

### 🚀 运维

| 指标 | 值 |
|------|-----|
| Runbook | 4 |
| 发布计划 | 3 |
| 故障报告 | 5 |
| 复盘 | 4 |
| 运维产出 commit 合计 | 6 |
| 回滚数 | 0 |
| Hotfix 数 | 0 |
| 复盘产出 | 4 |

<details>
<summary>完整 METRICS-operations.md</summary>

# 运维度量周报

- 采集窗口: since **60 days ago**
- 生成时间: 2026-04-20

## 运维产出

| 类别 | commit 数 |
|------|----------|
| Runbook | 4 |
| 发布计划 | 3 |
| 故障报告 | 5 |
| 复盘 | 4 |
| **运维产出 commit 合计** | **6** |

## 稳定性指标（粗估）

| 指标 | 值 | 说明 |
|------|----|------|
| 回滚数 | 0 | subject 以 `Revert` 开头的 commit |
| Hotfix 数 | 0 | subject 含 hotfix/emergency/紧急 的 commit |
| 复盘产出 | 4 | 如复盘数 < 故障数,提示复盘欠账 |

## 贡献者 Top-5（运维产出）

| 作者 | commit 数 |
|------|----------|
| zhangkunshi | 12 |
| JohnC-stack | 5 |


</details>

## 联动脚本（Sprint 4 产出）

| 场景 → | 脚本 | 作用 |
|--------|------|------|
| 业务 → 开发 | `link-prd-to-design.js` | PRD 变更 → 影响面 |
| 开发 → 测试 | `recommend-regression.js` | git diff → 回归用例推荐 |
| 测试 → 运维 | `generate-release-plan.js` | 测试报告 → 发布计划草稿 |
| 运维 → 业务 | `incident-to-requirement.js` | 复盘改进项 → Jira/GH Issue |
