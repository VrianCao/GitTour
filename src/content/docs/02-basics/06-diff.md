---
title: "查看修改内容"
description: "详解 git diff 命令，学会查看工作区、暂存区与版本库之间的代码差异。"
---

在执行 `git add` 或 `git commit` 之前，最重要的习惯就是检查你到底修改了什么。`git diff` 是 Git 中最常用的命令之一，它能帮助你精确地掌控代码变更。

## 1. 查看未暂存的修改

当你修改了文件但还没有执行 `git add` 时，这些改动位于**工作区**。使用不带参数的 `git diff` 命令可以查看工作区与暂存区（或最新提交）之间的差异。

```bash
git diff
```

### 理解输出格式

让我们来逐行解读一下这些输出内容的含义。

Git 的差异输出使用标准的 diff 格式：

*   `diff --git a/file.txt b/file.txt`: 表示正在比较的文件。
*   `--- a/file.txt`: **减号** (`---`) 代表变动前的文件（旧版本）。
*   `+++ b/file.txt`: **加号** (`+++`) 代表变动后的文件（新版本）。
*   `@@ -1,4 +1,5 @@`: 定位标记，表示变更发生的行号范围。

**颜色含义**：
*   <span style="color: red;">- 红色行</span>：表示被**删除**的内容（或旧内容）。
*   <span style="color: green;">+ 绿色行</span>：表示被**新增**的内容（或新内容）。

:::note[提示]
如果文件已经被 `git add` 放入暂存区，直接运行 `git diff` 是看不到这些输出的。
:::

## 2. 查看已暂存的修改

如果你已经执行了 `git add` 将文件放入了暂存区，此时想看下一次提交（commit）会包含哪些内容，需要使用 `--staged` 或 `--cached` 参数。

这两个参数是等价的，它们比较的是 **暂存区 (Index)** 与 **最后一次提交 (HEAD)** 之间的差异。

```bash
# 推荐使用 --staged，语义更清晰
git diff --staged

# 或者使用别名（历史遗留习惯）
git diff --cached
```

### 场景演示

假设你修改了 `README.md`，添加了一行文字，然后执行了 `git add README.md`。

1.  运行 `git diff`：**无输出**（因为工作区相对于暂存区没有变化）。
2.  运行 `git diff --staged`：**显示差异**（显示暂存区的新内容相对于上一次提交的变化）。

## 3. 差异对比总结

| 命令 | 比较对象 A | 比较对象 B | 用途 |
| :--- | :--- | :--- | :--- |
| `git diff` | 工作区 (Working Directory) | 暂存区 (Staging Area) | 查看**还没 add** 的修改 |
| `git diff --staged` | 暂存区 (Staging Area) | 最新提交 (HEAD) | 查看**已经 add** 但还没 commit 的修改 |
| `git diff HEAD` | 工作区 | 最新提交 (HEAD) | 查看所有修改（不管有没有 add） |

## 4. 使用外部 Diff 工具

虽然命令行的 diff 输出很高效，但在处理大量修改或复杂冲突时，图形化工具（GUI）通常更加直观。Git 允许你配置 `git difftool` 来启动外部比较工具，如 VS Code、Beyond Compare 或 Meld。

### 配置 VS Code 作为 Diff 工具

如果你使用 VS Code，可以通过以下配置将其设为默认工具：

```bash
git config --global diff.tool vscode
git config --global difftool.vscode.cmd "code --wait --diff \$LOCAL \$REMOTE"
```

配置完成后，当你想要查看差异时，只需运行：

```bash
git difftool
# 或者查看暂存区的差异
git difftool --staged
```

Git 会依次打开每个变更文件的对比视图，左侧是旧版本，右侧是新版本，非常便于阅读。
