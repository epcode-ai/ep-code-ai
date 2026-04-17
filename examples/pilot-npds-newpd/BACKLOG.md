# 技术债 & 改进清单

> 稳态运维项目的"有空就干"的事。不阻塞日常运维。

## 原则

- 不追求清零,按季度挑 1-2 个做
- 大改动（> 3 天）要升级到模式 C 再做

## 当前清单

### 运维类（优先级高）

- [ ] 补齐 P1 Runbook（RB-001 ~ RB-005）
- [ ] 建立值班 SOP（docs/sop/oncall-sop.md 填充实际值班人）
- [ ] 接入告警转发到企业微信 / 钉钉（用 [tools/integrations/im/](../../tools/integrations/im/)）
- [ ] 配置漂移审计（3 套环境对比,用 [config-audit Prompt](../../skills/operations/prompts/config-audit.md)）

### 监控类

- [ ] 确认"核心接口 P99 延迟"有告警
- [ ] 确认"消息积压量"有告警
- [ ] 确认"数据库慢查询"有告警
- [ ] 确认"磁盘使用率"有告警

### 文档类

- [ ] 补架构图（三个子包的关系）
- [ ] 补数据库 schema 文档（至少核心表）
- [ ] 补依赖系统清单（上下游谁在用）

### 代码类（按需）

- [ ] 依赖升级（季度级别,参考 Dependabot）
- [ ] 安全扫描无高危 CVE

### 协作类

- [ ] 建立 Bug 报告模板（已提供: [.github/ISSUE_TEMPLATE/bug.yml](./.github/ISSUE_TEMPLATE/bug.yml)）
- [ ] Commit 规范: 从下月起强制 Conventional Commits

## 已完成

_（每次完成挪到这里存档）_

## 自检日

每季度 1 号过一遍本清单,重排优先级。

## 相关

- [模式 D 接入文档](../../docs/chapters/00-adoption/mode-d-maintenance.md)
- [运维篇](../../docs/chapters/05-operations/)
