# CatMe v2

    一个现代化的 Next.js 15.24项目，通过 AI 生成符合用户个性测试结果的猫咪图片，满足社交分享和娱乐需求。
    目标用户：喜爱猫咪、对人格测试感兴趣的年轻人，社交平台内容创作者。

## 核心功能

    AI驱动的个性图片生成
    互动式心理测试
    根据测试结果生成符合用户个性的猫咪图片
    订阅制系统：分为三个等级
    积分管理系统
    云端图片存储
    多语言支持：首要语言英文
    SEO优化

## 用户流程

    落地页：展示欢迎语和答题界面，未注册用户享有１积分，可以完成１次答题生成１张图片。
    答题阶段：有3道选择题，以3x3标签形式呈现，每次展示一题，用户每次从9个标签中选择一个。
    提交答案：根据用户选择的3个标签，构造一段AI生图的Prompt触发后端API，生成图片。
    结果展示：展示AI生成的猫咪图，用户可以保存或下载，或点击重新开始。
    积分充值：如用户积分用完，用户点击重新开始按钮，引导用户注册并进入积分中心充值订阅。

## 技术栈

    前后端: Next.js 14 (App Router)
    AI: Cloudflare workers反向代理Gemini API
    数据库: Supabase
    用户认证: Clerk
    支付: Creem
    表单处理和验证: React Hook Form + Zod
    图片存储: Cloudinary
    样式: Tailwind CSS
    UI组件：shadcn/ui
    动画：Framer Motino
    图标库：Lucide React
    国际化: Next.js i18n

## 环境变量配置

创建 `.env.local` 文件并添加以下环境变量：

```env
# Creem 支付服务配置
CREEM_API_KEY=your_creem_api_key_here
NEXT_PUBLIC_CREEM_API_KEY=your_creem_api_key_here  # 用于前端签名验证

# 应用URL配置 - 用于支付回调（开发环境）
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 应用URL配置 - 用于支付回调（生产环境）
# NEXT_PUBLIC_APP_URL=https://your-domain.com

# Clerk 认证配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 支付流程说明

### 支付流程页面

1. **定价页面**: `/pricing` - 用户选择套餐
2. **支付成功页面**: `/payment/success` - 支付完成后的处理页面

### 支付流程

1. 用户在定价页面选择套餐并点击订阅
2. 系统验证用户登录状态
3. 调用 `/api/payment` 创建支付会话
4. 跳转到 Creem 支付页面
5. 支付完成后跳转到 `/payment/success`
6. 系统自动验证支付状态
7. 显示支付结果并自动跳转

### API 接口

- `POST /api/payment` - 创建支付会话
- `GET /api/payment/verify` - 验证支付状态

## 安装和运行

```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行生产版本
pnpm start
```

## 注意事项

1. 确保在 `.env.local` 中正确设置 `NEXT_PUBLIC_APP_URL`
2. Creem API Key 需要从 Creem 控制台获取
3. 支付回调 URL 会自动设置为 `{NEXT_PUBLIC_APP_URL}/payment/success`
4. 支付取消 URL 会自动设置为 `{NEXT_PUBLIC_APP_URL}/pricing?status=cancelled`

## 前端组件布局

#### Navbar
网站的主导航栏，提供页面导航功能。

#### Hero
首页的主视觉区域，展示网站的主要信息和价值主张。

#### Features
展示产品的主要功能界面,答题和图片生成。

#### HowToUse
使用指南部分，帮助用户了解如何使用产品。

#### Gallery
图片展示区域，用于展示用户生成的图片。

#### Pricing
价格方案展示，展示不同的产品套餐和价格。

#### Footer
网站页脚，包含额外的导航链接和版权信息。