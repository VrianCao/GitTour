---
title: "从历史中移除大文件"
description: "彻底清洗 Git 历史记录，移除误传的大文件或敏感数据"
---

有时候，有人不小心把几百兆的 `database.dump` 或 `node_modules.zip` 提交到了仓库中。即使你后来用 `git rm` 删除了它们，它们依然存在于 Git 的历史记录（`.git` 目录）中，导致克隆变慢。

要彻底清除它们，你需要重写历史。

:::danger[高风险操作]
**本章涉及的操作将重写 Git 历史！**
这会改变所有受影响提交的哈希值。强烈建议所有协作者删除本地旧仓库并重新克隆；高级用户可按安全流程（`git fetch origin && git reset --hard origin/main`）重置到新历史，但需格外小心。请务必在操作前备份整个仓库。
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
    git clone --mirror https://github.com/your-org/some-big-repo.git
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
    由于是 `--mirror` 克隆，需要推送所有引用：
    ```bash
    git push --mirror
    ```
    如果是普通克隆，则需要：
    ```bash
    git push --force --all && git push --force --tags
    ```
    
    :::caution
    强制推送会覆盖远程历史，请确保已与团队沟通并做好备份。
    :::

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
2.  **强烈建议**重新克隆（Clone）仓库；高级用户可按安全流程重置到新历史。

作为系统管理员，此时可以考虑开启远程仓库的“保护分支”功能，短时间内禁止非快进（Non-fast-forward）推送，防止有人不小心把旧历史推回来。

## 敏感数据泄露的额外处理

如果你清理的是密码、API 密钥等敏感数据，仅重写历史是**不够的**。即使本仓库已清理干净，数据可能仍存在于：

-   **Forks**：其他用户 fork 的仓库不会自动更新。
-   **Pull Request 缓存**：GitHub 等平台可能缓存了 PR 中的提交内容。
-   **CI/CD 日志**：构建日志可能记录了敏感信息。
-   **本地克隆**：团队成员的本地仓库。

**必要的补救措施**：

1.  **立即轮换凭据**：更改所有泄露的密码、API 密钥、Token 等。这是最重要的一步。
2.  **联系平台支持**：向 GitHub/GitLab 提交请求，要求清理缓存和 fork 中的敏感数据。
3.  **通知相关方**：告知团队成员和安全团队此次事件。
4.  **审计访问日志**：检查凭据是否已被滥用。
