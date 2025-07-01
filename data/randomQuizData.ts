// 猫咪生成问卷新版题库 - 多样化设计
import { RandomQuestion } from '@/types/quiz';

// 阶段1：气质行为设定
export const stage1Questions: RandomQuestion[] = [
  {
    title: "如果猫咪的你早晨醒来，会做什么？",
    options: [
      { text: "继续躺着发呆", personality: "lazy", pose: "lying down" },
      { text: "冲向窗边看风景", personality: "curious", pose: "walking" },
      { text: "爬高跳低开始锻炼", personality: "energetic", pose: "jumping" },
      { text: "找人撒娇蹭蹭", personality: "friendly", pose: "rolling" }
    ]
  },
  {
    title: "你被突然抱起来时会？",
    options: [
      { text: "挣脱逃跑", personality: "independent", pose: "running" },
      { text: "乖乖躺着不动", personality: "calm", pose: "sitting" },
      { text: "喵喵抗议大声表达", personality: "expressive", pose: "meowing" },
      { text: "四肢一摊装死", personality: "dramatic", pose: "lying down" }
    ]
  },
  {
    title: "你是那种喜欢探索新鲜事的猫吗？",
    options: [
      { text: "每个角落都要去嗅一嗅", personality: "curious", pose: "exploring" },
      { text: "对变化超敏感，先观察再说", personality: "alert", pose: "sitting" },
      { text: "冲上去看个究竟", personality: "bold", pose: "jumping" },
      { text: "宁愿宅在自己的小窝里", personality: "introverted", pose: "sleeping" }
    ]
  },
  {
    title: "在猫咪派对上你最可能在干嘛？",
    options: [
      { text: "和其他猫大玩特玩", personality: "playful", pose: "playing" },
      { text: "找个角落独自观察", personality: "quiet", pose: "sitting" },
      { text: "跑酷炫技成焦点", personality: "attention-seeking", pose: "jumping" },
      { text: "在食物区舔盘子", personality: "foodie", pose: "eating" }
    ]
  }
];

// 阶段2：外貌身份设定
export const stage2Questions: RandomQuestion[] = [
  {
    title: "你是别人镜头里的哪种猫？",
    options: [
      { text: "温文尔雅的优等生猫", breed: "British Shorthair", expression: "calm" },
      { text: "热情似火的开心果猫", breed: "Bengal", expression: "excited" },
      { text: "一脸高冷的酷哥/酷姐猫", breed: "Sphynx", expression: "serious" },
      { text: "天然呆萌、让人想rua", breed: "Scottish Fold", expression: "smiling" }
    ]
  },
  {
    title: "你的猫咪外号最可能是什么？",
    options: [
      { text: "社恐王者，见人就躲", breed: "Russian Blue", expression: "shy" },
      { text: "夸张戏精，一天演三回", breed: "Siamese", expression: "dramatic" },
      { text: "快乐疯子，一刻不停", breed: "Tabby", expression: "playful" },
      { text: "优雅贵族，拒绝低级趣味", breed: "Persian", expression: "relaxed" }
    ]
  },
  {
    title: "你理想中的猫设是什么？",
    options: [
      { text: "超萌宝藏猫，吸粉无数", breed: "American Shorthair", expression: "smiling" },
      { text: "治愈陪伴猫，眼神有温度", breed: "Birman", expression: "gentle" },
      { text: "猫界潮人，永远很酷", breed: "Abyssinian", expression: "focused" },
      { text: "神秘的魔法师猫", breed: "Oriental Shorthair", expression: "mysterious" }
    ]
  },
  {
    title: "你演电影时最适合扮演谁？",
    options: [
      { text: "猫王子/公主，仪态万千", breed: "Ragdoll", expression: "smiling" },
      { text: "猫间谍，行踪神秘", breed: "Norwegian Forest Cat", expression: "alert" },
      { text: "猫小丑，负责搞笑", breed: "Orange Cat", expression: "goofy" },
      { text: "猫心理师，眼神会说话", breed: "Maine Coon", expression: "relaxed" }
    ]
  }
];

