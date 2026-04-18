# 模式 C · 运行迭代项目接入

> **适用判定**：项目已上线,定期迭代新版本,有成熟现有流程。**这是最常见的情况**。

## 为什么你属于这个模式

符合以下任一项：

- ✅ 产品已上线给用户使用
- ✅ 有固定版本节奏（双周 / 月版 / 季度版）
- ✅ 有现成的工具链（Jira / 禅道 / Jenkins / 自建 BI）
- ✅ 团队有既有工作习惯
- ❌ 不愿意"一刀切换"到新流程（会破坏现有节奏）

## 核心策略：分阶段渐进,每版本加一层

```
版本 v1  v2  v3  v4  v5
        │   │   │   │   │
        ▼   ▼   ▼   ▼   ▼
       规范  门禁  测试  发布 度量
       基础  (提测) 规范  规范  闭环
        └─── 5 层递进,每 2 周 / 1 版本加一层 ───┘
```

**硬原则**：**不替换现有工具**,只叠加新规范。团队感觉到"只是多做点事",不感觉到"被换了"。

---

## 5 层递进路径

### 第 1 层（v+1 版本）· 规范基础

**新引入**：
- Conventional Commits（只要求新 commit）
- PR 模板（`.github/PULL_REQUEST_TEMPLATE.md`）
- CI 基础校验（链接、commit 格式、Markdown）

**保留**：
- 全部现有工具（Jira / Confluence / Jenkins 等）
- 全部现有流程（审批层级、评审方式）

**团队动作**：
- 10 分钟培训 Conventional Commits
- 贴一份 PR 模板的简明示例

**度量**：
- PR 描述完整度
- Commit 格式合规率

---

### 第 2 层（v+2 版本）· 提测门禁

**新引入**：
- [提测申请单](../../../templates/testing/submission/submission-template.md)
- [提测达标 Checklist](../04-testing/04-gates/submission-gate.md)
- CI 自动校验提测单完整性

**保留**：
- Jira 里的测试工作流不变
- 测试执行工具不变

**团队动作**：
- 测试负责人与开发沟通：下版本开始"提测必走申请单"
- 提供模板链接,不强制填所有字段

**度量**：
- 提测一次通过率
- 提测准备时间

---

### 第 3 层（v+3 版本）· 测试产出标准化

**新引入**：
- [测试用例模板](../../../templates/testing/test-cases/test-case-template.md)
- [Bug 报告模板](../../../templates/testing/bug-reports/bug-report-template.md)
- [测试报告模板](../../../templates/testing/test-reports/test-report-template.md)
- AI Prompt: 用例生成、可测性评审

**保留**：
- 禅道/TAPD/TestRail 等用例管理工具（把模板字段映射过去即可）

**团队动作**：
- 测试团队学习模板
- 对现有用例逐步迁移字段格式

**度量**：
- 用例覆盖度
- Bug 按模板填写率

---

### 第 4 层（v+4 版本）· 发布与故障流程

