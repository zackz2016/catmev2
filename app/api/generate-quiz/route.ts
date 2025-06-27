// AI问题生成API - 从丰富题库中随机选择问题
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getRandomQuestion } from '@/data/randomQuizData';

// 问题生成的配置信息
const stageConfig = {
  1: {
    theme: "性格探索",
    description: "通过有趣的情景设定来探索用户的性格特点"
  },
  2: {
    theme: "身份设定", 
    description: "通过角色扮演来确定猫咪的品种和表情特征"
  },
  3: {
    theme: "风格选择",
    description: "通过审美偏好来确定图片的艺术风格"
  },
  4: {
    theme: "场景构建",
    description: "通过场景设定来增加图片的丰富度和故事性"
  }
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    // 注意：移除登录检查，支持未注册用户免费体验
    // 未注册用户也应该能够生成问题，然后使用访客试用系统生成图片

    const { stage } = await request.json();
    
    if (!stage || stage < 1 || stage > 4) {
      return NextResponse.json({ error: '无效的问题阶段' }, { status: 400 });
    }

    try {
      // 从题库中随机选择问题
      const randomQuestion = getRandomQuestion(stage);
      
      const config = stageConfig[stage as keyof typeof stageConfig];
      
      return NextResponse.json({
        success: true,
        question: randomQuestion,
        stage,
        theme: config.theme,
        description: config.description
      });

    } catch (error) {
      console.error('选择随机问题失败:', error);
      
      // 如果随机选择失败，返回默认问题
      const fallbackQuestions = {
        1: {
          title: "如果你穿越成了猫咪，第一件事想做什么？",
          options: [
            { text: "找个最舒服的地方睡大觉", personality: "lazy", pose: "lying down" },
            { text: "到处跑酷炫耍帅", personality: "energetic", pose: "jumping" },
            { text: "对着镜子各种摆pose", personality: "social", pose: "sitting" },
            { text: "寻找世界上最好吃的小鱼干", personality: "curious", pose: "exploring" }
          ]
        },
        2: {
          title: "你希望成为哪种猫咪网红？",
          options: [
            { text: "颜值派：靠美貌征服世界", breed: "Ragdoll", expression: "smiling" },
            { text: "才艺派：会各种搞笑技能", breed: "Tabby", expression: "excited" },
            { text: "佛系派：躺平就是我的天赋", breed: "Persian", expression: "relaxed" },
            { text: "戏精派：每天都在演戏", breed: "Siamese", expression: "curious" }
          ]
        },
        3: {
          title: "你希望你的猫咪形象是什么风格？",
          options: [
            { text: "可爱卡通，萌化人心", style: "cartoon" },
            { text: "真实摄影，自然生动", style: "realistic" },
            { text: "水彩手绘，温柔梦幻", style: "watercolor" },
            { text: "油画艺术，经典优雅", style: "oil-painting" }
          ]
        },
        4: {
          title: "你希望你的猫咪生活在什么样的环境中？",
          options: [
            { text: "温暖的家中，阳光透过窗户", environment: "cozy indoor", mood: "warm" },
            { text: "花园里，被鲜花包围", environment: "sunny garden", mood: "bright" },
            { text: "现代公寓，简约时尚", environment: "modern apartment", mood: "cool" },
            { text: "神秘森林，充满魔法", environment: "magical forest", mood: "mysterious" }
          ]
        }
      };

      const fallbackQuestion = fallbackQuestions[stage as keyof typeof fallbackQuestions];
      const config = stageConfig[stage as keyof typeof stageConfig];

      return NextResponse.json({
        success: true,
        question: fallbackQuestion,
        stage,
        theme: config.theme,
        description: config.description,
        isFallback: true // 标记这是备用问题
      });
    }

  } catch (error) {
    console.error('生成问题失败:', error);
    return NextResponse.json(
      { error: '生成问题失败，请稍后重试' },
      { status: 500 }
    );
  }
} 