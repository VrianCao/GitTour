# GitTour 智能体操作指南

本文档为在 GitTour 仓库工作的 AI 智能体（Cursor, Copilot 等）提供指令和上下文。

## 1. 项目目标与现状 (Project Goals & Status)

### 1.1 核心目标
打造全网最全面的中文 Git 教程，涵盖从**入门**到**进阶**再到**专业**的全流程指南。
- **内容规模**: 总字数不少于 **20万字**。
- **覆盖范围**: 基础操作、底层原理、工作流策略、高级维护、工具链扩展。
- **质量标准**: 逻辑清晰、图文并茂（Mermaid/截图）、实战导向。

### 1.2 当前现状 (Current Status)
- **基础设施**: [已完成] Astro + Starlight 站点搭建完毕，配置已本地化（中文）。
- **内容架构**: [已完成] 9大核心模块（01-09）目录结构已建立。
- **文档状态**: [进行中]
  - **模块 01-03** (入门/基础/分支): [已完成] 19 篇文档已完整撰写并经过三次审查打磨。
  - **模块 04-09**: [待填充] 仅包含 Frontmatter，正文为空。
- **当前阶段**: **第二阶段内容填充 (Phase 2 Content Filling)**。

### 1.3 执行计划 (Plan)
智能体需按照以下优先级推进工作：

#### 第一阶段：核心基础填充 (优先级：最高)
- [x] **01-getting-started**: 完善 Git 历史、安装与初始化配置。
- [x] **02-basics**: 详解 add, commit, status, diff 等核心命令。
- [x] **03-branching**: 编写分支创建、合并及冲突解决机制。

#### 第二阶段：协作与进阶 (优先级：高)
- [x] **04-collaboration**: 远程仓库交互、GitHub PR 流程。
- [x] **05-advanced**: 深入 Rebase, Cherry-pick, Reset 及历史重写。

#### 第三阶段：原理与生态 (优先级：中)
- [ ] **06-internals**: 解释 .git 目录结构、对象模型 (Blob/Tree/Commit)。
- [ ] **07-workflows**: 对比 Gitflow, Trunk-based 等工作流。
- [ ] **08-tools** & **09-maintenance**: 工具链配置与仓库维护。

#### 第四阶段：润色与可视化 (持续进行)
- [ ] 为复杂概念添加 Mermaid 流程图。
- [ ] 补充实战代码示例与 CLI 输出截图占位符。

---

## 2. 项目概览与环境

- **框架**: Astro 5.x + Starlight
- **语言**: TypeScript, Markdown/MDX, Astro
- **包管理器**: pnpm (检测到 `pnpm-lock.yaml`)
- **Node 版本**: LTS (推荐)
- **根目录**: `C:\Users\User\Code\GitTour`

### 关键目录
- `src/content/docs/`: **主要工作区**。包含所有教程内容（Markdown 文件）。
- `src/assets/`: 图片和静态资源。
- `astro.config.mjs`: 主配置文件（侧边栏、Starlight 选项）。
- `public/`: 根路径服务的静态文件。

---

## 3. 操作命令

智能体必须使用以下命令验证工作成果。

### 安装
在开始复杂任务前，始终确保依赖是最新的。
```bash
pnpm install
```

### 开发服务器
启动本地服务器预览更改：
```bash
pnpm dev
```
*注意：智能体通常无法查看 localhost，除非另有指示，否则请依赖构建检查。*

### 验证 (构建与测试)
由于这是一个内容站点，主要的“测试”是成功的构建。这会检查死链接、无效的 Frontmatter 和编译错误。
**在修改配置或代码后，务必运行此命令。**

```bash
pnpm build
```

如果将来可用 `astro check`，请用于类型检查。目前，请依赖 `pnpm build`。

---

## 4. 代码风格与规范

### 4.1 内容规范 (Markdown/MDX)
本仓库的核心是文档。

