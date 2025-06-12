import { NextResponse } from 'next/server';
import { CatPrompt } from '@/types/quiz';

const GEMINI_PROXY_BASE_URL = process.env.GEMINI_PROXY_URL;

enum Modality {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',  
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json() as { prompt: CatPrompt };
    
    // 构建图片生成提示词
    const imagePrompt = `Generate a ${prompt.style} style illustration of a ${prompt.breed} cat that is ${prompt.pose} with a ${prompt.expression} expression, showing a ${prompt.personality} personality. The image should be cute and artistic, suitable for a personality quiz result.`;

    // 构建完整的反向代理URL
    const fullProxyUrl = `${GEMINI_PROXY_BASE_URL}/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`;

    // 调用API生图
    const response = await fetch(fullProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: [{
          parts: [{
            text: imagePrompt
          }]
        }],
        generationConfig: {
          responseModalities: [Modality.TEXT, Modality.IMAGE], // 指定响应MIME类型，请求图像和文本
       },
      })
    });

    let imageUrl = '';
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    for (const part of data.candidates[0].content.parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data; 
        imageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`;
        return NextResponse.json({ imageUrl });
      }
  }  
  
} catch (error) {
  console.error('Error generating cat image:', error);
  return NextResponse.json(
    { error: 'Failed to generate cat image' },
    { status: 500 }
  );
}
}   