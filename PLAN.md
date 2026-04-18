# EP Code AI 系统化建设计划（5-Sprint Roadmap）

> **这是 Sprint 1 启动时的定稿计划,作为后续 5 周实施的参考。**
> - 快速概览见 [ROADMAP.md](./ROADMAP.md)
> - 变更日志见 [CHANGELOG.md](./CHANGELOG.md)
> - 本文件定稿时间: 2026-04-17（Sprint 1 启动）
>
> ### 进度追踪（Sprint 状态）
>
> | Sprint | 主题 | 状态 |
> |--------|------|------|
> | S1 | 操作系统收尾 + 接入模式骨架 + 启动试点 | ✅ 完成（2026-04-17） |
> | S2 | 业务 + 开发场景工具补齐 | ✅ 完成（2026-04-18） |
> | S3 | 测试 + 运维场景工具补齐 | ✅ 完成（2026-04-18） |
> | S4 | 场景联动 + 度量闭环 | ✅ 完成（2026-04-18） |
> | S5 | 统一 CLI + 对外发布 + 试点复盘 | ✅ 完成（2026-04-18） 🎉 |
>
> 每完成一个 Sprint,会在对应章节标题加 ✅,并在 CHANGELOG 追加条目。

## Context

`ep-code-ai` 仓库（https://github.com/epcode-ai/ep-code-ai）目前已有相当完整的方法论框架，但距离"真正可企业落地 + 有真实项目验证"还有明确差距。本计划按**每周 1 个 Sprint 的节奏**，在 5 周内把系统从 "85% 框架完成" 推到 "95% 系统可用 + 有真实项目验证"。

### 为什么做这份计划

1. **方法论和工具已铺开**：5 篇文档、24 个模板、29 个 AI Prompt、5 个企业集成、端到端示例项目都已就位
2. **但四大场景工具层不均**：业务/运维场景弱于测试/开发（见矩阵）
3. **场景之间的自动化联动几乎为零**：只有文字契约，没有跨场景脚本
4. **三操作系统只验证了 macOS**：Linux/Windows 脚本写完没跑过
5. **没有真实项目试点**：只 dogfooding 过本仓库

### 目标

5 周后，这个项目要做到：
- ✅ 三个操作系统都在真机/CI 跑通
- ✅ 四大场景都有完整工具闭环（方法论 + 模板 + Prompt + CLI + 集成 + 度量）
- ✅ 跨场景联动有可执行脚本（不只是文字契约）
- ✅ 至少 1 个真实小项目跑完整周期并复盘
- ✅ 有对外门面（文档站 + 路线图）
- ✅ **不同阶段的项目都有清晰的接入路径**（见下节）

---

## 🔑 接入模式抽象（本次规划的关键补充）

> **核心挑战**：真实世界的项目处于不同阶段。绿地项目、在开发的项目、已上线迭代的项目、已进稳态运维的项目，嵌入本框架的路径**完全不同**。框架必须对四种模式都做抽象，让每种情况的用户**知道从哪儿开始、先做什么、别纠结什么**。

### 4 种接入模式（按项目阶段）

```
项目生命周期:  立项   开发中   上线后·迭代   稳态运维
                │      │        │            │
                ▼      ▼        ▼            ▼
             模式 A  模式 B   模式 C       模式 D
             绿地   进行中   运行迭代     稳态维护
             全套   追溯补   增量嵌入     运维聚焦
             上车   当下开始  每版一层    仅关键层
```

### 模式 A · 绿地项目（Greenfield）· 从零建

**判定条件**：
- 项目刚立项,尚未开始编码
- 团队接受从 0 天用本框架

**嵌入策略**：**全套上车**，按场景时序逐步展开

**起步清单**（按顺序执行）：
1. `epcode init --mode=greenfield --name=<项目名>`  → 生成完整目录
2. 产品先写 PRD（用 `templates/business/prd-template.md`）
3. 测试做可测性评审（用 `skills/business/prompts/prd-testability-check.md`）
4. 开发写设计 + ADR
5. 进入测试策略设计
6. ...按 examples/leave-management-system/ 的节奏走

