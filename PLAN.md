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
> | S6 | 架构盘点 + UI/UX 设计稿 + 手册起步 + 信息流文档化 | ✅ 完成（2026-04-20） |
> | **S7** | **macOS Beta 打包 + 跨平台栈决策** | **📋 Phase 2 计划中** |
> | S8 | 用户手册完整版 + v1.0 正式发布 | 📋 Phase 2 计划中 |
> | S9 | 服务端 RFC + OTA 协议设计（不实现） | 📋 Phase 2 计划中 |
> | S10 | 真实试点项目复盘 | 📋 Phase 2 计划中 |
>
> 每完成一个 Sprint,会在对应章节标题加 ✅,并在 CHANGELOG 追加条目。
>
> **Phase 2 详细规划见文末** [# Phase 2 · 落地与产品化](#phase-2--落地与产品化新增2026-04-18)

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
- ~~`tools/integrations/jenkins/` 目录~~
  - ~~`README.md` 接入指南~~
  - ~~`create-pipeline.js` 通过 API 创建 Pipeline Job~~
  - ~~`trigger-job.js` 触发构建~~
  - ~~示例 `Jenkinsfile`（含提测门禁）~~
  - ❌ **未实施 · 用户选 GitLab CI 替代**
    - Sprint 2 启动时确认,详见 [CHANGELOG v0.3.0](./CHANGELOG.md#030---2026-04-18--sprint-2-完成) "不做 Jenkins" 说明
    - 对应 Jenkins 要做的事,已在 `workflows/gitlab/.gitlab-ci.example.yml` 扩展的 4 个 job 里实现
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
- ~~Jenkins 示例 Pipeline 能在真实 Jenkins 上 dry-run~~ → 改为 **GitLab CI example 4 个新 job 能通过 lint + dry-run**

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
- ~~`tools/integrations/jenkins/`~~ ❌ 未做(GitLab CI 替代)
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

---
---

# Phase 2 · 落地与产品化（新增,2026-04-18）

> Sprint 1-5 把"方法论 + 工具链 + CLI + 文档站"做完了（98% 框架完成）。下一阶段 5 件待办,聚焦"**从方法论框架 → 可落地产品**":

## 待办清单（编号与用户提出的 5 件事对应）

### ① 架构设计图补齐 + 技术盘点

**现状**:
- 四大场景方法论完整,但 **仓库根没有一张"整体架构图"**
- 工具链 / CLI / 文档站 / 桌面应用 / 企业集成 各自都有子 README,但没有**"一张图看懂全局"**的视图
- 需要从"技术视角"反向审一次设计,识别还没覆盖的部分

**产出**:
- `ARCHITECTURE.md`（根目录）· 包含:
  - 整体架构图（Mermaid）· 四层:方法论层 / 工具链层 / 集成层 / 应用层
  - 数据流图 · 从"需求提出"到"发布上线"Markdown 在四场景间的流动
  - 组件依赖图 · CLI 如何调 tools/ 脚本,tools/ 如何用 integrations/
  - 部署架构图 · 零依赖脚本 + Swift 桌面应用 + Docusaurus 站点的关系
- `docs/chapters/01-overview/` 下嵌入 Mermaid 图
- **技术盘点清单** · 列 10-15 项"我们还缺的"（如观测性、类型定义、Schema 校验、插件机制等）

**Sprint**: S6（1 周）

---

### ② 用户使用手册（User Manual）

**现状**:
- `docs/chapters/` 是**方法论**（讲"为什么 + 该做什么"),不是**手册**（讲"怎么点击 / 怎么运行 / 遇到错误怎么办"）
- 新用户想上手,目前只能看 `README.md` + 各 README.md 碎片化拼
- 没有"按角色 / 按场景 / 按问题"组织的使用手册

**产出**:
- `docs/manual/` 新目录
  - `00-install.md` · 三操作系统安装步骤（含桌面应用 + CLI）
  - `01-first-project.md` · 第一个项目 (init → PRD → 提交 → CI) 手把手
  - `02-by-role/`
    - `product.md` · 产品怎么用（写 PRD / 校验 / 改动影响）
    - `developer.md` · 开发怎么用（设计 / ADR / PR / 回归推荐）
    - `qa.md` · 测试怎么用（策略 / 用例 / 提测 / 覆盖率）
    - `sre.md` · 运维怎么用（Runbook / 发布 / 故障 / 复盘）
  - `03-by-scenario/`
    - `greenfield-journey.md` · 从立项到上线完整示例
    - `adopt-to-legacy.md` · 老项目接入分层改造
  - `04-troubleshooting.md` · 常见错误 / 环境问题 / CI 失败诊断
  - `99-cheatsheet.md` · 一页速查表
- 文档站首页加"用户手册"Tab

**启动时机**:
- 可以 **从 S6 就开始写 00-install.md / 99-cheatsheet.md** (写一点发一点,别憋半年)
- 完整版 S8 收尾

**Sprint**: S6 开始铺 · S8 完整发布

---

### ③ 桌面应用三平台 Beta 可下载

**现状盘点**（**2026-04-18** 快照）:

| 平台 | 状态 | 缺什么 |
|------|------|--------|
| **macOS** | 🟡 **Swift 骨架已完成**（`app/ClaudeCodeHistory/` 22 个 .swift 文件,核心模块齐全）| ❌ 未 Archive 出 .app 包 / .dmg · 未签名 · 未做自动更新 · 未发布 |
| **Linux** | 🟥 **只有 `platforms/linux/scripts/`（Shell 安装脚本）**,无原生 GUI 应用 | ❌ 没有 Linux 客户端实现（Tauri / Electron / GTK?） |
| **Windows** | 🟥 **只有 `platforms/windows/scripts/`（PowerShell 安装脚本）**,无原生 GUI 应用 | ❌ 同 Linux |

**差距量化**:
- **macOS**: 距可下载 Beta 约 **1 周**（仅打包 + 签名 + GitHub Release）
- **Linux + Windows**: 距可下载 Beta 约 **3-4 周**,需先决策技术栈:
  - 方案 A · Tauri（Rust + Web 前端,一套代码三平台,推荐,与当前 Swift 版重写前端） · 预估 3 周
  - 方案 B · Electron（JS,最快,但包大约 100MB+） · 预估 2 周
  - 方案 C · 保持分平台原生（Swift / WinUI3 / GTK） · 预估 6+ 周,维护成本最高

**产出**:
- 决策记录（新 ADR: `docs/adr/0002-cross-platform-desktop-stack.md`）
- macOS DMG / Linux AppImage + deb / Windows MSI
- 自动更新通道（Sparkle for macOS · GitHub Release + 版本检查 for Linux/Win）
- `CODEOWNERS` 加桌面应用维护人

**Sprint**(因加入 ⑥ UI/UX 设计,顺序调整):
- **S6 · 不含打包**（先做 UI/UX 设计稿,见 ⑥）
- **S7 · macOS Beta 发布**(按设计稿调整 macOS 实现 → 打包 → 签名 → Release)
- **S8 · 跨平台栈决策 + Linux/Win Beta**

---

### ④ 服务端数据同步服务（规划优先,暂不开发）

**规划意图**:
- 当前所有数据都在 Git / 本地 `.md`,没有"**中心化**"能力
- 未来需要:
  - **OTA 动态更新客户端**（推新版本 / 强制升级 / 灰度通道）
  - **用户信息留档**（用户基本信息 / 团队归属 / 权限角色 / 订阅状态）
  - **审计日志**（谁在何时对哪个 PRD/ADR/Runbook 做了什么操作,合规需要）
  - **使用统计**（DAU / 四场景活跃度 / 最常用命令 / 失败诊断数据）
  - **团队协同**（跨机器共享项目配置 / 实时通知）

**产出（本阶段只做设计,不实现）**:
- `docs/rfc/0001-server-side-sync-service.md` · 完整技术方案
  - 后端技术栈（建议: Go / Rust + PostgreSQL + S3)
  - API 接口契约（用 `templates/testing/api-contracts/`）
  - 数据模型（用户 / 工作区 / 事件流 / 审计记录）
  - 认证授权方案（OIDC / JWT / RBAC）
  - 数据合规（PII 分级 / 加密存储 / 脱敏导出 / 删除权）
  - 部署架构（K8s / 单机 Docker 各一套）
  - 成本估算
