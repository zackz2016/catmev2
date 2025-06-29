# 使用Google Vertex AI开发图像生成应用 - 完整教程

## 📋 教程概述

本教程将指导您使用Google Cloud Vertex AI Imagen 4.0模型开发图像生成应用，包括云端设置、认证配置、API调用和代理配置等完整流程。

## 🎯 技术栈
- Google Cloud Vertex AI (Imagen 4.0)
- Node.js + TypeScript
- google-auth-library
- HTTPS代理支持

---

## 第一步：Google Cloud平台设置

### 1.1 创建Google Cloud项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击顶部的项目选择器，创建新项目
3. 输入项目名称（如：`my-ai-image-app`）
4. 记录项目ID，后续配置需要使用

### 1.2 启用Vertex AI API

1. 在Google Cloud Console中，导航到 **API和服务 > 库**
2. 搜索 "Vertex AI API"
3. 点击启用Vertex AI API
4. 等待API启用完成（通常需要1-2分钟）

### 1.3 设置计费账户

1. 导航到 **计费**
2. 选择或创建计费账户
3. 将计费账户链接到您的项目
4. **注意**：Imagen 4.0为付费服务，请确保有足够预算

---

## 第二步：服务账户认证配置

### 2.1 创建服务账户

1. 在Google Cloud Console中，导航到 **IAM和管理 > 服务账户**
2. 点击 **创建服务账户**
3. 输入服务账户详细信息：
   - **名称**：`vertex-ai-service`
   - **描述**：`Vertex AI image generation service account`
4. 点击 **创建并继续**

### 2.2 分配权限

在角色分配步骤中，添加以下角色：
- **Vertex AI User** - 使用Vertex AI服务
- **AI Platform Developer** - 访问AI平台资源

点击 **继续** 和 **完成**

### 2.3 生成密钥文件

1. 在服务账户列表中，点击刚创建的服务账户
2. 切换到 **密钥** 标签
3. 点击 **添加密钥 > 创建新密钥**
4. 选择 **JSON** 格式
5. 点击 **创建**，自动下载密钥文件
6. 将密钥文件保存到项目根目录，重命名为 `service-account-key.json`

---

## 第三步：项目环境配置

### 3.1 安装依赖包

```bash
npm install google-auth-library https-proxy-agent http-proxy-agent
```

### 3.2 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# Google Cloud配置
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1

# VPN代理配置（如需要）
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1,::1,.local
```

**重要提示**：
- 将 `your-project-id` 替换为您的实际项目ID
- 如果网络环境正常，可以省略代理配置
- 确保 `service-account-key.json` 文件路径正确

---

## 第四步：代理配置（适用于受限网络环境）

### 4.1 全局代理配置模块

创建 `lib/proxy-config.js`：

```javascript
// 全局代理配置模块
function configureGlobalProxy() {
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log('🔗 配置全局代理支持...');
    
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const { HttpProxyAgent } = require('http-proxy-agent');
    
    if (httpsProxy) {
      const httpsAgent = new HttpsProxyAgent(httpsProxy);
      require('https').globalAgent = httpsAgent;
      console.log('✅ HTTPS全局代理已配置:', httpsProxy);
    }
    
    if (httpProxy) {
      const httpAgent = new HttpProxyAgent(httpProxy);
      require('http').globalAgent = httpAgent;
      console.log('✅ HTTP全局代理已配置:', httpProxy);
    }
    
    return true;
  }
  
  return false;
}

module.exports = { configureGlobalProxy };
```

---

## 第五步：Vertex AI Imagen 4.0 API实现

### 5.1 创建图像生成服务

创建 `lib/vertex-imagen.js`：

```javascript
const { GoogleAuth } = require('google-auth-library');
const { configureGlobalProxy } = require('./proxy-config');

// 初始化代理配置
const proxyConfigured = configureGlobalProxy();

// Google Cloud认证
async function getAccessToken() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  return accessTokenResponse.token;
}