**需要工作量**：
- 前 1 周：框架初始化 + 团队培训（1-2 小时）
- 之后：融入日常工作,无额外开销

**关键工具**：
- `epcode init --mode=greenfield` （初始化脚手架）
- `epcode check` （每次 PR 校验）

---

### 模式 B · 进行中项目·开发阶段（Mid-Dev）· 从现在追溯

**判定条件**：
- 代码已开始写,但还未上线
- 有部分 PRD/设计,但不完整或分散
- 团队愿意改进流程

**嵌入策略**：**"两条腿走路"**
- **不追溯历史全部**：已写的代码不重新评审
- **从今天开始按框架**：新提交、新变更都走规范
- **追溯关键部分**：补齐关键 PRD/API 契约以便测试开展

**起步清单**（按优先级）：

| # | 动作 | 时间 | 负责人 |
|---|------|------|-------|
| 1 | `epcode init --mode=mid-dev` 建目录结构 | 30min | 任一人 |
| 2 | 把现有 API 代码反向生成 Markdown 接口文档（`skills/development/prompts/api-doc-from-code.md`） | 2-4h | 开发 |
| 3 | 找 3-5 个核心场景,补 PRD 简版（不求完整） | 1-2 天 | 产品 |
| 4 | 建立提测达标 Checklist + GitLab MR 模板 | 1h | 测试 |
| 5 | 从下个 MR 开始强制走新规范 | - | 全员 |
| 6 | 旧代码的技术债进 backlog,按 Sprint 慢慢补 | - | - |

**注意事项**：
- ⚠️ **不要要求追溯所有历史文档** —— 会让团队抵触
- ⚠️ **先从"硬门禁"入手**（CI + PR 模板 + 提测单）→ 自然带动文档补齐
- ✅ 存量技术债列到 `BACKLOG.md`,按迭代消化

**关键工具**：
- `epcode init --mode=mid-dev`
- `epcode migrate --from=existing-code`（从代码反向生成 API 文档）
- `tools/integrations/jira/sync-from-markdown.js`（把 backlog 同步到 Jira）

---

### 模式 C · 运行迭代项目（Iterating）· 每版本一层

**判定条件**：
- 已上线,定期迭代（如双周/月版）
- 有成熟的流程（但和本框架不同）
- 不能一刀切换,需要"边开车边换轮胎"

**嵌入策略**：**分阶段渐进,每个迭代加一层**

**5 迭代渐进路径**（每 2 周 / 1 版本一层）：

| 迭代 | 目标 | 引入 | 存量流程 |
|------|------|------|---------|
| v1 | **观察 + 规范基础** | Conventional Commits + PR 模板 + CI 校验 | 保留全部 |
| v2 | **提测门禁** | 提测申请单 + 提测达标 Checklist | 原流程保留,新增门禁 |
| v3 | **测试产出标准化** | 测试策略 + 用例模板 + Bug 模板 | 原测试工具保留 |
| v4 | **发布与故障流程** | 发布计划 + Runbook + 复盘模板 | 原运维工具保留 |
| v5 | **度量闭环** | 接入度量脚本,生成周报 | 原看板保留 |

**注意事项**：
- ⚠️ **不要强行替换现有工具**：用 Jira 就别硬切 GitLab Issue
- ✅ **新流程 + 旧工具并存**：用本框架的模板往 Jira 里填
- ✅ **度量驱动改进**：每版本看指标,让团队看到价值
- ✅ **回滚机制**：任何一层引入后出问题能退回

**关键工具**：
- `epcode init --mode=iterating` → 生成"兼容模式"目录
- `epcode adopt --level=1` / `--level=2` ... 渐进式启用

---

### 模式 D · 稳态运维项目（Maintenance）· 聚焦运维场景

