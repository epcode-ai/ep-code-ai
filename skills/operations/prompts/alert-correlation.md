---
name: alert-correlation
description: 多条告警归因聚合，推断根因
version: 1.0
category: operations
---

# 告警归因

## 用途

告警风暴时（几十条告警同时来），人眼难分清主次。AI 做初步聚合和归因。

## 使用场景

- 告警风暴时
- 复杂故障的诊断
- 告警降噪策略评估

## Prompt 本体

```markdown
以下是最近一段时间触发的所有告警。帮我聚合和归因。

## 时间窗口
[起 - 止]

## 告警列表
| 时间 | 告警名 | 服务 | 值 | 级别 | 状态 |
|------|-------|------|----|------|------|
| 10:30 | HighErrorRate | order-service | 2.5% | P1 | firing |
| 10:31 | HighLatency | order-service | P99=1.2s | P1 | firing |
| 10:32 | DBConnectionHigh | order-service | 95% | P2 | firing |
| 10:32 | HighQueueLength | mq | 50000 | P2 | firing |
| 10:33 | ReadFailure | redis | 10/s | P2 | firing |
| ... | | | | | |

## 服务拓扑
```
client -> gateway -> order-service -> mq -> worker
                                    -> redis
                                    -> db
```

## 最近变更
- [时间] [服务] [变更]
- [时间] [服务] [变更]

## 任务

### 1. 聚合相关告警
哪些告警可能是**同一问题**导致的。

### 2. 推断根因
推测 top 3 最可能的根因（带概率和理由）:
- 根因 A: 概率 70%, 理由: ...
- 根因 B: 概率 20%, 理由: ...
- 根因 C: 概率 10%, 理由: ...

### 3. 告警关系图
用文字描述告警之间的因果链:
```
根本原因
  └─► 导致 告警 X
        └─► 级联引发 告警 Y
              └─► 级联引发 告警 Z
```

### 4. 验证建议
对每个根因,给出具体的验证方法:
- 根因 A: 查 `kubectl top pods`
- 根因 B: 查 `SHOW PROCESSLIST`
- 根因 C: 查最近发布 `kubectl rollout history`

### 5. 处置优先级
建议的处置顺序（先解决哪个）:
1. 立即: [某个处置]
2. 其次: [某个处置]
3. 观察: [某个指标]

### 6. 告警规则改进建议
- 建议合并的告警: [列表]
- 建议抑制的告警: [列表]（避免风暴）
- 告警缺失: [应该有但没有的告警]
```

## 使用示例

**输入**: 一次故障的 25 条告警 + 拓扑 + 最近变更

**输出**: "最可能根因 = 数据库慢查询，引发 DB 连接池耗尽，导致 order-service 响应慢，队列堆积..."

## 相关资源

- [监控与告警](../../../docs/chapters/05-operations/02-monitoring.md)
- [故障响应](../../../docs/chapters/05-operations/03-incident-response.md)

## 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-17 | 初版 |
