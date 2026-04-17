---
name: unit-test-from-contract
description: 根据接口契约生成单元测试代码框架
version: 1.0
category: development
---

# 单元测试生成（从接口契约）

## 用途

根据 API 契约或函数签名生成测试用例框架，开发填充业务逻辑即可。

## 使用场景

- 新接口开发时先写测试（TDD）
- 老接口补测试覆盖
- 重构前保障安全网

## Prompt 本体

```markdown
你是一位资深测试开发工程师。根据以下接口契约，生成 [pytest / jest / junit / go test / ...] 单元测试。

## 覆盖要求

### 必须覆盖
1. 正常流（happy path）
2. 异常流（参数错误、权限错误、资源不存在、冲突）
3. 边界值（空、null、最大、最小、临界值）
4. 数据类型异常（类型错误、超长、特殊字符）

### 建议覆盖
5. 并发场景（如涉及）
6. 幂等性（如涉及）
7. 安全场景（SQL 注入、XSS 字符）

## 代码风格要求

1. 用 **AAA 模式**（Arrange / Act / Assert）
2. 测试函数命名: `should_<期望行为>_when_<前置条件>`
   - 例: `should_return_401_when_token_invalid`
3. 每个测试只测一件事
4. 测试数据用明确的变量名（不要魔法值）
5. Mock 依赖的外部调用（DB、HTTP）

## 输出格式

```语言
// Imports

// describe/class

//   // Setup / teardown

//   it/test(`should_xxx_when_yyy`, () => {
//     // Arrange
//     ...

//     // Act
//     ...

//     // Assert
//     ...
//   });
```

## 附带输出

每个测试用一句注释说明它验证什么。

末尾列一个清单:
- 总用例数
- 覆盖的正常流 / 异常流 / 边界 / 安全
- 需要 mock 的外部依赖清单

## 接口契约
[粘贴 API 文档或函数签名 + 类型定义]

## 被测代码（可选）
[粘贴被测函数的源代码]
```

## 使用示例

**输入**: 登录接口的 API 文档

**输出**: 12 个测试用例，覆盖：
- 2 个正常流（普通登录、记住我）
- 5 个异常流（用户名错、密码错、锁定、超时、缺参数）
- 3 个边界（用户名长度边界）
- 2 个安全（SQL 注入、XSS）

## 相关资源

- [测试用例模板](../../../templates/testing/test-cases/test-case-template.md)
- [API 契约模板](../../../templates/testing/api-contracts/api-template.md)

## 变更历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-17 | 初版 |
