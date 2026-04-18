// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'EP Code AI',
  tagline: '企业级 AI 研发助手 · 覆盖业务/开发/测试/运维四大场景',
  favicon: 'img/favicon.ico',

  url: 'https://epcode-ai.github.io',
  baseUrl: '/ep-code-ai/',

  organizationName: 'epcode-ai',
  projectName: 'ep-code-ai',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs/chapters',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/epcode-ai/ep-code-ai/tree/main/',
          include: ['**/*.md', '**/*.mdx'],
          exclude: ['**/FULL.md'],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'EP Code AI',
      logo: { alt: 'EP Code AI', src: 'img/logo.svg' },
      items: [
        { type: 'docSidebar', sidebarId: 'main', position: 'left', label: '方法论' },
        { to: '/docs/00-adoption/', label: '接入模式 ⭐', position: 'left' },
        { href: 'https://github.com/epcode-ai/ep-code-ai/blob/main/CHANGELOG.md', label: 'Changelog', position: 'right' },
        { href: 'https://github.com/epcode-ai/ep-code-ai', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '接入模式',
          items: [
            { label: 'A · 绿地', to: '/docs/00-adoption/mode-a-greenfield' },
            { label: 'B · 开发中', to: '/docs/00-adoption/mode-b-mid-dev' },
            { label: 'C · 迭代中', to: '/docs/00-adoption/mode-c-iterating' },
            { label: 'D · 稳态运维', to: '/docs/00-adoption/mode-d-maintenance' },
          ],
        },
        {
          title: '方法论篇章',
          items: [
            { label: '业务篇', to: '/docs/02-business/' },
            { label: '开发篇', to: '/docs/03-development/' },
            { label: '测试篇', to: '/docs/04-testing/' },
            { label: '运维篇', to: '/docs/05-operations/' },
          ],
        },
        {
          title: '资源',
          items: [
            { label: 'GitHub', href: 'https://github.com/epcode-ai/ep-code-ai' },
            { label: 'PLAN', href: 'https://github.com/epcode-ai/ep-code-ai/blob/main/PLAN.md' },
            { label: 'ROADMAP', href: 'https://github.com/epcode-ai/ep-code-ai/blob/main/ROADMAP.md' },
          ],
        },
      ],
      copyright: `MIT © ${new Date().getFullYear()} EP Code AI`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
