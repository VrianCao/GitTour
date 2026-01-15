---
title: "初次运行配置"
description: "安装 Git 后的第一步：配置身份信息、编辑器和默认行为。"
---

安装完 Git 后，你需要做的第一件事就是设置你的用户名和电子邮件地址。这一点非常重要，因为每次 Git 提交都会使用这些信息，并且它们会写入到你每一次的提交中。（这些信息默认情况下不会改变；若要修改已有提交的作者信息，需要重写历史，存在一定风险。）

除了身份信息，我们还将配置默认文本编辑器和分支命名规则，以便让 Git 更顺手。

## 1. 配置文件层级

Git 使用一系列配置文件来决定它的行为。它会按照以下顺序查找配置，**越靠近仓库的配置优先级越高**（即“覆盖”前面的配置）：

1.  **仓库级 (`--local`)**:
    *   **位置**: `.git/config` (当前仓库目录中)
    *   **范围**: 仅对当前仓库有效。
    *   **优先级**: 最高。

2.  **用户级 (`--global`)**: <span style="color: green; font-weight: bold;">[推荐]</span>
    *   **位置**: `~/.gitconfig` 或 `~/.config/git/config`
    *   **范围**: 对当前用户的所有仓库有效。
    *   **优先级**: 中等。这也是大多数配置应该存放的地方。

3.  **系统级 (`--system`)**:
    *   **位置**: `/etc/gitconfig` (Mac/Linux) 或 `C:\Program Files\Git\etc\gitconfig` (Windows)
    *   **范围**: 对系统上所有用户及所有仓库有效。
    *   **优先级**: 最低。

:::note[覆盖规则]
如果在 **用户级** 设置了编辑器为 VS Code，但在某个特定仓库的 **仓库级** 设置了编辑器为 Vim，那么在该仓库中操作时，Git 会使用 Vim。
:::

## 2. 设置用户信息 (必须)

安装 Git 后的**首要任务**是设置你的用户名和邮件地址。如果不配置，Git 可能会在提交时报错或使用自动猜测的（通常是错误的）信息。

请打开终端（Terminal 或 Git Bash），运行以下命令：

```bash
# 设置你的名字（这会显示在提交记录中）
git config --global user.name "Your Name"

# 设置你的邮箱（这会关联到 GitHub 头像和贡献记录）
git config --global user.email "your.email@example.com"
```

:::caution[重要提示]
这里的邮箱地址应该是你在 GitHub/GitLab 等代码托管平台账号中**已添加并验证**的邮箱（也可以使用平台提供的 noreply 邮箱），否则你的代码提交可能无法正确关联到你的账户（即没有"绿格子"贡献统计）。
:::

## 3. 配置文本编辑器

当你执行某些需要输入信息的命令（如 `git commit` 而不带 `-m` 参数，或 `git rebase -i`）时，Git 会自动启动一个文本编辑器。

默认情况下，Git 可能会使用 Vim 或 Nano。如果你不熟悉 Vim 的操作（比如如何退出），这会非常令人抓狂。

**强烈建议新手将编辑器配置为 VS Code：**

```bash
git config --global core.editor "code --wait"
```

*   `code`: VS Code 的命令行启动指令。
*   `--wait`: 告诉 Git 在你关闭编辑器窗口之前，暂停执行后续操作。

:::tip[其他编辑器]
如果你是 Vim 死忠粉，可以显式配置：
```bash
git config --global core.editor vim
```
:::

## 4. 默认分支名

在 Git 的早期版本中，初始化新仓库时的默认分支名是 `master`。近年来，出于包容性语言的考虑，社区普遍转向使用 `main` 作为默认分支名。

为了让 Git 在运行 `git init` 时自动创建 `main` 分支，请运行：

```bash
git config --global init.defaultBranch main
```

## 5. 检查配置

配置完成后，你可以随时查看当前的配置列表：

```bash
git config --list
```
*这会列出所有层级的配置，可能会有重复的键（因为分别来自系统级、用户级等）。*

如果你只想查看某一项特定的配置：

```bash
git config user.name
```

```git frame=terminal
Your Name
```

还可以加上 `--show-origin` 来查看配置具体是在哪个文件中定义的：

```bash
git config --list --show-origin
```

## 6. 常见疑难杂症

### Q: 我配置错了名字或邮箱，怎么改？
**A:** 只需要再次运行相同的 `git config --global ...` 命令即可覆盖旧的设置。
```bash
git config --global user.name "New Correct Name"
```

### Q: 这个配置会修改我以前的提交吗？
**A:** **不会**。`user.name` 和 `user.email` 的配置只会影响**配置之后**新产生的提交。旧的提交历史已经写入了数据库，无法通过修改配置来自动变更（除非使用 `git filter-branch` 等高级命令重写历史，这在后续“进阶”章节会讲到）。

### Q: VS Code 命令 `code` 找不到？
**A:** 这说明 VS Code 没有添加到你的系统环境变量 PATH 中。
*   **Mac**: 打开 VS Code，`Cmd + Shift + P`，输入 "shell command"，选择 "Install 'code' command in PATH"。
*   **Windows**: 重装 VS Code 时勾选 "Add to PATH"，或者手动添加安装路径。
