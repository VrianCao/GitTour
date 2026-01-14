---
title: "Git 协议 (HTTPs/SSH)"
---

在连接远程仓库（如 GitHub、GitLab）时，你主要会遇到两种协议：**HTTPS** 和 **SSH**。了解它们的区别并配置适合你的方式，能让日常开发更顺滑。

## HTTPS 协议

HTTPS 是最简单、最通用的连接方式。

- **URL 格式**: `https://github.com/username/repo.git`
- **优点**: 
  - 易于设置，不需要生成密钥对。
  - 防火墙友好（通常使用标准 443 端口）。
- **缺点**: 
  - 需要配置身份验证：主流平台（如 GitHub）已**不再支持**直接使用账户密码推送，必须使用**个人访问令牌 (PAT)** 或通过 OAuth 流程认证。
  
:::tip[凭证管理器]
现代 Git 通常自带或推荐安装 **Git Credential Manager**。配置后，它会安全地存储你的凭证，无需每次推送都输入。Windows/Mac 安装 Git 时通常会自动包含；Linux 用户可手动安装。首次认证后体验与 SSH 一样便捷。
:::

## SSH 协议

SSH (Secure Shell) 是一种安全的网络协议，广泛用于服务器通信。

- **URL 格式**: `git@github.com:username/repo.git`
- **优点**: 
  - 安全性高，使用非对称加密。
  - 配置完成后，推送和拉取无需每次输入密码。
- **缺点**: 
  - 初始配置稍显繁琐（需要生成密钥）。
  - 在某些严格的公司防火墙下可能被封锁（默认使用 22 端口）。

:::note[SSH 端口被封？]
如果 22 端口被防火墙封锁，许多平台（如 GitHub、GitLab）支持通过 443 端口使用 SSH。例如 GitHub 可使用 `ssh.github.com:443`。具体配置请查阅对应平台的官方文档。
:::

## 配置 SSH 密钥

如果你决定使用 SSH，以下是简要步骤：

### 1. 检查现有密钥
打开终端（Git Bash 或 PowerShell），运行：
```bash
ls ~/.ssh/
```
如果看到 `id_rsa` 和 `id_rsa.pub`（或 `id_ed25519`），说明你已经有密钥了。

### 2. 生成新密钥
如果没有，使用 `ssh-keygen` 生成。推荐使用 ED25519 算法（更安全高效）：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

按提示操作：
- **文件位置**：直接回车使用默认路径。
- **Passphrase（密码短语）**：建议设置一个密码短语以增加安全性。如果不想每次都输入，可使用 `ssh-agent` 缓存密钥。留空则无额外保护（方便但安全性较低）。

### 3. 获取公钥内容
密钥生成后，你需要复制**公钥**（`.pub` 结尾的文件）的内容。

```bash
# Windows (PowerShell)
type ~/.ssh/id_ed25519.pub

# macOS / Linux
cat ~/.ssh/id_ed25519.pub
```
复制输出的那一行以 `ssh-ed25519` 开头的字符串。

### 4. 添加到 GitHub
1. 登录 GitHub，点击头像 -> **Settings**。
2. 选择左侧的 **SSH and GPG keys**。
3. 点击 **New SSH key**。
4. 粘贴刚才复制的公钥，取一个标题（如 "My Laptop"），保存。

### 5. 测试连接
```bash
ssh -T git@github.com
```
如果看到 `Hi username! You've successfully authenticated...`，恭喜你，配置成功！

## 我该选哪个？

- **初学者**: 推荐 **HTTPS**。配合凭证管理器，它足够简单且好用。
- **进阶用户/自动化脚本**: 推荐 **SSH**。它提供了更稳定的身份验证机制，且不需要处理令牌过期的麻烦。
