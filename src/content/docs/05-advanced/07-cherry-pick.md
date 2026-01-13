---
title: "遴选提交 (Cherry-pick)"
description: "如何从其他分支“摘取”特定的提交？Git Cherry-pick 的使用场景与实战指南。"
---

想象一下：你在 `feature` 分支开发，同时你的同事在 `main` 分支修复了一个严重的 Bug。你需要这个修复，但你还不想合并整个 `main` 分支（因为里面可能包含了你不想要的其他变动）。

这时，**`git cherry-pick`** 就派上用场了。它允许你挑选任意一个提交，并将其“复制”应用到当前分支。

## 1. 基本用法

语法非常简单：

```bash
git cherry-pick <commit-hash>
```

### 实战演示

假设提交历史如下：

```text
a - b - c - d   <- main
     \
      e - f - g <- feature (HEAD)
```

你想把 `main` 分支上的提交 `c` (修复了 Bug) 应用到 `feature` 分支。

1.  获取 `c` 的哈希值（例如 `3a1b2c`）。
2.  确保当前在 `feature` 分支。
3.  执行命令：
    ```bash
    git cherry-pick 3a1b2c
    ```

结果历史变成：

```text
a - b - c - d       <- main
     \
      e - f - g - c' <- feature (HEAD)
```

注意：`c'` 的内容和 `c` 一样，但它是一个**全新的提交**（Hash 不同，时间戳不同）。

## 2. 高级用法

### 2.1 挑选多个提交

你可以一次摘取多个散乱的提交：

```bash
git cherry-pick <hash-1> <hash-2>
```

或者摘取一个范围（不包含起始点，包含结束点）：

```bash
# 摘取从 hash-A 到 hash-B 之间的所有提交（不含 hash-A）
git cherry-pick hash-A..hash-B
```

如果要包含起始点 `hash-A`：

```bash
git cherry-pick hash-A^..hash-B
```

### 2.2 处理冲突

就像合并一样，Cherry-pick 也可能产生冲突。

1.  Git 会暂停并提示冲突。
2.  你需要手动解决文件冲突。
3.  解决后添加到暂存区：`git add <path>`。
4.  继续 Cherry-pick：
    ```bash
    git cherry-pick --continue
    ```

或者放弃操作：
```bash
git cherry-pick --abort
```

## 3. 何时使用 vs 何时避免？

### ✅ 适用场景
- **紧急修复 (Hotfix)**：将 `main` 上的紧急修复同步到旧的稳定版本分支（如 `release/v1.0`）。
- **误提交**：你在错误的分支上提交了代码，想把它移到正确的分支（先 cherry-pick 到正确分支，再在原分支 reset）。
- **特定功能提取**：实验性分支中有 10 个提交，但你只想取其中 1 个有用的功能。

### ❌ 避免场景
- **代替 Merge**：如果你需要另一个分支的**所有**变更，请使用 `merge` 或 `rebase`。滥用 Cherry-pick 会导致历史中出现大量重复内容的提交，使得未来的合并变得极其困难。

## 4. 总结

`git cherry-pick` 就像自助餐的夹子，让你精准地夹取你想要的那一块“蛋糕”（Commit），而不需要吃下整个盘子（Branch）。但在享受便利的同时，要注意它会产生重复提交的副作用。