**判定条件**：
- 项目已运行 1 年+
- 不再有大版本迭代,只做 bug 修复和小优化
- 资源已转移到新项目,但需要维持稳定运行

**嵌入策略**：**只用运维篇 + 最小开发规范**

**最小可用集**：
1. ✅ **运维篇全套**：发布 / Runbook / 故障响应 / 复盘
2. ✅ **Bug 报告模板**：统一事件处理
3. ✅ **Conventional Commits**（纯粹的可追溯性）
4. ❌ **不强求**：PRD / 用户故事 / 可测性评审（项目已无新需求）

**起步清单**：
1. `epcode init --mode=maintenance` 只生成运维相关目录
2. 补 Runbook（最重要）：每种线上告警至少 1 份
3. 建立故障响应 SOP
4. 下次出故障必须做复盘（`templates/operations/postmortem-template.md`）
5. 度量 MTTR / 故障率

**注意事项**：
- ⚠️ 不要给稳态项目加太多仪式感,适得其反
- ✅ 重点在"故障时有章可循"

**关键工具**：
- `epcode init --mode=maintenance` → 精简目录（只有 04-operations 相关）
- `epcode incident new` → 快速建故障报告
- `epcode postmortem from-incident` → 从故障报告生成复盘初稿

---

### 接入模式的抽象原则

**本框架的"好接入"必须满足**：

1. **判定简单**：团队花 5 分钟能判定自己属于哪种模式
2. **起步清晰**：每种模式都有"第 1 天做什么、第 1 周做什么"
3. **粒度可选**：全套或部分都 OK,别要求一次吃下所有
4. **双向可达**：随时能升级到下一模式（A → B → C → D 不是单向）
5. **最小可用集**：每种模式都有"什么都不加也能跑"的底线
6. **共用资产**：四种模式共用同一套 `templates/`、`skills/`、`tools/`，只是"启用集合"不同

### 对 5 周建设计划的影响

本抽象需要在以下 Sprint 体现：

- **Sprint 1**：试点项目的选择 → 根据所选项目判定模式 → 执行对应的接入路径
- **Sprint 5**：`epcode` CLI 的 `init` 必须支持 `--mode=<A|B|C|D>` 四选项
- **各 Sprint**：文档站（Sprint 5）必须有独立的"接入指南"章节,按四种模式展开

---

## 当前状态（5 层建模）

```
┌──────────────────────────────────────────────────┐
│  L5: 真实反馈与迭代          █▁▁▁▁▁▁▁▁▁   5%    │
├──────────────────────────────────────────────────┤
│  L4: 场景联动自动化          ██▁▁▁▁▁▁▁▁  20%    │
├──────────────────────────────────────────────────┤
│  L3: 场景纵深（业/开/测/运）  █████████▁  88%    │
├──────────────────────────────────────────────────┤
│  L2: 三操作系统适配          ████████▁▁  85%    │
├──────────────────────────────────────────────────┤
│  L1: 核心基础                █████████▌  95%    │
└──────────────────────────────────────────────────┘
```

### L3 四场景纵深详细

| 场景 | 方法论 | 模板 | Prompt | 示例 | 集成 | 自动化 | 度量 | **总** |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 业务 | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | ❌ | **90%** |
| 开发 | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ❌ | **85%** |
| 测试 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | **95%** |
| 运维 | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | 🟡 | **80%** |

### 现有脚本资产

- `tools/cross-platform/scripts/` 6 个通用脚本（check-links / check-submission / markdown-lint / check-commit / api-diff / check-all）
- `tools/integrations/` 5 个企业集成（jira / confluence / slack / im / gitlab），共 11 个 js 脚本
- `platforms/macos,linux,windows/scripts/` 共 5 个脚本（仅 macOS 缺 install.sh）

---

## 路线图（5 周 × 5 Sprint）

### ✅ Sprint 1（Week 1）· 收尾操作系统 + 启动试点 + **接入模式骨架**

