---
title: "Git 子模块 (Submodules)"
description: "如何在项目中嵌套管理其他 Git 仓库？深入理解子模块的添加、更新与协作流程。"
---

有时你的项目需要依赖另一个 Git 仓库的代码（例如一个通用的工具库）。虽然可以使用包管理器（如 npm, maven），但如果你想直接在源码层面进行依赖管理，或者该库不是公开包，**Git Submodule** 就是标准解决方案。

子模块允许你将一个 Git 仓库作为另一个 Git 仓库的子目录。它能让你将另一个仓库克隆到自己的项目中，同时保持提交的独立。

## 1. 添加子模块

假设你想把 `libs/utils` 库添加到当前项目的 `third-party/utils` 目录下。

```bash
# 语法：git submodule add <仓库URL> [路径]
git submodule add https://github.com/example/utils.git third-party/utils
```

执行后，Git 会做两件事：
1.  在 `.gitmodules` 文件中添加子模块的映射信息。
2.  将该子模块的**当前 commit hash** 记录在父仓库中。

:::note[.gitmodules 文件]
这是一个纯文本文件，记录了项目与子模块 URL 的映射关系。它受版本控制，会随项目一起分发。
:::

## 2. 克隆包含子模块的项目

当你克隆一个含有子模块的项目时，默认情况下，子模块目录是空的。

### 方法 A：克隆时一步到位（推荐）

使用 `--recursive` 参数：

```bash
git clone --recursive https://github.com/my-org/main-project.git
```

### 方法 B：克隆后手动初始化

如果你已经克隆了父仓库，但忘记了加 `--recursive`，你需要运行两个命令：

```bash
# 初始化本地配置文件
git submodule init

# 从该项目中抓取所有数据并检出父项目中列出的合适的提交
git submodule update
```

通常可以将它们合并为一个命令：

```bash
git submodule update --init --recursive
```

## 3. 在子模块中工作

### 3.1 检查状态

进入子模块目录，它就是一个标准的 Git 仓库。

```bash
cd third-party/utils
git status
```

**关键点**：默认情况下，子模块处于 **Detached HEAD**（游离指针）状态。它指向的是父仓库记录的特定 Commit，而不是某个分支。

### 3.2 更新子模块

如果上游仓库（`utils`）更新了，你想在你的项目中同步这些更新：

1.  **手动更新**：
    ```bash
    cd third-party/utils
    git fetch
    git checkout main  # 切换到分支
    git pull
    ```

2.  **在父目录更新**：
    如果你只是想更新到子模块远程分支的最新状态：
    ```bash
    git submodule update --remote
    ```

更新完成后，记得在父仓库提交这次变更：

```bash
cd ../.. # 回到父仓库根目录
git add third-party/utils
git commit -m "chore: update utils submodule to latest version"
```

## 4. 常见陷阱与注意事项

### 4.1 忘记推送子模块

:::danger[致命错误]
如果你在子模块中修改了代码并提交，然后提交了父仓库的引用更新，但**忘记将子模块的改动推送到远程**。
结果：其他人拉取父仓库代码后，无法 checkout 子模块，因为父仓库引用的那个 Commit 在远程子模块中不存在！
**规则：总是先推送子模块，再推送父仓库。**
:::

### 4.2 令人头秃的删除

在旧版 Git 中删除子模块非常繁琐。在现代 Git 版本中，步骤已简化，但仍需小心：

```bash
# 1. 卸载子模块
git submodule deinit third-party/utils

# 2. 从 git 索引和 .gitmodules 中移除
git rm third-party/utils

import { Tabs, TabItem } from '@astrojs/starlight/components';

# 3. 删除残留的 .git/modules 目录（可选，为了彻底清理）
<Tabs>
  <TabItem label="Bash (Mac/Linux/Git Bash)">
    ```bash
    rm -rf .git/modules/third-party/utils
    ```
  </TabItem>
  <TabItem label="PowerShell (Windows)">
    ```powershell
    Remove-Item -Recurse -Force .git/modules/third-party/utils
    ```
  </TabItem>
</Tabs>
```

## 5. 总结

子模块很强大，但也增加了工作流的复杂度。在决定使用之前，请考虑：
- 是否可以用包管理器（npm/pip）代替？
- 团队成员是否熟悉 `git submodule` 命令？

如果必须使用，请记住口诀：**克隆加递归 (`--recursive`)，修改先推子 (`push submodule first`)**。
