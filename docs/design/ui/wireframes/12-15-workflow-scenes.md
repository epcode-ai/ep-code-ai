# Wireframe 12-15 · 四大场景工作流(Sprint 6 新增)

> 每个场景一个页面,帮用户按方法论**顺序走完**该角色应做的所有动作。
> Prompt 模板不是让用户"复制粘贴到 Claude",而是做成表单化按钮 → 点击 → 表单填参数 → 后台组合发送。

## 共同布局(三栏 + 顶栏)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [场景图标]  场景名                          用户身份 · 当前项目 ──────────   │ ① 顶栏:场景身份信息
├──────────────┬────────────────────────────────────┬──────────────────────────┤
│ 📍 时序       │   当前步骤详情                        │  ✨ 智能操作(Prompt)   │
│              │                                        │                          │
│ 1 ✓ Step1    │   h2 当前步骤标题                       │  📝 Prompt 卡 1          │ ② 中栏:步骤
│ 2 ✓ Step2    │                                        │  📋 Prompt 卡 2          │   详情 + 当前
│ 3 ● Step3    │   ✅ Checklist:                         │  🧪 Prompt 卡 3          │   Checklist +
│ 4 ○ Step4    │     [✓] 项 1                             │  ...                     │   快速操作
│ 5 ○ Step5    │     [ ] 项 2                             │                          │
│ 6 ○ Step6    │     [ ] 项 3                             │  💡 跨场景联动提示        │ ③ 右栏:该阶段
│              │                                        │                          │   可用的 AI 工具
│              │   📄 本阶段产出物                        │                          │
│              │     [Artifact 卡]                       │                          │
│              │                                        │                          │
│              │   💡 下一步                              │                          │
│              │     [按钮 1] [按钮 2]                    │                          │
└──────────────┴────────────────────────────────────┴──────────────────────────┘
   280px                flex                            320px
```

## 四个场景具体时序

### 12 · 💼 业务场景(产品/BA)

| 步 | 阶段 | 关键产出 | Prompt 工具 |
|----|------|---------|-----------|
| 1 | 需求采集 | 访谈笔记 | - |
| 2 | PRD 编写 | prd-vX.Y.md | 生成 PRD 初稿 · 拆用户故事 |
| 3 | 可测性评审 | testability-report.md | PRD 可测性评审 |
| 4 | 业务规则固化 | business-rules.md | 业务规则转表格 |
| 5 | 冲突检测 & 变更 | change-log.md | 需求冲突检测 · 变更影响分析 |
| 6 | 评审通过 & 归档 | PRD Accepted | - |

### 13 · 💻 开发场景(开发/架构师)

| 步 | 阶段 | 关键产出 | Prompt 工具 |
|----|------|---------|-----------|
| 1 | 接需求 · 澄清 | - | - |
| 2 | 技术方案设计 | design-v1.md | 设计文档起草 |
| 3 | ADR 决策 | ADR-NNNN.md | ADR 起草 |
| 4 | API 契约对齐 | api-contract.md | 从代码反向生成 API · 契约冲突检测 |
| 5 | 编码 · 自测 | PR | - |
| 6 | 代码评审 · 合入 | review 记录 | 代码评审清单生成 |
| 7 | 提测 · 发版说明 | Release Note | Release Note 生成 · 依赖升级风险分析 |

### 14 · 🧪 测试场景(测试/QA)

| 步 | 阶段 | 关键产出 | Prompt 工具 |
|----|------|---------|-----------|
| 1 | 需求可测性评审 | 评审意见 | PRD 可测性评审 |
| 2 | 测试策略设计 | test-strategy.md | 测试策略起草 |
| 3 | 用例编写 · 评审 | test-cases.md | 用例批量生成 · Bug 趋势分析 |
| 4 | 提测申请审核 | 审核结果 | 提测单审核 |
| 5 | 测试执行 | Bug 清单 | Bug 报告规范化 · 回归范围推荐 |
| 6 | 准出报告 | test-report.md | 准出报告生成 |

### 15 · 🚀 运维场景(SRE/On-call)

| 步 | 阶段 | 关键产出 | Prompt 工具 |
|----|------|---------|-----------|
| 1 | 发布计划 | release-plan.md | 发布计划生成 |
| 2 | Runbook 准备 | runbook-*.md | Runbook 起草 |
| 3 | 发布执行 | release-log | - |
| 4 | 事件响应 | INC-xxx.md | 事件分级 & 处理建议 |
| 5 | 故障复盘 | postmortem.md | 故障复盘起草 · SLO 分析 |
| 6 | 改进项跟踪 | actions 列表 | 改进项 → 需求池 |

## Prompt 卡片的交互模型

```
点击卡片
  ↓
弹出参数表单
  ├─ 输入来源: 选 Artifact / 粘贴文本 / 上传文件
  ├─ 其他参数: 根据 prompt 模板定义
  └─ Prompt 预览: 实时显示 Claude 将收到的完整 prompt(透明)
  ↓
点 "✨ 执行"
  ↓
- 关弹窗
- 切换到主视图(01),自动创建新消息
- 发送组合后的 prompt
- AI 流式输出回复
- 产出的 Artifact 自动入库,可在对应场景工作流里看到
```

## Prompt 元数据(每个 skills/xxx.md 的 frontmatter)

```yaml
---
id: prd-draft
category: business
icon: 📝
name: 生成 PRD 初稿
description: 从需求访谈笔记生成结构化 PRD
inputs:
  - key: source
    type: artifact_or_text
    label: 输入来源
    required: true
  - key: notes
    type: text
    label: 补充说明
    required: false
output: prd-v{{version}}.md
related_workflow: business
workflow_step: 2
---

你是高级产品经理,请基于下方访谈笔记,按 templates/business/prd-template.md 的
结构生成 PRD 草稿:
...
```

应用启动时扫描 `skills/**/*.md` 的 frontmatter,建 Prompt 注册表 + 自动分类到对应场景工作流的右栏。

## 与主视图(wireframe 01)的切换

用户可以:
- 主视图顶栏点"💼 业务 / 💻 开发 / 🧪 测试 / 🚀 运维" → 切换到对应场景工作流
- 场景工作流里点"📝 继续编辑" / "✨ 执行" → 回到主视图开始 AI 对话

**设计原则**: 主视图是"聊天主战场",场景工作流是"任务导航",两者各司其职。

## Sprint 7 实现影响

| 新增 Swift 文件 | 作用 |
|-----------|------|
| `WorkflowView.swift` | 三栏布局(共 4 个场景,通过数据驱动渲染) |
| `PromptRegistry.swift` | 扫描 skills/ 目录,建 Prompt 注册表 |
| `PromptActionCard.swift` | 右栏每张 Prompt 卡组件 |
| `PromptRunner.swift` | 表单参数 → 组合 prompt → 发送到会话 |
| `WorkflowStepModel.swift` | 时序数据模型(每场景的步骤定义) |
| `RoleContext.swift` | 用户角色 → 决定默认场景 + 工作流状态持久化 |

## 与已有 Skills 的兼容

现有 29 个 prompt 在 `skills/<scene>/prompts/*.md` 下,Sprint 7 迁移时**在文件顶部加 frontmatter** 即可自动被加载,不改写 prompt 内容。
