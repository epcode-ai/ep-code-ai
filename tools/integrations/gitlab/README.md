# GitLab 集成

GitLab 官方有好用的 `glab` CLI（参见 [platforms/linux/setup.md](../../../platforms/linux/setup.md)），所以本集成只补充 glab 不方便做的事。

## 能做什么

| 脚本 | 用途 |
|------|------|
| [create-labels.js](./create-labels.js) | 批量创建 scoped labels（类型/优先级/状态等） |

## 环境变量

```bash
GITLAB_BASE_URL=https://gitlab.yourcompany.com
GITLAB_TOKEN=glpat-xxx          # Personal Access Token（权限: api）
GITLAB_PROJECT_ID=12345         # 数字 ID 或 "namespace/repo"
```

获取 Token:
- GitLab → User Settings → Access Tokens → 创建（勾选 `api` scope）

## 使用示例

### 批量创建标签（按本框架推荐体系）

```bash
node tools/integrations/gitlab/create-labels.js
```

会创建这些 scoped labels（与 [workflows/gitlab/gitlab-labels.md](../../../workflows/gitlab/gitlab-labels.md) 一致）：

- **类型::feat / fix / refactor / docs / test / chore**
- **优先级::P0 / P1 / P2 / P3**
- **状态::待评审 / 开发中 / 待测试 / 测试中 / 待修复 / 待回归 / 已关闭 / 挂起**
- **Bug / 提测 / 回归 / 线上问题 / 技术债**

### 只创建部分

```bash
node tools/integrations/gitlab/create-labels.js --only priority
node tools/integrations/gitlab/create-labels.js --only type,status
```

### 预览不执行

```bash
node tools/integrations/gitlab/create-labels.js --dry-run
```

## 关于 `glab` vs 自制脚本

建议组合使用：

| 操作 | 推荐 |
|------|------|
| 日常 Issue / MR 操作 | `glab` CLI |
| 查看 Pipeline 状态 | `glab ci view` |
| 批量配置（标签、webhooks） | 本目录脚本 / API |
| 跨仓库操作 | 本目录脚本 |

## 相关资源

- [glab CLI 文档](https://glab.readthedocs.io/)
- [GitLab REST API](https://docs.gitlab.com/ee/api/)
- [workflows/gitlab/](../../../workflows/gitlab/) - GitLab 工作流配置指引
