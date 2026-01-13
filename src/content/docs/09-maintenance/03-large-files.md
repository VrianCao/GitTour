---
title: "从历史中移除大文件"
description: "彻底清洗 Git 历史记录，移除误传的大文件或敏感数据"
---

有时候，有人不小心把几百兆的 `database.dump` 或 `node_modules.zip` 提交到了仓库中。即使你后来用 `git rm` 删除了它们，它们依然存在于 Git 的历史记录（`.git` 目录）中，导致克隆变慢。

要彻底清除它们，你需要重写历史。

:::danger[高风险操作]
**本章涉及的操作将重写 Git 历史！**
这会改变所有受影响提交的哈希值。所有协作者必须删除本地旧仓库并重新克隆。请务必在操作前备份整个仓库。
:::

## 为什么不能只用 `git rm`？

`git rm` 只会从**当前**工作区和索引中删除文件，并创建一个新的提交记录“删除了文件”。历史提交中依然完整保留着该文件的物理副本。

## 推荐工具

虽然 Git 自带 `filter-branch` 命令，但它极其缓慢且容易出错。官方强烈建议使用第三方专用工具。

### 1. BFG Repo-Cleaner (推荐入门)

BFG 是一个基于 Java 的工具，比 `filter-branch` 快 10-720 倍，且使用更简单。

**安装**：
需先安装 Java，然后下载 jar 包或通过包管理器：
```bash
brew install bfg
```

**使用步骤**：

1.  **克隆裸仓库**（为了安全和速度）：
    ```bash
    git clone --mirror git://example.com/some-big-repo.git
    ```

2.  **执行清理**：
    假设我们要删除所有大于 100MB 的文件：
    ```bash
    bfg --strip-blobs-bigger-than 100M some-big-repo.git
    ```
    或者按文件名删除：
    ```bash
    bfg --delete-files *.zip some-big-repo.git
    ```

3.  **物理清理**：
    BFG 更新了提交历史，但物理文件还在。需要运行 GC 清理：
    ```bash
    cd some-big-repo.git
    git reflog expire --expire=now --all && git gc --prune=now --aggressive
    ```

4.  **推送到远程**：
    ```bash
    git push --force
    ```

### 2. git-filter-repo (Python 编写，功能最强)

这是目前 Git 官方文档推荐的现代化工具。

**安装**：
```bash
pip install git-filter-repo
```

**使用步骤**：

1.  **分析仓库**：
    ```bash
    git filter-repo --analyze
    ```
    这会在 `.git/filter-repo/analysis` 下生成详细的报告，告诉你哪些文件占用了最多空间。

2.  **执行清理**：
    删除特定路径：
    ```bash
    git filter-repo --path path/to/large/file --invert-paths
    ```

## 传统方法：git filter-branch (已废弃)

虽然已废弃，但为了应对遗留脚本，了解一下也无妨。

```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large/file" \
  --prune-empty --tag-name-filter cat -- --all
```

**缺点**：
-   极慢（对于大仓库可能跑几天）。
-   参数复杂，容易搞坏 Tag 和合并提交。

## 后续工作

完成清理并强制推送（Force Push）后，你需要通知团队所有成员：

1.  **不要**拉取（Pull）代码，这会把脏历史重新合并回来。
2.  **必须**重新克隆（Clone）仓库。

作为系统管理员，此时可以考虑开启远程仓库的“保护分支”功能，短时间内禁止非快进（Non-fast-forward）推送，防止有人不小心把旧历史推回来。
