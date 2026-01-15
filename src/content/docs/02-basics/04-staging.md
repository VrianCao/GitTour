---
title: "暂存更改：git add"
description: "详解 git add 命令、暂存区的快照机制以及如何处理文件的多种状态。"
---

在 Git 中，**暂存（Staging）** 是提交代码前最重要的准备工作。如果把 commit 比作“结账下单”，那么 `git add` 就是把商品放入“购物车”的过程。只有放入购物车的更改，才会被包含在下一次提交中。

## 1. 跟踪新文件

当你创建一个新文件时，Git 并不会自动管理它。你需要明确告诉 Git：“请开始跟踪这个文件”。

假设我们创建了一个名为 `README.md` 的新文件：

```bash
echo "# My Project" > README.md
git status
```

Git 会提示该文件处于 **Untracked files**（未跟踪文件）列表中：

```git
Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md
```

使用 `git add` 命令将其添加到暂存区：

```bash
git add README.md
```

再次查看状态，文件变为了 **Changes to be committed**（待提交的更改），也就是通常所说的“绿色状态”。

## 2. 暂存已修改的文件

对于已经被 Git 跟踪的文件（即之前已经 commit 过的文件），当你修改了它们的内容后，Git 会检测到变化。

假设我们修改了 `README.md`：

```bash
echo "这是一个 Git 教程项目" >> README.md
git status
```

此时文件出现在 **Changes not staged for commit**（未暂存以备提交的变更）列表中。这表示 Git 知道文件变了，但还没准备好将其存入下一次快照。

你需要再次运行 `git add`：

```bash
git add README.md
```

:::note[git add 的多义性]
你可能注意到，无论是**新文件**还是**修改过的文件**，我们都使用 `git add`。
*   对于新文件：它的意思是“开始跟踪”。
*   对于已修改文件：它的意思是“将当前的修改放入暂存区”。
:::

## 3. 关键概念：暂存的是“快照”

这是初学者最容易困惑的地方。**Git 暂存的不是文件名，而是你运行命令那一瞬间的文件内容快照。**

让我们通过一个实验来演示这个概念：

### 实验步骤

1.  **修改文件**：我们在 `README.md` 中添加一行文字。
    ```bash
    echo "版本 1：第一次修改" >> README.md
    ```
2.  **暂存文件**：将这次修改放入暂存区。
    ```bash
    git add README.md
    ```
3.  **再次修改**：在提交**之前**，我们立即再次修改同一个文件。
    ```bash
    echo "版本 2：第二次修改" >> README.md
    ```

### 此时的状态

现在运行 `git status`，你会看到一个非常有趣的现象：`README.md` 同时出现在了两个地方！

```git
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   README.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md
```

### 为什么会这样？

*   **Changes to be committed (绿色)**：这里保存的是你在**步骤 2** 运行时 `README.md` 的内容（包含“版本 1”）。
*   **Changes not staged (红色)**：这里反映的是工作区中 `README.md` 的最新状态（包含“版本 2”），与暂存区中内容的差异。

如果你现在执行 `git commit`，**只有“版本 1”会被记录到历史中**，“版本 2”的修改依然留在你的工作区里。

要提交“版本 2”，你需要再次运行 `git add README.md`。

## 4. `git add` 的多重身份

`git add` 是一个多功能命令，根据上下文不同，它的作用也不同：

| 场景 | 作用 |
| :--- | :--- |
| **未跟踪的文件** | 开始跟踪该文件 |
| **已修改的文件** | 将修改更新到暂存区 |
| **合并冲突时** | 标记冲突已解决（Resolve） |

:::tip[一次性添加所有文件]
在项目根目录下，你可以使用以下命令暂存所有变化（包括新文件、修改和删除）：
```bash
git add .
```
建议在仓库根目录运行更直观；若需明确包含全仓库的新增、修改和删除，可用 `git add -A`（语义更清晰）。但请务必先通过 `git status` 确认没有误加不该提交的文件（如日志、临时文件）。
:::

## 5. 进阶预告：交互式暂存

有时候你修改了一个大文件，但只想提交其中的一部分修改（例如修复了一个 Bug，同时又在下面写了点新功能，想分两次提交）。

Git 提供了强大的交互式模式：

*   **`git add -p` (patch)**：Git 会逐块（hunk）向你展示差异，并问你：“要把这一块放入暂存区吗？” (y/n)。

这允许你构建非常精细的原子化提交，我们将在后续的进阶章节中详细介绍。
