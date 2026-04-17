# 企业工具集成

把本框架与常用企业工具打通的现成脚本。**零依赖、Node.js 原生、配置即用**。

## 集成清单

| 集成 | 目录 | 主要脚本 |
|------|------|---------|
| **Jira** | [jira/](./jira/) | create-issue / sync-from-markdown / list-issues |
| **Confluence** | [confluence/](./confluence/) | publish-markdown / fetch-page |
| **Slack** | [slack/](./slack/) | notify / send-release-note |
| **企业微信 / 钉钉 / 飞书** | [im/](./im/) | 统一 notify.js |
| **GitLab API** | [gitlab/](./gitlab/) | create-labels (批量标签) |

## 设计原则

1. **零 npm 依赖**: 只用 Node 18+ 内置 fetch
2. **环境变量驱动**: 所有凭证从 env 读,不硬编码
3. **清晰错误**: 缺 env 时明确告知缺哪个+怎么拿
4. **幂等性**: 多次执行安全（如 create-labels 遇到已存在会更新而非报错）
5. **CI 友好**: 每个脚本独立可跑,退出码语义明确（0/1/2）

## 共用模块

`_common/` 目录下是所有集成共享的工具:

- [`env.js`](./_common/env.js) - 环境变量读取（支持 `.env` 自动加载）
- [`http.js`](./_common/http.js) - fetch 封装（超时、重试、认证 header）

## 典型使用场景

### 场景 1: 自动化发版通知

```bash
# 打 tag 时自动触发
node tools/integrations/slack/send-release-note.js \
  --file "release-v1.2.0.md" \
  --link "https://github.com/.../releases/v1.2.0"
```

### 场景 2: Bug 单跨系统同步

```
本地发现 Bug
    ↓ 写 bug.md（用 templates/testing/bug-reports 模板）
    ↓
node tools/integrations/jira/sync-from-markdown.js bug.md
    ↓ 自动创建 Jira Issue 并返回 KEY
    ↓
（在 bug.md 回填 Jira KEY,便于追溯）
```

### 场景 3: 文档统一发布

```
Markdown 作为源（Git 管理）
    ↓
node tools/integrations/confluence/publish-markdown.js \
  --file prd.md --page-id 12345
    ↓
Confluence 给非研发人员看
```

### 场景 4: 全场景告警

```bash
# CI 失败 → 多通道通知
node tools/integrations/slack/notify.js --text "..." --color danger
node tools/integrations/im/notify.js --platform wecom --text "..."
```

## 选型建议

### 我们用 Atlassian 全家桶（Jira + Confluence）

必做: [jira/](./jira/) + [confluence/](./confluence/)
可选: [slack/](./slack/)（如也在用 Slack）

### 我们是国内企业（企微/钉钉/飞书）

必做: [im/](./im/)
Jira 替代: 禅道/TAPD 等,本目录暂未支持（PR welcome）

### 我们用 GitLab 做一切

必做: [gitlab/](./gitlab/) + [im/](./im/)
参考: [workflows/gitlab/](../../workflows/gitlab/) 看工作流配置

## 在 CI / 自动化中使用

### GitHub Actions

所有凭证用 Secret 存储:

```yaml
- name: Notify
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
    WECOM_WEBHOOK_URL: ${{ secrets.WECOM_WEBHOOK_URL }}
  run: node tools/integrations/slack/notify.js --text "..."
```

### GitLab CI

```yaml
notify:
  stage: notify
  image: node:20-alpine
  script:
    - node tools/integrations/im/notify.js --platform wecom --text "..."
  variables:
    WECOM_WEBHOOK_URL: $WECOM_WEBHOOK_URL  # 从 CI/CD Variables 读
```

## 本地开发

### `.env` 文件（不要提交到 Git）

在项目根创建 `.env`：

```bash
# Atlassian (Jira + Confluence 共用)
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=ATATT3xxx
JIRA_DEFAULT_PROJECT=PROJ

CONFLUENCE_BASE_URL=https://yourcompany.atlassian.net/wiki
CONFLUENCE_EMAIL=you@company.com
CONFLUENCE_API_TOKEN=ATATT3xxx
CONFLUENCE_SPACE=DEV

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/xxx

# 企业微信
WECOM_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# GitLab
GITLAB_BASE_URL=https://gitlab.yourcompany.com
GITLAB_TOKEN=glpat-xxx
GITLAB_PROJECT_ID=12345
```

`.env` 已在根 `.gitignore` 里,不会意外提交。

### 测试连接

每个集成的 README 都有"测试连接"的命令，建议配置完先跑一次验证。

## 安全

**所有 Token / Webhook 都是凭证,泄漏等于控制了对应系统**。严格遵守：

| 红线 | 说明 |
|------|------|
| ❌ 不提交 `.env` | `.gitignore` 已配置,不要改 |
| ❌ 不硬编码 | 所有凭证只从 env 读 |
| ❌ 不打日志 | 脚本不打印 token 内容 |
| ✅ 用 Secret 管理 | CI/CD 用平台原生 Secret 功能 |
| ✅ 定期轮换 | 至少每 6 个月换一次 |
| ✅ 最小权限 | Token 只给必需 scope（如 Jira 只要 issue 读写） |
| ✅ 及时回收 | 人员离职、Token 泄漏 → 立即 Revoke |

## 故障排查

### `❌ 缺少必需环境变量`

脚本会告诉你缺哪个。检查:
1. `.env` 是否存在且在项目根
2. 变量名拼写是否对
3. `.env` 里等号两边有没有多余空格

### `HTTP 401 Unauthorized`

认证失败。检查:
- Token 是否过期（去对应平台重新生成）
- Email / 用户名是否对
- Token 是否有足够权限（scope）

### `HTTP 429 Too Many Requests`

触发限流。脚本已有指数退避重试,若频繁遇到:
- 降低调用频率
- 在 CI 里加 sleep

### `SSL_ERROR_SYSCALL` / 网络超时

检查:
- 是否有代理/VPN 干扰
- 企业内网是否能访问对方服务
- 防火墙是否放行

## 贡献

欢迎新增集成:

1. 在 `tools/integrations/` 下新建目录
2. 按现有结构组织（README.md + 脚本）
3. 共用代码走 `_common/`
4. 在本总 README 加一行

已规划但未实现（PR welcome）:
- 🟡 **禅道 ZenTao** - 国内 Bug 管理热门
- 🟡 **Jenkins** - CI 集成
- 🟡 **Prometheus Alertmanager → IM** - 告警转发
- 🟡 **OneAPI / OpenAI 代理** - 统一 LLM 网关
