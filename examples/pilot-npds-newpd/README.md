# 试点项目: npds-newpd 派单叫号系统

> 本框架第 1 个真实项目试点。**接入模式 D（稳态运维）**。

## 项目概况

| 项目 | 值 |
|------|-----|
| 项目名 | npds-newpd 派单叫号系统 |
| 业务域 | 内部工具 / 中台 |
| 当前阶段 | 稳态运维（只做维护） |
| 接入模式 | **D · 稳态运维**（参见 [mode-d-maintenance.md](../../docs/chapters/00-adoption/mode-d-maintenance.md)） |
| 试点开始 | 2026-04-17 |

## 系统组成

3 个子包：

| 子包 | 类型 | 技术栈 | 职责 |
|------|------|-------|------|
| `npds-newpd-web` | 前端 | 前端框架 | 用户操作界面 |
| `npds-newpd-service` | 后端 | 后端框架 | 业务逻辑 + API |
| `npds-newpd-consumer` | 后端 | 后端框架 | 消息消费（异步任务） |

**运维合并管理**（单人值班能看到全貌）：
- 告警发到同一个群
- Runbook 按"告警现象"组织（不按子包）
- 发布可分包独立（需要时）

## 为什么选模式 D

判定依据（见 [接入模式判定流程](../../docs/chapters/00-adoption/README.md#5-分钟判定流程)）:

1. ✅ 项目已经上线给用户使用
2. ✅ 不再有大版本迭代,只做 Bug Fix 和小优化
3. ✅ 只需要"不出事 + 出事能救"

**不适用的**：
- ❌ 完整 PRD（无新需求）
- ❌ 测试策略和覆盖度（小改动不需要）
- ❌ Sprint 规划（不做迭代）

**必须做的**（本项目试点目标）：
- ✅ 最高频告警的 Runbook（至少 5 份）
- ✅ 故障响应 SOP
- ✅ 下次故障必走复盘模板
- ✅ Conventional Commits（可追溯）

## 目录结构

```
pilot-npds-newpd/
├── README.md              本文件
├── GETTING-STARTED.md     Day 1 做什么
├── BACKLOG.md             技术债清单
├── ops/                   运维相关（核心）
│   ├── runbooks/          故障处置手册
│   │   ├── README.md      索引
│   │   └── _template.md   新建时复制
│   ├── incidents/         故障报告（按年归档）
│   │   └── 2026/
│   ├── postmortems/       复盘报告
│   │   └── 2026/
│   └── releases/          发布记录
├── docs/
│   └── sop/               SOP 文档
│       └── oncall-sop.md  值班 SOP
└── .github/
    └── ISSUE_TEMPLATE/
        └── bug.yml        Bug 模板
```

## 本试点的目标

### 短期（第 1 周）
- 按 [GETTING-STARTED.md](./GETTING-STARTED.md) 的起步清单完成初始化
- 补 3-5 份核心 Runbook
- 建立值班 SOP

### 中期（1 个月）
- 下次故障走完整复盘流程
- 度量：MTTR / 故障数 / 重复故障率

### 长期（3 个月）
- 作为框架模式 D 的真实验证案例
- 产出复盘报告,反馈框架改进点

## 度量（每月自测）

| 指标 | 目标 | 当前 |
|------|------|------|
| MTTR（故障平均恢复时间） | < 30 min | 待采集 |
| 月度故障数 | 持平或下降 | 待采集 |
| 重复故障率 | < 10% | 待采集 |
| Runbook 覆盖率（告警→Runbook 映射） | > 80% | 待补齐 |

## 与框架的互动

作为试点,本项目会：

1. **消费框架资产**：用 `templates/operations/` 的模板
2. **贡献反馈**：发现的框架问题 → 回馈到 [ROADMAP.md](../../ROADMAP.md)（待建）
3. **作为示例**：完成后作为模式 D 的参考案例

## 相关资源

- [模式 D 完整说明](../../docs/chapters/00-adoption/mode-d-maintenance.md)
- [运维篇](../../docs/chapters/05-operations/)
- [运维模板库](../../templates/operations/)
- [另一个示例：leave-management-system（模式 A）](../leave-management-system/)
