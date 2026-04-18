import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';

const MODES = [
  {
    id: 'a',
    icon: '🌱',
    title: 'A · 绿地项目',
    subtitle: '从零建,全套上车',
    desc: '项目刚立项,团队愿意从 Day 1 走规范。推荐路径: 产品写 PRD → 测试做可测性评审 → 开发写 ADR → ...',
    href: '/docs/adoption/mode-a-greenfield',
  },
  {
    id: 'b',
    icon: '🔧',
    title: 'B · 开发中项目',
    subtitle: '从现在追溯补齐',
    desc: '代码已开始写未上线。不追溯历史,从今天开始按规范 + 补齐 3-5 个核心 PRD。',
    href: '/docs/adoption/mode-b-mid-dev',
  },
  {
    id: 'c',
    icon: '🔄',
    title: 'C · 迭代中项目',
    subtitle: '每版本一层',
    desc: '已上线定期迭代,流程成熟但和本框架不同。分 5 迭代渐进嵌入,每版本加一层。',
    href: '/docs/adoption/mode-c-iterating',
  },
  {
    id: 'd',
    icon: '🏛️',
    title: 'D · 稳态运维',
    subtitle: '聚焦运维场景',
    desc: '项目运行 1 年+,只做 bug 修复小优化。只用运维篇 + 最小开发规范,其他不强求。',
    href: '/docs/adoption/mode-d-maintenance',
  },
];

export default function Home() {
  return (
    <Layout title="EP Code AI · 首页" description="企业级 AI 研发助手">
      <header style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--ifm-color-primary-lightest)' }}>
        <h1 style={{ fontSize: '3rem' }}>EP Code AI</h1>
        <p style={{ fontSize: '1.25rem', maxWidth: 700, margin: '1rem auto' }}>
          企业级 AI 研发助手 · 覆盖 <b>业务 · 开发 · 测试 · 运维</b> 四大场景的 Claude Code 增强生态
        </p>
        <div>
          <Link className="button button--primary button--lg" to="/docs/adoption/">
            5 分钟判定你的接入模式 →
          </Link>
          &nbsp;&nbsp;
          <Link className="button button--secondary button--lg" to="/docs/overview/">
            查看方法论总览
          </Link>
        </div>
      </header>

      <main>
        <section style={{ padding: '3rem 1rem', maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>按项目阶段选接入模式</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {MODES.map((m) => (
              <Link
                key={m.id}
                to={m.href}
                style={{
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  borderRadius: 12,
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'var(--ifm-background-surface-color)',
                  transition: 'transform .2s, box-shadow .2s',
                }}
                className="mode-card"
              >
                <div style={{ fontSize: '2.5rem' }}>{m.icon}</div>
                <h3 style={{ margin: '0.5rem 0' }}>{m.title}</h3>
                <div style={{ color: 'var(--ifm-color-primary)', fontWeight: 600 }}>{m.subtitle}</div>
                <p style={{ marginTop: '0.75rem', color: 'var(--ifm-color-emphasis-700)' }}>{m.desc}</p>
                <div style={{ color: 'var(--ifm-color-primary)' }}>阅读详情 →</div>
              </Link>
            ))}
          </div>
        </section>

        <section style={{ padding: '3rem 1rem', textAlign: 'center', background: 'var(--ifm-color-emphasis-100)' }}>
          <h2>快速开始</h2>
          <pre style={{ textAlign: 'left', maxWidth: 600, margin: '1rem auto', padding: '1rem', background: '#272822', color: '#f8f8f2', borderRadius: 8 }}>
{`# 全局安装 CLI（或用 npx）
npx epcode --help

# 绿地项目
npx epcode init --mode=A --name=my-project

# 校验 PRD
npx epcode prd docs/prd/v1.0.md

# 生成度量看板
npx epcode metrics --since "7 days ago"`}
          </pre>
        </section>
      </main>
    </Layout>
  );
}
