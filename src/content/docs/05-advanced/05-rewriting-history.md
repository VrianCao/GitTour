---
title: "重写历史：Amend 与 Interactive Rebase"
description: "学会如何优雅地修改提交历史。掌握 git commit --amend 和交互式变基，以及绝对不能打破的黄金法则。"
---

Git 的一大魅力在于它允许你在将代码分享给他人之前，打磨你的提交历史。你可以修改提交信息、合并琐碎的提交、甚至重新排序。这让你的项目历史读起来像一本精心编排的书，而不是草稿纸。

:::danger[黄金法则]
**永远不要重写已经推送到公共仓库（如 GitHub/GitLab）的共享分支历史！**

如果你修改了其他人正在使用的分支历史，他们的代码库将会陷入混乱（产生分叉），你会被同事"追杀"。重写历史的操作仅限于**本地尚未推送**的提交。
:::

:::note[例外情况]
在以下场景下，重写已推送的历史是**可接受的**（但仍需谨慎）：
- **个人功能分支**：如果这是只有你一个人工作的 PR 分支，且团队流程允许，可以在推送前整理历史。
- **团队明确同意**：在 Code Review 后需要 squash 或 rebase 时，与团队沟通后进行。
- **必须强推时**：优先使用 `git push --force-with-lease` 而非 `--force`。`--force-with-lease` 会在远程分支被他人更新时拒绝推送，提供额外的安全保护。
:::

## 1. 修正最近一次提交：`--amend`

这是最简单的重写历史操作。场景：你刚提交完，发现有个拼写错误，或者漏了一个文件没 `add`。

```bash
# 1. 做出修改（如修复 typo，或 git add 漏掉的文件）
git add .

# 2. 运行 amend
git commit --amend
```

这将打开编辑器让你修改提交信息。如果你不想修改信息，只想合并改动：

```bash
git commit --amend --no-edit
```

**结果**：旧的提交被一个新的提交（不同的 Hash）替换了。看起来就像那个错误从未发生过一样。

## 2. 交互式变基：`rebase -i`

当你想修改**更早**的提交，或者**多个**提交时，交互式变基（Interactive Rebase）是你的瑞士军刀。

假设你的提交历史是这样的：

```text
HEAD     -> feat: finish login page
HEAD~1   -> fix: typo in login css
HEAD~2   -> wip: login page structure
HEAD~3   -> docs: update readme
```

你想把最近的 3 个提交合并成一个整洁的“feat: implement login page”。

### 2.1 启动

```bash
# 变基最近的 3 个提交
git rebase -i HEAD~3
```

### 2.2 编辑剧本

Git 会打开一个编辑器，显示类似下面的内容：

```text
pick 1a2b3c wip: login page structure
pick 4d5e6f fix: typo in login css
pick 7a8b9c feat: finish login page

# Rebase ... onto ...
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# d, drop = remove commit
```

在这个界面中，你就像导演一样编排历史。为了合并提交，我们将后两个改为 `squash` (或 `s`)：

```text
pick 1a2b3c wip: login page structure
s 4d5e6f fix: typo in login css
s 7a8b9c feat: finish login page
```

### 2.3 完成变基

保存并关闭编辑器。Git 会开始重放这些提交。因为选择了 `squash`，它会再次暂停，让你合并这三个提交的信息。

你可以将其修改为：
```text
feat: implement login page

- Build structure
- Fix styles
- Finalize logic
```

保存后，历史就变成了：
```text
HEAD     -> feat: implement login page (原本的3个变成这1个)
HEAD~1   -> docs: update readme
```

## 3. 常用指令详解

在 `rebase -i` 界面中：

- **pick (p)**: 保留该提交，不做修改。
- **reword (r)**: 保留提交内容，但修改提交信息（Message）。
- **edit (e)**: 暂停变基过程，让你在这个特定的提交上做修改（如拆分提交）。改完后运行 `git rebase --continue`。
- **squash (s)**: 将此提交与**上一个**提交合并，并保留日志信息。
- **fixup (f)**: 将此提交与**上一个**提交合并，但**丢弃**日志信息（适合修补琐碎的 bug）。
- **drop (d)**: 直接删除该提交。

## 4. 如果搞砸了怎么办？

变基过程中如果遇到冲突解决不了，或者操作失误，随时可以中止：

```bash
git rebase --abort
```

这会将你的仓库恢复到变基开始前的状态，安全无痛。

## 5. 总结

- **`git commit --amend`**：用于快速修复最近的一次提交。
- **`git rebase -i`**：用于整理一系列提交（合并、排序、重命名）。
- **安全第一**：只修改本地的、私有的历史。一旦 Push，就当作泼出去的水。
