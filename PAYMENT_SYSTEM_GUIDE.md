# 支付系统使用指南

## 系统概述

本项目的支付系统已经过重构优化，解决了之前存在的支付记录丢失和页面跳转问题。新系统采用了Webhook + 重试机制的架构，确保支付数据的可靠性和用户体验的流畅性。

## 核心改进

### ✅ 问题解决

1. **支付记录丢失** - 通过Webhook确保即使用户关闭页面也能记录支付
2. **页面跳转失败** - 重构支付成功页面，添加智能重试和自动跳转
3. **用户体验差** - 优化状态提示，清晰的倒计时和错误信息

### ✅ 技术架构

```
用户支付流程：
1. 用户点击订阅 → 创建Creem支付会话
2. 跳转到Creem支付页面 → 用户完成支付
3. Creem发送Webhook通知 → 服务器创建支付记录
4. 用户返回成功页面 → 验证支付状态 → 显示结果
```

## 文件结构

```
app/
├── api/
│   ├── payment/
│   │   ├── route.ts              # 创建支付会话
│   │   └── verify/
│   │       └── route.ts          # 验证支付状态（简化版）
│   └── webhooks/
│       └── creem/
│           └── route.ts          # 处理Creem webhook通知 ✨新增
├── payment/
│   └── success/
│       └── page.tsx              # 支付成功页面（重构）
```

## 关键特性

### 🔐 安全性
- **HMAC签名验证**: 使用SHA256算法验证webhook来源
- **用户权限检查**: 确保支付记录属于正确用户
- **防重复处理**: 数据库约束避免重复支付记录

### 🔄 可靠性
- **Webhook机制**: 服务器端接收支付通知，不依赖客户端
- **智能重试**: 支付验证失败时自动重试，最多6次
- **双重确认**: Webhook + 前端验证的双重保障

### 🎯 用户体验
- **实时状态**: 动态显示支付处理状态
- **自动跳转**: 5秒倒计时后自动跳转到主页
- **错误处理**: 友好的错误提示和恢复建议

## 配置要求

### 环境变量
```bash
# 必需
CREEM_API_KEY=your_api_key
CREEM_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 数据库
DATABASE_URL=your_supabase_url
```

### Creem Webhook配置
- URL: `https://your-domain.com/api/webhooks/creem`
- 事件: `payment.succeeded`, `checkout.completed`
- 签名算法: HMAC-SHA256

## 支付流程详解

### 1. 支付发起 (`/api/payment`)
```typescript
// 创建支付会话
const checkoutRequest = {
  productId: productConfig.productId,
  amount: productConfig.price,
  metadata: { userId, planId },
  success_url: `${baseUrl}/payment/success`,
  cancel_url: `${baseUrl}/pricing`
};
```

### 2. Webhook处理 (`/api/webhooks/creem`)
```typescript
// 验证签名并创建支付记录
if (event.type === 'payment.succeeded') {
  await supabase.rpc('process_payment_success', {
    p_user_id: userId,
    p_checkout_id: checkout_id,
    p_order_id: order_id,
    p_plan_id: planId,
    p_amount: amount,
    p_currency: currency,
    p_points: pointsToAdd
  });
}
```

### 3. 状态验证 (`/api/payment/verify`)
```typescript
// 检查数据库中的支付记录
const { data: existingPayment } = await supabase
  .from('payment_transactions')
  .select('*')
  .eq('checkout_id', checkoutId)
  .eq('user_id', userId);
```

### 4. 用户界面 (`/payment/success`)
```typescript
// 智能重试机制
const MAX_RETRIES = 6;
const RETRY_INTERVAL = 5000;

if (data.status === 'pending' && retryCount < MAX_RETRIES) {
  setTimeout(verifyPayment, RETRY_INTERVAL);
}
```

## 监控和调试

### 日志检查
```bash
# 查看webhook日志
grep "Creem webhook" logs/application.log

# 查看支付处理日志
grep "process_payment_success" logs/application.log
```

### 常见问题排查

1. **Webhook未收到**
   - 检查URL配置是否正确
   - 验证防火墙设置
   - 确认SSL证书有效

2. **签名验证失败**
   - 检查`CREEM_WEBHOOK_SECRET`环境变量
   - 确认webhook配置中的密钥一致

3. **支付记录重复**
   - 数据库会自动防止重复，这是正常现象
   - 检查`checkout_id`和`order_id`的唯一性约束

## 开发和测试

### 本地测试
```bash
# 安装ngrok
npm install -g ngrok

# 启动开发服务器
npm run dev

# 在新终端创建隧道
ngrok http 3000
```

将ngrok生成的HTTPS URL配置到Creem webhook中进行测试。

### 构建验证
```bash
npm run build
```

确保所有类型检查和编译通过。

## 总结

新的支付系统通过以下关键改进解决了原有问题：

1. **可靠性**: Webhook机制确保支付记录不丢失
2. **用户体验**: 智能重试和自动跳转优化流程
3. **代码质量**: 删除冗余代码，简化架构
4. **安全性**: HMAC签名验证和权限检查

系统现在符合支付行业最佳实践，为用户提供稳定可靠的支付体验。 