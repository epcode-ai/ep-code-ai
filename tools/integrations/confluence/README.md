# Confluence 集成

把本框架与 Confluence（Cloud / Server / Data Center）打通。

## 能做什么

| 脚本 | 用途 |
|------|------|
| [publish-markdown.js](./publish-markdown.js) | 把本地 Markdown 发布成 Confluence 页面 |
| [fetch-page.js](./fetch-page.js) | 把 Confluence 页面拉下来保存为 Markdown |

## 环境变量

```bash
# Confluence 实例根（不带 /wiki）
CONFLUENCE_BASE_URL=https://your-company.atlassian.net/wiki

# 邮箱 + API Token（与 Jira 相同的 Token，Atlassian 账号共用）
CONFLUENCE_EMAIL=you@company.com
CONFLUENCE_API_TOKEN=ATATT3xFfGF0...

# 目标 Space Key（如 DEV, ENG, HR）
CONFLUENCE_SPACE=DEV
```

## 使用示例

### 发布一个 PRD 到 Confluence

```bash
node tools/integrations/confluence/publish-markdown.js \
  --file examples/leave-management-system/01-business/prd-v1.0.md \
  --title "员工请假管理系统 PRD v1.0" \
  --space DEV \
  --parent-id 123456      # 可选,父页面 ID
```

成功后会返回 Confluence 页面 URL。

### 更新已有页面

```bash
node tools/integrations/confluence/publish-markdown.js \
  --file prd.md \
  --page-id 7890123      # 已有页面 ID,更新而非新建
```

### 把 Confluence 页面拉成 Markdown

```bash
node tools/integrations/confluence/fetch-page.js \
  --page-id 7890123 \
  --output prd-from-confluence.md
```

## Markdown → Confluence 的转换

本工具做**简化转换**（不完美但够用）：

| Markdown | Confluence |
|----------|-----------|
| `# H1` | `<h1>H1</h1>` |
| `**bold**` | `<strong>bold</strong>` |
| `*italic*` | `<em>italic</em>` |
| `` `code` `` | `<code>code</code>` |
| `` ``` ``` `` | `<ac:structured-macro>code</ac:structured-macro>` |
| `[text](url)` | `<a href="url">text</a>` |
| `![alt](img)` | `<ac:image>...</ac:image>`（需另外上传图片） |
| 表格 | `<table>...</table>` |

> ⚠️ 复杂 Markdown（如 Mermaid 图、嵌套脚注）转换会不完整。建议：用 Markdown 作"单一事实源",Confluence 作"对外展示",不要双向频繁同步。

## 工作流建议

### 单向发布模式（推荐）

```
Markdown（源）  ──publish──► Confluence（展示）

- 修改只在 Markdown
- 定期跑 publish-markdown 同步到 Confluence
- Confluence 作为给非研发人员看的入口
```

### 双向同步（谨慎）

不推荐。原因：
- 两边格式不完全一致
- 冲突难解决
- 容易破坏 Markdown 结构

## CI 集成示例

把每次合入 main 的文档自动发布到 Confluence:

```yaml
- name: Publish docs to Confluence
  if: github.ref == 'refs/heads/main'
  env:
    CONFLUENCE_BASE_URL: ${{ secrets.CONFLUENCE_BASE_URL }}
    CONFLUENCE_EMAIL: ${{ secrets.CONFLUENCE_EMAIL }}
    CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}
    CONFLUENCE_SPACE: DEV
  run: |
    node tools/integrations/confluence/publish-markdown.js \
      --file docs/README.md \
      --page-id ${{ vars.CONFLUENCE_INDEX_PAGE_ID }}
```

## 对 Server / Data Center 版本

自建版 Confluence 的 REST API 路径不同：

```diff
- /wiki/rest/api/content         # Cloud
+ /rest/api/content              # Server / DC
```

修改脚本里的 URL 路径即可。

## 相关资源

- [Confluence Cloud REST API](https://developer.atlassian.com/cloud/confluence/rest/v2/)
- [Confluence Storage Format 语法](https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html)
- 共用 Jira 的 [API Token](https://id.atlassian.com/manage-profile/security/api-tokens)
