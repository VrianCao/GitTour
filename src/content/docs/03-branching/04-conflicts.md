---
title: "解决合并冲突"
description: "学会直面 Git 冲突：理解冲突原因、识别冲突标记以及手动解决冲突的标准流程。"
---

很多 Git 初学者看到 "CONFLICT"（冲突）这个词时会感到恐慌，实际上**冲突是正常的**。它并不是错误，而是 Git 在告诉你：“这里有两份不同的修改，我不知道该听谁的，请你来做主。”

学会解决冲突，标志着你从 Git 新手晋升为合格的协作者。

## 冲突何时发生？

Git 的自动合并功能非常强大，大部分时候它都能自动处理。但在以下情况，Git 无法自动决定：

1.  **修改了同一行**：两个分支都修改了同一个文件的同一行代码，且内容不同。
2.  **一删一改**：一个分支修改了某个文件，而另一个分支删除了这个文件。

:::note[核心逻辑]
冲突本质上是 Git 的一种**安全机制**。它防止你的代码被同事的代码（或者你自己的另一个分支）无声无息地覆盖。
:::

## 冲突的表现

当你执行 `git merge` 时，如果发生冲突，Git 会立即暂停合并过程，并给出提示。

### 1. 命令行提示
你会在终端看到类似这样的输出：

```bash
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

### 2. 状态检查 (`git status`)
此时系统处于“合并中”的状态。使用 `git status` 可以查看哪些文件卡住了：

```bash
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html
```

### 3. 文件内容标记
Git 会直接修改你的源代码文件，插入**冲突标记**。你需要打开文件（例如 `index.html`），寻找类似下面的内容：

```html
<<<<<<< HEAD
<h1>这是主分支的标题</h1>
=======
<h1>这是功能分支的新标题</h1>
>>>>>>> feature-login
```

*   **`<<<<<<< HEAD`**: 冲突区域开始。下面的内容是你当前所在分支（接收合并的分支）的修改。
*   **`=======`**: 分隔线。上面是当前分支的内容，下面是你要合并进来的分支的内容。
*   **`>>>>>>> feature-login`**: 冲突区域结束。标记了来源分支的名字。

## 解决步骤：四步法

解决冲突的过程其实就是“人工编辑”的过程。

### 第一步：打开并编辑文件
使用你喜欢的编辑器打开冲突文件。你需要做两件事：
1.  **决定保留什么**：你可以保留上面的（当前分支），也可以保留下面的（合并分支），或者综合两者的改动重写这一行。
2.  **删除标记**：必须删除 `<<<<<<<`、`=======` 和 `>>>>>>>` 这三行特殊的标记行，只留下最终代码。

**修改后的样子：**
```html
<h1>这是合并后我们共同决定的标题</h1>
```

### 第二步：标记为已解决 (`git add`)
当你处理完文件中的所有冲突标记后，保存文件。然后告诉 Git 你已经搞定了：

```bash
git add index.html
```

:::tip
`git add` 在这里的作用是**更新索引**，告诉 Git：“这个文件的冲突已经解决了，把它放进暂存区吧。”
:::

### 第三步：验证状态
再次运行 `git status`，确保所有冲突文件都已变更为 "Changes to be committed"（待提交的变更）。

### 第四步：完成合并 (`git commit`)
最后，完成这次暂停的合并操作。通常你只需要输入：

```bash
git commit
```

Git 会自动生成一个默认的合并提交信息（通常包含 "Merge branch..." 和冲突文件的列表）。你可以保留默认信息，保存并退出编辑器即可。

## 工具辅助

虽然手动编辑标记是最基础的技能，但现代工具可以让这个过程更直观。

### 使用 `git mergetool`
Git 内置了调用外部合并工具的命令。如果你配置了如 Vimdiff, Beyond Compare 或 KDiff3 等工具，可以运行：

```bash
git mergetool
```

它会依次打开冲突文件，提供三路合并（3-way merge）视图：左边是本地版本，右边是远程版本，中间是基础版本，底部是最终结果。

### 使用代码编辑器 (推荐)
现代编辑器如 **VS Code** 对 Git 冲突有极佳的支持。
*   它会高亮显示冲突区域。
*   提供快捷按钮：`Accept Current Change`（采用当前更改）、`Accept Incoming Change`（采用传入更改）或 `Compare Changes`（比较更改）。
*   点击按钮即可一键解决，无需手动删除 `<<<<<<<` 等标记。

---

## 总结
遇到冲突不要慌：
1.  看 `git status` 找文件。
2.  改代码，删标记。
3.  `git add` 标记解决。
4.  `git commit` 完成合并。
