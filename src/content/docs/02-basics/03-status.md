---
title: "检查状态与忽略文件"
description: "深入理解 git status 输出，掌握 .gitignore 匹配规则，学会管理不需要版本控制的文件。"
---

在之前的章节中，我们学习了 Git 的生命周期（工作区、暂存区、仓库）。在实际开发中，我们最频繁使用的命令非 `git status` 莫属。它就像汽车的仪表盘，随时告诉你仓库当前的情况。

本节我们将深入解读状态信息，并学习如何通过 `.gitignore` 让 Git “无视”某些特定的文件。

## 读懂 git status

当你运行 `git status` 时，Git 会扫描你的工作目录，并与暂存区及最新提交（HEAD）进行对比。输出通常分为三类信息：

### 1. Changes to be committed (已暂存的修改)
这部分显示的是**绿字**（在大多数终端中）。这些文件已经执行过 `git add`，准备好被提交了。

```bash
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
    new file:   README.md
    modified:   app.js
```

### 2. Changes not staged for commit (未暂存的修改)
这部分显示的是**红字**。这些文件在工作区被修改了，但还没有添加到暂存区。如果你现在执行 `git commit`，这些修改**不会**被包含进去。

```bash
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
    modified:   config.yaml
```

### 3. Untracked files (未跟踪的文件)
这部分也是**红字**。这些是 Git 之前从未见过的文件（新创建的）。除非你显式地 `add` 它们，否则 Git 不会开始跟踪它们的历史。

```bash
Untracked files:
  (use "git add <file>..." to include in what will be committed)
    logs/debug.log
    temp/
```

:::tip[提示]
如果你觉得 `git status` 的输出太长，可以使用简短模式：
```bash
git status -s
```
输出会变得非常紧凑：
- `??` : 未跟踪文件
- `A ` : 已添加到暂存区 (Added)
- `M ` : 文件被修改 (Modified)
:::

:::note[MM 状态详解]
你可能会遇到 `MM` 这样的双重标记，这表示文件**既被暂存（左侧 M），在工作区又被修改（右侧 M）**。

这种情况通常发生在：你修改了文件 → `git add` 暂存 → 再次修改了同一文件。

实际演示：
```bash
# 1. 修改文件并暂存
echo "第一处修改" >> test.txt
git add test.txt

# 2. 再次修改同一文件（暂存后修改）
echo "第二处修改" >> test.txt

# 3. 查看紧凑状态
git status -s
# 输出：MM test.txt
#      ^ ^
#      | └─ 工作区被修改（暂存后又有新改动）
#      └── 已暂存（第一次修改在暂存区）
```
:::

## 忽略文件 (.gitignore)

在开发过程中，总有一些文件是我们**不想**提交到 Git 仓库的：
- **编译产物**：如 Java 的 `.class`，Python 的 `__pycache__`，Node.js 的 `dist/` 文件夹。
- **依赖包**：如庞大的 `node_modules/` 文件夹（它们应该通过 `package.json` 管理）。
- **系统文件**：如 macOS 的 `.DS_Store` 或 Windows 的 `Thumbs.db`。
- **敏感配置**：如包含 API 密钥的 `.env` 文件。

为了让 `git status` 保持清爽，避免误提交这些垃圾文件，我们需要配置 `.gitignore`。

### 创建 .gitignore

在项目的**根目录**下创建一个名为 `.gitignore` 的纯文本文件。Git 会自动读取这个文件中的规则。

### Glob 模式匹配规则

`.gitignore` 使用标准的 **Glob 模式**来匹配文件路径。以下是核心语法：

| 符号 | 含义 | 示例 | 解释 |
| :--- | :--- | :--- | :--- |
| **`#`** | 注释 | `# 这是一个注释` | 被 Git 忽略的行 |
| **`*`** | 零个或多个字符 | `*.log` | 忽略所有以 `.log` 结尾的文件 |
| **`?`** | 单个字符 | `access?.log` | 匹配 `access1.log` 但不匹配 `access10.log` |
| **`[]`** | 范围匹配 | `image.[png]` | 匹配 `image.p`, `image.n`, `image.g` (注意通常写为 `*.[png]` 等组合) <br> 更常见用法：`image.[a-z]` |
| **`/` (开头)** | 防止递归 | `/TODO` | 忽略根目录下的 `TODO` 文件，但不忽略 `docs/TODO` |
| **`/` (结尾)** | 指明目录 | `build/` | 忽略 `build` 目录下的所有内容 |
| **`!`** | 取反 (不忽略) | `!important.log` | 即使前面写了 `*.log`，也要强制跟踪这个文件 |
| **`**`** | 跨目录匹配 | `src/**/*.css` | 匹配 `src/a.css`, `src/b/c.css` 等 |

### 典型的 .gitignore 模板

一个标准的 Web 前端项目 `.gitignore` 可能长这样：

```gitignore
# 依赖目录 (由包管理器安装)
node_modules/
pnpm-lock.yaml

# 构建产出
dist/
build/

# 环境变量 (包含敏感信息，绝不提交！)
.env
.env.local

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# IDE 配置 (视团队规范而定，通常建议忽略)
.vscode/
.idea/
```

:::caution[规则不生效？]
`.gitignore` **只对未被 Git 跟踪（Untracked）的文件有效**。
如果一个文件已经被提交到了仓库里，再把它加入 `.gitignore` 是不会自动删除它的。你需要先从暂存区移除它：
`git rm --cached <文件名>`
:::

## 状态的局限性

虽然 `git status` 非常有用，但它有一个明显的局限性：它只能告诉你**哪些文件**变了，却不能告诉你**文件里具体改了哪一行代码**。

比如，它会告诉你 `app.js` 被修改了（modified），但你可能已经忘了你是改了一个变量名，还是重写了整个函数。

为了查看具体的代码差异，我们需要使用下一节将要介绍的命令 —— `git diff`。
