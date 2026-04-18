# docs-site · Docusaurus 文档站

> 本目录是 EP Code AI 对外发布的静态文档站源码,部署到 GitHub Pages。

## 本地开发

```bash
cd docs-site
npm install
npm start       # http://localhost:3000
```

## 构建与发布

```bash
npm run build   # 产物在 docs-site/build/
npm run serve   # 本地预览 build 产物
```

**线上部署**: 推到 main 时由 `.github/workflows/pages.yml` 自动构建 + 发布到 GitHub Pages。

## 首页设计

首页以 **4 种接入模式** 作为一等公民:

```
┌─────────────┬─────────────┐
│  A · 绿地   │  B · 开发中 │
│  全套上车   │  追溯补齐   │
├─────────────┼─────────────┤
│  C · 迭代   │  D · 稳态   │
│  每版一层   │  聚焦运维   │
└─────────────┴─────────────┘
```

用户点卡片 → 直达对应 `docs/chapters/00-adoption/mode-x-*.md` 文档。

## 目录

```
docs-site/
├── docusaurus.config.js   站点配置
├── sidebars.js            侧边栏结构
├── package.json
├── src/
│   ├── pages/index.js     首页（4 模式卡片）
│   └── css/custom.css
└── docs/                  符号链接到 ../docs/chapters/
```

## 依赖

本项目用 Docusaurus v3。这是 EP Code AI 仓库内**唯一引入 npm 依赖**的子目录 —— 仅为发布文档站,不影响其他工具的零依赖承诺。
