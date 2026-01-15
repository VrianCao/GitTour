---
title: "推送到远程仓库"
description: "学习使用 git push 将本地提交上传到远程仓库，包括设置上游分支、处理推送被拒绝的情况，以及强制推送的注意事项。"
---

当你在此本地完成了提交 (commit) 并希望与他人分享或备份代码时，你需要将这些更改**推送 (push)** 到远程仓库。

## 基本推送命令

推送操作显式地将你的本地提交上传到远程仓库。

**常用语法：** `git push <remote> <branch>`

```bash
git push origin main
```

这条命令的意思是："把我的本地 `main` 分支的最新更改，推送到 `origin` 这个远程仓库的 `main` 分支上去。"

:::note[进阶语法]
完整的推送语法是 `git push <remote> <local-ref>:<remote-ref>`，允许你推送到不同名的远程分支：
```bash
# 将本地 feature 分支推送到远程的 dev 分支
git push origin feature:dev
```
如果省略 `:<remote-ref>`，Git 会默认推送到同名分支或上游分支。
:::

## 设置上游分支 (Upstream)

如果你在新建的仓库中第一次推送，或者推送一个新创建的本地分支，你可能会看到这样的错误：

```git
fatal: The current branch main has no upstream branch.
To push the current branch and set the remote as upstream, use

    git push --set-upstream origin main
```

这是因为 Git 不知道你当前的本地分支应该对应远程的哪个分支。你需要使用 `-u` (或 `--set-upstream`) 参数来建立这种**跟踪关系**。

```bash
# 第一次推送并建立跟踪关系
git push -u origin main
```

一旦建立了这种关系（即设置了 Upstream），以后你只需要输入简短的 `git push`，Git 就知道要把当前分支推送到哪里。

:::note[关于 push.default 配置]
默认情况下（Git 2.0+），`push.default` 设为 `simple`，即 `git push` 只会推送当前分支到其上游分支。如果你或团队修改过此配置，行为可能不同。可使用以下命令查看当前设置：
```bash
git config --get push.default
```
:::

:::tip[为什么需要 Upstream?]
设置 Upstream 后，`git status` 还能告诉你当前分支是“领先” (ahead) 还是“落后” (behind) 于远程分支，这对同步工作非常有帮助。
:::

## 推送被拒绝 (Rejected)

有时，你的推送会失败，并提示 `[rejected]`。

```git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '...'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally.
```

**原因**：远程仓库包含了一些你本地没有的提交。这通常是因为你的同事（或你在另一台电脑上）已经向远程分支推送了新代码。

**解决方法**：
根据拒绝原因采取不同措施：

1. **远程有新提交（最常见）**：先获取远程更新，再整合：
   ```bash
   git fetch origin
   # 选择合并或变基：
   git merge origin/main    # 合并方式
   # 或
   git rebase origin/main   # 变基方式（保持线性历史）
   ```
   解决冲突（如有）后，再次 `git push`。

2. **权限不足或分支保护**：检查你是否有该分支的写入权限，或该分支是否启用了保护规则（如要求 PR 审核）。

:::caution[关于强制推送]
你可能会发现 `git push --force` (或 `-f`) 可以强制覆盖远程仓库。**除非你非常清楚自己在做什么（例如在仅自己使用的特性分支上清理历史），否则绝对不要在公共分支（如 main）上使用强制推送**，这会导致其他人丢失代码历史！
:::

## 总结

- `git push <remote> <branch>` 将本地提交上传。
- 使用 `-u` 参数设置上游分支，简化后续命令。
- 如果推送被拒绝，先用 `git fetch` 检查远程状态，再决定 `merge` 还是 `rebase`；如果是权限问题，检查仓库设置。
