# API 契约模板（Markdown 格式）

## 为什么用 Markdown 做 API 契约

由于企业环境禁用 Swagger，采用**标准化的 Markdown 接口文档**作为替代方案：

| 优点 | 说明 |
|------|------|
| ✅ 通用 | 任何编辑器都能写、能看 |
| ✅ 可纳入代码仓库 | 随代码一起版本管理 |
| ✅ Git diff 友好 | 接口变更一目了然 |
| ✅ Claude 解析稳定 | 结构化 Markdown 解析效果最好 |
| ✅ 跨平台 | macOS / Linux / Windows 无差异 |
| ✅ 无需额外工具 | 不需要安装特定客户端 |

## 使用方式

1. 在代码仓库内创建 `docs/api/` 目录
2. 每个接口一个 Markdown 文件，或按模块组织
3. 接口变更必须同步更新文档
4. 文档与代码不一致 = **提测不达标**

## 文件命名规范

```
docs/api/
├── README.md               # 索引
├── auth/                   # 按模块分组
│   ├── login.md
│   ├── logout.md
│   └── refresh-token.md
├── user/
│   ├── profile.md
│   └── update.md
└── order/
    ├── create.md
    └── list.md
```

## 模板文件

- [api-template.md](./api-template.md) — 完整接口模板
- [api-simple-template.md](./api-simple-template.md) — 简化版模板（小接口用）
- [api-change-log-template.md](./api-change-log-template.md) — 接口变更记录模板
