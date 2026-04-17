<!--
PR 模板 - 基于 workflows/gitlab/merge_request_template.md 适配
涵盖提测达标 checklist + 跨职能影响面评估
-->

## 本次 PR 概述

### 变更类型

- [ ] feat: 新功能
- [ ] fix: Bug 修复
- [ ] docs: 文档
- [ ] refactor: 重构
- [ ] perf: 性能优化
- [ ] test: 测试相关
- [ ] chore: 杂项

### 变更说明

<!-- 1-3 句话描述本次变更 -->

### 关联 Issue

<!-- Closes #xxx / Relates #xxx -->

## 变更清单

### 新增
-

### 修改
-

### 移除
-

## 影响范围

| 项目 | 内容 |
|------|------|
| 直接影响模块 | |
| 可能影响模块 | |
| 文档变更 | 是 / 否 |
| 模板/Skill 变更 | 是 / 否 |
| 跨平台脚本变更 | 是 / 否 |
| 对存量使用者的影响 | 无 / 需迁移（见下） |

<!-- 如需迁移,在下方说明迁移路径 -->

## 自测

- [ ] `node tools/cross-platform/scripts/check-all.js` 通过
- [ ] 本地渲染预览无异常
- [ ] 所有相对链接可达
- [ ] 新增脚本本地跑过
- [ ] 无敏感信息（密钥、内部 URL、真实用户数据）

## 文档同步

- [ ] 根 README 是否需要更新 → 已更新 / 无需
- [ ] 交叉引用的文档是否需要更新 → 已更新 / 无需
- [ ] CHANGELOG / Release Note → 已更新 / 无需（docs-only）

## 跨平台（如涉及）

- [ ] 脚本在 macOS 验证
- [ ] 脚本在 Linux 验证（可用 Docker / WSL）
- [ ] 脚本在 Windows 验证（可选,见情况）

## CI 预期

- [ ] Docs & Links: ✅
- [ ] Commit Lint: ✅（所有 commit 符合 Conventional Commits）
- [ ] Shell Syntax: ✅（如改了 .sh 文件）

## Reviewers

<!-- @reviewer1 @reviewer2 -->

---

<!--
Tip: 本模板基于 templates/development/code-review-checklist.md 精简。
需要完整 checklist 时参照原文件。
-->
