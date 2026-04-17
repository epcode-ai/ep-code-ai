# Runbook: leave-management DB 慢查询 / 连接池告警

**Runbook ID**: RB-LEAVE-001
**Owner**: 周运维（主） / 王 DBA（备）
**最后更新**: 2026-04-27（根据首次生产故障更新）
**适用服务**: `leave-api`, `leave-db`
**预估处置时长**: 10-30 分钟

## 1. 故障现象

### 1.1 典型告警

| 告警名 | 表达式 |
|--------|-------|
| HighLeaveApiLatency | `histogram_quantile(0.99, leave_api_request_duration_seconds) > 1s` for 5m |
| DbConnectionPoolNearFull | `leave_db_connections_active / leave_db_connections_max > 0.8` for 5m |
| DbSlowQuery | `pg_stat_statements mean_exec_time > 1000 ms` for queries in last 5m |

### 1.2 用户可能反馈

- 登录慢、首屏加载慢
- 请假提交后显示"网络错误"
- 审批列表迟迟不出

### 1.3 严重度评估

| 情况 | 严重度 |
|------|-------|
| P99 > 5s，错误率 > 2% | SEV-1 |
| P99 1-5s，错误率 < 2% | SEV-2（常见） |
| P99 < 1s 但 DB 连接紧张 | SEV-3（预防） |

## 2. 快速定位（5 分钟内）

### Step 1: 看最近部署

```bash
kubectl -n hr rollout history deployment/leave-api
kubectl -n hr rollout history deployment/notification-worker
```

**如果 1 小时内有部署** → 跳到 [方案 A：回滚](#方案-a回滚)

### Step 2: 看 DB 状态

```bash
# 连接数
psql -h hr-pg-prod -U monitor -d leave -c "
  SELECT state, COUNT(*) FROM pg_stat_activity
  WHERE datname = 'leave' GROUP BY state;
"

# 慢查询 Top 10
psql -h hr-pg-prod -U monitor -d leave -c "
  SELECT query, calls, mean_exec_time, rows
  FROM pg_stat_statements
  WHERE mean_exec_time > 1000
  ORDER BY mean_exec_time DESC
  LIMIT 10;
"
```

### Step 3: 看应用日志

```bash
kubectl -n hr logs -l app=leave-api --tail=200 | grep -i "slow\|timeout\|error"
```

关注这些关键字:
- `prisma_timeout`
- `connection_pool_full`
- `query_timeout`
- `pg_locks`

### Step 4: 看 Grafana 大盘

打开 [Grafana - Leave Management](https://grafana.internal.company.com/d/leave-mgmt) 看：
- API QPS 趋势（有没有突增？）
- 各接口 P99
- DB 连接池水位
- 锁等待时间

## 3. 处置方案

### 方案 A：回滚

**适用**: 最近有部署 + 故障开始时间与部署吻合

```bash
kubectl -n hr rollout undo deployment/leave-api
kubectl -n hr rollout status deployment/leave-api
```

**验证**:
- [ ] Pod 状态 Running
- [ ] /health 返回 200
- [ ] 错误率回落
- [ ] 用内部账号 smoke test

**预估时长**: 5 分钟

### 方案 B：扩容连接池（快速缓解）

**适用**: 仅 DB 连接池饱和，无单条慢查询

```bash
kubectl -n hr set env deployment/leave-api DB_POOL_SIZE=40
# 原默认 20，提到 40（DB 上限 100）
```

**验证**: 观察 connection pool 水位

**预估时长**: 2 分钟（Pod rolling restart）

**副作用**: DB 总连接数增加,注意别把 PG 撑爆

### 方案 C：kill 慢查询

**适用**: 单条慢 SQL 占住连接

```sql
-- 先看是哪个
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '30 seconds';

-- 终止它（pid 从上面查出）
SELECT pg_cancel_backend(PID);
-- 或
SELECT pg_terminate_backend(PID);
```

**预估时长**: 1 分钟

### 方案 D：限流（兜底）

**适用**: 流量异常（超预期 QPS）

```bash
# 改网关限流配置（临时）
kubectl -n hr edit configmap nginx-config
# 把 leave-api 的 limit_req_zone 从 100 r/s 改成 50 r/s
# 热加载
kubectl -n hr exec -it nginx-0 -- nginx -s reload
```

**副作用**: 部分用户被限流（返回 429）,但核心路径保活

### 方案 E：重启服务（最后手段）

**适用**: 应用卡死（内存泄漏、事件循环阻塞）

```bash
kubectl -n hr rollout restart deployment/leave-api
```

**⚠️ 重启只是缓解**。根因必须找到，否则会复发。

## 4. 常见根因（按频率）

### 根因 1: Prisma N+1 查询

**症状**: 某个 API 接口变慢，DB 连接数激增

**定位**:
```bash
# 看哪个 SQL 被高频执行
psql -c "SELECT query, calls FROM pg_stat_statements
         ORDER BY calls DESC LIMIT 20;"
```

**处置**: 回滚 + 修代码（include/select 优化）

### 根因 2: 未命中索引的查询

**症状**: 单次查询慢,但 QPS 不高

**定位**:
```sql
EXPLAIN ANALYZE <问题查询>;
-- 看 Seq Scan vs Index Scan
```

**处置**: 
- 短期: kill 查询
- 长期: 加索引（需发版）

### 根因 3: 事务长时间持有锁

**症状**: `pg_locks` 表有大量 `waiting`

**定位**:
```sql
SELECT blocked_locks.pid AS blocked_pid,
       blocking_locks.pid AS blocking_pid,
       blocked_activity.query AS blocked_query,
       blocking_activity.query AS blocking_query
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity
  ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks
  ON blocking_locks.locktype = blocked_locks.locktype
  AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity
  ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.GRANTED;
```

**处置**: 终止 blocking 进程,排查代码为何长事务

### 根因 4: 月底统计导出压力大

**症状**: 每月 1-3 号 HR 批量查询,QPS 异常

**处置**:
- 告知 HR 分时段导出
- 加导出限速（已在 v1.1 backlog）

### 根因 5: SSO 慢拖累本系统

**症状**: 登录接口慢，但本系统 DB 无压力

**处置**: 向 IT SSO 团队升级

## 5. 升级路径

如上述方案 15 分钟内未能恢复：
- 升级 SEV-1
- 召集: IC + 开发 Tech Lead + DBA
- 启用应急群
- 考虑完全关闭服务（运维手动关 ingress）,用户转回邮件流程

## 6. 事后必做

- [ ] 保留 pg_stat_statements 快照（用于复盘）
- [ ] 保留 Grafana 截图
- [ ] 24h 内产出故障报告（[模板](../../../templates/operations/incident-report-template.md)）
- [ ] 48h 内产出复盘（[postmortem-example.md](./postmortem-example.md) 为参考）
- [ ] 更新本 Runbook（如有新发现）

## 7. 相关资源

- Grafana: https://grafana.internal/d/leave-mgmt
- Kibana: https://kibana.internal (index: `leave-*`)
- 架构图: [design-doc.md](../02-development/design-doc.md)
- 监控告警规则: `alerting/leave-rules.yml`
- 应急联系人: [release-plan-v1.0.md 第 7 节](./release-plan-v1.0.md#7-应急联系人)

## 8. 更新历史

| 版本 | 日期 | 变更人 | 变更内容 |
|------|------|-------|---------|
| v1.0 | 2026-04-20 | 周运维 | 初版（上线前预置） |
| v1.1 | 2026-04-27 | 周运维 | 根据 4/26 首次真实故障,补充"根因 1: N+1" 章节 |
