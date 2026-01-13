---
title: "GitHub 基础与 Pull Request"
---

虽然 Git 是一个工具，但 GitHub（以及 GitLab, Bitbucket）是基于 Git 的**社交编程平台**。它引入了 "Fork" 和 "Pull Request" 的概念，彻底改变了开源软件的协作方式。

## 核心概念

### Fork (复刻)
Fork 不是 Git 的原生命令，而是 GitHub 提供的功能。
它会在**服务器端**将别人的仓库完整复制一份到**你的** GitHub 账号下。
- **目的**: 让你在不拥有原仓库写入权限的情况下，也能对其代码进行修改。

### Clone (克隆)
`git clone` 是将远程仓库下载到你**本地电脑**的操作。
- **通常流程**: 先 Fork (GitHub) -> 再 Clone (本地)。

### Pull Request (PR / 拉取请求)
当你修改了 Fork 来的代码，并希望原作者接受你的修改时，你发起一个 Pull Request。
- **含义**: "我修改了代码，请你(Pull)拉取我的修改。"
- PR 是一个**对话机制**，原作者可以在 PR 中审查代码、提出修改意见，最后决定是合并 (Merge) 还是关闭 (Close)。

## 标准开源贡献工作流

假设你想给某个开源项目 `vuejs/core` 贡献代码，流程通常如下：

### 1. Fork 项目
在 GitHub 页面右上角点击 **Fork** 按钮。现在你的账号下有了 `your-name/core`。

### 2. Clone 到本地
```bash
git clone https://github.com/your-name/core.git
cd core
```

### 3. 创建特性分支
永远不要直接在 `main` 分支上修改。为每个功能创建一个新分支：
```bash
git checkout -b fix-typo
```

### 4. 修改与提交
修改代码，保存，然后提交：
```bash
git add .
git commit -m "docs: fix typo in README"
```

### 5. 推送分支
将你的分支推送到**你自己的**远程仓库 (`origin`)：
```bash
git push -u origin fix-typo
```

### 6. 发起 Pull Request
1. 打开 GitHub 上你的仓库页面。
2. 你通常会看到一个黄色的提示条："Compare & pull request"。
3. 点击它，填写标题和描述（解释你做了什么）。
4. 确认目标是原作者的仓库 (`base repository`) 和分支。
5. 点击 **Create pull request**。

### 7. 代码审查与合并
项目维护者会收到通知。他们可能会要求你修改代码。
- 你只需在本地继续修改，再次 `commit` 并 `push` 到**同一个分支**。
- GitHub 上的 PR 会自动更新，包含你最新的提交。

一旦维护者满意，点击合并，你的代码就正式成为了项目的一部分！

:::note[同步上游代码]
在贡献过程中，原仓库可能已经更新了。为了保持同步，你需要添加原仓库为额外的远程地址（通常命名为 `upstream`），并定期抓取合并：
```bash
git remote add upstream https://github.com/vuejs/core.git
git fetch upstream
git merge upstream/main
```
:::
