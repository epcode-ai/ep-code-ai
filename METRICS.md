# 📊 EP Code AI · 度量看板

> 窗口: **7 days ago** · 生成时间: 2026-05-04

本看板由 `tools/metrics/generate-dashboard.js` 汇总四大场景 `METRICS-*.md` 生成。

## 场景关键指标

### 💼 业务

| 指标 | 值 |
|------|-----|
| 业务文档相关 commit | 0 |
| CR（变更请求）相关 commit | 0 |
| CR 占业务 commit 比 | 0% |

<details>
<summary>完整 METRICS-business.md</summary>

# 业务度量周报

> 自动生成自 `tools/metrics/business/collect.js`
> 数据区间：自 7 days ago
> 生成时间：2026-05-04T01:30:47Z

## 一、总览

| 指标 | 数值 |
|------|------|
| 业务文档相关 commit | 0 |
| CR（变更请求）相关 commit | 0 |
| 业务侧贡献者 | 0 人 |
| CR 占业务 commit 比 | 0% |

## 二、业务文档按月变更

| 月份 | commit 数 |
|------|-----------|
| —  | 无业务文档变更 |

## 三、业务侧贡献者（Top 10）

| 作者 | 提交数 |
|------|--------|
| — | 无数据 |

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
| 总 commit 数（不含 Merge） | 0 |
| Conventional Commits 规范率 | 0% |
| 不合规 commit | 0 |
| Merge commit 数 | 9 |
| 平均每次合入包含的 commit 数 | 1.0 |
| ADR 总数（全仓库） | 4 |
| 小（< 50 行） | 0 |
| 中（50-499 行） | 0 |

<details>
<summary>完整 METRICS-development.md</summary>

# 开发度量周报

> 自动生成自 `tools/metrics/development/collect.js`
> 数据区间：自 7 days ago
> 生成时间：2026-05-04T01:30:47Z

## 一、总览

| 指标 | 数值 |
|------|------|
| 总 commit 数（不含 Merge） | 0 |
| Conventional Commits 规范率 | 0% |
| 不合规 commit | 0 |
| Merge commit 数 | 9 |
| 平均每次合入包含的 commit 数 | 1.0 |
| ADR 总数（全仓库） | 4 |
| 采样 commit 的总改动行数 | +0 / -0 |

## 二、Commit 类型分布（Conventional Commits）

| 类型 | 数量 | 占合规 commit |
|------|------|--------------|

## 三、代码变更规模分布（采样 100 个最近 commit）

| 规模 | 数量 | 占比 |
|------|------|------|
| 小（< 50 行） | 0 | 0% |
| 中（50-499 行） | 0 | 0% |
| 大（500-1999 行） | 0 | 0% |
| 超大（≥ 2000 行） | 0 | 0% |

## 四、参考基线（开发篇建议值）

| 指标 | 期望 | 当前 | 达标 |
|------|------|------|------|
| Conventional Commits 合规率 | ≥ 90% | 0% | ⚠️ |
| 单次 MR 合入的 commit 数 | 1-3 | 1.0 | ✅ |
| 单个 commit 大小 | 多数 < 500 行 | NaN% 在 < 500 行 | ⚠️ |

---

_本报告由 `tools/metrics/development/collect.js` 自动生成,请勿手动编辑。_

</details>

### 🧪 测试

| 指标 | 值 |
|------|-----|
| 测试用例 | 0 |
| 测试策略 | 0 |
| 测试报告 | 0 |
| 提测申请 | 0 |
| Bug 报告 | 0 |
| 测试产出 commit 合计 | 0 |

<details>
<summary>完整 METRICS-testing.md</summary>

# 测试度量周报

- 采集窗口: since **7 days ago**
- 生成时间: 2026-05-04

## 测试产出

| 类别 | commit 数 |
|------|----------|
| 测试用例 | 0 |
| 测试策略 | 0 |
| 测试报告 | 0 |
| 提测申请 | 0 |
| Bug 报告 | 0 |
| **测试产出 commit 合计** | **0** |

## 最近 fix/bug 提交 (Top 10)

_(本时间窗无 fix/bug 提交)_

## 贡献者 Top-5（测试产出）

_(无)_


</details>

### 🚀 运维

| 指标 | 值 |
|------|-----|
| Runbook | 0 |
| 发布计划 | 0 |
| 故障报告 | 0 |
| 复盘 | 0 |
| 运维产出 commit 合计 | 0 |
| 回滚数 | 0 |
| Hotfix 数 | 0 |
| 复盘产出 | 0 |

<details>
<summary>完整 METRICS-operations.md</summary>

# 运维度量周报

- 采集窗口: since **7 days ago**
- 生成时间: 2026-05-04

## 运维产出

| 类别 | commit 数 |
|------|----------|
| Runbook | 0 |
| 发布计划 | 0 |
| 故障报告 | 0 |
| 复盘 | 0 |
| **运维产出 commit 合计** | **0** |

## 稳定性指标（粗估）

| 指标 | 值 | 说明 |
|------|----|------|
| 回滚数 | 0 | subject 以 `Revert` 开头的 commit |
| Hotfix 数 | 0 | subject 含 hotfix/emergency/紧急 的 commit |
| 复盘产出 | 0 | 如复盘数 < 故障数,提示复盘欠账 |

## 贡献者 Top-5（运维产出）

_(无)_


</details>

## 联动脚本（Sprint 4 产出）

| 场景 → | 脚本 | 作用 |
|--------|------|------|
| 业务 → 开发 | `link-prd-to-design.js` | PRD 变更 → 影响面 |
| 开发 → 测试 | `recommend-regression.js` | git diff → 回归用例推荐 |
| 测试 → 运维 | `generate-release-plan.js` | 测试报告 → 发布计划草稿 |
| 运维 → 业务 | `incident-to-requirement.js` | 复盘改进项 → Jira/GH Issue |
