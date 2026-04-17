# 用户故事模板

> 参考规范：[docs/chapters/02-business/02-user-stories.md](../../docs/chapters/02-business/02-user-stories.md)

---

## US-[编号] [简短标题]

**归属 Epic / 主题**: [Epic 名]
**状态**: Draft / Refined / Ready / In Progress / Done
**优先级**: P0 / P1 / P2 / P3
**Story Point**: 1 / 2 / 3 / 5 / 8 / 13

### 故事

**作为** [用户角色]
**我想要** [功能 / 能力]
**以便** [业务价值 / 目标]

### 背景
[为什么需要这个？当前是怎样？]

### 验收标准（Acceptance Criteria）

#### AC-1 [场景名：正常流]

- **Given**: [前置条件]
- **And**: [附加前置]
- **When**: [触发动作]
- **Then**: [预期结果]
- **And**: [附加结果]

#### AC-2 [场景名：异常 1]

- Given: ...
- When: ...
- Then: ...

#### AC-3 [场景名：异常 2]

- Given: ...
- When: ...
- Then: ...

#### AC-4 [场景名：边界值]

- Given: ...
- When: ...
- Then: ...

### INVEST 自检

- [ ] **I**ndependent: 不依赖其他未完成故事
- [ ] **N**egotiable: 预留实现空间
- [ ] **V**aluable: 有明确业务价值
- [ ] **E**stimable: 可估算工作量
- [ ] **S**mall: 1 个迭代内可完成
- [ ] **T**estable: 每条 AC 可测试验证

### 依赖

- 前置故事: US-xxx, US-yyy
- 后续故事: US-zzz
- 外部依赖: [外部系统 / 团队]

### 开放问题

- 问题 1: [待谁解答 + 截止时间]

### 相关资料

- PRD: [链接]
- 原型: [链接]
- 设计: [链接]
- 技术方案: [链接]

### DoR（Definition of Ready）自检

- [ ] 故事描述完整
- [ ] 有验收标准
- [ ] 有优先级
- [ ] 有工期估算
- [ ] 无阻塞依赖
- [ ] 测试已评审可测性
- [ ] UI/UX 已评审

### DoD（Definition of Done）

- [ ] 所有 AC 通过
- [ ] 代码已合并
- [ ] 单元测试覆盖
- [ ] 接口文档同步
- [ ] 测试已回归
- [ ] 产品验收
