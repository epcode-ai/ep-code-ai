# 禅道（ZenTao）集成

> Sprint 3 产出。基于禅道 API（v15+ 的 PHP Restful 或自 v18 起的 OAuth2 API）,零依赖。

## 能力

| 脚本 | 作用 |
|------|------|
| `create-bug.js` | 创建 Bug |
| `list-bugs.js` | 按项目/产品/状态查询 Bug |
| `sync-from-markdown.js` | 把 Markdown 格式 Bug 报告批量同步到禅道 |

## 环境变量

```bash
ZENTAO_BASE_URL=https://zentao.example.com
ZENTAO_USERNAME=xxx
ZENTAO_PASSWORD=xxx
# 可选（用于默认项目/产品）
ZENTAO_DEFAULT_PRODUCT=1
ZENTAO_DEFAULT_PROJECT=1
```

## Dry-run

所有脚本支持 `--dry-run`,打印请求体但不发出真实调用,便于离线开发 / CI 冒烟。

```bash
node tools/integrations/zentao/create-bug.js --dry-run \
  --product 1 --title "登录验证码偶现失败" --severity 2
```

## 禅道 API 说明

- 禅道 API 需先调用 `/api.php?m=user-login-apiGetConfig.json` 获取 sessionID,再用 sessionID 访问业务接口
- 本集成封装了该鉴权流程,用户只需配置 username/password
- 详见禅道官方文档: https://www.zentao.net/book/zentaopmshelp/integration-268.html

## Markdown 同步格式

`sync-from-markdown.js` 识别以下格式的 Markdown:

```markdown
## BUG-001: 登录验证码偶现失败

- 严重度: 2 (中)
- 优先级: 3
- 环境: staging
- 模块: 用户中心

### 重现步骤
1. 访问登录页
2. 输入账号密码
3. 点击"获取验证码"

### 期望
收到短信验证码

### 实际
约 20% 概率收不到
```

每个 `## BUG-xxx: 标题` 块被识别为一条 Bug。
