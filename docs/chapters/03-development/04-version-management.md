# 开发篇 · 04 · 版本与依赖管理

## 本章目标

让**版本可追溯、依赖可审计、升级可预期**，避免"昨天还好好的，今天就挂了"。

## 一、版本化三原则

1. **可追溯**：线上任何故障都能定位到具体 commit + 依赖版本
2. **可复现**：任何时间点的构建都能重复出同一结果
3. **可回退**：紧急时能快速回到上一个稳定版本

## 二、语义化版本（SemVer）

```
v<MAJOR>.<MINOR>.<PATCH>[-<预发标识>][+<构建元数据>]
```

### 2.1 版本号递增规则

| 情况 | 递增位 | 例子 |
|------|-------|------|
| 不兼容的 API 变更 | MAJOR | v1.2.3 → v2.0.0 |
| 向下兼容的新功能 | MINOR | v1.2.3 → v1.3.0 |
| Bug 修复 | PATCH | v1.2.3 → v1.2.4 |

### 2.2 预发标识

```
v1.2.0-alpha.1   ← 内部验证
v1.2.0-beta.1    ← 灰度
v1.2.0-rc.1      ← 发布候选
v1.2.0           ← 正式发布
```

优先级：`alpha < beta < rc < 正式`

### 2.3 版本号约定的争议

**争议**：Bug 修复 + 新功能 + 不兼容变更一次发布，怎么定版本号？

**规则**：**取最高级**。如果有不兼容变更，哪怕只是 1 个，也必须升 MAJOR。

## 三、Tag 与 Release

### 3.1 Tag 命名

```
v<MAJOR>.<MINOR>.<PATCH>

示例:
v1.2.3
v2.0.0-rc.1
```

**始终加 `v` 前缀**（与代码里的版本号字段区分）。

### 3.2 Release Note 模板

```markdown
# v1.2.0 - 2026-04-20

## 新增
- 批量导出订单 (REQ-042) @alice
- 支持多供应商支付 (REQ-045) @bob

## 变更
- 登录流程简化，减少一步验证

## 修复
- 分页数据错误 (#123)
- 金额精度丢失 (#124)

## 安全
- 升级 express 修复 CVE-2024-xxxx

## 已知问题
- 大数据量导出性能待优化 (计划 v1.3)

## 升级指南
### 破坏性变更
无

### 数据库迁移
```bash
./migrate up
```

### 配置变更
新增：
- `EXPORT_MAX_ROWS=10000`

## 贡献者
@alice, @bob, @charlie

## 完整变更日志
https://github.com/.../compare/v1.1.0...v1.2.0
```

### 3.3 CHANGELOG 维护

在仓库根目录放 `CHANGELOG.md`，**每次发版时更新**（可手动，也可用 Conventional Commits 自动生成）。

自动生成工具：
- **Node.js**: `conventional-changelog-cli`, `standard-version`, `semantic-release`
- **Python**: `commitizen`
- **Go**: `git-chglog`
- **跨语言**: `git-cliff`

## 四、依赖管理

### 4.1 依赖的三个层级

| 层级 | 例子 | 升级频率 |
|------|------|---------|
| **运行时依赖** | Node.js 18, Python 3.11 | 低（~ 1 年） |
| **框架/库依赖** | Express, Django | 中（季度） |
| **工具依赖** | ESLint, Prettier | 高（月度） |

### 4.2 依赖锁定

必须提交到 Git：
- Node: `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`
- Python: `poetry.lock` / `requirements.txt` (with hashes)
- Go: `go.sum`
- Ruby: `Gemfile.lock`
- Rust: `Cargo.lock`（应用用、库不用）

**作用**：保证所有开发者、CI、线上环境装的是**同一份精确依赖**。

### 4.3 依赖版本范围的选择

| 范围 | Node/pnpm | 含义 | 建议 |
|------|----------|------|------|
| 精确版本 | `"1.2.3"` | 只装 1.2.3 | ⚠️ 过死 |
| 补丁版本 | `"~1.2.3"` | 1.2.x | 🟢 推荐给稳定库 |
| 次版本 | `"^1.2.3"` | 1.x.x | 🟢 推荐给大多数 |
| 任意版本 | `"*"` | 任何版本 | ❌ 禁用 |

**原则**：
- 业务依赖：用 `^` 或 `~`
- 稳定的基础库：用 `~`
- 新版本有风险的：用精确版本

## 五、依赖升级

### 5.1 升级频率

