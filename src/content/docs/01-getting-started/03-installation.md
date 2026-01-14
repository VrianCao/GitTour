---
title: "安装 Git (Win/Mac/Linux)"
description: "在 Windows、macOS 和 Linux 上安装 Git 的最全保姆级指南，包含 Windows 安装向导的详细配置解析。"
---

Git 是一个开源的分布式版本控制系统，可以运行在 Linux、macOS、Windows 等主流操作系统上。根据你的操作系统，选择对应的安装方式。

## 在 Linux 上安装

在 Linux 上，通常通过发行版自带的包管理器安装 Git 是最简单的方法。

### Debian / Ubuntu
对于基于 Debian 的发行版（如 Ubuntu、Kali、Mint 等），使用 `apt` 命令：

```bash
sudo apt-get update
sudo apt-get install git
```

### Fedora / RHEL / CentOS
对于基于 RPM 的发行版（如 Fedora、RHEL、CentOS），使用 `dnf` 或 `yum`：

```bash
# Fedora 22+
sudo dnf install git

# RHEL / CentOS
sudo yum install git
```

其他发行版（如 Arch Linux, Gentoo 等）请参考各自的官方 Wiki。

---

## 在 macOS 上安装

在 macOS 上有多种安装 Git 的方式，我们推荐使用 Homebrew。

### 方法一：使用 Homebrew (推荐)
如果你已经安装了 [Homebrew](https://brew.sh/)，这是管理 Git 版本的最佳方式：

```bash
brew install git
```

### 方法二：Xcode Command Line Tools
如果你是开发者，只需安装 Xcode 命令行工具即可，它自带了 Git。在终端运行：

```bash
xcode-select --install
```
系统会弹出一个对话框，点击"安装"即可。注意：这种方式安装的 Git 版本通常比官方最新版稍旧。

### 方法三：官方安装包
你也可以从 [Git 官网](https://git-scm.com/download/mac) 下载 `.dmg` 安装包，双击按照提示安装。

---

## 在 Windows 上安装

Windows 用户面临的配置选项最多，初学者容易在安装向导中感到困惑。以下是详细的安装步骤。

### 1. 下载安装包
访问 [Git 官网下载页面](https://git-scm.com/download/win)，通常网站会自动识别你的系统位数（64-bit），点击 "Click here to download" 下载最新版安装程序（例如 `Git-2.xx.x-64-bit.exe`）。

### 2. 详细安装向导配置 (关键步骤)

双击运行安装程序，以下是关键步骤的建议配置：

#### 步骤 A: 选择默认编辑器 (Choosing the default editor used by Git)
*   **默认**: Vim
*   **建议**: 如果你不熟悉 Vim（无法退出 Vim 是新手的噩梦），**强烈建议**下拉选择 **Visual Studio Code** 或 **Notepad++** 等图形化编辑器。
*   *选项*: "Use Visual Studio Code as Git's default editor"

#### 步骤 B: 调整初始分支名 (Adjusting the name of the initial branch in new repositories)
*   **建议**: 选择 **"Override the default branch name for new repositories"** 并填入 `main`。
*   *说明*: Git 默认使用 `master`，但近年来社区已普遍转向使用 `main` 作为主分支名。

#### 步骤 C: 配置 PATH 环境 (Adjusting your PATH environment)
*   **建议**: 选择中间项 **"Git from the command line and also from 3rd-party software"** (默认推荐)。
*   *说明*: 这允许你在 PowerShell 或 CMD 中直接使用 `git` 命令，而不仅限于 Git Bash。

#### 步骤 D: 选择 SSH 可执行文件 (Choosing the SSH executable)
*   **建议**: 保持默认 **"Use bundled OpenSSH"**。

#### 步骤 E: 配置行尾换行符 (Configuring the line ending conversions) —— **非常重要**
*   **建议**: 选择第一项 **"Checkout Windows-style, commit Unix-style line endings"**。
*   *配置项*: `core.autocrlf = true`
*   *说明*: 
    *   Windows 使用 `CRLF`（回车换行），Linux/Mac 使用 `LF`（换行）。
    *   此选项会在你检出代码时自动转为 CRLF（适配 Windows 编辑器），提交时自动转为 LF（适配仓库标准）。这能有效避免跨平台协作时的"换行符地狱"。
    *   **注意**：如果项目已有 `.gitattributes` 文件定义了换行规则，请优先遵循项目/团队约定。

#### 步骤 F: 选择终端模拟器 (Configuring the terminal emulator to use with Git Bash)
*   **建议**: 选择 **"Use MinTTY (the default terminal of MSYS2)"**。
*   *说明*: MinTTY 支持调整窗口大小、复制粘贴更方便，体验优于 Windows 默认的控制台窗口 (cmd.exe)。

#### 步骤 G: 额外配置 (Configuring extra options)
*   **建议**: 勾选 "Enable file system caching" 和 "Enable Git Credential Manager"（凭证管理器，可安全保存和刷新访问凭据）。
    *   **注意**：GitHub 等平台已不再接受账号密码进行 HTTPS 推送，GCM 会帮你管理 Personal Access Token 或设备授权。

---

### 使用 Winget 安装 (可选)
如果你习惯使用命令行安装软件，可以在 PowerShell 中运行：

```powershell
winget install --id Git.Git -e --source winget
```

---

## 验证安装

无论你使用哪个操作系统，安装完成后，请打开终端（Windows 用户打开 PowerShell 或 Git Bash），输入以下命令检查版本：

```bash
git --version
```

**预期输出**：
```text
git version 2.43.0  # 版本号可能不同
```

如果你能看到类似的版本号输出，恭喜你，Git 已经成功安装！接下来我们将学习如何进行初次配置。
