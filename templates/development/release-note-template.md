# Release Note / CHANGELOG 模板

> 参考规范：[docs/chapters/03-development/04-version-management.md](../../docs/chapters/03-development/04-version-management.md)
>
> **两种用法**：
> 1. 单次发版的 Release Note（放在 GitHub/GitLab Releases 页面）
> 2. 累计的 CHANGELOG.md（放在仓库根目录）

---

## 用法一：单次 Release Note

# v[版本号] - YYYY-MM-DD

## 摘要（1-2 句话）

[这次发版最值得关注的变化]

## 新增（Added）

- [功能 A]（REQ-xxx）@[贡献者]
- [功能 B]（REQ-xxx）@[贡献者]

## 变更（Changed）

- [变更 1 的说明]
- [变更 2 的说明]

## 废弃（Deprecated）

- [被标记废弃的功能/接口]（计划在 vX.Y 移除）

## 移除（Removed）

- [被删除的功能/接口]

## 修复（Fixed）

- 修复 [问题描述]（#issue-号）
- 修复 [问题描述]（#issue-号）

## 安全（Security）

- 升级 [依赖包] 修复 [CVE-编号]
- 补充 [安全加固项]

## 性能（Performance）

- [优化点]：指标 A 从 X 改善到 Y

## 已知问题（Known Issues）

- [已知问题 1]（计划在 vX.Y 修复）

## 破坏性变更（Breaking Changes）⚠️

> 仅当主版本号递增时填写

### 1. [变更标题]

**影响**: [对使用者的影响]

**迁移指南**:
```bash
# 旧方式
old_command --option

# 新方式
new_command --flag
```

## 升级指南

### 数据库迁移
```bash
./scripts/migrate up
```

### 配置变更
**新增**:
```yaml
feature:
  newFlag: true
```

**变更**:
```yaml
timeout: 30  # 旧值 10
```

**删除**:
- `legacyConfig`（已迁移到 `newConfig`）

### 依赖变化
- Node.js: 18.x → 20.x（必须升级）
- React: 18.x → 18.x（无变化）

## 贡献者

@alice, @bob, @charlie

## 完整变更

- 代码对比: https://github.com/.../compare/v1.1.0...v1.2.0
- 测试报告: [链接]
- 部署文档: [链接]

---

## 用法二：CHANGELOG.md（累计）

```markdown
# Changelog

All notable changes to this project will be documented in this file.

格式参考: [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)
版本号遵循: [SemVer 2.0.0](https://semver.org/lang/zh-CN/)

## [Unreleased]

### Added
- [待发布的新功能]

### Changed
- [待发布的变更]

## [1.2.0] - 2026-04-20

### Added
- 批量导出订单 (REQ-042) [@alice]
- 支持多供应商支付 (REQ-045) [@bob]

### Changed
- 登录流程简化，减少一步验证

### Fixed
- 修复分页数据错误 (#123)
- 修复金额精度丢失 (#124)

### Security
- 升级 express 修复 CVE-2024-xxxx

## [1.1.0] - 2026-03-15

### Added
- 新增 OAuth 登录
- 新增日志导出功能

### Fixed
- 修复搜索无结果不提示的 bug (#98)

## [1.0.0] - 2026-02-01

### Added
- 初始发布

[Unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

---

## 最佳实践

### DO

- ✅ 从**使用者视角**写（他们关心什么变化）
- ✅ 分类清晰（Added/Changed/Fixed/Security/...）
- ✅ 每条变更有**ID 追溯**（Issue / PR）
- ✅ 破坏性变更有明显标记 ⚠️
- ✅ 提供**升级/迁移指南**
- ✅ 感谢贡献者（建立社区/团队氛围）

### DON'T

- ❌ 不要 copy-paste commit message（太技术细节）
- ❌ 不要 copy-paste Jira 单（太内部）
- ❌ 不要只写"bug fixes and improvements"（没信息量）
- ❌ 不要遗漏破坏性变更
- ❌ 不要在 CHANGELOG 里写"内部变更"（放 Git history）

### 生成工具推荐

| 语言 | 工具 |
|------|------|
| Node.js | `conventional-changelog-cli`, `standard-version`, `semantic-release` |
| Python | `commitizen` |
| Go | `git-chglog` |
| 跨语言 | `git-cliff` |

配合 Conventional Commits 规范使用，可以**自动生成** CHANGELOG。
