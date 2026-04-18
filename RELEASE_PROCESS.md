# Release Process

> 本项目的发布流程。版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。每个 Sprint 完成 = 一次 minor 发布。

## 版本节奏

| 变动类型 | 版本段 | 示例 | 何时 |
|---------|-------|------|------|
| 破坏性变更 | major | 0.x.y → 1.0.0 | 1.0 GA 前不动 major |
| Sprint 完成 / 显著新特性 | minor | 0.5.0 → 0.6.0 | 每个 Sprint 结束 |
| Bug 修复 / 小优化 | patch | 0.5.0 → 0.5.1 | 随时 |

## 发布 Checklist（每次 minor/patch）

### 1. 准备

- [ ] 所有相关 PR 已合入 main
- [ ] CI 全绿（`gh pr checks`）
- [ ] 本地跑 `node tools/cross-platform/scripts/check-all.js` 无错误
- [ ] 本地跑 `node tools/cli/bin/epcode.js --help`,所有子命令可用

### 2. 更新版本号

需同步改 3 个地方:

- `package.json` · 根目录
- `tools/cli/bin/epcode.js` · `const VERSION = 'x.y.z'`
- `docs-site/package.json` · `version`

### 3. 更新 CHANGELOG

按 Keep-a-Changelog 格式,在顶部追加:

```markdown
## [0.x.0] - YYYY-MM-DD · Sprint N 完成

**主题**: ...

### 新增
- ...

### 变更
- ...

### 完成度
...
```

### 4. 更新 ROADMAP

- Sprint 状态表: `🚧 进行中` → `✅ 完成`,下一 Sprint `📋 计划中` → `🚧 进行中`
- "近期变更" 追加一条

### 5. 打 tag

```bash
git tag -a v0.x.0 -m "Release v0.x.0 · Sprint N 完成"
git push origin v0.x.0
```

### 6. GitHub Release

```bash
gh release create v0.x.0 \
  --title "v0.x.0 · Sprint N 完成" \
  --notes-file <(sed -n '/## \[0.x.0\]/,/## \[/p' CHANGELOG.md | head -n -1)
```

或在 GitHub 网页上用"从 tag 创建 Release"并把 CHANGELOG 对应段落粘进去。

### 7. 部署文档站

`.github/workflows/pages.yml` 会在 main 有 `docs-site/` 或 `docs/chapters/` 变动时自动部署。如果未变动需手动部署:

```bash
gh workflow run pages.yml
```

## 破坏性变更（1.0 前应尽量避免）

如必须做破坏性变更:
1. 先开 RFC Issue（`.github/ISSUE_TEMPLATE/rfc.yml`,如无则用 enhancement）讨论 2 周
2. 在 CHANGELOG 显著位置标注 `⚠️ Breaking`
3. 提供 migration guide

## 回滚

如发布后发现严重问题:

```bash
# 1. 删 tag 和 release
gh release delete v0.x.0 --cleanup-tag --yes

# 2. 回滚 main
git revert <commit-sha>
git push

# 3. 在 CHANGELOG 新增 patch 版本记录回滚
```

## 变更沟通

- 每次 minor 发布 → 在 README 顶部 banner 标注最新版本
- 每个 Sprint 结束 → 在 ROADMAP.md "近期变更" 小节追加说明
- 重大变更 → 在 GitHub Discussions（如开启）通知
