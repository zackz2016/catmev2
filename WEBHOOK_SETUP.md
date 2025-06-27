# Webhook 配置指南

## 概述

本文档说明如何配置 Creem 支付 webhook，确保支付数据准确记录到数据库。

## 环境变量配置

在 `.env.local` 和生产环境中添加以下环境变量：

```bash
# Creem API 配置
CREEM_API_KEY=your_creem_api_key_here
CREEM_WEBHOOK_SECRET=your_webhook_secret_here

# 应用程序 URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Creem Webhook 配置步骤

### 1. 登录 Creem 管理后台

访问 [Creem Dashboard](https://app.creem.io) 并登录您的账户。

### 2. 创建 Webhook

1. 进入 **Developers** > **Webhooks** 页面
2. 点击 **Add Webhook** 按钮
3. 填写 webhook 配置：

   - **Name**: `Catme Payment Webhook`
   - **URL**: `https://your-domain.com/api/webhooks/creem`
   - **Events**: 选择以下事件类型：
     - `payment.succeeded`
     - `checkout.completed`
   - **Secret**: 生成一个随机字符串作为签名密钥

### 3. 测试 Webhook

使用 ngrok 进行本地测试：

```bash
# 安装 ngrok
npm install -g ngrok

# 启动开发服务器
npm run dev

# 在新终端中运行 ngrok
ngrok http 3000
```

将 ngrok 提供的 HTTPS URL 添加到 Creem webhook 配置中：
```
https://your-ngrok-id.ngrok.io/api/webhooks/creem
```

### 4. 验证配置

1. 在测试环境中完成一笔支付
2. 检查服务器日志，确认收到 webhook 通知
3. 验证数据库中是否创建了相应的支付记录

## 支付流程说明

### 新流程（使用 Webhook）

1. **支付发起**: 用户点击订阅 → 创建 Creem 支付会话 → 跳转到支付页面
2. **支付完成**: 用户完成支付 → Creem 发送 webhook 通知 → 创建支付记录
3. **状态确认**: 用户返回成功页面 → 验证支付状态 → 显示结果

### 优势

- **可靠性**: Webhook 确保即使用户关闭页面也能记录支付
- **安全性**: HMAC 签名验证确保数据来源可信
- **实时性**: 支付完成后立即处理，无需轮询

## 故障排除

### Webhook 未收到通知

1. 检查 webhook URL 是否正确
2. 确认防火墙和安全组设置
3. 验证 SSL 证书有效性

### 签名验证失败

1. 检查 `CREEM_WEBHOOK_SECRET` 环境变量
2. 确认 webhook 配置中的密钥一致
3. 验证签名算法实现

### 支付记录重复

- 数据库约束会防止重复记录
- 检查 `checkout_id` 和 `order_id` 唯一性

## 监控和日志

生产环境建议监控以下指标：

- Webhook 接收成功率
- 支付处理延迟
- 错误率和类型

检查应用日志：
```bash
# 查看 webhook 处理日志
tail -f logs/webhook.log | grep "Creem webhook"

# 查看支付处理日志
tail -f logs/payment.log | grep "process_payment_success"
``` 