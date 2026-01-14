---
title: "提交签名 (GPG)"
description: "配置 GPG 密钥签署提交，获得 GitHub Verified 认证徽章"
---

在开源世界或高安全要求的企业环境中，证明“你是你”非常重要。默认情况下，任何人都可以设置 `user.name` 为 "Linus Torvalds" 并提交代码。Git 签名（GPG Signing）通过加密技术解决了身份冒充问题。

当你在 GitHub 上看到绿色的 **Verified** 徽章时，意味着该提交或标签的签名已通过平台验证。签名类型可能是 GPG、SSH、S/MIME 或 GitHub 自身的 Web 签名。

## 准备工作

### 1. 安装 GPG 工具

**Windows (Git Bash 包含):**
通常 Git for Windows 已经自带了 GPG。如果没有，可以安装 `Gpg4win`。

**macOS:**
```bash
brew install gnupg
```

### 2. 生成密钥对

运行以下命令并按提示操作（建议选择 RSA and RSA，长度 4096）：

```bash
gpg --full-generate-key
```

*注意：生成过程中需要设置一个密码（Passphrase），请务必记住它。*

### 3. 获取密钥 ID

```bash
gpg --list-secret-keys --keyid-format LONG
```

输出示例：
```plaintext
sec   rsa4096/3AA5C34371567BD2 2023-01-01 [SC]
      uid                 User Name <user@example.com>
```
这里的 `3AA5C34371567BD2` 就是你的 Key ID。

## 配置 Git

### 1. 告诉 Git 你的密钥

```bash
git config --global user.signingkey 3AA5C34371567BD2
```

### 2. 开启自动签名

你可以选择在每次提交时手动加 `-S` 参数，或者设置全局自动开启：

```bash
# 全局开启 commit 签名
git config --global commit.gpgsign true

# (可选) 全局开启 tag 签名
git config --global tag.gpgsign true
```

## 关联 GitHub

为了让 GitHub 识别你的签名，你需要将公钥上传到 GitHub 设置中。

1.  **导出公钥**：
    ```bash
    gpg --armor --export 3AA5C34371567BD2
    ```
    这会输出一大段以 `-----BEGIN PGP PUBLIC KEY BLOCK-----` 开头的文本。

2.  **上传**：
    -   进入 GitHub -> Settings -> **SSH and GPG keys**。
    -   点击 **New GPG key**。
    -   粘贴刚才导出的公钥。

## 常见问题与排错

### 提交时报错 "gpg: signing failed"

这通常是因为 GPG 无法弹出密码输入框。

**解决方案**：
配置 `gpg-agent`。编辑（或创建） `~/.gnupg/gpg-agent.conf`：

**macOS:**
```plaintext
pinentry-program /opt/homebrew/bin/pinentry-mac
```

**Windows:**
通常不需要额外配置，但确保 Git Bash 是使用的自带的 gpg。

### 如果忘记密码怎么办？

GPG 密钥是私有的，如果你忘记了密码且没有备份撤销证书，这把钥匙就废了。你需要：
1.  在 GitHub 上删除旧的公钥。
2.  生成新的密钥对。
3.  更新 Git 配置和 GitHub 设置。
4.  (遗憾的是) 以前签名的提交将无法再被验证。

## 总结

GPG 签名虽然配置稍显繁琐，但它是供应链安全的重要一环。它能确保代码确实出自其声称的作者之手，且未在传输过程中被篡改。

## SSH 签名（替代方案）

从 Git 2.34 开始，你可以使用已有的 SSH 密钥进行签名，无需额外配置 GPG。对于已经在使用 SSH 密钥进行身份验证的开发者来说，这是一个更简便的选择。

### 配置 SSH 签名

1.  **设置签名格式为 SSH**：
    ```bash
    git config --global gpg.format ssh
    ```

2.  **指定用于签名的 SSH 密钥**：
    ```bash
    git config --global user.signingkey ~/.ssh/id_ed25519.pub
    ```

3.  **开启自动签名**（与 GPG 相同）：
    ```bash
    git config --global commit.gpgsign true
    ```

### 验证 SSH 签名

要在本地验证 SSH 签名，需要配置一个"允许的签名者"文件：

```bash
git config --global gpg.ssh.allowedSignersFile ~/.ssh/allowed_signers
```

该文件格式为每行一个条目：`邮箱 密钥类型 公钥内容`，例如：
```plaintext
user@example.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...
```

### 关联 GitHub

GitHub 同样支持 SSH 签名验证。将你的 SSH 公钥添加到 GitHub 时，选择 **Signing Key** 类型即可（与 Authentication Key 分开管理）。
