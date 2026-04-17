# Getting Started · npds-newpd 接入清单

> 按模式 D（稳态运维）接入的起步清单。

## Day 1（今天）· 准备 · 30 分钟

- [x] 目录骨架已建好（当前文件在的目录就是）
- [ ] **列出"当前最频繁的告警 Top 10"**（任一形式：邮件、群消息截图、监控截图）
- [ ] **列出"最近 3 个月的故障清单"**（如果有记录）
- [ ] 贴到群里让值班同学看一眼

## Day 2-3（本周）· 写 Runbook · 2-4 小时

**目标**：把 Top 5 告警各写 1 份 Runbook。

每份用 [_template.md](./ops/runbooks/_template.md) 复制后改：

建议先写（按严重度 × 频率）：
- [ ] RB-001: 数据库慢查询 / 连接池满
- [ ] RB-002: service 核心接口 5xx 飙升
- [ ] RB-003: consumer 消息积压
- [ ] RB-004: web 页面白屏 / CDN 异常
- [ ] RB-005: 依赖的外部服务（如 SSO / 消息中心）异常

**原则**：
- 先求**有**,不求完美 —— 先照着 template 粗填,后续有故障再补细节
- 每次真实处理故障后,更新对应 Runbook

## Day 4（本周）· 建值班 SOP · 1 小时

- [ ] 打开 [docs/sop/oncall-sop.md](./docs/sop/oncall-sop.md)
- [ ] 填入真实的值班表、升级联系人
- [ ] 发到值班群置顶

## Week 2 · 开始用 · 渐进落地

- [ ] 下次告警 → 按 Runbook 执行
- [ ] 如果 Runbook 不对,**处理完就更新**
- [ ] 如果有没有 Runbook 的场景,**处理完就补一份**

## 第一次故障发生时 · 完整走一遍流程

1. 按值班 SOP 响应
2. 按 Runbook 处置
3. 24 小时内在 `ops/incidents/2026/INC-20260XXX-xxx.md` 写故障报告
   - 用模板：`templates/operations/incident-report-template.md`
4. 48 小时内在 `ops/postmortems/2026/PM-20260XXX-xxx.md` 写复盘
   - 用模板：`templates/operations/postmortem-template.md`
5. 复盘会议产出的"Runbook 补充点" → 回填到对应 Runbook

## 每月自测

每月 1 号做一次：

- [ ] 过一遍本月所有告警,是否有没 Runbook 的
- [ ] 检查 MTTR / 故障数指标（[README.md 里的表](./README.md#度量每月自测)）
- [ ] 问自己：**如果值班人离职 1 周,新人能接班吗?**

## 升级触发器

以下情况出现时,考虑升级到模式 C（迭代中）：

- 本项目要加一个新功能 > 5 人天
- 要做数据库大重构
- 要接入新的外部系统

届时参考 [模式 C 文档](../../docs/chapters/00-adoption/mode-c-iterating.md)。

## 需要帮助？

- 翻 [运维篇文档](../../docs/chapters/05-operations/)
- 参考 [leave-management-system 的运维产出](../leave-management-system/04-operations/)
- 用 [运维 AI Prompt](../../skills/operations/)

---

**记住模式 D 的口号**：不求完整,只求出事能救。
