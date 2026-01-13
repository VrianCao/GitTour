---
title: "推送到远程仓库"
---

当你在此本地完成了提交 (commit) 并希望与他人分享或备份代码时，你需要将这些更改**推送 (push)** 到远程仓库。

## 基本推送命令

推送操作显式地将你的本地提交上传到远程仓库。

**语法：** `git push <远程主机名> <本地分支名>`

```bash
git push origin main
```

这条命令的意思是：“把我的本地 `main` 分支的最新更改，推送到 `origin` 这个远程仓库的 `main` 分支上去。”

## 设置上游分支 (Upstream)

如果你在新建的仓库中第一次推送，或者推送一个新创建的本地分支，你可能会看到这样的错误：

```text
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

:::tip[为什么需要 Upstream?]
设置 Upstream 后，`git status` 还能告诉你当前分支是“领先” (ahead) 还是“落后” (behind) 于远程分支，这对同步工作非常有帮助。
:::

## 推送被拒绝 (Rejected)

有时，你的推送会失败，并提示 `[rejected]`。

```text
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '...'
hint: Updates were rejected because the remote contains work that you do
hint: not have locally.
```

**原因**：远程仓库包含了一些你本地没有的提交。这通常是因为你的同事（或你在另一台电脑上）已经向远程分支推送了新代码。

**解决方法**：
Git 为了防止你覆盖他人的工作，强制要求你**先拉取 (pull)** 远程的变更，在本地合并解决冲突后，才能再次推送。

1. `git pull origin main` (拉取并合并)
2. 解决冲突（如果有）
3. `git commit`
4. `git push origin main`

:::caution[关于强制推送]
你可能会发现 `git push --force` (或 `-f`) 可以强制覆盖远程仓库。**除非你非常清楚自己在做什么（例如在仅自己使用的特性分支上清理历史），否则绝对不要在公共分支（如 main）上使用强制推送**，这会导致其他人丢失代码历史！
:::

## 总结

- `git push <remote> <branch>` 将本地提交上传。
- 使用 `-u` 参数设置上游分支，简化后续命令。
- 如果推送被拒绝，通常意味着你需要先 `git pull` 同步远程的变更。