// 阶段3：画风风格选择
export const stage3Questions: RandomQuestion[] = [
  {
    title: "你的猫咪风格最像哪种画？",
    options: [
      { text: "温柔朦胧的水彩画", style: "watercolor" },
      { text: "清晰立体的油画风", style: "oil painting" },
      { text: "线条简练的现代插画", style: "minimalist" },
      { text: "丰富细节的照片写实", style: "realistic photo" }
    ]
  },
  {
    title: "你最爱的猫图风格是？",
    options: [
      { text: "日系动漫风，清新治愈", style: "anime" },
      { text: "暗黑魔幻风，神秘高冷", style: "dark fantasy" },
      { text: "小清新粉彩风，温柔好亲近", style: "pastel painting" },
      { text: "搞怪表情包风，笑出声", style: "cartoon" }
    ]
  },
  {
    title: "你希望猫咪头像给人的感觉？",
    options: [
      { text: "艺术气息浓厚", style: "sketch" },
      { text: "有时尚感，像封面大片", style: "digital art" },
      { text: "像童话书里的主角", style: "storybook" },
      { text: "贴近自然，充满生活感", style: "realistic" }
    ]
  },
  {
    title: "如果你的猫咪要印在T恤上，你希望是？",
    options: [
      { text: "复古涂鸦风，街头潮流感", style: "pop art" },
      { text: "素描风格，黑白极简", style: "pencil sketch" },
      { text: "手绘卡通，适合表情包", style: "color pencil drawing" },
      { text: "东方水墨风，有文化气质", style: "ink painting" }
    ]
  }
];

// 阶段4：场景构建
export const stage4Questions: RandomQuestion[] = [
  {
    title: "你的理想猫窝在哪儿？",
    options: [
      { text: "窗边阳光照进的榻榻米", environment: "cozy indoor", mood: "warm" },
      { text: "绿意满满的小花园", environment: "sunny garden", mood: "bright" },
      { text: "未来感十足的高科技基地", environment: "futuristic lab", mood: "cool" },
      { text: "森林小屋，神秘又宁静", environment: "magical forest", mood: "mysterious" }
    ]
  },
  {
    title: "你想在哪个场景拍猫写真？",
    options: [
      { text: "秋日公园，金黄落叶", environment: "autumn park", mood: "nostalgic" },
      { text: "海边沙滩，阳光微咸", environment: "beach sunset", mood: "peaceful" },
      { text: "夜晚城市霓虹灯下", environment: "city night", mood: "vibrant" },
      { text: "樱花树下的午后", environment: "cherry blossoms", mood: "dreamy" }
    ]
  },
  {
    title: "最适合你的猫咪生活场景是？",
    options: [
      { text: "图书馆角落，安静阅读", environment: "library corner", mood: "peaceful" },
      { text: "艺术工作室，创意无限", environment: "art studio", mood: "bright" },
      { text: "复古咖啡馆，文艺气息", environment: "vintage cafe", mood: "nostalgic" },
      { text: "露天阳台，城市风景尽收眼底", environment: "rooftop view", mood: "calm" }
    ]
  },
  {
    title: "你想在哪个地方休息？",
    options: [
      { text: "柔软床铺上的阳光角落", environment: "cozy bedroom", mood: "warm" },
      { text: "静谧湖边，风轻云淡", environment: "peaceful lake", mood: "serene" },
      { text: "老式书屋的木地板上", environment: "vintage room", mood: "nostalgic" },
      { text: "玻璃温室里的绿植之间", environment: "greenhouse", mood: "bright" }
    ]
  }
];

// 随机选择问题的工具函数
export const getRandomQuestion = (stage: number): RandomQuestion => {
  let questionPool: RandomQuestion[];
  
  switch (stage) {
    case 1:
      questionPool = stage1Questions;
      break;
    case 2:
      questionPool = stage2Questions;
      break;
    case 3:
      questionPool = stage3Questions;
      break;
    case 4:
      questionPool = stage4Questions;
      break;
    default:
      throw new Error('Invalid stage number');
  }
  
  const randomIndex = Math.floor(Math.random() * questionPool.length);
  return questionPool[randomIndex];
};

// 获取指定阶段的所有问题（用于测试）
export const getAllQuestionsForStage = (stage: number): RandomQuestion[] => {
  switch (stage) {
    case 1:
      return stage1Questions;
    case 2:
      return stage2Questions;
    case 3:
      return stage3Questions;
    case 4:
      return stage4Questions;
    default:
      return [];
  }
}; 