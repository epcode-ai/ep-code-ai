# 开发篇 · 03 · 分支策略

## 本章目标

明确团队的**分支模型选择**，让代码流转规则清晰、可自动化。

## 一、主流分支模型对比

| 模型 | 适合 | 优点 | 缺点 |
|------|------|------|------|
| **Git Flow** | 有明确版本的产品（SaaS、App） | 结构清晰，版本管理严谨 | 分支多、流程重 |
| **GitHub Flow** | 持续部署的 Web 应用 | 简单，一个 main + feature | 没有版本概念，大版本难管 |
| **Trunk-Based** | 高频发布、成熟 CI/CD | 极简、合并快 | 需要强大的测试与 Feature Flag |
| **GitLab Flow** | 介于 Git Flow 和 GitHub Flow | 兼顾简单与环境管理 | 学习成本中等 |

## 二、推荐方案：简化 Git Flow（适合大多数企业项目）

```
main          ← 稳定版（对应线上）
├── develop   ← 开发主分支（集成用）
├── feature/<名称>   ← 功能分支
├── fix/<名称>        ← 修复分支
├── release/<版本>    ← 发布分支（冻结期用）
└── hotfix/<问题>    ← 线上热修
```

### 2.1 各分支的职责

| 分支 | 从哪来 | 合并到哪 | 保护级别 |
|------|-------|---------|---------|
| `main` | 由 release / hotfix 合入 | - | 🔒 保护 |
| `develop` | 由 feature / fix 合入 | release | 🔒 保护 |
| `feature/*` | develop | develop | ❌ 不保护 |
| `fix/*` | develop | develop | ❌ 不保护 |
| `release/*` | develop | main + develop | 🔒 保护 |
| `hotfix/*` | main | main + develop | 🔒 保护 |

### 2.2 典型流程

**新功能开发**：
```
git checkout develop
git pull
git checkout -b feature/batch-export
# 开发...
git push -u origin feature/batch-export
# 在 GitLab/GitHub 提 MR/PR, 目标分支 develop
```

**版本发布**：
```
# 从 develop 切出发布分支
git checkout -b release/1.2.0

# 只做 bug 修复，不加新功能
# ...

# 合并到 main（并打 tag）
git checkout main
git merge --no-ff release/1.2.0
git tag v1.2.0
git push origin main --tags

# 合并回 develop（把 release 上的修复同步回去）
git checkout develop
git merge --no-ff release/1.2.0
```

**线上热修**：
```
git checkout main
git checkout -b hotfix/payment-bug

# 修复...
git commit

# 合到 main（紧急发布）
git checkout main
git merge --no-ff hotfix/payment-bug
git tag v1.2.1

# 合回 develop（避免 bug 复现）
git checkout develop
git merge --no-ff hotfix/payment-bug
```

## 三、分支命名规范

### 3.1 基本格式

```
<type>/<scope>-<short-description>

示例:
feature/order-batch-export
feature/user-sso-integration
fix/login-password-reset
hotfix/payment-timeout
docs/api-refactor
chore/upgrade-node-20
```

### 3.2 约束

- 只用**小写字母、数字、短横线**
- 不超过 **50 字符**
- 不用中文（避免跨平台问题）
- 关联 Issue 的可加 ID：`feature/ORDER-042-batch-export`

## 四、Commit Message 规范

### 4.1 Conventional Commits 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**（必选）：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档
- `style`: 格式（不影响逻辑）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具
- `revert`: 回滚

**scope**（可选）：模块名、文件名

**subject**（必选）：
- 一行以内
- 首字母小写
- 结尾不加句号
- 动词开头（add / fix / update / remove）

### 4.2 示例

```
feat(order): add batch export API

Support exporting up to 10000 orders as xlsx.
Implements REQ-042.

Closes #123
```

```
fix(auth): prevent token leak in error log

Error handler previously dumped full headers including
Authorization. Now it masks sensitive headers.

Fixes #456
```

### 4.3 不推荐的提交

```
❌ update
❌ fix bug
❌ 修改了一些内容
❌ WIP
❌ 加了一些东西，下次再说
```

## 五、合并策略（Merge Strategy）

### 5.1 三种合并方式

| 方式 | 命令 | 效果 | 适合 |
|------|------|------|------|
| **Merge Commit** | `git merge --no-ff` | 保留分支历史 | 长期 feature 分支 |
| **Squash** | `git merge --squash` | 压成一个 commit | 短期 feature、小改动 |
| **Rebase** | `git rebase` | 线性历史 | develop 合入前整理 commits |

