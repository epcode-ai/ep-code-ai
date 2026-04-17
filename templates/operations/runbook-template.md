# Runbook 模板（故障处置手册）

> 参考规范：[docs/chapters/05-operations/03-incident-response.md](../../docs/chapters/05-operations/03-incident-response.md)
>
> **使用方式**：每种高频故障场景都写一份 Runbook，放在团队共享位置，值班人遇到告警即查阅。

---

# Runbook: [故障场景名称]

**Runbook ID**: RB-[编号]
**Owner**: [姓名]（主） / [姓名]（备）
**最后更新**: YYYY-MM-DD
**适用服务**: [服务名]
**预估处置时长**: [X 分钟]

## 1. 故障现象

### 1.1 典型表现

- [告警名称 + 告警内容]
- [用户反馈描述]
- [监控指标异常]

### 1.2 告警规则

```yaml
# 触发这份 Runbook 的告警规则
alert: HighErrorRate
expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
for: 5m
severity: P1
```

### 1.3 严重度评估

- SEV-1 的情况: [什么时候升级到 SEV-1]
- SEV-2 的情况: [正常处置级别]
- SEV-3 的情况: [可以延后处理]

## 2. 快速定位（5 分钟内）

### Step 1: 看最近变更

```bash
# 最近发布
kubectl rollout history deployment/SERVICE_NAME

# 最近配置变更
curl http://config-server/audit?service=SERVICE_NAME&hours=1
```

**如果刚发布过** → 跳到 [方案 A：回滚](#方案-a-回滚)

### Step 2: 看依赖健康

```bash
# 检查下游依赖
curl http://SERVICE_NAME/health/deps

# 检查数据库
curl http://SERVICE_NAME/health/db

# 检查缓存
curl http://SERVICE_NAME/health/cache
```

**如果某依赖不可用** → 跳到 [方案 B：降级](#方案-b-降级)

### Step 3: 看资源

```bash
# Pod 资源
kubectl top pods -l app=SERVICE_NAME

# 查看异常 Pod
kubectl get pods -l app=SERVICE_NAME | grep -v Running
```

**如果资源爆** → 跳到 [方案 C：扩容](#方案-c-扩容)

### Step 4: 看错误日志

```bash
# 最近错误
kubectl logs -l app=SERVICE_NAME --tail=100 | grep ERROR

# 按错误类型统计
kubectl logs -l app=SERVICE_NAME --since=10m | grep ERROR | awk '{print $5}' | sort | uniq -c
```

## 3. 处置方案

### 方案 A：回滚

**适用**: 最近有发布，且发布后开始故障

```bash
# Step 1: 回滚到上一版本
kubectl rollout undo deployment/SERVICE_NAME

# Step 2: 等待滚动完成
kubectl rollout status deployment/SERVICE_NAME

# Step 3: 验证
curl http://SERVICE_NAME/health
```

**验证点**:
- [ ] 所有 Pod Running
- [ ] 健康检查通过
- [ ] 错误率恢复
- [ ] 业务功能正常

**预估时长**: 5-10 分钟

### 方案 B：降级

**适用**: 下游依赖故障，但本服务可通过降级继续提供部分功能

```bash
# 关闭依赖该下游的功能
curl -X POST http://config-server/flags/disable \
  -d '{"service": "SERVICE_NAME", "feature": "dependency_x"}'

# 或者修改 ConfigMap
kubectl edit configmap SERVICE_NAME-config
# 改: dependency_x_enabled=false
# 保存后触发 Pod 重启或热加载
```

**影响**:
- 保留的功能: [列表]
- 临时丢失的功能: [列表]

**预估时长**: 2-5 分钟

### 方案 C：扩容

**适用**: 流量激增导致资源不足

```bash
# 水平扩容
kubectl scale deployment/SERVICE_NAME --replicas=10

# 或垂直扩容（需重启）
kubectl set resources deployment/SERVICE_NAME \
  --limits=cpu=2000m,memory=4Gi \
  --requests=cpu=1000m,memory=2Gi
```

**预估时长**: 2-3 分钟

### 方案 D：重启

**适用**: 明显的 OOM、连接池耗尽、内存泄漏迹象

```bash
# 滚动重启
kubectl rollout restart deployment/SERVICE_NAME
```

**⚠️ 警告**: 重启只是缓解，一定要找根因。

## 4. 常见根因（按出现频率）

### 根因 1: 数据库慢查询

**症状**: DB 连接池满、应用响应慢

**定位**:
```sql
-- MySQL
SHOW PROCESSLIST;

-- PostgreSQL
SELECT pid, query_start, query FROM pg_stat_activity WHERE state = 'active';
```

**处置**:
- 杀慢查询
- 加索引（事后）
- 优化 SQL（事后）

### 根因 2: 第三方服务超时

**症状**: 日志里大量 `timeout`、P99 飙升

**定位**:
```bash
# 测试第三方连通
time curl -m 5 http://third-party-api/health
```

**处置**:
- 联系第三方方
- 启用降级/本地缓存
- 调整超时策略（临时）

### 根因 3: 流量异常（DDoS/爬虫/业务突增）

**症状**: QPS 飙升、错误率飙升

**定位**:
```bash
# 查看请求来源分布
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head
```

**处置**:
- 网关限流
- 封禁异常 IP
- 扩容（如果是正常流量）

### 根因 4: 配置错误

**症状**: 特定功能失效、日志里有配置相关错误

**定位**:
```bash
# 查看当前配置
curl http://SERVICE_NAME/config/dump

# 对比配置变更
git log --oneline -- config/
```

**处置**:
- 回滚配置
- 修正后重新发布

## 5. 升级路径

如果上述方案 5 分钟内不能恢复：
- 升级为 SEV-1
- 召集 IC / Tech Lead / Ops Lead
- 启用应急群沟通
- 考虑整机房切换 / 全站降级

## 6. 事后必做

故障恢复后：
- [ ] 保留现场（日志快照、监控截图）
- [ ] 通知故障结束
- [ ] 24h 内产出复盘（参考 [复盘模板](./postmortem-template.md)）
- [ ] 更新本 Runbook（新学到的知识）
- [ ] 加监控/告警（如果发现盲区）

## 7. 相关资源

- 服务架构图: [链接]
- 服务 SLA 文档: [链接]
- 应急联系人: [链接]
- 上次故障复盘: [链接]

## 8. 更新历史

| 版本 | 日期 | 变更人 | 变更内容 |
|------|------|-------|---------|
| v1.0 | YYYY-MM-DD | | 初版 |
