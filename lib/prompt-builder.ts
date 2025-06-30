// 图片生成提示词构建器
// 统一管理所有AI图像生成API的提示词构建逻辑

import { CatPrompt } from '@/types/quiz';

/**
 * 构建增强版图片生成提示词
 * 统一用于Vertex AI和代理API的提示词生成
 * @param prompt - 猫咪提示词对象
 * @returns 完整的图片生成提示词
 */
export function buildImagePrompt(prompt: CatPrompt): string {
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

  return imagePrompt;
}

/**
 * 构建用户友好的提示词描述（用于显示）
 * @param prompt - 猫咪提示词对象
 * @returns 简化的用户可读描述
 */
export function buildUserFriendlyPrompt(prompt: CatPrompt): string {
  return `Generate a ${prompt.style} style illustration of a ${prompt.breed} cat that is ${prompt.pose} with a ${prompt.expression} expression, showing a ${prompt.personality} personality${prompt.environment ? ` in a ${prompt.environment} setting` : ''}${prompt.mood ? ` with a ${prompt.mood} atmosphere` : ''}.`;
} 