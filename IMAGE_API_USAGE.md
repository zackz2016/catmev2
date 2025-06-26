# 图像生成API使用说明

本项目支持两种图像生成API，可以根据需要进行切换：

## API提供商

### 1. Gemini API (默认)
- **文件**: `app/api/generate-cat/route.ts`
- **模型**: `gemini-2.0-flash-preview-image-generation`
- **特点**: Google的最新图像生成模型，支持文本+图像混合输出
- **环境变量**: 
  - `GEMINI_PROXY_URL`: Gemini API代理地址

### 2. TUZI API (备选)
- **文件**: `app/api/generate-cat/route-tuzi.ts` 
- **模型**: `gpt-image-1`
- **特点**: OpenAI兼容API，支持base64和URL两种返回格式
- **环境变量**:
  - `TUZI_API_KEY`: TUZI API密钥 (默认: sk-**)
  - `TUZI_API_BASE`: TUZI API基础URL (默认: https://api.tu-zi.com/v1)

## 使用方法

### 方法1: 重命名文件切换
```bash
# 切换到TUZI API
mv app/api/generate-cat/route.ts app/api/generate-cat/route-gemini.ts
mv app/api/generate-cat/route-tuzi.ts app/api/generate-cat/route.ts

# 切换回Gemini API  
mv app/api/generate-cat/route.ts app/api/generate-cat/route-tuzi.ts
mv app/api/generate-cat/route-gemini.ts app/api/generate-cat/route.ts
```

### 方法2: 修改前端调用
在前端代码中可以选择调用不同的端点：
```typescript
// 调用Gemini API (默认)
const response = await fetch('/api/generate-cat', {...});

// 调用TUZI API (需要创建对应路由)
const response = await fetch('/api/generate-cat-tuzi', {...});
```

## 环境变量配置

创建或更新 `.env.local` 文件：

```env
# Gemini API配置
GEMINI_PROXY_URL=your_gemini_proxy_url

# TUZI API配置  
TUZI_API_KEY=sk-your-tuzi-api-key
TUZI_API_BASE=https://api.tu-zi.com/v1
```

## API响应格式

两个API都返回相同的响应格式：

```typescript
{
  imageUrl: string;           // 生成的图片URL或base64数据
  pointsRemaining: number;    // 用户剩余积分
  provider: 'Gemini' | 'TUZI'; // API提供商标识
}
```

## 切换建议

1. **开发阶段**: 使用文件重命名方式，便于快速测试不同API
2. **生产环境**: 建议使用环境变量配置，避免频繁修改代码
3. **A/B测试**: 可以同时部署两个端点，分流测试效果

## 注意事项

- 两个API的提示词格式相同，可以无缝切换
- TUZI API支持更多参数配置（如图片尺寸）
- Gemini API支持混合模态输出
- 积分扣减逻辑完全相同
- 错误处理和用户认证逻辑一致 