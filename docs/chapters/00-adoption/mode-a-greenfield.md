# 模式 A · 绿地项目接入

> **适用判定**：项目刚立项，尚未开始编码，或者新开一个代码仓库。

## 为什么你属于这个模式

符合以下任一项：

- ✅ 还没有代码仓库,即将新建
- ✅ 产品需求还在构思或刚进入 PRD 阶段
- ✅ 团队愿意从第 1 天开始用规范
- ✅ 项目规模 > 5 人天（值得规范投入）

## 推荐的时序

按"业务 → 开发 → 测试 → 运维"顺序展开，每个阶段完成前置产出物后再进入下一阶段。

```
Week 0   Day 1-3     Day 4-7      Week 2        Week 3+
 立项 →  业务  →     开发设计  →   测试设计  →   实施迭代
 Kickoff  PRD完成    设计完成     用例完成       按周 Sprint
```

---

## 起步清单（按顺序执行）

### Day 1 · 项目初始化（30 分钟）

```bash
# 1. 初始化项目目录
epcode init --mode=greenfield --name=my-project
# 或手动:
mkdir my-project && cd my-project
git init

# 2. 复制 ep-code-ai 的通用资产
cp -r /path/to/ep-code-ai/templates ./templates-refs
cp -r /path/to/ep-code-ai/.github ./.github
cp /path/to/ep-code-ai/CONTRIBUTING.md .
cp /path/to/ep-code-ai/.gitattributes .
cp /path/to/ep-code-ai/.gitignore .

# 3. 建立目录骨架
mkdir -p docs/{prd,design,adr,api} tests/{cases,reports}
```

### Day 1 · 启动产品阶段（1-2 小时）

1. 产品经理用 [PRD 模板](../../../templates/business/prd-template.md) 开始写 PRD v0.1
2. 同时用 [用户故事模板](../../../templates/business/user-story-template.md) 拆故事
3. 如有复杂业务规则,用 [业务规则模板](../../../templates/business/business-rule-template.md) 整理

### Day 2-3 · PRD 评审

1. 测试在 PRD 评审前 1 天做[可测性评审](../../../templates/testing/requirements/requirements-testability-review.md)
2. 用 AI 辅助评审：复制 [prd-testability-check](../../../skills/business/prompts/prd-testability-check.md) 的 Prompt 到 Claude
3. 评审会：产品 + 开发 + 测试三方,输出改进意见
4. 产品修订 PRD v1.0

### Day 4-5 · 开发设计

1. 开发基于 v1.0 PRD 写[概要设计](../../../templates/development/design-doc-template.md)
2. 关键决策记录为 [ADR](../../../templates/development/adr-template.md)
3. API 契约用 [api-template.md](../../../templates/testing/api-contracts/api-template.md) 写成 Markdown

### Day 6-7 · 测试设计

1. 测试基于设计文档写测试策略
2. 用 [test-case-template](../../../templates/testing/test-cases/test-case-template.md) 写用例
3. 用 AI 辅助：[test-case-gen](../../../skills/testing/prompts/test-case-gen.md) 加速

### Week 2+ · 实施

1. 开发按 Conventional Commits 规范提交
2. 每个 PR 用 [PR 模板](../../../.github/PULL_REQUEST_TEMPLATE.md) 描述
3. 提测时用 [提测申请单](../../../templates/testing/submission/submission-template.md)
4. 测试执行,Bug 用 [Bug 模板](../../../templates/testing/bug-reports/bug-report-template.md) 提

### 第一次发布前 · 运维准备

1. 写 [发布计划](../../../templates/operations/release-plan-template.md)
2. 至少 1 个 [Runbook](../../../templates/operations/runbook-template.md)
3. 准备测试准出报告

---

## 最小可用集

如果时间紧,只做这 **必备 5 件事**：

| # | 必做 | 工具 |
|---|------|------|
| 1 | PRD（含验收标准） | [prd-template.md](../../../templates/business/prd-template.md) |
| 2 | API Markdown 文档 | [api-template.md](../../../templates/testing/api-contracts/api-template.md) |
| 3 | 测试用例集 | [test-case-template.md](../../../templates/testing/test-cases/test-case-template.md) |
| 4 | 提测申请单 | [submission-template.md](../../../templates/testing/submission/submission-template.md) |
| 5 | 第一个 Runbook | [runbook-template.md](../../../templates/operations/runbook-template.md) |

---

## 推荐工具链

| 工具 | 用途 |
|------|------|
| GitHub 或 GitLab | 代码托管 + PR/MR |
| `tools/cross-platform/` 脚本 | 链接校验、commit 校验 |
| `tools/integrations/jira` 或 GitHub Issue | Issue 追踪 |
| `tools/integrations/slack` 或 `im` | 通知 |
| Jenkins / GitLab CI / GitHub Actions | CI/CD |

---

## 团队培训（1 小时）

首次采用时做一次团队宣讲：

1. **10 分钟 · 为什么**：现有工作流痛点 + 框架怎么解决
2. **20 分钟 · 怎么用**：过一遍模板和 checklist
3. **10 分钟 · Demo**：展示 [示例项目 leave-management-system](../../../examples/leave-management-system/) 的产出
4. **20 分钟 · Q&A**：解答团队疑问

---

## 首 2 周的常见问题

### Q: 团队觉得模板太重了

- **回应**：允许先只用最小可用集的 5 件事
- **证据**：展示示例项目的产出质量

### Q: "我们之前也没这样做啊"

- **回应**：对新项目尝试 2 周,和老项目对比
- **指标**：Bug 率、返工率、文档完整度

### Q: 工期紧,没时间写这些

- **回应**：填模板不是额外工作,是把原来就该做的事**显式化**
- **实际情况**：PRD 就是要写,用模板反而快

---

## 成熟度里程碑

| 时间 | 应该达到 |
|------|---------|
| Week 1 | 有 PRD + 可测性评审 |
| Week 2 | 有设计文档 + API Markdown + 测试策略 |
| Week 3-4 | 有测试用例 + 提测走流程 + Bug 用模板 |
| Month 1 末 | 有第一个 Runbook + 度量数据 |
| Month 3 | 所有文档都齐 + 团队熟练使用 |

---

## 升级到模式 B/C/D

项目进入不同阶段后,需要切换：

- **首次进入编码阶段** → 继续用 A（从立项到提测都是绿地）
- **代码开始积累,开始写 MVP** → 可选切换到 B（更务实）
- **首次上线** → 切换到 C（迭代模式）

切换时通常不需要重新初始化,只是调整"规范强度"。

---

## 相关资源

- [接入模式总览](./README.md)
- [01 总览](../01-overview/)
- [完整示例 leave-management-system](../../../examples/leave-management-system/)