- **文件命名**: 所有内容文件使用 `kebab-case`（例如 `01-getting-started.md`）。
- **目录结构**: 保持编号的目录结构（例如 `01-getting-started/`, `02-basics/`）以保留模块顺序。
- **Frontmatter (前言)**:
  `src/content/docs` 中的每个 `.md` 或 `.mdx` 文件 **必须** 包含有效的 YAML Frontmatter。
  ```yaml
  ---
  title: "清晰、描述性的标题"
  description: "可选的 SEO 摘要"
  # sidebar:
  #   order: 1 # 可选：特定的排序覆盖
  ---
  ```
- **标题**: 正文从 H2 (`##`) 开始。H1 保留给 Frontmatter 中定义的页面标题。
- **链接**:
  - 内部导航首选相对链接（例如 `[链接](../02-basics/01-repo.md)`）。
  - 外部链接应使用 HTTPS。

### 4.2 Starlight 特性
利用 Starlight 的内置组件提升文档体验：

- **提示块 (Asides/Admonitions)**:
  用于注释、提示和警告。
  ```markdown
  :::note
  这是一个提示。
  :::
  :::caution
  执行此命令时请小心。
  :::
  ```
- **代码块**:
  始终指定语言以进行语法高亮。
  ```bash
  git commit -m "feat: add new tutorial"
  ```
- **选项卡 (Tabs)**:
  如果适用，使用 `<Tabs>` 组件展示不同操作系统（Win/Mac/Linux）的命令。

### 4.3 TypeScript & Astro
- **严格模式**: `tsconfig.json` 继承自 `astro/tsconfigs/strict`。尽可能确保显式类型。
- **导入**: 使用 ESM 语法。
  ```typescript
  import { defineConfig } from 'astro/config';
  ```
- **组件**: 组件文件名应为 `PascalCase.astro`。

---

## 5. 工作流与安全

### 5.1 修改配置 (`astro.config.mjs`)
- 侧边栏配置为从目录 **自动生成 (autogenerate)**。
- 添加新的顶级部分时，必须更新 `astro.config.mjs` 中的 `sidebar` 数组。
- **不要** 手动在配置中列出每个文件，除非有特殊要求；请依赖 `autogenerate: { directory: '...' }`。

### 5.2 错误处理
- **构建失败**: 如果 `pnpm build` 失败，请重点检查控制台输出中的：
  - **Frontmatter 错误**: 缺少标题或无效的 YAML 缩进。
  - **死链接**: 引用了不存在的文件。
  - **图片路径**: 确保引用的资源存在于 `src/assets` 或 `public` 中。

### 5.3 Git 最佳实践 (智能体)
- **提交信息**: 遵循 Conventional Commits（例如 `docs: add chapter on rebase`, `fix: correct typo in intro`）。
- **原子更改**: 如果可能，不要在一步操作中混合配置更改和大量内容更新。

---

## 6. 智能体行为准则

1.  **先读后写**: 在编辑文件之前，始终先读取它以了解上下文和现有模式。
2.  **杜绝幻觉**: 不要编造已安装的 Starlight 版本中不存在的 Astro 配置选项。
3.  **保留结构**: 不要删除 `src/content/docs` 文件夹结构。它是教程的骨架。
4.  **绝对路径**: 使用文件工具时，始终解析为项目根目录的绝对路径（例如 `C:\Users\User\Code\GitTour\...`）。
5.  **语言要求**: 本教程的目标语言是 **简体中文**。确保所有生成的内容都是中文，除非是代码或通常保留英文的标准术语（如 "Commit", "Push"，但在首次使用时通常翻译为 "提交", "推送" 并附带英文括号）。

## 7. 测试细节

由于没有配置单元测试套件（如 Vitest），“运行单个测试”实际上意味着验证特定页面是否正确渲染或构建是否通过。

要验证特定内容文件是否有效：
1. 确保 Frontmatter 是有效的 YAML。
2. 运行 `pnpm build`。
3. 如果构建成功，则内容在技术上是有效的。

---
*指令结束*
