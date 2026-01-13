---
title: "提交更新"
description: "学习如何使用 git commit 将暂存区的更改永久保存到仓库历史中，并掌握提交信息的编写规范。"
---

如果说 `git add` 是将商品放入购物车，那么 `git commit` 就是结账付款。只有执行了提交命令，你的更改才会被 Git 永久记录下来，成为项目历史的一部分。

## 提交前的最后确认

在正式提交之前，养成一个好习惯：**永远先运行一次 `git status`**。

```bash
git status
```

这一步是为了确认：
1.  **所有**你想提交的文件都已经绿了吗？（在 "Changes to be committed" 下）
2.  有没有**不小心**放进去的配置文件或临时文件？
3.  还有没有什么修改被遗漏在红色的 "Changes not staged for commit" 区域？

## 基本提交：使用编辑器

最基础的提交命令是不带任何参数的：

```bash
git commit
```

当你输入这条命令并回车后，Git 会自动打开你系统中默认的文本编辑器（通常是 Vim, Nano 或 VS Code）。

编辑器中通常会包含这样的默认信息（以 `#` 开头的行是注释，不会被包含在提交信息中）：

```text
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch main
# Changes to be committed:
#	new file:   README.md
#	modified:   app.js
#
```

### 为什么使用编辑器？
对于复杂的修改，你可能需要写多行描述来解释**为什么**做这些改动。编辑器允许你从容地编写详细的文档级提交信息。

## 快捷提交：一行搞定

对于日常的小修小补，如果你的描述很简短，可以直接使用 `-m` (message) 选项：

```bash
git commit -m "fix: 修复登录页面的排版错误"
```

:::caution
如果你的提交信息中包含空格（通常都会有），**必须**使用引号将信息括起来。
:::

## 跳过暂存区：一键提交

觉得先 `add` 再 `commit` 太繁琐？如果你确定**所有**已跟踪文件的修改都要提交，可以使用 `-a` (all) 选项。

```bash
git commit -a -m "chore: 更新所有配置文件"
```

或者合并参数：

```bash
git commit -am "chore: 更新所有配置文件"
```

这个命令会自动把所有**已经跟踪过**（Tracked）且**被修改**的文件加入暂存区并提交。

:::danger[风险警告]
**慎用此命令！**
`git commit -a` 非常方便，但也非常危险。它会不分青红皂白地提交所有修改过的文件。如果你在调试过程中为了方便修改了某个配置文件，或者加了一些临时的 `console.log`，使用这个命令会将这些不想提交的脏代码一并带入版本库。
**注意**：它不会自动添加**新建的**（Untracked）文件。
:::

## 提交规范：如何写好 Commit Message

提交信息（Commit Message）是写给人看的，不是写给机器看的。清晰的提交记录能让团队协作效率倍增，也能让你在未来回溯代码时不再头秃。

### 信息的结构
一个标准的提交信息通常包含两部分：**标题 (Subject)** 和 **正文 (Body)**。

```text
feat: 添加用户头像上传功能 (这是标题)

- 使用新的 upload-api 接口
- 支持 jpg, png 格式
- 限制文件大小为 2MB
(这是正文，与标题空一行)
```

### 行业标准：Conventional Commits
目前社区最流行的是 **[Conventional Commits (约定式提交)](https://www.conventionalcommits.org/zh-hans/)** 规范。格式如下：

`<类型>(<范围>): <描述>`

常用的**类型 (Type)** 包括：

| 类型 | 含义 | 示例 |
| :--- | :--- | :--- |
| **feat** | 新功能 (Feature) | `feat: 增加暗黑模式切换开关` |
| **fix** | 修复 Bug | `fix: 解决移动端导航栏无法点击的问题` |
| **docs** | 文档变更 | `docs: 更新 README 安装指南` |
| **style** | 格式调整 (不影响代码运行) | `style: 调整代码缩进，删除多余空行` |
| **refactor** | 代码重构 (既不修复 bug 也不加功能) | `refactor: 优化购物车计算逻辑` |
| **test** | 测试代码 | `test: 补充用户注册模块的单元测试` |
| **chore** | 构建过程或辅助工具变动 | `chore: 升级依赖包版本` |

:::tip[小贴士]
编写提交信息时，请尽量使用**祈使句**（例如 "Fix bug" 而不是 "Fixed bug"），并保持简明扼要。
:::
