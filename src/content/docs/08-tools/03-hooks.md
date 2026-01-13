---
title: "Git 钩子 (Hooks)"
description: "自动化工作流：客户端与服务端钩子详解，及 Husky 现代化配置"
---

Git 钩子（Hooks）是 Git 在特定事件（如提交、推送、合并）触发时执行的脚本。它们是自动化工作流、代码质量控制和策略执行的基石。

## 钩子机制概览

钩子脚本存储在 `.git/hooks/` 目录下。默认情况下，Git 会提供一些以 `.sample` 结尾的示例脚本。要启用它们，只需移除后缀并赋予执行权限。

### 客户端 vs 服务端

| 类型 | 常见钩子 | 触发时机 | 典型用途 |
| :--- | :--- | :--- | :--- |
| **客户端** | `pre-commit` | 提交前 | 代码格式化 (Linting)、运行单元测试 |
| | `commit-msg` | 编辑提交信息后 | 检查提交信息格式 (Conventional Commits) |
| | `pre-push` | 推送前 | 防止推送坏代码、运行集成测试 |
| **服务端** | `pre-receive` | 接收推送前 | 权限检查、拒绝非快进推送 |
| | `post-receive` | 接收推送后 | 触发 CI/CD 构建、更新工单状态 |

## 常用钩子详解

### 1. Pre-commit

这是最常用的钩子。它在 `git commit` 执行前运行。如果脚本以非零状态退出，提交将被中止。

**SysAdmin 场景**：防止提交包含 `TODO` 或私人密钥的代码。

```bash
#!/bin/sh
# 检查是否包含 "AWS_SECRET_KEY"
if grep -r "AWS_SECRET_KEY" .; then
    echo "错误：发现潜在的密钥泄露！"
    exit 1
fi
```

### 2. Commit-msg

用于验证提交信息是否符合团队规范。

**SysAdmin 场景**：强制使用 Conventional Commits 格式（如 `feat:`, `fix:`）。

```bash
#!/bin/sh
INPUT_FILE=$1
START_LINE=$(head -n1 $INPUT_FILE)
PATTERN="^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"

if ! [[ "$START_LINE" =~ $PATTERN ]]; then
  echo "错误：提交信息不符合规范。"
  echo "示例：feat: add new login page"
  exit 1
fi
```

## 现代化管理：Husky

手动编写 shell 脚本并分发给团队成员（`.git` 目录通常不被版本控制）非常麻烦。在 Node.js 生态中，**Husky** 是管理 Git 钩子的标准工具。

### 配置 Husky

1.  **安装**
    ```bash
    npm install --save-dev husky
    npx husky init
    ```

2.  **添加钩子**
    这会在 `.husky/` 目录下创建一个文件，并将其纳入版本控制。
    ```bash
    echo "npm test" > .husky/pre-commit
    ```

现在，每当开发者运行 `git commit` 时，Husky 会自动触发 `npm test`。如果测试失败，提交也会失败。

### 配合 lint-staged

在大型项目中，每次提交都运行所有测试太慢了。`lint-staged` 允许你只对**暂存区（staged）**的文件运行检查。

**package.json 配置：**

```json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

**.husky/pre-commit:**
```bash
npx lint-staged
```

这样，你的代码库将始终保持干净、格式统一，且无需人工干预。

## 跳过钩子

在紧急情况下（例如你需要立即保存一个临时的 WIP 提交），可以使用 `--no-verify` 标志跳过客户端钩子：

```bash
git commit -m "wip: temporary save" --no-verify
# 或者简写
git commit -m "..." -n
```

:::caution[警告]
不要滥用 `--no-verify`。它应该只用于本地临时保存，绝不应推送到共享分支。
:::
