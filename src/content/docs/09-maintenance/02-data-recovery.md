---
title: "数据恢复与 Reflog"
description: "Git 的后悔药：使用 Reflog 找回丢失的提交、分支和暂存区内容"
---

即使是最资深的 Git 用户也会犯错：误删分支、错误的硬重置（Hard Reset）、或者搞丢了暂存的工作。幸运的是，Git 几乎很难真正丢弃数据。

只要你还没有运行过激进的垃圾回收（`git gc --prune=now`），**Reflog** 就是你的救命稻草。

## 什么是 Reflog？

Reflog（Reference Logs）记录了本地仓库中引用（如 HEAD、分支名）的每一次变更。无论是提交、合并、回滚、还是切换分支，Git 都会在 Reflog 中记上一笔。

除了默认的 `git reflog`（等同于 `git reflog show HEAD`），你还可以查看特定分支的 reflog：
```bash
git reflog show main
git reflog show stash
```

**关键点**：
-   Reflog 是**本地的**。它不会被推送到远程仓库。
-   Reflog 是**临时的**。默认保留 90 天（对于不可达对象是 30 天）。

## 查看 Reflog

```bash
git reflog
```

输出示例：
```plaintext
e3b0a1f (HEAD -> main) HEAD@{0}: commit: fix login bug
8a2b3c4 HEAD@{1}: reset: moving to HEAD~1
9f8e7d6 HEAD@{2}: commit: wip login feature  <-- 以为丢失的提交
1a2b3c4 HEAD@{3}: checkout: moving from dev to main
```

## 场景 1：恢复误重置的提交

**情况**：你运行了 `git reset --hard HEAD~1`，结果发现刚刚那个提交（哪怕没推送到远程）其实是有用的。

**解决**：
1.  运行 `git reflog`。
2.  找到重置前的那个提交哈希（例如上面的 `9f8e7d6` 或 `HEAD@{2}`）。
3.  重置回去：
    ```bash
    git reset --hard 9f8e7d6
    ```
    或者，如果你不想破坏当前状态，可以基于那个哈希开一个新分支：
    ```bash
    git branch recover-branch 9f8e7d6
    ```

## 场景 2：恢复误删的分支

**情况**：你删除了 `feature-x` 分支，后来才意识到里面还有没合并的代码。

**解决**：
1.  运行 `git reflog`。
2.  寻找 `checkout: moving from feature-x to ...` 之前的最后一次提交记录。通常你会看到类似 `commit: ...` 的记录。
3.  基于该哈希重建分支：
    ```bash
    git branch feature-x <commit-hash>
    ```

## 场景 3：恢复丢弃的 Stash

**情况**：你运行了 `git stash pop`，因为冲突解决失败或其他原因，Stash 列表空了，但工作区也是乱的，你想找回那个 Stash 原本的状态。

Stash 的创建和丢弃本质上也是对象操作。Stash 有自己的 reflog，删除的对象通常还是悬空的。

**推荐恢复流程**：

1.  **首选：查看 stash 的 reflog**
    ```bash
    git reflog show stash
    ```
    如果能看到记录，直接用哈希恢复：
    ```bash
    git stash apply <commit-hash>
    ```

2.  **兜底：使用 fsck 查找悬空对象**
    如果 stash reflog 已清空，可以查找悬空提交：
    ```bash
    git fsck --no-reflogs --unreachable | grep commit
    ```
    用 `git show <id>` 逐个检查内容。

3.  **安全恢复**
    找到目标后，建议先在隔离分支检查，而非直接合并：
    ```bash
    git branch recover-stash <id>
    git checkout recover-stash
    # 确认内容无误后再处理
    ```

## 终极手段：文件系统级恢复

如果连 `git reflog` 都帮不了你（比如你删除了 `.git` 目录...好吧那就真没了），或者文件没有被提交就被删除了。

-   **已添加到暂存区但未提交**：Git 已经为其创建了 Blob 对象。通过 `git fsck --lost-found` 可以找到这些悬空的 blob 对象（会被复制到 `.git/lost-found/other/` 目录），但文件名信息已丢失，需要用 `git show <blob-hash>` 查看内容来识别。
-   **从未 `git add` 过**：Git 无能为力。请咨询专业的数据恢复公司或检查你的 IDE 本地历史记录（VS Code, IntelliJ 都有 Local History 功能）。

## 总结

`git reflog` 是 Git 最被低估的功能之一。记住：**在 reflog 未过期且对象未被修剪前，通常可以恢复。** 遇到灾难时，保持冷静，不要乱跑命令，先看 Reflog。