- `docs/rfc/0002-desktop-ota-protocol.md` · 客户端动态更新协议
- **决策点**: RFC 评审后,如团队投资允许,进入"Phase 3 · 服务化"独立路线图
- 本阶段不写一行代码

**Sprint**: S9（纯文档 + 评审）

---

### ⑤ 当前阶段的信息共享模式文档化

**现状澄清**（**第 5 问的答案**）:

在没有服务端（④）之前,信息共享依靠 "**Markdown + Git + CI**" 三件套:

```
┌──────────────────────────────────────────────────────────────────┐
│                       当前信息共享模式（无服务端）                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐           │
│  │  产品   │ → │  开发   │ → │  测试   │ → │  运维   │           │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘           │
│       │             │             │             │                │
│    PRD.md       设计.md+ADR   用例+提测单    Runbook/复盘        │
│       │             │             │             │                │
│       └──────────────┴─────────────┴─────────────┘                │
│                          ↓                                       │
│                    ┌──────────┐                                  │
│                    │  Git 仓库 │  ← 唯一真实源                   │
│                    └─────┬────┘                                  │
│                          ↓                                       │
│              ┌──────────────────────┐                            │
│              │ CI 门禁              │                            │
│              │ + 跨场景联动脚本      │ ← 自动触发下一环           │
│              │ + 度量采集            │                            │
│              └──────────┬───────────┘                            │
│                         ↓                                        │
│              ┌──────────────────────┐                            │
│              │ Jira / 禅道 / IM /   │ ← 可选通知/同步层           │
│              │ Confluence / Slack   │   (镜像/广播,非权威)         │
│              └──────────────────────┘                            │
└──────────────────────────────────────────────────────────────────┘
```

