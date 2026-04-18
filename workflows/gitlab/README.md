# GitLab 工作流适配

## 适配目标

把本框架的方法论落地到 GitLab：
- 提测达标 → MR 模板 + CI 门禁
- Bug 管理 → Issues + 标签
- 代码评审 → MR 评审规则
- 流水线 → `.gitlab-ci.yml` 集成测试门禁

## 文件清单

| 文件 | 用途 | 放置位置 |
|------|------|---------|
| [`merge_request_template.md`](./merge_request_template.md) | MR 模板（含提测 checklist） | 仓库根：`.gitlab/merge_request_templates/` |
| [`issue_template_bug.md`](./issue_template_bug.md) | Bug Issue 模板 | 仓库根：`.gitlab/issue_templates/Bug.md` |
| [`issue_template_submission.md`](./issue_template_submission.md) | 提测 Issue 模板 | 仓库根：`.gitlab/issue_templates/Submission.md` |
| [`.gitlab-ci.example.yml`](./.gitlab-ci.example.yml) | CI 示例（含测试门禁） | 仓库根：`.gitlab-ci.yml` |
| [`gitlab-labels.md`](./gitlab-labels.md) | 标签约定（Bug 等级、状态） | 文档参考 |

## 快速开始

### 1. 在 GitLab 仓库中启用模板

```bash
# 在代码仓库根目录
mkdir -p .gitlab/merge_request_templates
mkdir -p .gitlab/issue_templates

# 复制本框架中的模板过去
cp path/to/merge_request_template.md .gitlab/merge_request_templates/Submission.md
cp path/to/issue_template_bug.md .gitlab/issue_templates/Bug.md
cp path/to/issue_template_submission.md .gitlab/issue_templates/Submission.md
```

### 2. 配置 CI 门禁

- 参考 [.gitlab-ci.example.yml](./.gitlab-ci.example.yml)
- 关键：把测试门禁作为 CI 的必经 stage

### 3. 配置仓库保护规则

- 测试分支（`release/*`）仅允许通过 MR 合入
- 合入前必须：
  - CI 通过
  - 至少 1 人 approve
  - MR 模板 checklist 全部勾选

### 4. 配置标签体系

参考 [gitlab-labels.md](./gitlab-labels.md)

## 与其他平台的对照

| 能力 | GitLab | GitHub | Gitea |
|------|--------|--------|-------|
| MR/PR 模板 | `.gitlab/merge_request_templates/` | `.github/PULL_REQUEST_TEMPLATE.md` | `.gitea/PULL_REQUEST_TEMPLATE.md` |
| Issue 模板 | `.gitlab/issue_templates/` | `.github/ISSUE_TEMPLATE/` | `.gitea/issue_template.md` |
| CI 配置 | `.gitlab-ci.yml` | `.github/workflows/*.yml` | `.gitea/workflows/*.yml` 或 Drone |
| 标签 | Labels（内置） | Labels（内置） | Labels（内置） |

如果你用的是 GitHub，见 [../github/](../github/)。

## Sprint 2 新增 CI Job

`.gitlab-ci.example.yml` 新增以下 4 个 job（不替换原有流水线）：

| Job | 阶段 | 触发条件 | 作用 | 阻塞性 |
|-----|------|---------|------|--------|
| `prd-check` | lint | MR + 动了 `docs/prd/**/*.md` 或 `**/prd-*.md` | 跑 `check-prd.js` 校验必备章节 / 模糊词 | 硬错误（退出 2）阻塞合入 |
| `testability-score` | lint | 同上 | 跑 `score-testability.js` 0-100 打分 | < 60 分阻塞合入 |
| `adr-index` | lint | push 到默认分支 + 动了 `docs/adr/**/*.md` | 重建索引并自动 commit | - |
| `business-metrics` | metrics | Schedule（每周一 08:00） | 跑 `tools/metrics/**/collect.js` 生成周报 artifact | - |

**准备工作**：
- `adr-index` 需要在 **CI/CD → Variables** 配置 `CI_PUSH_TOKEN`（Project Access Token,`write_repository` 权限）。
- `business-metrics` 需要在 **CI/CD → Schedules** 创建每周一 08:00 的定时任务（cron: `0 8 * * 1`）。

所有脚本零依赖（Node 18+ 内置 fetch/fs）,镜像用 `node:20-alpine` 即可。
