# 模式 B · 进行中项目接入（开发阶段）

> **适用判定**：代码已开始写但未上线，有部分 PRD/设计但不完整，想改进流程但不能重来。

## 为什么你属于这个模式

符合以下任一项：

- ✅ 代码仓库已存在，已开始编码
- ✅ 还未上线生产给真实用户
- ✅ 有些 PRD/设计但分散、不规范
- ✅ 团队认可改进流程的必要性
- ❌ 不接受全部推翻重来

## 核心策略：两条腿走路

```
┌──────────────────────────┬──────────────────────────┐
│  历史代码                 │   未来代码                │
│  （不重做）                │   （走规范）               │
├──────────────────────────┼──────────────────────────┤
│  - 已写的代码不回炉        │   - 新 PR 用 PR 模板       │
│  - 历史文档补关键部分       │   - 新需求用 PRD 模板       │
│  - 技术债进 backlog        │   - 新 Bug 用 Bug 模板      │
└──────────────────────────┴──────────────────────────┘
```

**硬原则**：**不要求追溯历史全部**，否则团队会抵触。

---

## 6 步上车清单（按优先级）

### Step 1 · 建目录骨架（30 分钟）

```bash
cd your-existing-repo
epcode init --mode=mid-dev

# 或手动:
mkdir -p docs/{prd,design,adr,api} tests
cp -r /path/to/ep-code-ai/.github ./.github
cp /path/to/ep-code-ai/.gitattributes .
# 已有的 .gitignore 合并 ep-code-ai 的
```

### Step 2 · 反向补 API 文档（2-4 小时）

对**当前还在用的接口**，用 AI 快速生成 Markdown 文档：

```bash
# 从代码生成接口文档
# 把你的接口代码粘给 Claude,用 api-doc-from-code Prompt
cat skills/development/prompts/api-doc-from-code.md
```

**规则**：
- ✅ 只做**还在用**的接口（废弃的不补）
- ✅ **先主干后细节**（核心 5-10 个接口优先）
- ⚠️ 标注"v0.9 - 反向生成,待人工核对"

### Step 3 · 补 3-5 个关键 PRD（1-2 天）

**不是把所有历史需求补 PRD**，而是：

1. 列出当前 Roadmap 上**还会持续开发**的核心功能（3-5 个）
2. 用 [PRD 简版模板](../../../templates/business/prd-template.md) 补写（轻量即可）
3. 这些 PRD 作为未来迭代的基线

**例子**：
- 如果你的产品有"订单管理、用户管理、报表"3 个核心模块
- 每个模块写 1 份 PRD v1.0（不必追溯每个历史小需求）

### Step 4 · 建立门禁（1 小时）· 关键！

这是模式 B 的**最大收益点**：通过门禁自动强制规范落地。

```bash
# 在仓库启用:
cp /path/to/ep-code-ai/.github/PULL_REQUEST_TEMPLATE.md .github/
cp /path/to/ep-code-ai/.github/workflows/ci.yml .github/workflows/
cp -r /path/to/ep-code-ai/.github/ISSUE_TEMPLATE .github/
```

从这一刻起：
- 新 PR 必须填 checklist
- CI 自动校验 Conventional Commits + 链接 + Markdown 规范
- 提测要用 [提测申请单](../../../templates/testing/submission/submission-template.md)

### Step 5 · 列技术债 BACKLOG（30 分钟）

历史代码里"知道有问题但一直没改"的点,列到 `BACKLOG.md`：

```markdown
# Technical Debt Backlog

## 文档类
- [ ] 老接口 `/api/v1/foo` 没有 API Markdown
- [ ] 订单模块的业务规则散落在代码注释里,未整理

## 代码类
- [ ] 缺少单元测试：user-service
- [ ] TODO 标记的 15 处未处理

## 规范类
- [ ] commit 历史不符合 Conventional Commits
```

每个迭代挑 1-2 个消化,别一次清。

### Step 6 · 从下个 Sprint 开始强制新规范

宣布：**从下个 Sprint 开始，所有新 PR 必须**：
- 用 PR 模板
- Conventional Commits
- 影响接口的 PR 必须更新 API Markdown
- 涉及新功能的必须有对应 PRD 或补 PRD

---

## 最小可用集

如果时间非常紧,只做 **必备 3 件事**：

| # | 必做 | 为什么 |
|---|------|--------|
| 1 | 启用 PR 模板 + CI 校验 | 自动化门禁,零人工成本 |
| 2 | 补 3-5 个核心模块的 API Markdown | 为测试开展铺路 |
| 3 | 提测走申请单 | 测试质量立刻提升 |

**剩下的慢慢来,2-3 个月内完成**。

---

## 团队沟通话术

### 对开发

- 不会否定你们过去的工作
- 新规范只管新代码和新 PR
- 填 PR 模板其实比瞎写描述快

### 对产品

- 历史需求不用补 PRD
- 新需求用模板,省得反复被测试问

### 对测试

- 有了 API Markdown + 提测申请单,测试效率会提升
- 以前遇到的"开发没说变了什么"问题会显著减少

### 对 Leader

- 所有改动都是**增量的**,可随时停
- 每 2 周度量一次,看效果调整

---

## 量化效果（预期）

按这个模式走 1 个月后,典型效果：

| 指标 | Before | After |
|------|--------|-------|
| PR 描述完整度 | 30% | 80%+ |
| 提测一次通过率 | 50% | 70%+ |
| 接口文档覆盖（核心接口） | 10% | 90% |
| 测试准出速度 | 慢 | 快 20% |

---

## 常见 2 周内会遇到的坑

### 坑 1: 开发嫌 PR 模板啰嗦

**缓解**：
- PR 模板先简化（只留必填项）
- 让 CI 校验只挑最关键的（不要一上来太严）
- 2 周后根据实际使用调整

### 坑 2: 补 PRD 感觉"做假账"

**回应**：
- 反向 PRD **不是为了交差**,是为后续迭代建立基线
- 不求 100% 还原历史,记录"当前是怎样"就行

### 坑 3: CI 经常挂

**缓解**：
- `continue-on-error: true` 对非关键检查
- `--fail-on=hard` 参数让 lint 警告不阻塞
- 参考本仓库 [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) 的配置

### 坑 4: 接口文档反向生成后没人维护

**缓解**：
- CI 加检查：PR 里动了 `src/api/` 就必须动 `docs/api/`
- 让"更新接口文档"和"改接口"合并到同一 PR

---

## 升级路径

模式 B 是过渡态,通常运行 2-3 个月后：

- **项目首次上线** → 升级到 [模式 C](./mode-c-iterating.md)
- **如果你发现规范已经稳定运行** → 可以主动切 C（享受渐进升级的好处）

---

## 相关资源

- [接入模式总览](./README.md)
- [模式 A · 绿地](./mode-a-greenfield.md) - 对比参考
- [模式 C · 迭代](./mode-c-iterating.md) - 下一阶段
- [反向生成 API 文档 Prompt](../../../skills/development/prompts/api-doc-from-code.md)
- [PR 模板](../../../.github/PULL_REQUEST_TEMPLATE.md)