**核心特征**:
1. **Git = 单一真实源**,所有产出物都是 Git 里的 Markdown
2. **PR/MR = 协作边界**,评审在 Git 平台完成（GitHub/GitLab）
3. **CI = 触发器**,PR 动了 PRD 就跑 `check-prd`,动了设计就提醒测试,动了代码就推荐回归用例
4. **企业系统 = 镜像**,Jira/Confluence 是"广播/归档"用途,不是权威源

**优点**:
- 零后端成本,每个项目私有仓库就是自己的数据
- 完全离线可跑（除通知类集成外）
- Diff / Blame / Revert 天然支持

**缺点**:
- 跨仓库统计 / 全员审计难做（需要服务端 ④ 补齐）
- 新人上手需要熟悉 Git 语义
- 非技术人员（产品 / 业务）Git 不够顺手 → 需要桌面应用 ③ 的 GUI

**产出**:
- `docs/architecture/information-sharing.md` · 用上面的图 + 详细说明写成正式文档
- 每篇方法论章节末尾加"**本场景产出物流向哪里 / 被谁消费**"小节（固化"契约"关系）
- 在 ARCHITECTURE.md（①产出）里作为"数据流"章节

**Sprint**: 和 ① 一起（S6）

---

### ⑥ 桌面应用 UI/UX 设计稿（新增 · 2026-04-19）

**为什么先做**:
- 当前 macOS 有 22 个 Swift 文件**实现**,但**没有设计稿**(Sprint 1 之前是快速原型)
- Phase 2 三平台齐发,如果直接开码,Linux/Win 没有权威源,每个平台做出来都不一样
- 设计稿先行 → 跨平台实现有统一蓝图 → 减少 Sprint 7-8 的返工

