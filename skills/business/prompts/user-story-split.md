---
name: user-story-split
description: 把大用户故事拆成符合 INVEST 原则的子故事
version: 1.0
category: business
---

# 用户故事拆解

## 用途

把"太大无法一次交付"的故事拆解成可独立交付的子故事。

## 使用场景

- Epic 拆解成 Story
- Story Point 估出来太大（> 8）需要拆
- 迭代规划前的准备工作

## Prompt 本体

```markdown
你是一位资深敏捷教练。帮我把这个大故事拆成 3-7 个可独立交付的子故事。

## 要求
1. 每个子故事满足 INVEST 原则：
   - Independent: 可独立交付
   - Negotiable: 留实现空间
   - Valuable: 有明确业务价值
   - Estimable: 可估算工作量
   - Small: 1 个迭代内可完成
   - Testable: 有明确验收标准

2. 每个子故事输出：
   - 标题
   - As a / I want / So that
   - 至少 3 条验收标准（Given-When-Then 格式）
   - Story Point 估算（1/2/3/5/8）
   - 是否阻塞其他故事

3. 标注子故事之间的依赖关系

4. 给出建议的交付顺序和理由

## 大故事
[粘贴原始故事 + 背景 + 已知约束]

## 附加输出
- 拆解后的总 Story Point
- 建议分到几个迭代
- 可能漏掉的场景提醒
```

## 使用示例

**输入**: "作为企业管理员，我想要员工管理系统，以便统一管理人员"

**输出**: 7 个子故事（从"添加员工" → "批量导入" → "角色权限" → ...）

## 相关资源

- [用户故事与验收标准](../../../docs/chapters/02-business/02-user-stories.md)
- [用户故事模板](../../../templates/business/user-story-template.md)

## 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-17 | 初版 |
