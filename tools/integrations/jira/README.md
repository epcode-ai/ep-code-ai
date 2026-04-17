# Jira 集成

把本框架与 Jira 打通的现成脚本。

## 能做什么

| 脚本 | 用途 |
|------|------|
| [create-issue.js](./create-issue.js) | 快速创建一个 Issue（CLI） |
| [sync-from-markdown.js](./sync-from-markdown.js) | 把本仓库 Bug 报告 Markdown → Jira Issue |
| [list-issues.js](./list-issues.js) | 列出符合 JQL 的 Issue |

## 环境变量

需要三个变量（推荐写到 `.env`）：

```bash
# 你的 Jira 实例地址（不带 /rest/api/...）
JIRA_BASE_URL=https://your-company.atlassian.net

# 邮箱（登录 Jira 用的）
JIRA_EMAIL=you@company.com

# API Token（不是密码！）
# 获取: https://id.atlassian.com/manage-profile/security/api-tokens
JIRA_API_TOKEN=xxxxxx

# （可选）默认项目 Key
JIRA_DEFAULT_PROJECT=PROJ
```

### Atlassian Cloud vs Self-Hosted

- **Cloud**: 用邮箱 + API Token（上面的方式）
- **Server / Data Center**: 用用户名 + 密码或 Personal Access Token,需调整 auth 方式

本脚本默认适配 **Cloud**。Self-hosted 需改 auth header 为 `Bearer PAT`。

## 快速开始

### 1. 创建 API Token

1. 去 https://id.atlassian.com/manage-profile/security/api-tokens
2. 点 "Create API token"
3. 起个名（如 "ep-code-ai-integration"），创建
4. 复制 token，立即保存（只显示一次）

### 2. 配置 .env

```bash
cat > .env <<EOF
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=ATATT3xFfGF0...
JIRA_DEFAULT_PROJECT=PROJ
EOF
```

> ⚠️ **`.env` 已在 `.gitignore` 里,不会被提交。**

### 3. 测试连接

```bash
node tools/integrations/jira/list-issues.js 'assignee = currentUser()'
```

应该看到自己名下的 Issue 列表。

## 使用示例

### 创建 Issue

```bash
node tools/integrations/jira/create-issue.js \
  --project PROJ \
  --type Bug \
  --summary "[订单][P1] 跨年请假余额错误" \
  --description "详见 GitHub Issue #42"
```

### 从 Markdown 同步

```bash
# 把一个填写好的 Bug Markdown 推到 Jira
node tools/integrations/jira/sync-from-markdown.js \
  path/to/bug-report.md
```

脚本会解析 Markdown 里的标题、严重度、环境等字段,自动生成 Jira Issue。

### 查询

```bash
# 列出最近 7 天分配给我的 open Issue
node tools/integrations/jira/list-issues.js \
  'assignee = currentUser() AND status != Done AND created >= -7d'
```

## 在 CI / 自动化中使用

```yaml
# GitHub Actions 示例
- name: Create Jira Bug for failed tests
  if: failure()
  env:
    JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
    JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
    JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
  run: |
    node tools/integrations/jira/create-issue.js \
      --project PROJ --type Bug \
      --summary "CI failure on ${{ github.ref }}"
```

## 注意事项

- **Rate limit**: Jira Cloud 默认 5000 次/小时,脚本已加简单重试
- **字段定制**: 不同项目有不同必填字段（customfield），脚本内置常见字段,缺字段时会报错提示
- **权限**: API Token 的权限等于你账号的权限
- **不要提交 .env**: 确认 `.gitignore` 已包含

## 相关资源

- [Jira Cloud REST API 文档](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [API Token 管理](https://id.atlassian.com/manage-profile/security/api-tokens)
- [JQL 语法参考](https://support.atlassian.com/jira-software-cloud/docs/jql-fields/)
