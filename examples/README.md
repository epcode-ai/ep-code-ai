# 完整示例项目

> **用途**：用一个假想的小项目,展示本方法论如何端到端落地。

## 示例列表

| 项目 | 域 | 规模 | 状态 |
|------|-----|------|------|
| [leave-management-system](./leave-management-system/) | 员工请假管理 | 小型（~6 个接口） | ✅ 完整示例 |

## 怎么用这个示例

### 我想快速了解全流程

直接看 [`leave-management-system/README.md`](./leave-management-system/README.md) 的时间线叙述。

### 我是产品/业务

重点看 [`01-business/`](./leave-management-system/01-business/)：
- PRD 长什么样
- 用户故事怎么写
- 业务规则用决策表表达
- 测试给出的可测性评审意见

### 我是开发

重点看 [`02-development/`](./leave-management-system/02-development/)：
- 概要设计文档
- ADR 决策记录
- API Markdown 文档
- Release Note

### 我是测试

重点看 [`03-testing/`](./leave-management-system/03-testing/)：
- 测试策略
- 测试用例集
- 提测申请单（合格的样本）
- 测试报告（准出报告）

### 我是运维

重点看 [`04-operations/`](./leave-management-system/04-operations/)：
- 发布计划
- Runbook
- 故障报告
- 故障复盘

## 示例的真实度

- ✅ **结构真实**：按项目真实交付节奏组织
- ✅ **内容可信**：数字/场景/问题符合真实项目
- ⚠️ **业务虚构**：不是真项目,但业务逻辑合理
- ⚠️ **不含代码**：只展示文档/交付物,不提供可运行代码

如果需要示例包含可运行的应用代码,后续可以考虑。

## 与模板的关系

- [`templates/`](../templates/) 是**空模板**，给你照着填
- [`examples/`](./) 是**填好的模板**，给你看"填成什么样合适"

对照阅读效果最好。