**目标**：三系统都真机/CI 验证通过 + 试点项目选定 + 初版接入模式文档

**产出**：
1. **操作系统收尾**：
   - 新增 `platforms/macos/scripts/install.sh`（参照 linux 版简化）
   - 新增 `.github/workflows/platforms-verify.yml`
     - Linux 矩阵：`ubuntu:22.04` / `ubuntu:24.04` / `fedora:39` / `debian:12` 的 Docker 容器里跑 `install.sh` + `check-environment.sh`
     - Windows：`windows-latest` runner 跑 `install.ps1` + `check-environment.ps1`
     - macOS：`macos-latest` runner 跑 macOS 的 install.sh
   - 把 `.github/workflows/ci.yml` 里 `powershell-syntax` 从 `if: false` 打开

2. **接入模式文档**（全新 + 关键）：
   - `docs/chapters/00-adoption/README.md` 总览（接入模式抽象）
   - `docs/chapters/00-adoption/mode-a-greenfield.md` 绿地项目接入
   - `docs/chapters/00-adoption/mode-b-mid-dev.md` 开发中接入
   - `docs/chapters/00-adoption/mode-c-iterating.md` 迭代中接入
   - `docs/chapters/00-adoption/mode-d-maintenance.md` 稳态运维接入
   - 每个 mode 文档包含：判定条件 / 起步清单 / 工具命令 / 最小可用集 / 常见坑

3. **试点项目选型与初始化**：
   - 和用户确认项目 → 判定属于哪种 mode
   - 在 `examples/pilot-<项目名>/` 按对应 mode 初始化目录
   - 填写"起步清单"并在后续 Sprint 跟进

**关键文件**：
- `platforms/macos/scripts/install.sh`（新）
- `.github/workflows/platforms-verify.yml`（新）
- `docs/chapters/00-adoption/` 整个目录（新，5 个文件）
- `examples/pilot-<项目名>/` 按 mode 初始化（新）

**验收**：
- `gh run list` 看到三平台验证 workflow 全绿
- 接入模式 5 个文档可读可用（判定 + 起步清单齐全）
- 试点项目判定出 mode,有对应的起步目录

**需要用户参与**（关键问询项）：
- 试点项目信息（名称、规模、业务域）
- 该项目当前处于什么阶段？（绿地 / 开发中 / 迭代中 / 稳态）
- 按判定结果选 mode

---

### ✅ Sprint 2（Week 2）· 业务 + 开发场景工具补齐

**目标**：业务和开发场景的"自动化工具 + 度量"补齐

**业务场景产出**：
- `tools/cross-platform/scripts/check-prd.js`
  - 基于 `templates/business/prd-template.md` 校验用户的 PRD：必备章节、验收标准存在、业务规则可测
- `tools/cross-platform/scripts/score-testability.js`
  - 对 PRD 可测性打分（0-100 分），参考 `skills/business/prompts/prd-testability-check.md` 的逻辑
- `tools/metrics/business/` 目录
  - 从 Jira/Git 拉"需求变更率、澄清轮次"等指标

**开发场景产出**：
- `tools/cross-platform/scripts/generate-adr-index.js`
  - 扫 `docs/adr/*.md` 自动生成 `docs/adr/README.md` 索引
- `tools/integrations/jenkins/` 目录
  - `README.md` 接入指南
  - `create-pipeline.js` 通过 API 创建 Pipeline Job
  - `trigger-job.js` 触发构建
  - 示例 `Jenkinsfile`（含提测门禁）
- `tools/metrics/development/` 目录
  - MR 平均响应时长、评审轮次、Bug 重开率

**CI 增强**：
- 新增 `prd-check` job，PR 动了 PRD 文件时自动跑 check-prd.js

**试点项目同步**：
- Week 2 完成试点的业务 + 开发阶段（PRD / 设计文档 / ADR）
- 用新工具跑一遍自己的 PRD 和设计