**新引入**：
- [发布计划模板](../../../templates/operations/release-plan-template.md)
- [Runbook 模板](../../../templates/operations/runbook-template.md)
- [故障报告 + 复盘模板](../../../templates/operations/postmortem-template.md)
- 告警转 IM（[im/notify.js](https://github.com/epcode-ai/ep-code-ai/blob/main/tools/integrations/im/notify.js)）

**保留**：
- 现有 CI/CD 流水线
- 现有监控（Prometheus/Datadog/...）

**团队动作**：
- 运维把最高频的 3-5 个告警写成 Runbook
- 约定下次故障必须走复盘模板

**度量**：
- MTTR（平均恢复时间）
- Runbook 覆盖率（告警 → Runbook 映射）

---

### 第 5 层（v+5 版本）· 度量闭环

**新引入**：
- 跨场景度量脚本（Git + Jira + 监控数据）
- 每周自动生成 `METRICS.md`
- 月度复盘用度量数据驱动

**保留**：
- 现有 BI / 数据看板

**团队动作**：
- 把度量结果带到双周会
- 用数据驱动下个版本改进

---

## 渐进引入的"7 条军规"

### 规则 1：不替换,只叠加

- ❌ 不要把 Jira 切到 GitHub Issue
- ✅ 用 Jira + 本框架的模板字段

### 规则 2：从 PR 模板 + CI 开始

这两个**零人工成本**（CI 自动跑）、**全员受益**,是最好的切入点。

### 规则 3：Checklist 先轻后重

- v1 的 PR 模板只有 3 项 checkbox
- v3 再加到 10 项
- 别一上来 20 项,团队会对抗

### 规则 4：每一层完成后观察 2 周再上下一层

- 验证稳定后再推进
- 如果这一层没玩好,先别加下一层

### 规则 5：有回滚机制

- 如果引入某个规范后阻塞了迭代,**能立刻去掉**
- 比如 CI 校验过严 → `continue-on-error: true`

### 规则 6：用度量说话

- 每 2 周看指标
- 数字好看就继续
- 数字不好就暂停分析

### 规则 7：老代码不追溯

- 不要求补历史 PRD / 测试用例
- 只管从本版本开始的新内容

---

## 最小可用集

时间非常紧,只做 **必备 2 件事**（第 1-2 层）：

| # | 必做 | 收益 |
|---|------|------|
| 1 | PR 模板 + Conventional Commits + CI 校验 | 提升代码/commit 质量 |
| 2 | 提测申请单 + 提测门禁 | 提升测试效率 |

这两件做好就能显著改善,其他层慢慢加。

---

## 5 周实施时间线（示例）

假设项目是双周迭代（sprint）：

```
Week 1-2 (v1) → 引入第 1 层 规范基础
  ├─ Day 1: 加 PR 模板 + CI workflow
  ├─ Day 3: 团队培训 Conventional Commits
  └─ Day 10: 复盘效果

Week 3-4 (v2) → 引入第 2 层 提测门禁
  ├─ Day 1: 发布提测申请单模板
  ├─ Day 3: 测试开始强制
  └─ Day 14: 第一批用模板的提测完成

Week 5-6 (v3) → 引入第 3 层 测试规范

Week 7-8 (v4) → 引入第 4 层 发布/故障

Week 9-10 (v5) → 引入第 5 层 度量闭环
```

---

## 真实场景的常见问题

### Q: 我们用的不是 Jira,是国内工具（禅道/TAPD）

**回应**：没问题，本框架的模板都是 Markdown 格式，往禅道/TAPD 的字段里填即可。工具集成见 [tools/integrations/](../../../tools/integrations/)（禅道/TAPD 在 Sprint 3 计划中）。

### Q: 我们已经有自己的 PRD 模板了

**回应**：保留你们的。本框架的模板可以作为补充参考，重点是**可测性**部分一定要有。

### Q: 老板觉得"规范就是束缚敏捷"

**回应**：
- 本框架恰恰是为了**不让流程卡死敏捷**
- 每一层都可选,可回滚
- 数据说话：看 Bug 率、返工率变化

### Q: 有些核心成员觉得没必要

**回应**：
- 先不强推,把工具默默放好
- 让自愿尝试的人先用 2 周
- 数据好看后再推广

### Q: 产品经理不愿写新 PRD

**回应**：
- 模式 C 不强制补 PRD
- 可以先只引入测试/运维规范
- 产品侧的规范等团队成熟后再加

---

## 升级路径

项目在模式 C 运行 6-12 个月后：

- **如果项目进入稳态（停止新功能开发）** → 切换到 [模式 D](./mode-d-maintenance.md)
- **如果有新子项目启动** → 新项目用 [模式 A](./mode-a-greenfield.md)

---

## 相关资源

- [接入模式总览](./README.md)
- [模式 B · 进行中](./mode-b-mid-dev.md) - 上一阶段
- [模式 D · 稳态](./mode-d-maintenance.md) - 下一阶段
- [提测门禁](../04-testing/04-gates/submission-gate.md)
- [PR 模板](../../../.github/PULL_REQUEST_TEMPLATE.md)
