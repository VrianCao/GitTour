---
title: "Git 调试：Blame 与 Bisect"
description: "掌握 git blame 追溯代码责任人，使用 git bisect 二分查找快速定位 Bug 引入点。"
---

在软件开发中，Bug 是无法避免的。当生产环境出现问题，或者你发现一段代码逻辑奇怪时，Git 提供了两个强大的工具来帮助你回答两个关键问题：“这是谁写的？”（`git blame`）以及“这个 Bug 是什么时候引入的？”（`git bisect`）。

## 1. 追溯代码历史：`git blame`

`git blame` 是一个“甩锅”工具（开玩笑），它的主要用途是**注释文件的每一行**，显示最后修改该行的提交哈希、作者和时间。这对于理解代码背后的上下文非常有帮助。

### 1.1 基本用法

查看某个文件的逐行修改历史：

```bash
git blame src/utils/calculator.ts
```

输出示例：
```git
5a3d12f9 (Alice 2023-10-01 14:30:00 +0800 1) export function add(a, b) {
5a3d12f9 (Alice 2023-10-01 14:30:00 +0800 2)   return a + b;
7b8c92a1 (Bob   2023-11-15 09:15:00 +0800 3) }
```

### 1.2 常用参数

- **指定行范围 (`-L`)**：文件很大时，只查看特定函数或行范围。
  ```bash
  # 查看第 10 到 20 行
  git blame -L 10,20 src/app.tsx
  ```
- **忽略空白修改 (`-w`)**：如果某行代码只是缩进改变了，你可能更关心实际逻辑的修改者。
  ```bash
  git blame -w src/app.tsx
  ```
- **显示邮箱 (`-e`)**：显示作者邮箱而不是名字。

:::tip
大多数现代 IDE（如 VS Code, IntelliJ）都有 Git Blame 插件或内置功能（CodeLens），可以在编辑器行尾直接显示 Blame 信息。虽然 GUI 很方便，但 CLI 在服务器端排查问题时不可替代。
:::

---

## 2. 二分查找 Bug：`git bisect`

当你发现一个 Bug，但不确定它是哪次提交引入的，且提交历史很长时，手动一个一个 checkout 去验证效率极低。`git bisect` 利用**二分查找算法**（Binary Search），能以 $O(\log N)$ 的时间复杂度迅速定位“罪魁祸首”。

### 2.1 手动二分查找流程

假设当前版本（HEAD）是坏的（存在 Bug），而你记得两周前的 `v1.0.0` 是好的。

1.  **启动二分查找**：
    ```bash
    git bisect start
    ```
2.  **标记坏点（当前）**：
    ```bash
    git bisect bad
    # 或者 git bisect bad HEAD
    ```
3.  **标记好点（已知无 Bug 的版本）**：
    ```bash
    git bisect good v1.0.0
    # 或者某个具体的 commit hash
    ```

    此时，Git 会自动计算中间的提交，并 checkout 到该状态：
```git
Bisecting: 100 revisions left to test after this (roughly 7 steps)

    [3a1b2c...] refactor: update user login logic
    ```

4.  **验证与反馈**：
    现在你需要运行项目或测试用例，检查 Bug 是否存在。
    - 如果 Bug **存在**，告诉 Git：
      ```bash
      git bisect bad
      ```
    - 如果 Bug **不存在**，告诉 Git：
      ```bash
      git bisect good
      ```

    Git 会根据你的反馈，再次切分剩余的一半历史，重复此过程，直到定位到引入 Bug 的那次具体提交。

5.  **结束查找**：
    找到问题提交后，Git 会输出类似信息：
```git
8d9e1f... is the first bad commit

    commit 8d9e1f...
    Author: Charlie <charlie@example.com>
    Date:   Tue Dec 12 10:00:00 2023 +0800
    
        feat: optimize loop performance
    ```
    
    任务完成后，切回原来的工作分支：
    ```bash
    git bisect reset
    ```

### 2.2 自动化二分查找

如果你有一个脚本或测试命令可以自动判断 Bug 是否存在，你可以让 `bisect` 自动运行。

**退出码规则**：
| 退出码 | 含义 | 说明 |
| :---: | :--- | :--- |
| `0` | Good | 当前版本正常，不存在 Bug |
| `1-124`, `126-127` | Bad | 当前版本存在 Bug |
| `125` | Skip | 当前版本无法测试（如编译失败），跳过 |

```bash
git bisect start
git bisect bad HEAD
git bisect good v1.0.0

# 开始自动运行
# 语法：git bisect run <cmd>
git bisect run npm test
```

Git 会自动在每个检查点运行 `npm test`，根据退出码自动标记 good/bad，喝杯咖啡回来就能看到结果了。

:::tip[处理无法测试的版本]
如果某些中间版本无法编译或运行，你可以编写一个包装脚本：当检测到编译失败时返回 `exit 125`，让 Git 跳过该版本继续二分。
:::

:::caution[注意]
在 `git bisect` 过程中，Git 会频繁切换 HEAD。确保你的工作区是干净的（没有未提交的更改），否则 checkout 可能会失败。
:::

## 3. 总结

- 使用 **`git blame`** 快速查看代码行的最后修改者，结合 `-w` 忽略格式变更。
- 使用 **`git bisect`** 在庞大的提交历史中像手术刀一样精准定位 Bug 引入点。学会自动化 `bisect run` 可以极大地节省调试时间。