**产出**:
- `docs/design/ui/` 新目录
  - `README.md` · 设计原则 + 工具选型(Figma 链接 + 仓库内 ASCII 备份)
  - `wireframes/` · 核心页面线框图(ASCII / Mermaid)
    - `01-main-three-pane.md` · 三栏主视图(侧边栏会话列表 / 聊天区 / Artifact 面板)
    - `02-setup-wizard.md` · 首次启动向导(环境检查 + 供应商配置)
    - `03-settings.md` · 设置页(供应商管理 / 偏好 / 快捷键)
    - `04-conversation.md` · 单会话内的交互(消息渲染 / 斜杠命令 / 流式输出)
    - `05-artifact.md` · Artifact 面板(代码片段 / 文档 / 图表)
    - `06-search-and-favorites.md` · 搜索与收藏
  - `interaction-flows/` · 关键交互流程图(Mermaid)
    - `flow-new-conversation.md` · 新建会话 → 选供应商 → 输入首条消息
    - `flow-env-check-fail.md` · 环境检查失败的兜底引导
    - `flow-slash-command.md` · 斜杠命令选择 + 自动补全
    - `flow-artifact-detect.md` · AI 输出代码 → 自动识别为 Artifact
  - `cross-platform-constraints.md` · 三平台一致性约束
    - 必须一致的部分(信息架构 / 核心功能层级 / 关键术语)
    - 可分平台定制的部分(快捷键 / 窗口控件 / 系统集成方式)

**工具选型**:
- **首版**: 仓库内 ASCII 线框 + Mermaid(零外部依赖,文档站可直接渲染)
- **高保真版** (S7-S8 由有 Figma 经验者补): Figma 链接挂在 README 里

**Sprint**: S6(2-3 天,在架构图之后,UI 设计前置于实现)

**为什么 macOS 实现要等设计稿**:
- macOS 已有的 22 个 Swift 文件可能不是最优解
- 设计稿出来后,可能需要调整 macOS 的部分页面
- 与其打包"过时"版本,不如延后 1 周打包"对齐"版本

---

## Phase 2 · 5 Sprint 规划

| Sprint | 主题 | 覆盖 | 状态 |
|--------|------|------|------|
| S6 | 架构图 + UI/UX 设计稿 + 信息流 + 手册起步 | ①⑤⑥ 完成 · ②起步 | 📋 计划中 |
| S7 | macOS Beta(对齐设计稿)+ 跨平台栈决策 | ③ macOS · 跨平台 ADR | 📋 计划中 |
| S8 | 用户手册完整版 + Linux/Win Beta + v1.0 GA | ② 完成 · ③ Linux/Win | 📋 计划中 |
| S9 | 服务端 RFC + OTA 协议设计 | ④（纯设计）| 📋 计划中 |
| S10 | 真实试点项目（非 npds）+ 复盘 + 反馈回流 | Phase 1 遗留（L5） | 📋 计划中 |

**完成度预期**:

| 阶段 | L1 | L2 | L3 | L4 | L5 | 应用可用 | 服务端 | 整体 |
|------|---|---|---|---|---|---------|--------|------|
| Phase 1 结束 (当前) | 95 | 100 | 97 | 90 | 85 | 30（仅 macOS 源码,无设计稿） | 0 | **98%** |
| S6 完成 | 100 | 100 | 97 | 90 | 85 | 40（设计稿就绪,实现未变） | RFC 0% | **设计完整** |
| S7 完成 | 100 | 100 | 97 | 92 | 88 | 60（macOS Beta） | RFC 0% | **macOS 可下载** |
| S8 完成 | 100 | 100 | 97 | 92 | 90 | 90（三平台 Beta） | 设计 50% | **三平台可下载** |
| S9 完成 | 100 | 100 | 97 | 92 | 90 | 90 | 设计 100% | **服务化可投资** |
| S10 完成 | 100 | 100 | 97 | 95 | 95 | 95 | 设计 100% | **企业可试点** |

## Phase 2 原则

1. **先设计再实现**:④ 服务端先 RFC 评审;⑥ UI/UX 先线框/Mermaid,再调 macOS 实现 → 再开 Linux/Win
2. **三平台齐发**:③ 不追求"macOS 领先 3 个月",但接受"macOS 先 1 周 Beta(S7)+ Linux/Win 紧跟(S8)"的小错位 —— 关键是设计稿统一
3. **用户手册小步迭代**:② 写一节发一节,别憋到 Sprint 结尾
4. **架构文档要有图**:①⑤⑥ 不是文字描述,必须有 Mermaid / ASCII 图让非技术人员也能看懂
5. **设计先于代码**:⑥ 是 Phase 2 的隐藏前置 —— Sprint 1-5 已经把"方法论先于工具"做好,Sprint 6+ 把"设计先于实现"补齐
