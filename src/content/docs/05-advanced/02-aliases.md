---
title: "Git 别名 (Aliases)"
description: "配置 git config 别名，打造高效的命令行工作流。"
---

Git 命令虽然强大，但有些命令确实很长，或者参数组合很复杂。作为一名 Git 高级用户，通过配置别名（Alias）来简化日常操作是提升效率的关键一步。

## 配置别名的方法

Git 别名存储在 `.gitconfig` 文件中。你可以通过命令行设置，也可以直接编辑配置文件。

### 命令行方式

使用 `git config` 命令可以快速添加别名。通常我们需要设置**全局**别名，这样在所有仓库都能使用。

```bash
# 将 'git co' 设置为 'git checkout' 的别名
git config --global alias.co checkout
```

### 配置文件方式

你也可以直接编辑全局配置文件：

```bash
git config --global -e
```

在文件中添加 `[alias]` 部分：

```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
```

## 推荐的实用别名

以下是一份经过实战检验的高效别名清单，建议加入你的配置中。

### 基础缩写

最常用的命令缩写，能为你节省成千上万次击键。

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.cp cherry-pick
```

### 优雅的日志 (`git lg`)

Git 默认的 `git log` 输出信息量较少且不易读。我们可以配置一个极其强大的 `lg` 别名，显示提交图谱、哈希值、时间、作者和提交信息。

:::caution[跨 Shell 兼容性]
在不同的 Shell 环境（Git Bash、zsh、PowerShell、cmd.exe）中，命令行设置别名时的引号处理可能不一致。**推荐直接编辑 `~/.gitconfig` 文件**，使用 INI 格式，这是最稳定可靠的方式。
:::

**推荐方式：直接在 `~/.gitconfig` 中添加**

```ini
[alias]
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit
```

**命令行方式（Git Bash / Linux / macOS）**

```bash
git config --global alias.lg "log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

:::note
如果你使用 Windows PowerShell 或 cmd.exe，命令行的引号转义会非常复杂，建议直接编辑配置文件。
:::

**效果对比：**

使用 `git lg` 后，你将看到一棵色彩分明的提交树，分支合并情况一目了然。这是理解 Git 历史结构的神器。

### 撤销操作 (`git unstage`)

经常不小心 `git add` 了不需要的文件？可以配置一个 `unstage` 命令。

```bash
git config --global alias.unstage "reset HEAD --"
```

用法：`git unstage file.txt`

:::note[这不是回退提交！]
这里使用的是 `git reset` 的**路径形式**（`reset HEAD -- <path>`），它只会将指定文件从暂存区移除，**不会移动 HEAD 指针或改变提交历史**。如果你想了解 `reset` 的完整语义，请参阅 [Reset 揭秘](/05-advanced/06-reset-demystified/)。

**现代替代方案**：Git 2.23+ 引入了更语义化的命令 `git restore --staged <file>`，功能相同但更易理解。
:::

### 查看最后一次提交 (`git last`)

想快速看看刚才提交了什么？

```bash
git config --global alias.last "log -1 HEAD"
```

## 执行外部命令

Git 别名不仅可以是 Git 子命令，还可以执行外部 Shell 命令！只需在别名定义前加 `!`。

例如，定义一个 `git visual` 命令启动可视化工具（如 gitk）：

```bash
git config --global alias.visual "!gitk"
```

## 总结

配置别名是个性化你的 Git 环境的第一步。不要死记硬背别人的配置，根据你自己的使用习惯，把那些每天敲几十遍的命令变成简短的别名。

建议你现在就检查一下自己的 `~/.gitconfig`，看看是否已经拥有了那个能够改变你生活质量的 `git lg`。