### 5.2 推荐策略

| 分支合并 | 推荐方式 | 原因 |
|---------|---------|------|
| feature → develop | Squash | 保持主线干净，一个功能一个 commit |
| develop → release | Merge Commit | 保留完整历史 |
| release → main | Merge Commit | 保留发版历史 |
| hotfix → main | Merge Commit | 清晰显示紧急修复 |

### 5.3 禁止事项

- ❌ 禁止在 main 上 force push
- ❌ 禁止 rebase 已 push 的公共分支
- ❌ 禁止跨多层分支直接 cherry-pick

## 六、Tag 与版本

### 6.1 版本号规则（SemVer）

```
v<MAJOR>.<MINOR>.<PATCH>

v1.2.3

- MAJOR: 不兼容变更
- MINOR: 新功能（向下兼容）
- PATCH: Bug 修复
```

预发版：
```
v1.2.0-alpha.1   内部验证
v1.2.0-beta.1    灰度
v1.2.0-rc.1      发布候选
v1.2.0           正式发布
```

### 6.2 Tag 推送

```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 6.3 配合 Changelog

每次打 tag 前更新 `CHANGELOG.md`：

```markdown
# Changelog

## [1.2.0] - 2026-04-20

### Added
- 批量导出订单 (REQ-042)
- 多供应商支付 (REQ-045)

### Changed
- 登录流程简化，减少一步验证

### Fixed
- 修复分页数据错误 (#123)
- 修复金额精度丢失 (#124)

### Security
- 升级 express 修复 CVE-2024-xxxx

## [1.1.0] - 2026-03-15
...
```

## 七、分支保护规则

### 7.1 推荐配置

对 `main` 和 `develop`：

- ✅ 禁止直接 push
- ✅ 必须通过 PR/MR 合入
- ✅ 至少 1 人 approve
- ✅ CI 必须通过
- ✅ 分支必须同步到最新（Required branches to be up to date）
- ✅ 禁止 force push
- ✅ 禁止删除

### 7.2 不同平台的实现

| 平台 | 配置入口 |
|------|---------|
| GitLab | Settings → Repository → Protected branches |
| GitHub (组织) | Settings → Rules → Rulesets |
| GitHub (个人免费) | ⚠️ 私有仓库不支持服务端保护 |

详见 [测试篇 · 提测门禁](../04-testing/04-gates/submission-gate.md)。

## 八、长期分支的维护

### 8.1 定期 sync

feature 分支如果长期存活（> 1 周），要定期把 develop 合入：

```bash
git checkout feature/batch-export
git fetch origin
git rebase origin/develop   # 或 merge
# 解决冲突
git push --force-with-lease  # 注意：只能在个人分支用
```

### 8.2 僵尸分支清理

每月清理长期未活跃的分支：

```bash
# 查看所有远程分支最后提交时间
git for-each-ref --format='%(committerdate:short) %(refname:short)' refs/remotes/origin/ | sort

# 删除本地已合并分支
git branch --merged develop | grep -v develop | xargs git branch -d
```

## 九、跨平台注意事项

### 9.1 不同 OS 的换行符

仓库已通过 `.gitattributes` 强制 LF：
- 代码文件（`.md`, `.sh`, `.js`, `.py`, `.swift`）: LF
- Windows 专用（`.ps1`, `.bat`, `.cmd`）: CRLF

开发者第一次 clone 时会自动处理。

### 9.2 文件名大小写

- macOS 默认不敏感，Linux 敏感
- **始终用全小写 kebab-case**：`user-service.ts`，不是 `UserService.ts`
- Swift 类文件除外（语言惯例用大驼峰）

### 9.3 命令差异

```bash
# 跨平台通用
git <command>

# Unix-only
grep 'pattern' file
sed -i 's/old/new/' file

# Windows-only（PowerShell）
Get-Content file | Select-String 'pattern'
```

团队工具链建议统一用 **Node.js / Python** 脚本，避免 OS 差异。

## 十、配套资源

- [01 设计规范](./01-design-standards.md)
- [02 代码评审](./02-code-review.md)
- [04 版本与依赖管理](./04-version-management.md)
- [GitLab MR 模板](../../../workflows/gitlab/merge_request_template.md)