// 使用Imagen 4.0生成图片
async function generateImageWithImagen4(prompt) {
  try {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID环境变量未配置');
    }

    console.log('🎨 开始生成图片...');

    // 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 构建请求数据
    const requestBody = {
      instances: [{
        prompt: prompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
        addWatermark: false
      }
    };

    // 使用HTTPS模块发送请求（支持代理）
    const https = require('https');
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-4.0-generate-preview-06-06:predict`;
    const urlParsed = new URL(endpoint);
    
    const requestOptions = {
      hostname: urlParsed.hostname,
      port: urlParsed.port || 443,
      path: urlParsed.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
      }
    };

    if (proxyConfigured) {
      console.log('🔗 通过代理发送请求到Vertex AI');
    }

    // 发送HTTPS请求
    const response = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: () => Promise.resolve(JSON.parse(data)),
            text: () => Promise.resolve(data)
          });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.setTimeout(30000);
      
      req.write(JSON.stringify(requestBody));
      req.end();
    });

    console.log('🎨 收到Vertex AI响应，状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.predictions || result.predictions.length === 0) {
      throw new Error('Vertex AI响应中没有预测结果');
    }

    const prediction = result.predictions[0];
    if (!prediction.bytesBase64Encoded) {
      throw new Error('Vertex AI响应中没有图片数据');
    }

    // 构建图片URL
    const mimeType = prediction.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;
    
    console.log('🎨 图片生成成功，大小:', Math.round(imageUrl.length / 1024) + 'KB');
    
    return {
      success: true,
      imageUrl: imageUrl,
      model: 'imagen-4.0'
    };

  } catch (error) {
    console.error('🎨 图片生成失败:', error.message);
    
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateImageWithImagen4
};
```

---

## 第六步：API路由实现

### 6.1 创建Next.js API路由

创建 `pages/api/generate-image.js` 或 `app/api/generate-image/route.js`：

```javascript
// Next.js API路由
import { generateImageWithImagen4 } from '@/lib/vertex-imagen';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return Response.json(
        { error: '缺少prompt参数' },
        { status: 400 }
      );
    }

    // 调用Vertex AI生成图片
    const result = await generateImageWithImagen4(prompt);
    
    if (result.success) {
      return Response.json({
        success: true,
        imageUrl: result.imageUrl,
        model: result.model
      });
    } else {
      return Response.json(
        { error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API错误:', error);
    return Response.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
```

---

## 第七步：前端调用示例

### 7.1 React组件示例

```jsx
import { useState } from 'react';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      alert('请输入图片描述');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      
      if (data.success) {
        setImageUrl(data.imageUrl);
        console.log('使用模型:', data.model);
      } else {
        alert('生成失败: ' + data.error);
      }
    } catch (error) {
      alert('请求失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">AI图片生成器</h2>
      
      <div className="mb-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述您想要的图片..."
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>
      
      <button
        onClick={generateImage}
        disabled={loading}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? '生成中...' : '生成图片'}
      </button>
      
      {imageUrl && (
        <div className="mt-6">
          <img
            src={imageUrl}
            alt="Generated"
            className="max-w-md rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
```

### 7.2 Vue.js组件示例

```vue
<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">AI图片生成器</h2>
    
    <div class="mb-4">
      <textarea
        v-model="prompt"
        placeholder="描述您想要的图片..."
        class="w-full p-3 border rounded-lg"
        rows="3"
      ></textarea>
    </div>
    
    <button
      @click="generateImage"
      :disabled="loading"
      class="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
    >
      {{ loading ? '生成中...' : '生成图片' }}
    </button>
    
    <div v-if="imageUrl" class="mt-6">
      <img
        :src="imageUrl"
        alt="Generated"
        class="max-w-md rounded-lg shadow-lg"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      prompt: '',
      imageUrl: '',
      loading: false
    }
  },
  methods: {
    async generateImage() {
      if (!this.prompt.trim()) {
        alert('请输入图片描述');
        return;
      }

      this.loading = true;
      
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ prompt: this.prompt })
        });

        const data = await response.json();
        
        if (data.success) {
          this.imageUrl = data.imageUrl;
          console.log('使用模型:', data.model);
        } else {
          alert('生成失败: ' + data.error);
        }
      } catch (error) {
        alert('请求失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>
```

---

## 第八步：测试验证

### 8.1 创建测试脚本

创建 `test-imagen.js`：

```javascript
const { generateImageWithImagen4 } = require('./lib/vertex-imagen');

async function testImageGeneration() {
  console.log('🧪 开始测试Imagen 4.0图片生成...');
  
  const testPrompt = "A cute cat sitting in a sunny garden, realistic style, high quality";
  
  const result = await generateImageWithImagen4(testPrompt);
  
  if (result.success) {
    console.log('✅ 测试成功！');
    console.log('📊 图片大小:', Math.round(result.imageUrl.length / 1024) + 'KB');
    console.log('🎨 使用模型:', result.model);
  } else {
    console.log('❌ 测试失败:', result.error);
  }
}

testImageGeneration();
```

### 8.2 运行测试

```bash
node test-imagen.js
```

---

## 第九步：优化和最佳实践

### 9.1 错误处理优化

```javascript
// 添加重试机制
async function generateImageWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await generateImageWithImagen4(prompt);
    
    if (result.success) {
      return result;
    }
    
    if (i < maxRetries - 1) {
      console.log(`重试 ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return { success: false, error: '达到最大重试次数' };
}
```

### 9.2 成本控制

```javascript
// 添加使用统计
let requestCount = 0;
const dailyLimit = 100;

function checkDailyLimit() {
  if (requestCount >= dailyLimit) {
    throw new Error('今日API调用次数已达上限');
  }
  requestCount++;
}
```

### 9.3 图片质量参数

```javascript
// Imagen 4.0高级参数配置
const advancedParameters = {
  sampleCount: 1,
  aspectRatio: "1:1",        // 可选: "9:16", "16:9", "4:3", "3:4"
  safetyFilterLevel: "block_some", // "block_most", "block_few"
  personGeneration: "allow_adult", // "dont_allow"
  addWatermark: false,
  seed: 12345,               // 可选：固定随机种子
  guidanceScale: 7           // 可选：提示词遵循度 (1-20)
};
```

---

## 🎯 完成部署

### 部署检查清单

- ✅ Google Cloud项目已创建并启用Vertex AI API
- ✅ 服务账户已创建并分配正确权限
- ✅ 密钥文件已下载并配置环境变量
- ✅ 依赖包已安装
- ✅ 代理配置已设置（如需要）
- ✅ API路由已实现
- ✅ 前端组件已集成
- ✅ 测试验证通过

### 成本预估

- **Imagen 4.0**：约$0.04-0.08每张图片
- **建议**：设置Google Cloud预算警报
- **优化**：实现图片缓存和去重机制

---

## 🚀 总结

您现在已经完成了基于Google Vertex AI Imagen 4.0的图像生成应用开发！这套方案具有以下特点：

- **最新技术**：使用Imagen 4.0最新模型
- **网络兼容**：支持代理配置，适用于各种网络环境
- **生产就绪**：包含错误处理、重试机制和成本控制
- **易于扩展**：模块化设计，便于后续功能扩展

开始创建您的AI图像生成应用吧！🎨 