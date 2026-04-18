# __PROJECT_NAME__ · 接入模式 C · 运行迭代项目（渐进嵌入）

> 本目录由 `epcode init --mode=C --name=__PROJECT_NAME__` 于 __DATE__ 生成。

## 核心策略: "边开车边换轮胎"

项目已上线,有成熟流程,不能一刀切换。按迭代分层引入,每个版本加一层。

## 5 迭代渐进路径

| 迭代 | 目标 | 引入 | 启用命令 |
|------|------|------|---------|
| v1 | **观察 + 规范基础** | Conventional Commits + PR 模板 + CI 校验 | `epcode adopt --level=1` |
| v2 | **提测门禁** | 提测申请单 + 提测达标 Checklist | `epcode adopt --level=2` |
| v3 | **测试产出标准化** | 测试策略 + 用例模板 + Bug 模板 | `epcode adopt --level=3` |
| v4 | **发布与故障流程** | 发布计划 + Runbook + 复盘模板 | `epcode adopt --level=4` |
| v5 | **度量闭环** | 接度量脚本,生成周报 | `epcode adopt --level=5` |

每次执行 `epcode adopt --level=N` 都会:
1. 复制对应层的模板/workflow
2. 在 `ADOPTION-LOG.md` 记录启用时间
3. 给出该层"该做什么、该避免什么"的提示

## 为什么选 C

- 项目已上线,定期迭代
- 有成熟流程（可能用 Jira/Confluence/钉钉等),和本框架不同
- 不能推倒,但愿意分层改进

## 注意

- ⚠️ **不要强行替换现有工具**:用 Jira 就别硬切 GitLab Issue
- ✅ **新流程 + 旧工具并存**:用本框架模板往 Jira 里填内容
- ✅ **度量驱动改进**:每版本看指标,让团队看到价值
- ✅ **回滚机制**:任何一层引入后出问题能退回

## 目录

```
__PROJECT_NAME__/
├── ADOPTION-LOG.md        本项目的渐进启用记录
├── docs/                  按需补齐（Level 3 开始）
└── .github/workflows/     按需开启（Level 1 开始）
```