**验收**：
- 对 examples/ 下现有 PRD 跑校验和打分，确认合理
- ADR 索引可复现生成
- Jenkins 示例 Pipeline 能在真实 Jenkins 上 dry-run

---

### ✅ Sprint 3（Week 3）· 测试 + 运维场景工具补齐

**目标**：测试和运维场景的"集成 + 度量"补齐

**测试场景产出**：
- `tools/integrations/zentao/` 禅道集成（国内高频）
  - 创建 Bug、查询 Bug 列表、同步 Markdown → 禅道
- `tools/integrations/tapd/` TAPD 集成（国内高频）
- `tools/cross-platform/scripts/bug-trend.js`
  - 读 Bug JSON 数据（来源: Jira/禅道/TAPD）→ 生成 Markdown 表格 + ASCII 趋势图
- `tools/cross-platform/scripts/coverage-analysis.js`
  - 分析需求 ↔ 用例映射,找未覆盖需求

**运维场景产出**：
- `tools/integrations/alertmanager/` Prometheus 告警转发
  - Webhook handler: Alertmanager → 企业微信/钉钉/飞书/Slack
- `tools/cross-platform/scripts/config-audit.js`
  - 多环境（dev/staging/prod）配置 diff 审计（对应 Prompt 已有）
- `tools/integrations/k8s/` Kubernetes 基础操作封装
  - `rollout-status.js` / `scale.js` / `logs.js`（kubectl 的 JS 封装）

**试点项目同步**：
- Week 3 完成试点的测试 + 运维阶段（策略/用例/提测/准出/运维计划）
- 在试点上演示 Bug 同步到禅道/TAPD（如果用）

**验收**：
- 试点项目完整走过 4 场景,产出所有 artifacts
- 新工具对照 Sprint 2 的 examples 数据能跑通

---

### ✅ Sprint 4（Week 4）· 场景联动 + 度量闭环

**目标**：这是整个项目最有价值的一层 —— 让四个场景**自动串联起来**

**场景联动产出**（共 4 个关键脚本）：
1. **业务 → 开发**：`tools/cross-platform/scripts/link-prd-to-design.js`
   - PRD 变更时，找出可能受影响的设计文档（按需求 ID 追溯）
2. **开发 → 测试**：`tools/cross-platform/scripts/recommend-regression.js`
   - `git diff` + 用例关联表 → 推荐应该回归的用例 ID
3. **测试 → 运维**：`tools/cross-platform/scripts/generate-release-plan.js`
   - 准出报告 `test-report.md` → 自动生成发布计划草稿（灰度节奏基于 Bug 严重度和覆盖度）
4. **运维 → 业务**：`tools/cross-platform/scripts/incident-to-requirement.js`
   - 故障复盘 `postmortem.md` 的改进项 → 自动建 Issue 到需求池（Jira/GitHub Issue）

**度量闭环产出**：
- `tools/metrics/` 统一度量采集框架
  - 各场景 `collect.js` 子命令
  - `generate-dashboard.js` 汇总所有指标 → 生成 `METRICS.md`（Markdown 看板）
- `.github/workflows/metrics-weekly.yml`
  - 每周一 08:00 定时跑 → 自动提 PR 更新 `METRICS.md`

**试点项目同步**：
- 在试点上演示一轮完整联动
- 产生第一份度量周报

**验收**：
- 脚本能在 `examples/leave-management-system/` 上一键演示全流程联动
- `METRICS.md` 有真实数据

---

### ✅ Sprint 5（Week 5）· 统一 CLI + 对外发布 + 试点复盘

**目标**：让这个系统有"门面"，并完成试点复盘

