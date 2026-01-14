---
title: "创建与切换分支"
description: "掌握 Git 分支操作的核心：使用 git branch 创建指针，以及使用 git switch 在不同工作流之间穿梭。"
---

在 Git 中，分支操作极其轻量。正如我们在上一章所学，创建分支本质上只是**新建了一个指向特定提交的引用（ref）**。

本章我们将学习如何"分裂"出平行宇宙，并在它们之间自由穿梭。

## 1. 新建分支

要创建一个新分支，我们使用 `git branch` 命令。

```bash
git branch feature-login
```

:::caution[关键点]
执行这条命令后，Git **不会**自动切换到新分支！
:::

此时，你仍然停留在原来的分支（通常是 `main`）上。Git 只是在当前的提交对象上打了一个新的标签 `feature-login`。

## 2. 切换分支

创建了分支后，我们需要"跳"过去才能开始在新分支上工作。

### 方式一：经典命令 (git checkout)

在 Git 2.23 版本之前，我们使用 `git checkout` 来切换分支：

```bash
git checkout feature-login
```

`checkout` 是一个"瑞士军刀"般的命令，它既可以用来切换分支，也可以用来恢复文件，甚至用来分离 HEAD。因为功能过于混杂，容易让初学者困惑，所以 Git 社区推出了新的专用命令。

:::note[版本兼容性]
`git switch` 和 `git restore` 是 Git 2.23 新增的命令。如果你使用的是较旧版本的 Git，这些命令可能不存在，请继续使用 `checkout`。
:::

### 方式二：现代命令 (git switch)

从 Git 2.23 (2019年) 开始，推荐使用语义更明确的 `git switch`：

```bash
git switch feature-login
```

这个命令的意思非常直白："切换"到指定分支。我们强烈建议新手使用这个命令。

### 切换时发生了什么？

当你执行切换命令时，Git 会做两件事：
1.  **移动 HEAD 指针**：将 HEAD 指向 `feature-login` 分支。
2.  **更新工作目录**：将你的文件系统瞬间改变为 `feature-login` 分支所指向的那个提交的状态。

## 3. 新建并同时切换

在实际开发中，我们通常希望创建完分支就立即开始工作。Git 提供了快捷方式，让你一步完成"创建"和"切换"。

**经典方式 (`checkout`)**:
使用 `-b` (branch) 参数：
```bash
git checkout -b feature-login
```

**现代方式 (`switch`)**:
使用 `-c` (create) 参数：
```bash
git switch -c feature-login
```

这两条命令的效果是完全一样的：如果分支不存在，就创建它，然后立即切换过去。

## 4. 演示：见证"时空穿梭"

这是新手接触 Git 时最震撼的时刻之一。让我们模拟一下：

1.  在 `main` 分支，你的文件夹里有 `readme.txt`。
2.  创建并切换到新分支 `dev`：
    ```bash
    git switch -c dev
    ```
3.  在 `dev` 分支新建一个文件 `config.json` 并提交：
    ```bash
    # 类 Unix (Linux/macOS/Git Bash):
    touch config.json
    # Windows PowerShell:
    # New-Item -ItemType File config.json
    git add .
    git commit -m "add config file"
    ```
    此时，你的文件夹里有 `readme.txt` 和 `config.json`。
4.  **见证奇迹**：切回 `main` 分支。
    ```bash
    git switch main
    ```
    
**看一眼你的文件夹！** `config.json` 瞬间消失了！

这不是 bug，而是 Git 的核心能力。当你切回 `main` 时，Git 迅速将工作区还原到了 `main` 分支的状态（那时还没有 `config.json`）。当你再次 `git switch dev` 时，文件又会完好无损地回来。

## 5. 游离的 HEAD (Detached HEAD)

除了切换到分支名，你还可以直接切换到某个具体的 Commit ID（哈希值）。

```bash
git checkout a1b2c3d
# 或者
git switch --detach a1b2c3d
```

当你这样做时，你会进入一种叫 **"Detached HEAD" (游离 HEAD)** 的状态。

:::note[这意味着什么？]
此时 HEAD 不再指向任何**分支名**，而是直接指向了一个**提交**。
:::

**后果**：
如果你在这个状态下修改代码并 `commit`，这些新的提交将**不属于任何分支**。一旦你切换回其他分支，刚才写的那些提交就会因为没有分支指针引用而变成"孤魂野鬼"，**可能**在一段时间后被 Git 的垃圾回收机制清除。不过短期内（默认 90 天），这些提交通常仍可通过 `git reflog` 找到并恢复。

**如何挽救？**
如果你不小心在 Detached HEAD 状态下写了重要的代码，可以立即创建一个新分支来"抓住"它们：

```bash
git switch -c new-feature-saved
```

这样，当前的提交就有了一个正式的"名分"（分支名），安全了。
