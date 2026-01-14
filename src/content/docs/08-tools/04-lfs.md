---
title: "Git LFS 大文件存储"
description: "使用 Git Large File Storage (LFS) 高效管理音频、视频和数据集"
---

Git 在处理文本文件时表现出色，但在处理大型二进制文件（如 PSD、视频、数据集）时却非常低效。这是因为二进制文件的 delta 压缩效果很差，且无法进行有意义的差异对比，导致仓库体积迅速膨胀，克隆速度变慢。

**Git LFS (Large File Storage)** 通过将大文件替换为轻量级的“指针”文件来解决这个问题，而实际的大文件内容则存储在远程服务器上。

## LFS 核心原理

当你使用 LFS 跟踪一个大文件时：
1.  **本地**：Git 仓库中存储的只是一个包含元数据（ID, 大小等）的小文本指针。
2.  **远程**：实际的大文件被上传到专门的 LFS 存储桶中。
3.  **检出**：当你 `git checkout` 时，LFS 客户端会根据指针自动从服务器下载对应的真实文件。

## 安装与配置

### 1. 安装 LFS

你需要先在机器上安装 LFS 客户端，然后运行初始化命令注册 Git 过滤器和钩子。

**Windows:**
首先从 [git-lfs.com](https://git-lfs.com) 下载并安装 Git LFS 客户端（或通过 `winget install GitHub.GitLFS`），然后运行：
```bash
git lfs install
```

**macOS (Homebrew):**
```bash
brew install git-lfs
git lfs install
```

*注意：`git lfs install` 会在你的 Git 全局配置中注册 LFS 过滤器和钩子，不是安装软件本身。这个命令在每台机器上只需运行一次（每个用户账户），之后所有仓库都可以使用 LFS。*

### 2. 跟踪文件

在你的仓库中，告诉 LFS 要接管哪些文件。

```bash
# 跟踪所有 Photoshop 文件
git lfs track "*.psd"

# 跟踪所有视频文件
git lfs track "*.mp4"
```

这会更新 `.gitattributes` 文件。**务必将此变更提交！**

```bash
git add .gitattributes
git commit -m "docs: configure LFS for psd and mp4 files"
```

### 3. 正常使用

配置完成后，你就照常使用 Git 即可。

```bash
git add design.psd
git commit -m "feat: add new logo design"
git push origin main
```

在 `git push` 过程中，你会看到 LFS 正在分别上传大文件对象。

## 常用命令

-   **`git lfs ls-files`**：列出当前被 LFS 管理的文件。
-   **`git lfs status`**：查看当前工作区 LFS 文件的状态。
-   **`git lfs pull`**：手动下载当前提交的所有 LFS 对象（通常自动执行）。
-   **`git lfs prune`**：清理本地旧的 LFS 缓存，释放磁盘空间。

## 迁移现有仓库

如果你的仓库中已经提交了大量二进制文件，仅仅现在开始使用 `git lfs track` 是不够的，因为历史记录中仍然包含那些大文件。

你需要重写历史（Rewrite History）。推荐使用 `git lfs migrate`。

```bash
# 将历史中所有的 *.mp4 转换为 LFS 指针
git lfs migrate import --include="*.mp4" --everything
```

:::danger[警告]
这将重写提交哈希值！所有协作者都需要重新克隆仓库。请在执行前做好备份。
:::

## 常见问题

### 配额限制
GitHub、GitLab 等平台对 LFS 的存储空间和带宽都有限制（通常免费额度为 1GB）。超出后需要付费或可能会被禁用写入。

### 锁定机制 (File Locking)
对于二进制文件，合并通常是不可能的。LFS 支持“文件锁定”，防止两人同时编辑同一个文件。

```bash
# 锁定文件
git lfs lock assets/logo.psd

# 解锁
git lfs unlock assets/logo.psd
```
