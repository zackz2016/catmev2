// Vertex AI Imagen API 服务模块
// 为 standard 和 super 套餐提供高质量的图片生成服务

import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';
import { CatPrompt } from '@/types/quiz';

// 在模块加载时配置全局代理
function configureGlobalProxy() {
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log('🔗 配置全局代理支持...');
    
    // 为Google Cloud请求配置全局代理
    const originalHttpsGlobalAgent = require('https').globalAgent;
    const originalHttpGlobalAgent = require('http').globalAgent;
    
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
    
    // 确保Google Cloud认证库使用代理
    process.env.GRPC_PROXY = httpsProxy || httpProxy;
    process.env.HTTPS_PROXY = httpsProxy || httpProxy;
    process.env.HTTP_PROXY = httpProxy || httpsProxy;
    
    return true;
  }
  
  return false;
}

// 立即执行代理配置
const proxyConfigured = configureGlobalProxy();

// Google Cloud认证配置
async function getAccessToken(): Promise<string> {
  const { GoogleAuth } = require('google-auth-library');
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  return accessTokenResponse.token;
}

export interface VertexImagenResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * 使用 Vertex AI Imagen API 生成猫咪图片
 * @param prompt - 猫咪提示词对象
 * @returns Promise<VertexImagenResponse>
 */
export async function generateImageWithVertexAI(prompt: CatPrompt): Promise<VertexImagenResponse> {
  try {
    console.log('🎨 Vertex AI: 开始生成图片...');
    
    // 检查环境变量
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!projectId) {
      return {
        success: false,
        error: 'Google Cloud项目ID未配置。请设置GOOGLE_CLOUD_PROJECT_ID环境变量。'
      };
    }
    
    // 构建增强版图片生成提示词
    let imagePrompt = `Generate a stunning, high-quality, and artistically refined ${prompt.style} style image of a ${prompt.breed} cat, emphasizing intricate details and vibrant colors. `;
    
    // 添加姿势和表情描述
    imagePrompt += `The cat should be in a ${prompt.pose} pose with a ${prompt.expression} expression, clearly conveying a ${prompt.personality} personality. `;
    
    // 添加环境和氛围描述（如果有的话）
    if (prompt.environment) {
      imagePrompt += `The scene should be set in a ${prompt.environment} environment. `;
    }
    
    if (prompt.mood) {
      imagePrompt += `The overall atmosphere should feel ${prompt.mood}. `;
    }
    
    // 添加颜色和配饰描述（如果有的话）
    if (prompt.color) {
      imagePrompt += `Pay special attention to the ${prompt.color} color scheme. `;
    }
    
    if (prompt.accessory) {
      imagePrompt += `The cat should be wearing or accompanied by ${prompt.accessory}. `;
    }
    
    // 结尾要求
    imagePrompt += `The overall aesthetic should be exceptionally cute, charming, and visually appealing. Ensure the image captures the unique personality and charm of this specific cat character.`;

    console.log('🎨 Vertex AI: 生成的提示词:', imagePrompt);

    if (proxyConfigured) {
      console.log('🔗 Vertex AI 将通过全局代理连接Google服务');
    }

    // 获取访问令牌
    const accessToken = await getAccessToken();
    
    // 构建请求数据
    const requestBody = {
      instances: [{
        prompt: imagePrompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_some",
        personGeneration: "allow_adult",
        addWatermark: false
      }
    };

    console.log('🎨 Vertex AI: 调用Imagen REST API生成图片...');
    
    // 使用Node.js原生HTTPS模块确保代理支持
    const https = require('https');
    const url = require('url');
    
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

    // 如果配置了代理，代理agent会通过全局配置自动使用
    if (proxyConfigured) {
      console.log('🔗 Vertex AI: 使用HTTPS模块通过全局代理发送请求');
    }
    
    // 发送HTTPS请求
    const response = await new Promise<any>((resolve, reject) => {
      const req = https.request(requestOptions, (res: any) => {
        let data = '';
        res.on('data', (chunk: any) => {
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
      req.setTimeout(30000); // 30秒超时
      
      req.write(JSON.stringify(requestBody));
      req.end();
    });

    console.log('🎨 Vertex AI: 收到响应, 状态码:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // 检查是否有预测结果
    if (!result.predictions || result.predictions.length === 0) {
      throw new Error('No predictions in Vertex AI response');
    }

    console.log('🎨 Vertex AI: 响应预测数量:', result.predictions.length);

    const prediction = result.predictions[0];
    if (!prediction.bytesBase64Encoded) {
      throw new Error('No image data in Vertex AI response');
    }

    // 构建图片URL
    const mimeType = prediction.mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;
    
    console.log('🎨 Vertex AI: 图片生成成功, 大小:', Math.round(imageUrl.length / 1024) + 'KB');
    
    return {
      success: true,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error('🎨 Vertex AI 生成图片失败:', error);
    
    // 提供更具体的错误信息
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // 检查常见错误类型
      if (errorMessage.includes('authentication') || errorMessage.includes('credentials')) {
        errorMessage = 'Google Cloud认证失败。请检查服务账户配置。';
      } else if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        errorMessage = 'API配额超限。请稍后重试或检查Google Cloud配额设置。';
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        errorMessage = 'Vertex AI服务不可用。请检查项目ID和地区设置。';
      } else if (errorMessage.includes('permission') || errorMessage.includes('forbidden')) {
        errorMessage = '权限不足。请检查服务账户权限配置。';
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 检查 Vertex AI 服务是否可用
 * @returns Promise<boolean>
 */
export async function checkVertexAIAvailability(): Promise<boolean> {
  try {
    // 检查必要的环境变量
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    if (!projectId) {
      console.error('🔍 Vertex AI 不可用: 缺少项目ID配置');
      return false;
    }
    
    // 尝试获取访问令牌来验证认证
    const accessToken = await getAccessToken();
    
    if (accessToken) {
      console.log('🔍 Vertex AI 可用性检查通过');
      
      // 如果配置了代理，输出代理状态
      if (proxyConfigured) {
        console.log('🔗 Vertex AI 代理配置已启用');
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('🔍 Vertex AI 服务不可用:', error);
    return false;
  }
} 