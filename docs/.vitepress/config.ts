import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitepress';
import { buildGuideSidebar } from './guide-sidebar';
import { buildPikaNetworkApiSidebar } from './pika-network-api-sidebar';
import pkg from '../../package.json';
import typedocSidebar from '../api/typedoc-sidebar.json';

const repoUrl = pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
const guideSidebar = buildGuideSidebar();
const firstGuideLink = guideSidebar[0]?.items?.[0]?.link ?? '/guide/getting-started';
const pikaNetworkApiSidebar = buildPikaNetworkApiSidebar();
const firstPikaNetworkApiLink =
  pikaNetworkApiSidebar[0]?.items?.[0]?.link ?? '/pika-network-api/overview';

export default defineConfig({
  title: 'Craftify',
  description: pkg.description,
  appearance: true,
  cleanUrls: true,
  lastUpdated: true,
  srcDir: '.',
  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('../../src', import.meta.url)),
      },
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#fbf9fd' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: firstGuideLink },
      { text: 'API Reference', link: '/api/' },
      { text: 'HTTP API', link: firstPikaNetworkApiLink },
      {
        text: 'Links',
        items: [
          { text: 'Changelog', link: `${repoUrl}/blob/main/CHANGELOG.md` },
          { text: 'Contributing', link: `${repoUrl}/blob/main/CONTRIBUTING.md` },
          { text: 'npm', link: 'https://www.npmjs.com/package/@kyizl/craftify' },
        ],
      },
    ],

    sidebar: {
      '/guide/': guideSidebar,
      '/api/': [{ text: 'API Reference', collapsed: false, items: typedocSidebar }],
      '/pika-network-api/': pikaNetworkApiSidebar,
    },

    socialLinks: [{ icon: 'github', link: repoUrl }],

    search: { provider: 'local' },

    footer: {
      message: 'Distributed under the MIT License.',
      copyright: `© ${new Date().getFullYear()} kyizl`,
    },

    outline: { level: [2, 3] },
  },

  markdown: {
    theme: { light: 'github-light', dark: 'github-dark' },
  },
});
