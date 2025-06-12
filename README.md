# CatMe v2

-一个现代化的 Next.js 14 项目，通过 AI 生成符合用户个性测试结果的猫咪图片，满足社交分享和娱乐需求。
-目标用户：喜爱猫咪、对人格测试感兴趣的年轻人，社交平台内容创作者。

## 核心功能

-个性测试问卷：用户回答3道选择题，每道题有9个选项，选择1个以获取性格倾向。
-Prompt生成：根据用户的回答构建一段AI图片生成Prompt。
-AI 图片生成：调用 Gemini 反向代理接口，根据Prompt生成一张定制化猫咪图片。
-结果分享与保存：用户可保存并下载图片，分享到社交平台。
-积分和订阅系统：新注册用户赠送1积分，可以生成一张图片，订阅后可获得更多积分。

## 用户流程

-落地页：展示欢迎语和测试界面。
-答题阶段：逐题展示，用户选择一项，展示下一题。
-提交问卷：用户选择完毕，触发后端 API，生成图片。
-结果展示：猫咪图+保存/下载/重新开始按钮。
-积分充值：如用户积分用完，引导用户进入积分中心充值订阅。

## 技术栈

-前端：Next.js、TypeScript、TailwindCSS、shadcn/ui、Clerk
-后端：Next.js、Supabase、 Cloudflare R2 用于图片存储
-LLM/图像：Cloudflare workers反向代理Gemini API，调用gemini模型
-支付与积分：Stripe(或其他支持个人开发者的收单平台) + Supabase
-部署：Vercel

## 🚀 特性

- 基于 Next.js 14 构建
- 使用 TypeScript 确保类型安全
- 采用 Tailwind CSS 进行样式管理
- 集成 Radix UI 组件库
- 响应式设计
- 深色模式支持

## 📦 安装

1. 克隆项目
```bash
git clone [your-repository-url]
cd catmev2
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 🛠️ 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **表单处理**: React Hook Form
- **数据验证**: Zod
- **图表**: Recharts
- **日期处理**: date-fns

## 📁 项目结构

```
├── app/                    # Next.js 14 app 目录
│   └── page.tsx           # 主页面
├── components/            # 组件目录
│   ├── share/            # 共享组件
│   │   ├── Navbar       # 导航栏
│   │   ├── Hero         # 首页主视觉
│   │   ├── Features     # 特性展示
│   │   ├── Gallery      # 图片展示
│   │   ├── HowToUse     # 使用指南
│   │   ├── Pricing      # 价格方案
│   │   └── Footer       # 页脚
│   ├── quiz/            # 测验相关组件
│   ├── ui/              # UI 基础组件
│   └── theme-provider.tsx # 主题提供者
├── public/               # 静态资源
└── styles/              # 全局样式
```

## 🎨 组件文档

### 共享组件

#### Navbar
网站的主导航栏，提供页面导航功能。

#### Hero
首页的主视觉区域，展示网站的主要信息和价值主张。

#### Features
展示产品的主要特性和优势。

#### Gallery
图片展示区域，用于展示产品图片或相关视觉内容。

#### HowToUse
使用指南部分，帮助用户了解如何使用产品。

#### Pricing
价格方案展示，展示不同的产品套餐和价格。

#### Footer
网站页脚，包含额外的导航链接和版权信息。

## 🔧 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行代码检查

## 🌙 主题支持

项目支持深色模式，可以通过 `theme-provider` 组件进行主题切换。

## 📝 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 使用 Prettier 进行代码格式化

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

[MIT License](LICENSE)

## 👥 作者

[Your Name] - [Your Email]

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) 