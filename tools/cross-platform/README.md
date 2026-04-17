# 跨平台工具脚本

> **零依赖** · **Node.js 18+** · **macOS / Linux / Windows 通用**

## 设计原则

- 只使用 Node.js 内置模块（`node:fs`, `node:path`, `node:process` 等）
- 不依赖任何 npm 包（`npm install` 都不需要跑）
- 统一用 ES Modules（`type: "module"`）
- 全部跨平台（路径处理用 `path.join`，不硬编码分隔符）

## 脚本清单

| 脚本 | 用途 | 退出码 0 的条件 |
|------|------|----------------|
| [check-links.js](./scripts/check-links.js) | Markdown 相对链接校验 | 所有内部链接可达 |
| [check-submission.js](./scripts/check-submission.js) | 提测申请单完整性校验 | 必备章节齐全、checklist 完整 |
| [markdown-lint.js](./scripts/markdown-lint.js) | Markdown 风格检查（中英文空格等） | 无风格问题 |
| [check-commit.js](./scripts/check-commit.js) | Conventional Commits 校验 | 格式合规 |
| [api-diff.js](./scripts/api-diff.js) | API 契约 Markdown 对比 | 无破坏性变更 |
| [check-all.js](./scripts/check-all.js) | 一键跑所有检查 | 必需项全部通过 |

## 使用方式

### 方式 1：npm scripts（推荐）

```bash
cd tools/cross-platform

# 单个检查
npm run check-links
npm run check-submission path/to/submission.md
npm run markdown-lint docs/
npm run check-commit "feat: add new feature"
npm run api-diff old.md new.md

# 全部检查
npm run check-all
```

### 方式 2：直接 node 调用

```bash
node tools/cross-platform/scripts/check-links.js .
node tools/cross-platform/scripts/check-submission.js my-submission.md
```

### 方式 3：全局别名（可选）

```bash
# 在你的 shell 配置里加 alias（以 zsh 为例）
alias epck='node ~/ep-code-ai/tools/cross-platform/scripts'

# 然后这么用
epck/check-links.js
epck/check-submission.js my.md
```

## 集成到 Git Hook

### 1. 本地 pre-push hook（拦截有问题的推送）

在你的**代码仓库**根目录：

```bash
# 创建 hook 文件
cat > .git/hooks/pre-push <<'SH'
#!/bin/sh
# 推送前运行链接检查
node /path/to/ep-code-ai/tools/cross-platform/scripts/check-links.js . || exit 1
SH
chmod +x .git/hooks/pre-push
```

### 2. commit-msg hook（强制 commit 规范）

```bash
cat > .git/hooks/commit-msg <<'SH'
#!/bin/sh
node /path/to/ep-code-ai/tools/cross-platform/scripts/check-commit.js "$1"
SH
chmod +x .git/hooks/commit-msg
```

### 3. 跨平台的 hook 管理（推荐用 husky）

```bash
npm install -D husky
npx husky init
echo 'node ./tools/cross-platform/scripts/check-commit.js "$1"' > .husky/commit-msg
echo 'node ./tools/cross-platform/scripts/check-links.js' > .husky/pre-push
```

## 集成到 CI

### GitHub Actions

```yaml
# .github/workflows/docs-check.yml
name: Docs Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node tools/cross-platform/scripts/check-all.js
```

### GitLab CI

```yaml
# .gitlab-ci.yml
docs-check:
  stage: lint
  image: node:20-alpine
  script:
    - node tools/cross-platform/scripts/check-all.js
```

## 脚本开发规范

新增脚本时遵循：

1. **文件头注释**：说明用途、用法、退出码含义
2. **ES Modules**：用 `import` 而非 `require`
3. **Shebang**：`#!/usr/bin/env node` 便于直接执行
4. **UTF-8 输出**：Windows 终端要支持中文
5. **退出码**：0 成功 / 1 有问题 / 2 参数错误
6. **尊重 `stdout` / `stderr`**：结果走 stdout,诊断走 stderr
7. **无外部依赖**：`package.json` 不加 `dependencies`

## 测试矩阵

| 平台 | Node.js 18 | Node.js 20 |
|------|-----------|-----------|
| macOS Sequoia | ✅ | ✅ |
| Linux Ubuntu 22 | 📋 待验证 | 📋 待验证 |
| Windows 11 | 📋 待验证 | 📋 待验证 |

## 常见问题

### Q: 为什么不用 markdownlint / commitlint 等现成工具？

A: 这些工具本身没问题，但：
- 它们要装 npm 依赖，增加复杂度
- 配置繁琐，跨平台一致性难保证
- 对中文支持不够（如中英文空格规则）

本仓库的脚本**只解决 80% 高频问题**，追求零成本可用。有专业需求请自行接入成熟工具。

### Q: 脚本中文乱码？

A: 确保：
- Windows 终端用 UTF-8 编码（`chcp 65001`）
- Git 配置 `core.quotepath = false`
- 文件保存为 UTF-8 无 BOM

### Q: 如何自定义规则？

A: 所有脚本都是可读性良好的 Node.js 代码，直接修改即可。建议 fork 到你的项目里定制。

## 贡献

- 新增脚本放 `scripts/`
- 更新 README 和 `package.json`
- 添加到 `check-all.js` 的调用链（如适用）
- 自测 macOS/Linux/Windows 三平台
