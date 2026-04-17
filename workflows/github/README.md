# GitHub 工作流适配

> **状态**: ✅ 完整实施（本仓库自用 + 可复制到你的项目）

本目录展示如何把本框架的方法论落地到 GitHub,配合 `.github/` 目录使用。

## 本仓库已启用的 GitHub 能力

| 能力 | 文件 | 说明 |
|------|------|------|
| **CI 自动检查** | [`../../.github/workflows/ci.yml`](../../.github/workflows/ci.yml) | PR 时自动跑链接校验、commit 格式、shell 语法、提测单校验 |
| **PR 模板** | [`../../.github/PULL_REQUEST_TEMPLATE.md`](../../.github/PULL_REQUEST_TEMPLATE.md) | 提 PR 时自动填充的 checklist |
| **Bug Issue 模板** | [`../../.github/ISSUE_TEMPLATE/bug.yml`](../../.github/ISSUE_TEMPLATE/bug.yml) | 表单式 Bug 报告 |
| **改进建议模板** | [`../../.github/ISSUE_TEMPLATE/enhancement.yml`](../../.github/ISSUE_TEMPLATE/enhancement.yml) | 功能/改进建议 |
| **提测模板（示例）** | [`../../.github/ISSUE_TEMPLATE/submission.yml`](../../.github/ISSUE_TEMPLATE/submission.yml) | 提测单的 Issue 表单示例 |
| **Issue 入口配置** | [`../../.github/ISSUE_TEMPLATE/config.yml`](../../.github/ISSUE_TEMPLATE/config.yml) | 禁用空白 Issue，引导到 Discussions |

## GitLab vs GitHub 对照

| 用途 | GitLab | GitHub |
|------|--------|--------|
| MR/PR 模板 | `.gitlab/merge_request_templates/Xxx.md` | `.github/PULL_REQUEST_TEMPLATE.md` 或 `.github/PULL_REQUEST_TEMPLATE/Xxx.md` |
| Issue 模板 | `.gitlab/issue_templates/Xxx.md` | `.github/ISSUE_TEMPLATE/*.yml`（表单）或 `*.md`（Markdown） |
| CI 配置 | `.gitlab-ci.yml` | `.github/workflows/*.yml`（支持多个） |
| 标签 | Scoped Labels (`类型::feat`) | 普通 Label |
| 审批规则 | Protected Branches / Approvers | Branch Protection / Rulesets |

## 在你的项目中启用（3 步）

### Step 1: 复制 `.github/` 到你的仓库

```bash
cp -r path/to/ep-code-ai/.github your-repo/
```

按需删改：
- 如果不用 Swift / macOS 应用，删除相关检查
- 如果没有 `tools/cross-platform/`，删除或调整 CI 里引用这些脚本的步骤

### Step 2: 配置分支保护（如是组织仓库）

参见 [`../../docs/chapters/03-development/03-branch-strategy.md#71-推荐配置`](../../docs/chapters/03-development/03-branch-strategy.md)：

- Settings → Branches → Branch protection rule（个人 / 组织 free 仅公开仓库）
- Settings → Rules → Rulesets（组织私有仓库推荐）

**必要规则**:
- Require a pull request before merging
- Require approvals: 1
- Require status checks to pass before merging → 勾选 CI 任务
- Require conversation resolution before merging

### Step 3: 配置标签

CLI 一键创建常用标签：

```bash
# 先登录 gh
gh auth login

# 批量创建（去你的仓库跑）
gh label create "bug"          --color d73a4a --description "Bug"
gh label create "enhancement"  --color a2eeef --description "功能建议"
gh label create "documentation" --color 0075ca --description "文档"
gh label create "需求"         --color 7057ff
gh label create "提测"         --color 0e8a16
gh label create "待审核"       --color e4e669
gh label create "P0"           --color b60205
gh label create "P1"           --color d93f0b
gh label create "P2"           --color fbca04
gh label create "P3"           --color c5def5
```

## CI 工作流设计说明

本仓库的 `ci.yml` 设计原则：

1. **快**：全部跑在 `ubuntu-latest`（免费额度最多），Node 20
2. **可并行**：多个 job 并行
3. **分级阻塞**：
   - 链接校验 / 提测单校验 → 必须通过
   - Markdown 风格 → 警告不阻塞（`continue-on-error: true`）
4. **条件触发**：commit-lint 只在 PR 时跑,submission-check 只在有提测文件变更时跑
5. **可取消**：同分支连续 push 会取消旧的

### 如何让 CI 成为"硬门禁"

1. 进入 Settings → Rules → Rulesets（或 Branch Protection）
2. 勾选 `Require status checks to pass before merging`
3. 把 CI 里各 job 的名字加进"Required status checks"列表

完成后，CI 不过 PR 就合不进去。

## GitHub 特定的最佳实践

### 1. 用 Issue Forms（YAML）而非 Markdown

- ✅ 字段可校验（required、dropdown）
- ✅ 填写体验好
- ✅ 数据结构化,便于后续脚本处理

已在本仓库采用（见 `.github/ISSUE_TEMPLATE/*.yml`）。

### 2. 用 Rulesets 而非 Branch Protection

- Rulesets 更现代、更灵活
- 免费组织私有仓库也能用（注：需组织账号,个人私有仓库需 Pro）

### 3. Reusable Workflows

多仓库同架构时，把 ci.yml 抽成 reusable workflow,各仓库调用：

```yaml
# your-repo/.github/workflows/ci.yml
jobs:
  ci:
    uses: epcode-ai/ep-code-ai/.github/workflows/ci.yml@main
```

### 4. GitHub Actions 配额管理

- **公开仓库**: 免费无限
- **私有仓库**: 2000 分钟/月（Free）/ 3000 分钟（Team）/ 50000 分钟（Enterprise）
- **WinSrv / macOS runner 扣费率更高**: Windows × 2, macOS × 10

本仓库的 CI 只用 `ubuntu-latest`，对免费额度最友好。

## 给大型团队的进阶建议

- **多仓库复用**: 抽 Reusable Workflow
- **安全扫描**: 集成 [CodeQL](https://codeql.github.com/)
- **依赖管理**: 启用 [Dependabot](https://github.com/dependabot)
- **代码所有权**: 配置 `.github/CODEOWNERS`（需 Pro/Team）
- **自动 Release**: 用 `release-please` / `semantic-release`

## 相关资源

- [GitLab 工作流](../gitlab/) - 对照阅读
- [通用工作流](../generic/) - 不依赖平台的方案
- [开发篇 · 分支策略](../../docs/chapters/03-development/03-branch-strategy.md)
- [测试篇 · 提测门禁](../../docs/chapters/04-testing/04-gates/submission-gate.md)
