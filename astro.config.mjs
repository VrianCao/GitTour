// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://gittour.pages.dev',
	integrations: [
		starlight({
			title: 'GitTour',
			description: '全网最全面的中文 Git 教程，从入门到专家一路打通。',
			logo: { src: './src/assets/gittour-logo.svg', alt: 'GitTour' },
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/VrianCao/GitTour' }],
			editLink: { baseUrl: 'https://github.com/VrianCao/GitTour/edit/master/' },
			lastUpdated: true,
			customCss: ['./src/styles/custom.css'],
			expressiveCode: {
				shiki: {
					langAlias: {
						gitignore: 'shellscript',
					},
				},
			},
			components: { Head: './src/components/Head.astro' },
			sidebar: [
				{ label: '首页', link: '/' },
				{
					label: '01. 入门篇：Git 初相见',
					autogenerate: { directory: '01-getting-started' },
				},
				{
					label: '02. 基础篇：核心操作',
					autogenerate: { directory: '02-basics' },
				},
				{
					label: '03. 进阶篇：分支与合并',
					autogenerate: { directory: '03-branching' },
				},
				{
					label: '04. 协作篇：远程与团队',
					autogenerate: { directory: '04-collaboration' },
				},
				{
					label: '05. 高级篇：重写历史与调试',
					autogenerate: { directory: '05-advanced' },
				},
				{
					label: '06. 原理篇：Git 内部机制',
					autogenerate: { directory: '06-internals' },
				},
				{
					label: '07. 实战篇：工作流与策略',
					autogenerate: { directory: '07-workflows' },
				},
				{
					label: '08. 工具篇：效率与扩展',
					autogenerate: { directory: '08-tools' },
				},
				{
					label: '09. 专家篇：故障排除与维护',
					autogenerate: { directory: '09-maintenance' },
				},
			],
		}),
	],
});
