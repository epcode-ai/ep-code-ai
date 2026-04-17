# Runbook 索引 · npds-newpd

> 按"告警现象"组织，值班人收到告警直接按名字找。

## 如何新建

```bash
cp _template.md RB-0XX-简短描述.md
```

## Runbook 清单

| ID | 告警现象 | 严重度 | 涉及子包 | 状态 |
|----|---------|--------|---------|------|
| RB-001 | 数据库慢查询 / 连接池满 | P1 | service, consumer | 📝 待建 |
| RB-002 | service API 5xx 飙升 | P1 | service | 📝 待建 |
| RB-003 | consumer 消息积压 | P1 | consumer | 📝 待建 |
| RB-004 | web 白屏 / 首屏加载失败 | P1 | web | 📝 待建 |
| RB-005 | 外部依赖异常（SSO 等） | P2 | 全部 | 📝 待建 |
| RB-006 | 内存异常 / OOM | P2 | service, consumer | 📝 后续 |
| RB-007 | 磁盘告警 | P3 | 全部 | 📝 后续 |
| RB-008 | 证书过期 / HTTPS 异常 | P1 | web | 📝 后续 |

## 状态说明

- 📝 待建：还没写（应优先补齐 P0/P1）
- 🟡 粗版：有内容但不完整
- ✅ 完整：经过实际故障验证

## 按严重度分类

### P0 阻塞（核心不可用）
- 建议至少 2-3 份

### P1 严重（部分不可用）
- 当前规划 5-6 份

### P2 一般（体验问题）
- 2-3 份即可

## 按子包分类

### npds-newpd-web
- RB-004, RB-008 + 通用 RB-005, RB-007

### npds-newpd-service
- RB-001, RB-002, RB-006 + 通用 RB-005, RB-007

### npds-newpd-consumer
- RB-001, RB-003, RB-006 + 通用 RB-005, RB-007

## 编写原则

1. **具体可执行**：命令、查询、地址都写清楚
2. **分场景分方案**：不同触发条件对应不同处置
3. **有回滚按钮**：每个处置动作后"如果没好怎么办"
4. **事后更新**：每次故障处理后更新对应 Runbook

## 相关资源

- [Runbook 模板](../../../../templates/operations/runbook-template.md)
- [运维篇 · 故障响应](../../../../docs/chapters/05-operations/03-incident-response.md)
