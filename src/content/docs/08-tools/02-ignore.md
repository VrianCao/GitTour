---
title: "高级忽略规则 (.gitignore)"
description: "掌握 .gitignore 的高级模式匹配、反向包含及全局忽略配置"
---

`.gitignore` 不仅仅是列出几个文件名那么简单。对于复杂的项目结构，你需要掌握更精细的控制模式，以确保仓库只包含源代码，而不包含构建产物、临时文件或敏感信息。

## 基本规则回顾

- **空行**：不匹配任何文件，用于可读性分隔。
- **`#`**：注释。
- **`/` 结尾**：匹配目录。
- **`/` 开头**：匹配根目录下的文件/目录。

```plaintext
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 仅忽略根目录下的 TODO 文件，不包括子目录的 (docs/TODO)
/TODO
```

## 高级模式匹配

### 1. 递归匹配 (`**`)

`**` 用于匹配多级目录。

```plaintext
# 忽略任何目录下的 .DS_Store 文件
**/.DS_Store

# 忽略 logs 目录下所有层级的 .log 文件
logs/**/*.log

# 忽略 foo/bar/z, foo/a/b/c/z 等
foo/**/z
```

### 2. 反向包含/例外规则 (`!`)

这是最强大但也最容易让人困惑的功能。你可以先忽略一类文件，然后用 `!` 重新包含其中的一部分。

**场景**：忽略所有文档，但保留 HTML 文件。

```plaintext
# 忽略所有 doc 目录下的内容
doc/*

# 但不忽略 .html 文件
!doc/*.html
```

:::caution[常见陷阱]
**如果父目录被忽略了，默认情况下你无法重新包含其中的文件。**
Git 出于性能考虑，一旦忽略了某个目录，就不会再遍历该目录下的内容。但通过正确的规则顺序，你可以实现精细控制。

**错误示例**：
```plaintext
logs/
!logs/important.log  <-- 无效，因为 logs/ 已经被完全忽略
```

**正确做法**：
```plaintext
logs/*               <-- 忽略 logs 下的所有内容（而不是 logs 目录本身）
!logs/important.log  <-- 有效，因为 logs 目录本身还在被扫描
```

**多层嵌套的正确模板**（顺序很关键）：
```plaintext
# 忽略 build 目录下的所有内容
build/*
# 但保留 build/keep 目录
!build/keep/
# 忽略 build/keep 下的所有内容
build/keep/*
# 但保留其中的 .gitkeep 文件
!build/keep/.gitkeep
```
:::

## 全局忽略 (Global Ignore)

有些文件是特定于你的开发环境的（如 macOS 的 `.DS_Store`，VSCode 的 `.vscode/`，IntelliJ 的 `.idea/`），不应该强制要求项目中的每个人都去忽略它们。

作为系统管理员，你应该配置自己的**全局忽略文件**。

1.  创建全局忽略文件：
    ```bash
    touch ~/.gitignore_global
    ```

2.  填入你的环境特定规则：
    ```plaintext
    .DS_Store
    .vscode/
    *.swp
    ```

3.  告诉 Git 使用该文件：
    ```bash
    git config --global core.excludesfile ~/.gitignore_global
    ```

现在，这些文件在你的所有 Git 仓库中都会被忽略，而不需要污染项目的 `.gitignore`。

## 检查忽略规则

有时候你会发现某个文件明明在 `.gitignore` 里，却还是被 Git 追踪了，或者相反。

### 调试忽略规则

使用 `git check-ignore` 命令查看是哪一行规则生效了。

```bash
$ git check-ignore -v app/build/temp.txt
```

```git frame=terminal
.gitignore:3:build/    app/build/temp.txt
```
*输出表示：`.gitignore` 文件的第 3 行 `build/` 规则导致了该文件被忽略。*

### 忽略已追踪的文件

如果一个文件已经被提交到了仓库，稍后你把它加到了 `.gitignore`，Git **不会**自动停止追踪它。你需要手动将其从索引（暂存区）中移除。

```bash
# 从暂存区移除文件，但保留在工作区
git rm --cached <filename>

# 重新提交
git commit -m "chore: stop tracking ignored file"
```

## 最佳实践

1.  **模板起步**：不要从零开始写。使用 [github/gitignore](https://github.com/github/gitignore) 提供的针对特定语言（Node, Python, Go 等）的标准模板。
2.  **项目级 vs 全局**：项目特定的构建产物（`dist/`, `build/`）放项目 `.gitignore`；编辑器配置和系统文件放全局忽略。
3.  **保持整洁**：定期清理不再需要的规则。
