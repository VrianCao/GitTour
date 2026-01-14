---
title: "Git 属性配置 (.gitattributes)"
description: "通过 .gitattributes 管理换行符、二进制文件差异对比及导出策略"
---

在跨平台协作或处理特定文件类型时，Git 的默认行为可能不够完美。`.gitattributes` 文件允许你为特定的路径定义属性，从而微调 Git 的行为。这对于维护代码库的一致性和清洁度至关重要。

## 核心概念

`.gitattributes` 文件的工作方式类似于 `.gitignore`，通常放在仓库的根目录下。每行包含一个路径模式，后面跟着一个或多个属性。

```plaintext
# 模式       属性1   属性2
*.txt       text
*.jpg       binary
```

## 1. 换行符处理 (End of Line)

这是系统管理员最头疼的问题之一：Windows 使用 `CRLF`，而 macOS/Linux 使用 `LF`。如果不加控制，代码库中会混杂各种换行符，导致极其难看的 `diff` 甚至构建失败。

### 强制统一策略

虽然可以通过 `git config core.autocrlf` 设置全局行为，但在 `.gitattributes` 中定义项目级规则是更安全、可移植的做法。

**推荐配置：**

```properties
# 默认行为：自动检测文本文件，在仓库中规范化为 LF
# 检出到工作区的换行符由 eol= 属性或 Git 的平台/配置决定
* text=auto

# 明确声明文本文件，强制在仓库中存储为 LF
*.js text
*.css text
*.html text

# 强制 Windows 批处理文件保留 CRLF
*.bat text eol=crlf

# 强制 Shell 脚本保留 LF (即使在 Windows 上)
*.sh text eol=lf
```

:::note[SysAdmin 提示]
一旦在 `.gitattributes` 中设定了规则，建议运行 `git add --renormalize .` 来标准化现有文件。这会重写索引中的文件以符合新规则。
:::

## 2. 二进制文件处理

Git 默认尝试对所有文件进行文本差异比较。对于图像或编译后的二进制文件，这通常是无意义的垃圾字符。

### 标记二进制文件

告诉 Git 某些文件是二进制的，这样它就不会尝试进行文本合并或差异比较。

```properties
# 图像文件
*.jpg binary
*.png binary
*.gif binary

# 编译后的库
*.dll binary
*.so binary
```

### 差异对比 (Diffing)

即使是二进制文件，有时我们也想看差异。例如，对于 Word 文档，我们可以配置 Git 使用转换器提取文本进行对比。

**示例：对比 Word 文档**

1.  在 `.gitattributes` 中定义：
    ```properties
    *.docx diff=word
    ```
2.  在 `.git/config` (或全局配置) 中配置转换器（注意：需要预先安装 pandoc）：
    ```bash
    git config diff.word.textconv "pandoc --to=markdown"
    ```

现在运行 `git diff` 时，Git 会先通过 `pandoc` 将 docx 转换为 Markdown 再显示差异。

## 3. 归档导出 (Export Ignore)

当你使用 `git archive` 命令（或在 GitHub 上下载 ZIP 包）时，某些开发文件（如 `.gitignore`, `.github/` 文件夹, 测试配置）可能不需要包含在最终的发布包中。

使用 `export-ignore` 属性排除它们：

```properties
# 忽略 Git 配置文件
.gitignore export-ignore
.gitattributes export-ignore

# 忽略 CI/CD 配置
.github export-ignore
.travis.yml export-ignore

# 忽略测试目录
tests/ export-ignore
```

这样生成的发布包会更干净、更专业。

## 4. 合并策略 (Merge Strategies)

有些特定文件（如自动生成的 `package-lock.json` 或 `yarn.lock`），我们可能希望在合并冲突时总是优先使用“我们的”版本或“他们的”版本，或者将其标记为冲突让开发者手动解决。

```properties
# 对特定文件使用 "ours" 合并驱动程序（需要额外配置）
database.xml merge=ours
```
*注意：这通常需要配合 `git config merge.ours.driver true` 使用。*

## 总结

`.gitattributes` 是项目一致性的守门员。作为系统管理员，你应该确保每个正规项目都有一个合理配置的 `.gitattributes` 文件，以避免“换行符地狱”和不必要的合并冲突。