| 类型 | 建议频率 |
|------|---------|
| 安全补丁 | **立即**（收到 CVE 通知当天） |
| 日常依赖（patch） | 每周或每 sprint |
| 次版本（minor） | 每月评估 |
| 主版本（major） | 每季度评估 |
| 运行时（Node/Python） | 每年评估 |

### 5.2 升级流程

```
1. 运行审计工具（npm audit / pip-audit / snyk）
   ↓
2. 生成升级清单
   ↓
3. 按风险分组：低风险 / 中风险 / 高风险
   ↓
4. 低风险批量升 → 跑测试 → 合入
5. 中风险单个升 → 详细测试 → 合入
6. 高风险做评估 → 列变更点 → 评审 → 灰度
```

### 5.3 自动化工具

| 工具 | 平台 | 功能 |
|------|------|------|
| **Dependabot** | GitHub | 自动 PR 升级依赖 |
| **Renovate** | GitLab / GitHub / ... | 更灵活的依赖升级机器人 |
| **npm audit / yarn audit** | Node | 安全漏洞扫描 |
| **pip-audit** | Python | 同上 |
| **govulncheck** | Go | 同上 |
| **Snyk** | 多语言 | 全面审计 |

### 5.4 配置 Dependabot 示例

文件：`.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
    groups:
      dev-dependencies:
        dependency-type: "development"
```

## 六、环境变量与配置管理

### 6.1 分层

```
默认值（代码里）
  ↓ 被覆盖
.env.example         ← 提交到 git，示例
  ↓
.env                 ← 不提交，本地
  ↓
环境变量              ← CI/CD 注入，生产
```

### 6.2 命名规范

```
<PROJECT>_<CATEGORY>_<NAME>

示例:
EPCODE_DB_HOST
EPCODE_DB_PORT
EPCODE_API_TIMEOUT_MS
EPCODE_AI_PROVIDER
```

**规则**：
- 全大写 + 下划线
- 加前缀避免与系统变量冲突
- 单位明确（`_MS`, `_SECONDS`, `_BYTES`）
- 敏感信息（密钥、Token）**绝不进 Git**

### 6.3 配置校验

启动时验证必需的环境变量：

```javascript
// Node.js 示例
import { z } from 'zod';

const envSchema = z.object({
  EPCODE_DB_HOST: z.string().min(1),
  EPCODE_DB_PORT: z.coerce.number().int().positive(),
  EPCODE_API_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

const env = envSchema.parse(process.env);
```

```python
# Python 示例
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    epcode_db_host: str
    epcode_db_port: int
    epcode_api_timeout_ms: int = 5000

settings = Settings()  # 缺失必需变量会启动失败
```

## 七、跨平台依赖问题

### 7.1 常见坑

- 某些原生模块 Windows 构建失败（如 `node-gyp` 相关）
- Python 的 `manylinux` wheel 在 macOS ARM 上要单独编译
- 文件路径分隔符
- shell 脚本在 Windows 上跑不了

### 7.2 应对策略

- `package.json` 里标注 `engines`（限定 Node / npm 版本）
- 提供 Dockerfile 统一构建环境
- CI 矩阵测试（macOS + Linux + Windows）
- 脚本用 Node.js / Python，少用 bash-only

## 八、软件物料清单（SBOM）

### 8.1 什么是 SBOM

**Software Bill of Materials** — 列出项目里**所有**依赖（包括传递依赖）的清单。

### 8.2 生成方式

```bash
# Node.js
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# Python
pip-audit --format json --output sbom.json

# 跨语言
syft . -o cyclonedx-json > sbom.json
```

### 8.3 用途

- 供应链攻击检测（有没有引入恶意包）
- 合规审计（证明使用的开源协议）
- 快速响应 CVE（哪些项目受影响）

## 九、回滚策略

### 9.1 代码级回滚

```bash
# 方案 A：revert（推荐，保留历史）
git revert <bad-commit>

# 方案 B：checkout 旧 tag（紧急情况）
git checkout v1.2.0
git tag v1.2.1-rollback
git push origin v1.2.1-rollback
```

### 9.2 部署级回滚

详见 [运维篇 · 01 发布 SOP](../05-operations/01-release-sop.md)。

### 9.3 数据库回滚

**关键规则**：
- 每次 migration 必须**同时写回滚脚本**
- 数据库 migration 与代码 deployment **不要同时做**
- 先加列再用，再删旧（分两次发布）

## 十、配套资源

- [01 设计规范](./01-design-standards.md)
- [02 代码评审](./02-code-review.md)
- [03 分支策略](./03-branch-strategy.md)
- [05 AI 辅助开发](./05-ai-assistance.md)
- [运维篇 · 发布 SOP](../05-operations/01-release-sop.md)
