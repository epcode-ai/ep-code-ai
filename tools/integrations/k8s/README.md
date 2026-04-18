# Kubernetes 基础操作封装

> Sprint 3 产出。对 `kubectl` 的 JS 薄封装,统一日志格式 + dry-run + 机器可读输出,便于在 CI/Runbook 里复用。

## 前提

- 本机已安装 `kubectl` 且 `kubectl config current-context` 指向目标集群
- 或在容器里挂 Kubeconfig

## 脚本

| 脚本 | 作用 |
|------|------|
| `rollout-status.js` | 查 Deployment 的滚动发布状态（是否健康 / 就绪副本数） |
| `scale.js` | 扩缩 Deployment 副本数（带保护,不允许 prod 缩到 0） |
| `logs.js` | 拉取 Pod 日志（按 label 多 Pod 合并,支持 tail 与时间窗） |

## 通用参数

```
--ns <namespace>    默认 default
--context <ctx>     默认当前 context
--dry-run           只打印将执行的 kubectl 命令,不执行
--output json       输出 JSON（方便其他脚本消费）
```

## 示例

```bash
# 发布状态检查（CI 里常用）
node tools/integrations/k8s/rollout-status.js --ns payment --deployment payment-api --timeout 300

# 扩容 2 → 4
node tools/integrations/k8s/scale.js --ns payment --deployment payment-api --replicas 4 --dry-run

# 拉最近 5 分钟日志
node tools/integrations/k8s/logs.js --ns payment --label app=payment --since 5m --tail 500
```

## 安全约束

- `scale.js` 默认拒绝把 `--replicas 0` 应用到名字含 `prod` / `production` / `live` 的 Deployment,可加 `--force` 覆盖
- 所有脚本失败时 **非零退出**,便于 CI 感知
