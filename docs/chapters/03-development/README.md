# 第 03 篇 · 开发篇

> **状态**: ✅ 5 个子章节完成
> **目标读者**: 开发工程师 / 架构师 / Tech Lead

## 一、本篇目标

解决开发侧的核心问题：
1. **输入如何把关**：业务交付包不合格怎么办？
2. **产出如何规范**：代码、设计、契约、文档如何统一标准
3. **提测质量如何保证**：达到什么标准才能提给测试
4. **AI 如何帮助开发**：代码评审、文档生成、架构建议

## 二、开发在整个研发流程中的位置

```
业务场景 ──► 需求包 ──►┌─────────────────┐
                      │  开发场景        │
                      │                 │──► 可测版本（含接口文档）
                      │  本篇的范围      │
                      └─────────────────┘
                                        │
                                        ▼
                                    测试场景
```

### 开发的输入把关（对业务的要求）

当业务交付的需求包不合格时，开发应启动"需求退回"机制：

| 不合格情形 | 处理 |
|----------|------|
| 验收标准模糊 | 退回，要求明确化 |
| 业务规则冲突 | 召开澄清会 |
| 异常场景缺失 | 要求补充 |
| 技术不可行 | 开发提出替代方案 |

### 开发的输出规范（对测试的承诺）

提测达标标准详见 [测试篇 · 提测门禁](../04-testing/04-gates/submission-gate.md)，核心要求：

- 代码已合并到 `release/*` 分支
- CI 绿灯、覆盖率 ≥ 80%
- 接口文档与代码一致
- 提测申请单完整
- 测试环境可访问

## 三、本篇目录

| 章节 | 内容 | 状态 |
|------|------|------|
| [01 设计规范](./01-design-standards.md) | 概要设计、ADR、数据模型、时序图 | ✅ |
| [02 代码评审](./02-code-review.md) | 评审清单、礼仪、分级标签、度量 | ✅ |
| [03 分支策略](./03-branch-strategy.md) | 简化 Git Flow、Commit 规范、合并策略 | ✅ |
| [04 版本与依赖管理](./04-version-management.md) | SemVer、依赖锁定、升级、SBOM | ✅ |
| [05 AI 辅助开发](./05-ai-assistance.md) | 9 个核心 Prompt 模板 | ✅ |

## 四、当前可用的相关资源

以下资源已可在 `templates/` 和 `docs/chapters/04-testing/` 下找到：

### 已有内容

| 资源 | 位置 |
|------|------|
| API 契约 Markdown 模板 | [`templates/testing/api-contracts/`](../../../templates/testing/api-contracts/) |
| 开发 → 测试 契约 | [`docs/chapters/04-testing/03-roles-contracts/dev-contract.md`](../04-testing/03-roles-contracts/dev-contract.md) |
| GitLab MR 模板 | [`workflows/gitlab/merge_request_template.md`](../../../workflows/gitlab/merge_request_template.md) |
| GitLab CI 示例 | [`workflows/gitlab/.gitlab-ci.example.yml`](../../../workflows/gitlab/.gitlab-ci.example.yml) |

### 本篇后续会重点补充

- [ ] 架构设计文档模板（ADR: Architecture Decision Record）
- [ ] 代码评审清单（按语言/按场景）
- [ ] Git Flow vs Trunk-Based 决策指南
- [ ] 前端/后端/数据库的开发规范

## 五、AI 辅助开发的嵌入点

| 场景 | 用 AI 做什么 |
|------|------------|
| 代码评审 | 自动识别常见问题（空指针、资源泄漏、SQL 注入） |
| 文档补全 | 根据代码生成接口文档草稿 |
| 代码翻译 | 把旧代码翻成新语言/新框架 |
| 测试桩生成 | 根据接口契约生成 mock 服务 |
| 架构建议 | 根据需求提出多方案对比 |

具体 prompt 与工作流将在本篇后续补充。

## 六、相关篇章

- [01 总览](../01-overview/)
- [02 业务篇](../02-business/) — 开发的上游输入
- [04 测试篇](../04-testing/) — 开发的下游输出
