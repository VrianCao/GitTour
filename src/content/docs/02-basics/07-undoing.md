---
title: "撤销操作：后悔药的使用指南"
description: "学习如何在 Git 中修正提交信息、取消暂存文件以及丢弃本地修改。"
---

在软件开发过程中，每个人都会犯错：可能提交得太早了，或者不小心暂存了错误的文件，又或者把代码改得一团糟想重头再来。

Git 提供了强大的工具来帮助我们“撤销”这些操作。本章将介绍几种常见的“后悔药”。

## 修正上一次提交

有时候你刚运行完 `git commit`，瞬间就发现遗漏了几个文件没有 add，或者提交信息里有一个显眼的错别字。

此时，你不需要撤销提交再重新来过，只需要使用 `--amend` 选项。

### 修改提交信息

如果你只是想修改**最近一次**的提交信息（而不修改文件内容），可以直接运行：

```bash
git commit --amend
```

这将打开你默认的文本编辑器，里面包含了上一次的提交信息。你可以修改它，保存并退出，Git 会用新的信息替换旧的提交。

### 补救漏掉的文件

如果你提交后发现漏掉了文件（例如 `forgotten_file.js`），可以按以下步骤补救：

```bash
# 1. 暂存漏掉的文件
git add forgotten_file.js

# 2. 修正提交（--no-edit 表示沿用上次的提交信息，不打开编辑器）
git commit --amend --no-edit
```

最终，你的 Git 历史中只会看到**一个**完美的提交，中间那个错误的提交会被覆盖掉。

:::caution[至关重要的警告]
**注意**：Amend 会改变 Commit 的 SHA-1 哈希值，**严禁在已推送的公共分支上使用**，否则会破坏他人的历史。

`amend` 本质上是用一个新的提交替换了旧的提交（哈希值会改变）。如果你已经把旧提交推送到服务器并与他人共享，修改它会导致历史冲突，给团队协作带来噩梦。
:::

---

## 取消暂存的文件 (Unstaging)

假设你修改了两个文件：`README.md` 和 `config.json`。你原本只想提交 `README.md`，却习惯性地运行了 `git add .`，把两个文件都放进了暂存区。

:::caution[避免使用 `git add *`]
不要使用 `git add *` 依赖 shell 通配符——它在不同 shell（PowerShell、CMD、Bash）行为不一致，还会漏掉点文件（如 `.gitignore`）。请使用 `git add .` 或显式指定文件名。
:::

如何把 `config.json` 从暂存区里拿出来，但保留它在工作区的修改呢？

### 使用 git restore (推荐)

在 Git 2.23 版本之后，官方引入了语义更清晰的 `restore` 命令：

```bash
# 将 config.json 移出暂存区
git restore --staged config.json
```

此时运行 `git status`，你会看到 `config.json` 变回了“未暂存以备提交”的状态。

### 使用 git reset (旧版)

在旧版本的教程中，你可能会看到使用 `reset` 命令：

```bash
git reset HEAD config.json
```

这两个命令的效果是一样的，但 `restore --staged` 更容易记忆和理解。

:::note[新仓库尚无提交时]
如果仓库还没有任何提交（unborn HEAD），`git restore --staged` 和 `git reset HEAD` 可能会报错。此时可用 `git rm --cached <file>` 来取消暂存新文件。
:::

---

## 撤销对文件的修改 (Discarding Changes)

这是最“危险”的操作之一，请务必小心。

假设你在 `controller.js` 里写了一堆代码，结果越改越乱，甚至代码都跑不起来了。你决定放弃这一小时的工作，把文件恢复到上一次提交时的样子。

### 使用 git restore (推荐)

同样使用 `restore` 命令，但不加 `--staged` 参数：

```bash
# 将 controller.js 恢复到最近一次提交的状态
git restore controller.js
```

### 使用 git checkout (旧版)

在旧版 Git 中，这个操作通常使用 `checkout`：

```bash
git checkout -- controller.js
```

:::danger[极度危险警告]
**这个操作是不可逆的！**

执行上述命令后，你在 `controller.js` 中所做的所有本地修改都会**瞬间消失**。Git 没有“回收站”，这些未提交的修改一旦被覆盖，就再也找不回来了。

如果你只是想暂时把刚才的修改放到一边，以便看看之前的版本，请考虑使用 **分支 (Branch)** 或 **储藏 (Stash)**（后续章节会讲到），而不是直接撤销。
:::

## 总结

| 场景 | 新版命令 (Git 2.23+) | 旧版命令 | 结果 |
| :--- | :--- | :--- | :--- |
| **改写提交** | `git commit --amend` | 同左 | 修正最近一次提交 |
| **取消暂存** | `git restore --staged <file>` | `git reset HEAD <file>` | 文件保留在工作区，但移出暂存区 |
| **丢弃修改** | `git restore <file>` | `git checkout -- <file>` | **危险**：永久删除工作区修改，不可恢复 |
