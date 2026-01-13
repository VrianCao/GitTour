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
  - 每次推送时都需要验证身份（输入用户名/密码）。
  - *注意*: 现在 GitHub 等平台不再支持使用账户密码直接推送，而是需要使用 **个人访问令牌 (Personal Access Token, PAT)** 或 Git Credential Manager 来缓存凭证。

:::tip[凭证管理器]
如果你在 Windows 或 Mac 上安装了 Git，通常会自动安装凭证管理器。这意味着你只需在第一次推送时登录一次，系统会记住你的凭证，体验上和 SSH 一样方便。
:::

## SSH 协议

SSH (Secure Shell) 是一种安全的网络协议，广泛用于服务器通信。

- **URL 格式**: `git@github.com:username/repo.git`
- **优点**: 
  - 安全性高，使用非对称加密。
  - 配置完成后，推送和拉取无需每次输入密码。
- **缺点**: 
  - 初始配置稍显繁琐（需要生成密钥）。
  - 在某些严格的公司防火墙下可能被封锁（使用 22 端口）。

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
一路按回车键使用默认设置即可。

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
