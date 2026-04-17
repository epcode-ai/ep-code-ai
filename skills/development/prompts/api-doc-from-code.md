---
name: api-doc-from-code
description: 根据代码（路由+处理函数+schema）生成标准化 Markdown 接口文档
version: 1.0
category: development
---

# 接口文档生成（从代码）

## 用途

手写接口文档繁琐且容易和代码脱节。让 AI 从代码生成初稿,作者审核即可。

## 使用场景

- 接口变更后补/更新文档
- 老接口补档
- 对接外部（客户端、第三方）前

## Prompt 本体

```markdown
根据以下代码生成 Markdown 格式的接口文档。

## 文档结构（参照 templates/testing/api-contracts/api-template.md）

1. 基本信息（方法、路径、认证、限流、幂等）
2. 请求参数
   - Headers
   - Path parameters
   - Query parameters
   - Body
3. 响应
   - 成功响应（HTTP 200）
   - 业务错误码表
4. 示例（curl + 成功/失败响应）
5. 测试用例提示
   - 边界值
   - 等价类
   - 异常场景
   - 安全场景
   - 性能场景
6. 变更历史（留空）

## 代码
[粘贴路由定义 + 处理函数 + 相关 schema/DTO + 错误码定义]

## 要求
- 类型信息从代码里提取（TypeScript 类型、Python 类型注解等）
- 错误码从异常处理代码里提取
- 必填/可选要明确
- 默认值要明确
- 约束要明确（长度、格式、枚举）
- **末尾标注**: "本文档由 AI 生成，需人工核对与补充业务描述"

## 对不确定的部分
- 用 ⚠️ 标注
- 写上"需要作者确认"
```

## 使用示例

**输入**: 一个登录接口的 TypeScript 代码（Express + Zod）

**输出**: 完整的接口文档 Markdown，符合项目规范

## 相关资源

- [API 契约模板](../../../templates/testing/api-contracts/api-template.md)
- [设计规范](../../../docs/chapters/03-development/01-design-standards.md)

## 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-17 | 初版 |
