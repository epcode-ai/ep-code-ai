# GitHub 工作流适配

> 适配本框架到 GitHub（占位，Phase 1 不重点实施）

## 文件对照（与 GitLab 对应）

| 用途 | GitLab | GitHub |
|------|--------|--------|
| PR 模板 | `.gitlab/merge_request_templates/*.md` | `.github/PULL_REQUEST_TEMPLATE.md` 或 `.github/PULL_REQUEST_TEMPLATE/*.md` |
| Issue 模板 | `.gitlab/issue_templates/*.md` | `.github/ISSUE_TEMPLATE/*.md` |
| CI | `.gitlab-ci.yml` | `.github/workflows/*.yml` |

## 后续实施计划

- [ ] `.github/PULL_REQUEST_TEMPLATE.md`（基于 GitLab MR 模板改编）
- [ ] `.github/ISSUE_TEMPLATE/bug.yml`
- [ ] `.github/ISSUE_TEMPLATE/submission.yml`
- [ ] `.github/workflows/ci.yml`（提测门禁）

## 临时方案

如需立即适配 GitHub，请参考 [../gitlab/](../gitlab/) 中的模板，把 GitLab 特有语法（如 `/label`、`/assign`）改为 GitHub 语法（`labels`、`assignees`）。