**统一 CLI 产出**：
- `tools/cli/` 目录
- `epcode` CLI（Node 写的，三平台通用）
  - **`epcode init --mode=<A|B|C|D> --name=<项目名>`** ⭐ 最重要 → 按接入模式初始化
  - `epcode adopt --level=<1|2|3|4|5>` 模式 C 的渐进启用命令
  - `epcode migrate --from=existing-code` 模式 B 的反向生成工具
  - `epcode incident new` 模式 D 的快速故障处理
  - `epcode check <target>` 聚合 check-all
  - `epcode prd <file>` 跑 PRD 校验
  - `epcode adr index` 重建 ADR 索引
  - `epcode jira sync <md>` 同步到 Jira
  - `epcode metrics` 生成度量看板
- `package.json` 在根目录支持 `npx epcode`
- **每个 `init` mode 对应的脚手架模板**放在 `tools/cli/scaffolds/mode-<a|b|c|d>/`

**对外发布产出**：
- `docs-site/` 用 Docusaurus（默认结构）
  - `docusaurus.config.js`
  - 把 `docs/chapters/*` 和 `examples/*` 渲染成静态站
  - **首页突出"4 种接入模式"入口**（四个大卡片：绿地 / 开发中 / 迭代中 / 稳态）
- `.github/workflows/pages.yml`
  - 推到 `gh-pages` 分支自动部署
- `CODEOWNERS` / `ROADMAP.md` / `RELEASE_PROCESS.md`

**试点复盘产出**：
- `examples/pilot-xxx/` 的复盘报告（作为第二个完整案例）
- 把"试点过程中发现的框架问题" → 整理成下一阶段 backlog

**验收**：
- `npx epcode --help` 能列出所有能力
- `https://epcode-ai.github.io/ep-code-ai/` 可访问
- 试点复盘作为 examples/ 的第二个真实案例

---

## 跨 Sprint 主线：试点项目

```
Week 1: 选项目 + 初始化目录
Week 2: 业务阶段 + 开发阶段（PRD/设计/ADR/API）
Week 3: 测试阶段 + 运维阶段（策略/用例/提测/准出/发布）
Week 4: 跨场景联动演示 + 度量数据产生
Week 5: 复盘 + 反馈 → 改进 backlog
```

**用户参与检查点**（每 Sprint 结束）：
- 30 分钟评审试点进展和发现的问题
- 确认下一 Sprint 优先级

---

## 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| Windows 真机验证我没机器 | 中 | 用 GH Actions `windows-latest` runner |
| 试点项目拖延 | 高 | 选极小规模（< 10 人天,1-2 个功能点） |
| 企业 API 密钥难拿 | 中 | 所有集成脚本支持 `--dry-run`,有 mock response |
| 度量接真实 Jira/监控 | 中 | 先接 Git（本地可用），Jira/监控用示例数据 |
| 分支保护在免费私有不生效 | 低 | 已知,用 pre-push hook 弥补 |
| 每周 1 Sprint 压力大 | 中 | 任务粒度已按"可在 1 周完成"切分,允许往下拖 |

---

## 完成度预期

| 阶段 | L1 | L2 | L3 | L4 | L5 | **整体** |
|------|---|---|---|---|---|---|
| 当前 | 95 | 85 | 88 | 20 | 5 | **85%** |
| S1 完成 | 95 | 100 | 88 | 20 | 10 | **88%** |
| S2 完成 | 95 | 100 | 93 | 20 | 30 | **91%** |
| S3 完成 | 95 | 100 | 97 | 20 | 50 | **93%** |
| S4 完成 | 95 | 100 | 97 | 90 | 70 | **96%** |
| S5 完成 | 95 | 100 | 97 | 90 | 85 | **98%** |

---

## 验证方法

### 每个 Sprint 结束时验证
1. 本地: `node tools/cross-platform/scripts/check-all.js` 通过
2. CI: GH Actions 全绿
3. 试点项目: 对应 Sprint 的 artifacts 都已产出
4. 用户评审: 30 分钟 checkpoint

### Sprint 1 专项
- GH Actions `platforms-verify.yml` 矩阵跑通（三平台 x install + check）

