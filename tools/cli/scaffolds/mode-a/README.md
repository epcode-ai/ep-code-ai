# __PROJECT_NAME__ · 接入模式 A · 绿地项目

> 本目录由 `epcode init --mode=A --name=__PROJECT_NAME__` 于 __DATE__ 生成。
> 完整方法论见 https://github.com/epcode-ai/ep-code-ai

## 起步清单（按顺序执行）

- [ ] **Day 1 · 产品**: 用 `docs/prd/prd-v1.0.md` 模板写 PRD
- [ ] **Day 1 · 测试**: 测试同学做可测性评审（`epcode prd docs/prd/prd-v1.0.md`）
- [ ] **Day 2 · 开发**: 写设计文档 `docs/design/design-v1.0.md` + ADR
- [ ] **Day 3 · 测试**: 基于 PRD 写测试策略 + 用例大纲
- [ ] **Week 2**: 提测门禁跑通（CI 接 `check-prd` + `submission-check`）
- [ ] **发布前**: `epcode linkage release-plan --report test-report.md` 生成发布计划

## 目录

```
__PROJECT_NAME__/
├── docs/
│   ├── prd/               业务篇产出
│   ├── design/            开发篇产出
│   ├── adr/               架构决策记录
│   └── ops/               运维产出
├── tests/                 测试策略 / 用例 / 报告
└── .github/workflows/     建议从 ep-code-ai/.github/workflows/ci.yml 抄一份
```

## 常用命令

```bash
epcode prd docs/prd/prd-v1.0.md         # PRD 结构 + 可测性校验
epcode adr index --target docs/adr/     # 重建 ADR 索引
epcode check                            # 跑所有聚合检查
epcode metrics --since "7 days ago"     # 四场景度量周报
```

## 为什么选 A

你的项目:
- 刚立项,尚未编码
- 团队愿意从 Day 1 走规范
- 可以承担前一周的流程学习成本
