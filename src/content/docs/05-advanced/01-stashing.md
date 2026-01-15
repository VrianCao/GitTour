---
title: "储藏与清理 (Stashing)"
description: "使用 git stash 暂存未完成的修改，实现高效的上下文切换。"
---

在开发过程中，我们经常会遇到这样的场景：你正在为一个新功能编写代码，突然接到一个紧急 Bug 修复任务，必须立即切换到另一个分支。但你当前的工作目录中还有未提交的修改，而且这些修改还不够完整，不能创建一个 Commit。

这时，`git stash`（储藏）就是你的救星。

## 什么是储藏 (Stashing)？

`git stash` 会处理工作目录的脏状态（即被追踪文件的修改和暂存区的修改），将它们保存到一个未完成变更的栈中，您可以随时重新应用这些变更。

简单来说，它就像按下“暂停”键，把你当前乱糟糟的工作台（工作目录）清理干净，保存到后台，等你处理完急事（切换分支修复 Bug）后，再按“恢复”键，把工作台还原。

## 基本用法

### 保存当前进度

要储藏当前的修改，只需运行：

```bash
git stash
```

或者为了更清晰，给这次储藏加个备注：

```bash
git stash push -m "正在开发用户登录功能，暂停修Bug"
```

执行后，**被追踪文件**的修改会被储藏，工作目录中这部分变得干净。但需要注意：**默认情况下，`git stash` 不会储藏未追踪文件（untracked files）和被忽略的文件**，它们仍会留在工作区。如果你需要储藏所有内容，请参阅下方"进阶技巧"章节。

### 查看储藏列表

你可以多次储藏修改。使用以下命令查看储藏栈：

```bash
git stash list
```

输出示例：
```git
stash@{0}: On feature-login: 正在开发用户登录功能，暂停修Bug
stash@{1}: On main: 之前的临时修改
```

### 恢复储藏

当你处理完其他任务回到这个分支，想要恢复之前的进度时，有两种主要方式：

#### 1. 应用并保留 (`apply`)

如果你想应用最近一次的储藏，但**不从栈中删除**它（比如你想把它应用到多个分支）：

```bash
git stash apply
```

如果要应用指定的某次储藏（例如 `stash@{2}`）：

```bash
git stash apply stash@{2}
```

#### 2. 应用并删除 (`pop`)

这是最常用的方式。它会应用最近一次储藏，并在应用成功后**自动从栈中移除**：

```bash
git stash pop
```

:::tip
通常建议使用 `git stash pop`，因为它可以保持储藏栈的整洁，避免堆积过多的临时状态。
:::

### 删除储藏

如果你决定不再需要某次储藏的内容，可以手动删除它：

:::danger[不可逆操作]
`git stash drop` 和 `git stash clear` 是**不可逆操作**！一旦删除，储藏的内容通常无法找回（不像 commit 可以通过 reflog 恢复）。执行前请确保你不再需要这些内容。
:::

```bash
# 删除最近一次
git stash drop

# 删除指定的一次
git stash drop stash@{0}

# 清空所有储藏
git stash clear
```

## 进阶技巧

### 包含未追踪的文件

默认情况下，`git stash` 只会储藏**被追踪**（tracked）的文件。如果你新增了文件但还没 `git add`，它们不会被储藏。

要强制储藏包括未追踪文件（untracked files）在内的所有修改：

```bash
git stash -u
# 或者
git stash --include-untracked
```

如果你甚至需要储藏被 `.gitignore` 忽略的文件（如构建产物、临时缓存），使用：

```bash
git stash -a
# 或者
git stash --all
```

:::tip[区别总结]
| 命令 | 被追踪文件 | 未追踪文件 | 被忽略文件 |
| :--- | :---: | :---: | :---: |
| `git stash` | ✅ | ❌ | ❌ |
| `git stash -u` | ✅ | ✅ | ❌ |
| `git stash -a` | ✅ | ✅ | ✅ |
:::

### 储藏特定文件

如果你只想储藏某个特定文件的修改，而不是整个工作目录：

```bash
git stash push -m "只储藏配置文件" path/to/config.json
```

## 最佳实践：上下文切换

最常见的工作流如下：

1.  **开发中途被打断**：
    ```bash
    git stash push -m "WIP: feature X"
    ```
2.  **切换分支修复 Bug**：
    ```bash
    git checkout main
    git pull
    git checkout -b hotfix-urgent
    # ... 修复 Bug, 提交, 推送 ...
    ```
3.  **回到原分支继续开发**：
    ```bash
    git checkout feature-X
    git stash pop
    ```

通过熟练使用 `git stash`，你可以保持 Git 历史的整洁（避免产生大量无意义的 "WIP" 提交），同时在多任务并行时游刃有余。
