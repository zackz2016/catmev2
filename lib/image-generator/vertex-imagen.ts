// Vertex AI Imagen API 服务模块
// 为 standard 和 super 套餐提供高质量的图片生成服务

import { VertexAI } from '@google-cloud/vertexai';
import { CatPrompt } from '@/types/quiz';

// Vertex AI 实例延迟初始化，避免构建时错误
let vertex_ai: VertexAI | null = null;

function getVertexAI(): VertexAI {
  if (!vertex_ai) {
    vertex_ai = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT_ID!,
      location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
    });
  }
  return vertex_ai;
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

    // 调用 Vertex AI Imagen API
    const request = {
      instances: [{
        prompt: imagePrompt
      }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '1:1',
        safetySetting: 'block_medium_and_above',
        personGeneration: 'dont_allow', // 专注于猫咪生成
        addWatermark: false, // 可根据需要调整
        outputOptions: {
          mimeType: 'image/png',
          compressionQuality: 90
        }
      }
    };

    console.log('🎨 Vertex AI: 发送生成请求:', request);

    // 发送请求到 Vertex AI
    const endpoint = `https://${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/${process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'}/publishers/google/models/imagen-3.0-generate-002:predict`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    console.log('🎨 Vertex AI: 响应状态:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎨 Vertex AI 错误:', errorText);
      throw new Error(`Vertex AI API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('🎨 Vertex AI: 响应数据结构:', JSON.stringify(data, null, 2));

    if (!data.predictions || !data.predictions[0] || !data.predictions[0].bytesBase64Encoded) {
      console.error('🎨 Vertex AI: 无效的响应结构');
      throw new Error('Invalid response structure from Vertex AI Imagen API');
    }

    // 构建图片URL
    const imageData = data.predictions[0].bytesBase64Encoded;
    const mimeType = data.predictions[0].mimeType || 'image/png';
    const imageUrl = `data:${mimeType};base64,${imageData}`;

    console.log('🎨 Vertex AI: 图片生成成功，长度:', imageUrl.length);

    return {
      success: true,
      imageUrl: imageUrl
    };

  } catch (error) {
    console.error('🎨 Vertex AI 生成图片失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 获取 Google Cloud 访问令牌
 * @returns Promise<string>
 */
async function getAccessToken(): Promise<string> {
  try {
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }
    
    return accessToken.token;
  } catch (error) {
    console.error('🔐 获取访问令牌失败:', error);
    throw new Error('Failed to authenticate with Google Cloud');
  }
}

/**
 * 检查 Vertex AI 服务是否可用
 * @returns Promise<boolean>
 */
export async function checkVertexAIAvailability(): Promise<boolean> {
  try {
    const token = await getAccessToken();
    return !!token;
  } catch (error) {
    console.error('🔍 Vertex AI 服务不可用:', error);
    return false;
  }
} 