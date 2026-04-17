# 贡献指南

## 项目范围

EP Code AI 是 **一个桌面应用 + 一套方法论**，两者相辅相成：

- 应用代码位于 [`app/`](./app/)
- 方法论位于 [`docs/chapters/`](./docs/chapters/)
- 两者不能彼此依赖：应用在无方法论文档时也能工作，方法论在无应用时也可实施

## 分支策略

```
main          ← 稳定版，受保护，只能通过 PR/MR 合入
├── develop   ← 开发主分支
├── feature/* ← 功能分支
├── fix/*     ← 修复分支
├── docs/*    ← 纯文档变更
└── release/* ← 发布分支
```

**不用分支区分平台。平台差异通过 `platforms/` 目录。**

## 提交规范（Conventional Commits）

```
<type>(<scope>): <subject>
```

### type

- `feat`: 新增功能或内容
- `fix`: 修复
- `docs`: 纯文档
- `refactor`: 重构
- `perf`: 性能优化
- `chore`: 杂项

### scope

- 应用代码: `app`
- 文档篇章: `docs/overview`, `docs/business`, `docs/dev`, `docs/testing`, `docs/ops`
- 模板: `templates`
- 工作流: `workflows/gitlab`, `workflows/github`, `workflows/generic`
- 平台: `platforms/macos`, `platforms/linux`, `platforms/windows`
- 工具: `tools`, `skills`

### 示例

```
feat(app): 新增 Artifact 侧边面板
fix(docs/testing): 修正提测达标 Checklist 遗漏项
docs(overview): 新增四场景融合图
chore(workflows/gitlab): 更新 CI 示例
```

## 文件规范

- **编码**: UTF-8
- **换行符**: LF（`.gitattributes` 已强制）
- **命名**: 全小写 kebab-case（如 `api-contract.md`）
- **Markdown**: 中英文之间加空格；不用下划线式标题

## 跨平台要求

- 脚本优先 **Node.js / Python**
- 必须用 Shell 时，**同时提供 `.sh` 与 `.ps1`**
- 代码中用 `path.join()` / `pathlib.Path`，禁止硬编码路径分隔符
- 路径优先相对路径或环境变量（`${PROJECT_ROOT}`）

## 评审规则

- 每个 PR 至少 1 人 approve
- 模板类改动需评估对存量用户的影响
- 跨平台改动需说明三个平台的验证情况
- 方法论文档重大更新需至少 2 人评审（含角色专家）

## 各场景负责人（建议）

| 篇章 | 建议负责人 |
|------|----------|
| 01 总览 | 项目总设计师 |
| 02 业务篇 | 资深产品 / BA |
| 03 开发篇 | 架构师 / Tech Lead |
| 04 测试篇 | 测试负责人 |
| 05 运维篇 | SRE / DevOps 负责人 |