### Sprint 4 专项
- 能在试点项目上**串起 4 个联动脚本**做 end-to-end 演示
- `METRICS.md` 自动生成且有真实数据

### Sprint 5 专项
- `npx epcode --help` 输出完整
- Pages 站可访问
- 试点复盘报告完整

---

## 并行 / 后备 Backlog

以下事项不在主路线图，但任何时候有空档可以插：

- CODEOWNERS（Sprint 5 前）
- Dependabot 配置
- Swift 应用加 CI 编译检查
- 集成脚本的单元测试
- 更多 AI Prompt 示例（如"测试数据生成"、"SRE 值班交接" 等）

---

## 关键文件清单（备忘）

执行时要新增/修改的关键文件：

**Sprint 1**:
- `platforms/macos/scripts/install.sh` 🆕
- `.github/workflows/platforms-verify.yml` 🆕
- `docs/chapters/00-adoption/` 🆕（5 个 mode 文档）⭐ 新增的最重要产出
- `examples/pilot-<项目名>/` 🆕 按判定的 mode 初始化

**Sprint 2**:
- `tools/cross-platform/scripts/check-prd.js` 🆕
- `tools/cross-platform/scripts/score-testability.js` 🆕
- `tools/cross-platform/scripts/generate-adr-index.js` 🆕
- `tools/integrations/jenkins/` 🆕
- `tools/metrics/business/`、`tools/metrics/development/` 🆕

**Sprint 3**:
- `tools/integrations/zentao/` 🆕
- `tools/integrations/tapd/` 🆕
- `tools/integrations/alertmanager/` 🆕
- `tools/integrations/k8s/` 🆕
- `tools/cross-platform/scripts/bug-trend.js` 🆕
- `tools/cross-platform/scripts/config-audit.js` 🆕

**Sprint 4**:
- `tools/cross-platform/scripts/link-prd-to-design.js` 🆕
- `tools/cross-platform/scripts/recommend-regression.js` 🆕
- `tools/cross-platform/scripts/generate-release-plan.js` 🆕
- `tools/cross-platform/scripts/incident-to-requirement.js` 🆕
- `tools/metrics/collect.js`、`generate-dashboard.js` 🆕
- `.github/workflows/metrics-weekly.yml` 🆕

**Sprint 5**:
- `tools/cli/bin/epcode` + `tools/cli/commands/` 🆕
- `tools/cli/scaffolds/mode-{a,b,c,d}/` 🆕（四种模式的脚手架模板）
- `package.json` 根目录 🆕 支持 `npx epcode`
- `docs-site/` 🆕 Docusaurus,首页突出四种接入模式
- `.github/workflows/pages.yml` 🆕
- `CODEOWNERS`、`ROADMAP.md` 🆕

---

## 对框架本身的三个抽象原则（贯穿所有 Sprint）

无论实现哪个 Sprint 的功能,都要遵守：

### 原则 1 · 接入模式优先

任何新加的"模板 / 工具 / Prompt"都要思考：**四种模式都能用吗?哪种最需要?**
- 如果只服务 1-2 种模式,在文档里明确标注
- 避免做出"只有绿地项目能用"的工具

### 原则 2 · 最小可用集可拆分

每一类产出都要有"最精简版本"：
- 用不上完整 PRD 模板 → 有 `prd-simple-template.md`
- 用不上完整提测单 → 有 checkbox 版
- 这保证模式 B/C/D 的团队能快速起步

### 原则 3 · 降级优雅

所有工具在"缺依赖"时要给清晰提示：
- 没有 Jira → 退化为本地 Markdown
- 没有 Jenkins → 退化为 shell 脚本
- 没有监控 → 度量用 Git 数据代替

---

## 总结一句话

**现在 85% → 5 周后 98%。核心不是"多做几个工具",而是把"4 种项目阶段接入模式"作为一等公民,配合 1 个真实小项目跑完完整周期并复盘,让这个框架从"可读"升级到"可落地"。**
