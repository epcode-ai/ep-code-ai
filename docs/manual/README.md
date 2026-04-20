# 用户使用手册

> Sprint 6 ② 起步 · Sprint 8 完整发布。
>
> **这是什么**: 面向"拿起来就用"的用户手册。区别于 [docs/chapters/](../chapters/)(讲"为什么"的方法论)。
>
> **这不是什么**: 不是开发者手册(如何改 CLI / 改工具链)。那个见 [ARCHITECTURE.md](../../ARCHITECTURE.md)。

---

## 按你的需求选起点

### 🆕 "我是新用户,0 基础"

1. [**00-install.md**](./00-install.md) · 三操作系统安装步骤(含桌面应用 + CLI)
2. [**99-cheatsheet.md**](./99-cheatsheet.md) · 一页速查表(打印贴墙)
3. `01-first-project.md`(S8 补) · 第一个项目手把手(Sprint 8 补)

### 🎭 "我是特定角色,直奔我的部分"

| 角色 | 入口(Sprint 8 补全) |
|------|---------------------|
| 产品经理 / BA | `02-by-role/product.md`(S8 补) |
| 开发工程师 | `02-by-role/developer.md`(S8 补) |
| 测试 / QA | `02-by-role/qa.md`(S8 补) |
| SRE / 运维 | `02-by-role/sre.md`(S8 补) |

### 📍 "我的项目处于某阶段,给我完整流程"

| 阶段 | 入口(Sprint 8 补全) |
|------|---------------------|
| 刚立项 · 从零建 | `03-by-scenario/greenfield-journey.md`(S8 补) |
| 老项目接入 | `03-by-scenario/adopt-to-legacy.md`(S8 补) |

### 🆘 "我遇到问题了"

- `04-troubleshooting.md` · 常见错误诊断(Sprint 8 补)·临时看 [99-cheatsheet](./99-cheatsheet.md#-常见错误--怎么办)
- [GitHub Issues](https://github.com/epcode-ai/ep-code-ai/issues) · 找不到答案时来这里提

---

## 当前状态(Sprint 6 起步)

| 文件 | 状态 | 计划 Sprint |
|------|------|-----------|
| README.md | ✅ | S6 |
| 00-install.md | ✅ | S6 |
| 99-cheatsheet.md | ✅ | S6 |
| 01-first-project.md | 📋 | S8 |
| 02-by-role/{product,developer,qa,sre}.md | 📋 | S8 |
| 03-by-scenario/{greenfield,legacy}.md | 📋 | S8 |
| 04-troubleshooting.md | 📋 | S8 |

按 PLAN § Phase 2 的"小步迭代"原则,先发起步最重要的两篇,后续 Sprint 持续补。

---

## 与方法论文档的关系

| | 用户手册 (`docs/manual/`) | 方法论 (`docs/chapters/`) |
|--|------------------------|-------------------------|
| 回答 | **怎么做** | **为什么这么做** |
| 风格 | 手把手步骤 + 截图 + 故障诊断 | 原则 + 对照 + 案例分析 |
| 读完时长 | 5-20 分钟 | 每章 1-2 小时 |
| 例子 | "装好后在终端输这行" | "提测为什么是重要的门禁" |
| 更新频率 | 随版本 / 随反馈 | 季度级稳定 |

两者配合: 先读方法论搞明白"值不值得做",再读手册"怎么下手"。
