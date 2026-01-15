---
title: "分支管理"
description: "学会如何高效地查看、筛选、删除和重命名 Git 分支，保持仓库整洁。"
---

随着项目的推进，你的仓库中可能会积累大量的分支。学会有效地管理这些分支——查看状态、清理旧分支以及重命名——是保持项目整洁的关键技能。

## 查看分支

最基础的命令是 `git branch`，它用于列出、创建或删除分支。

### 列出本地分支

不带任何参数运行时，它会列出所有本地分支，并用星号 (`*`) 标记当前所在的分支。

```bash
git branch
```

输出示例：

```git
  feature-login
* main
  bugfix-header
```

### 查看远程和所有分支

如果你的项目关联了远程仓库（如 GitHub、GitLab），你需要查看远程分支的状态。

*   **查看远程分支**：使用 `-r` (remote) 选项。
    ```bash
    git branch -r
    ```
*   **查看所有分支**：使用 `-a` (all) 选项，同时列出本地和远程分支。
    ```bash
    git branch -a
    ```

:::note[远程跟踪分支]
`-r` 和 `-a` 显示的是**远程跟踪分支**（remote-tracking branches），它们是你本地仓库中对远程分支的缓存引用，并非实时的远程状态。如果远程已删除某个分支，你本地可能仍然看到它，直到执行 `git fetch --prune` 或 `git remote prune origin` 清理。
:::

### 查看分支详情

如果想知道每个分支最后一次提交的信息，可以使用 `-v` (verbose) 选项。

```bash
git branch -v
```

输出示例：

```git
  feature-login 1a2b3c4 Add login form validation
* main          9f8e7d6 Merge pull request #42
  bugfix-header 5b6f7a8 Fix css alignment issue
```

:::tip
使用 `-vv` 选项可以查看本地分支与远程分支的追踪关系（Upstream），这对于检查是否落后于远程非常有用。
:::

## 筛选分支

在清理分支之前，通常需要确认哪些分支已经完成了使命（已合并），哪些还在开发中（未合并）。

### 查看已合并分支

列出所有已经合并到当前分支的分支。这些分支通常可以安全删除。

```bash
git branch --merged
```

### 查看未合并分支

列出尚未合并到当前分支的分支。

```bash
git branch --no-merged
```

:::caution
在 `git branch --no-merged` 列表中的分支包含了未并入当前历史的工作。如果直接删除它们，你可能会丢失代码。
:::

## 删除分支

当一个功能开发完成并合并到主分支后，或者你决定放弃某个实验性功能时，应该删除对应的分支以保持仓库整洁。

### 安全删除

使用 `-d` (delete) 选项可以安全地删除分支。Git 会检查该分支是否已 **fully merged**（完全合并）到 HEAD 或其 upstream 分支。如果是，则允许删除；否则，Git 会拒绝删除并报错，需要使用 `-D` 强制删除。

```bash
git branch -d feature-login
```

如果分支未合并，你会看到类似这样的错误：

```git
error: The branch 'feature-login' is not fully merged.
If you are sure you want to delete it, run 'git branch -D feature-login'.
```

### 强制删除

如果你确定要丢弃某个分支的所有改动（例如一个失败的实验），可以使用 `-D` 选项强制删除。这等同于 `--delete --force`。

```bash
git branch -D experiment-fail
```

## 重命名分支

有时候你会发现分支名字起得不够准确，或者有拼写错误，这时可以使用 `-m` (move/rename) 选项。

### 重命名当前分支

如果你已经检出（checkout）到了该分支：

```bash
git branch -m new-branch-name
```

### 重命名指定分支

如果你在其他分支上，想要重命名另一个分支：

```bash
git branch -m old-name new-name
```

:::note[关于远程分支]
上述命令只会重命名**本地**分支。如果你已经将旧名字的分支推送到远程，重命名会变得稍微复杂一些：你需要删除远程的旧分支，然后推送改名后的新分支，并重新设置追踪关系。
:::
