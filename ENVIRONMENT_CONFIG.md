# 环境配置指南

本文档说明如何在不同环境中配置代理设置。

## 配置方式

通过设置 `ENABLE_PROXY` 环境变量来控制是否使用代理：

- `ENABLE_PROXY=true` - 启用代理
- `ENABLE_PROXY=false` - 禁用代理
- 不设置 - 根据其他环境变量自动判断

## 本地开发环境配置

在项目根目录创建 `.env.local` 文件：

```bash
# ==================== 代理配置 ====================
# 启用代理（本地开发环境通常需要代理访问Google服务）
ENABLE_PROXY=true

# 代理服务器地址（根据你的实际代理软件端口配置）
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890

# ==================== Google Cloud 配置 ====================
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json

# ==================== API 密钥 ====================
GEMINI_API_KEY=your-gemini-api-key

# ==================== 数据库配置 ====================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ==================== 认证配置 ====================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# ==================== 支付配置 ====================
CREEM_WEBHOOK_SECRET=your-creem-webhook-secret
```

## Vercel 生产环境配置

在 Vercel Dashboard 中配置环境变量：

### 必须设置的变量：
```bash
# 禁用代理（Vercel 可以直接访问 Google API）
ENABLE_PROXY=false

# Google Cloud 配置
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account",...}  # JSON字符串

# API 密钥
GEMINI_API_KEY=your-gemini-api-key

# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# 支付配置
CREEM_WEBHOOK_SECRET=your-creem-webhook-secret
```

### 不要设置的变量：
```bash
# 生产环境不需要这些代理变量
# HTTP_PROXY
# HTTPS_PROXY
```

## 快速切换

### 启用代理（本地开发）：
```bash
# 在 .env.local 中设置
ENABLE_PROXY=true
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### 禁用代理（生产环境）：
```bash
# 在 Vercel 或生产环境中设置
ENABLE_PROXY=false
```

## 验证配置

启动应用后，查看控制台输出：

```
🚀 代理配置模块加载完成
📋 代理控制模式: 环境变量控制: TRUE
🔗 代理配置结果: ✅ 已启用
```

或者：

```
🚀 代理配置模块加载完成
📋 代理控制模式: 环境变量控制: FALSE
🔗 代理配置结果: ❌ 已禁用
```

## 常见问题

### 1. 本地开发无法访问 Google API
确保设置了正确的代理配置：
```bash
ENABLE_PROXY=true
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
```

### 2. Vercel 部署后 API 超时
确保在 Vercel 中禁用了代理：
```bash
ENABLE_PROXY=false
```

### 3. 代理软件端口不是 7890
修改代理地址为你实际使用的端口：
```bash
HTTP_PROXY=http://127.0.0.1:YOUR_PORT
HTTPS_PROXY=http://127.0.0.1:YOUR_PORT
``` 