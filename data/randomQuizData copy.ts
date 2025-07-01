// AI随机问卷题库 - 每个阶段包含多个有趣的问题变体
import { RandomQuestion } from '@/types/quiz';

// 阶段1：性格探索问题库
export const stage1Questions: RandomQuestion[] = [
  {
    title: "如果你穿越成了猫咪，第一件事想做什么？",
    options: [
      { text: "找个最舒服的地方睡大觉", personality: "lazy", pose: "sleeping" },
      { text: "到处跑酷炫耍帅", personality: "energetic", pose: "jumping" },
      { text: "对着镜子各种摆pose", personality: "social", pose: "rolling" },
      { text: "寻找世界上最好吃的小鱼干", personality: "curious", pose: "walking" }
    ]
  },
  {
    title: "作为一只猫咪，你最讨厌什么？",
    options: [
      { text: "被打扰睡觉，简直要命", personality: "lazy", pose: "lying down" },
      { text: "被关在室内，无法自由奔跑", personality: "energetic", pose: "running" },
      { text: "独自待着，没人陪伴", personality: "social", pose: "playing" },
      { text: "无聊的重复，没有新鲜事", personality: "curious", pose: "exploring" }
    ]
  },
  {
    title: "猫咪的你会选择什么样的日常？",
    options: [
      { text: "每天20小时睡觉时光", personality: "lazy", pose: "sleeping" },
      { text: "户外冒险和运动不停", personality: "energetic", pose: "jumping" },
      { text: "和主人互动玩耍", personality: "social", pose: "playing" },
      { text: "探索家里每个角落", personality: "curious", pose: "walking" }
    ]
  },
  {
    title: "如果你是猫咪老板，会经营什么店？",
    options: [
      { text: "舒适按摩店，专业躺平", personality: "lazy", pose: "lying down" },
      { text: "运动健身房，活力满满", personality: "energetic", pose: "running" },
      { text: "交友咖啡厅，温馨社交", personality: "social", pose: "sitting" },
      { text: "神秘探险社，发现未知", personality: "curious", pose: "walking" }
    ]
  },
  {
    title: "猫咪的你最想拥有什么超能力？",
    options: [
      { text: "时间暂停，永远在睡觉", personality: "lazy", pose: "sleeping" },
      { text: "瞬间移动，想去哪去哪", personality: "energetic", pose: "fighting" },
      { text: "心灵感应，读懂所有人", personality: "social", pose: "rolling" },
      { text: "透视眼，看穿一切秘密", personality: "curious", pose: "flying" }
    ]
  }
];

// 阶段2：身份设定问题库
export const stage2Questions: RandomQuestion[] = [
  {
    title: "你希望成为哪种猫咪网红？",
    options: [
      { text: "颜值派：靠美貌征服世界", breed: "Ragdoll", expression: "smiling" },
      { text: "才艺派：会各种搞笑技能", breed: "Tabby", expression: "excited" },
      { text: "佛系派：躺平就是我的天赋", breed: "Persian", expression: "relaxed" },
      { text: "戏精派：每天都在演戏", breed: "Siamese", expression: "curious" }
    ]
  },
  {
    title: "如果你是猫咪明星，想演什么角色？",
    options: [
      { text: "高贵公主，优雅迷人", breed: "Russian Blue", expression: "smiling" },
      { text: "搞笑谐星，逗人开心", breed: "Orange Cat", expression: "excited" },
      { text: "温暖治愈系，安慰人心", breed: "Maine Coon", expression: "relaxed" },
      { text: "神秘魅力型，深不可测", breed: "Sphynx", expression: "curious" }
    ]
  },
  {
    title: "你希望拥有什么样的猫咪人设？",
    options: [
      { text: "傲娇小公主，要被宠爱", breed: "British Shorthair", expression: "pouting" },
      { text: "活力小天使，带来快乐", breed: "Abyssinian", expression: "excited" },
      { text: "贴心小棉袄，温暖陪伴", breed: "Birman", expression: "smiling" },
      { text: "独立小酷猫，自由自在", breed: "Norwegian Forest Cat", expression: "focused" }
    ]
  },
  {
    title: "朋友们会给你什么猫咪外号？",
    options: [
      { text: "睡神喵：永远在睡觉", breed: "Persian", expression: "sleepy" },
      { text: "闪电喵：速度超快", breed: "Bengal", expression: "excited" },
      { text: "社交喵：人见人爱", breed: "American Shorthair", expression: "smiling" },
      { text: "好奇喵：什么都想知道", breed: "Devon Rex", expression: "curious" }
    ]
  },
  {
    title: "如果开一家猫咪公司，你是什么职位？",
    options: [
      { text: "首席颜值官，负责美貌", breed: "Balinese", expression: "smiling" },
      { text: "首席娱乐官，负责搞笑", breed: "Tabby", expression: "excited" },
      { text: "首席治愈官，负责温暖", breed: "Scottish Fold", expression: "relaxed" },
      { text: "首席探索官，负责发现", breed: "Siamese", expression: "curious" }
    ]
  }
];

// 阶段3：风格选择问题库
export const stage3Questions: RandomQuestion[] = [
  {
    title: "你希望你的猫咪形象是什么风格？",
    options: [
      { text: "可爱卡通，萌化人心", style: "cartoon" },
      { text: "真实摄影，自然生动", style: "realistic" },
      { text: "水彩手绘，温柔梦幻", style: "watercolor" },
      { text: "油画艺术，经典优雅", style: "oil-painting" }
    ]
  },
  {
    title: "如果为你的猫咪拍写真，选什么风格？",
    options: [
      { text: "日系清新，治愈温暖", style: "anime" },
      { text: "欧美复古，经典怀旧", style: "vintage" },
      { text: "简约现代，干净利落", style: "minimalist" },
      { text: "梦幻仙境，奇幻浪漫", style: "fantasy" }
    ]
  },
  {
    title: "你的猫咪头像应该是什么感觉？",
    options: [
      { text: "手绘素描，艺术气息", style: "sketch" },
      { text: "卡通动漫，青春活力", style: "cartoon" },
      { text: "水墨画风，东方韵味", style: "watercolor" },
      { text: "照片级真实，惟妙惟肖", style: "realistic photo" }
    ]
  },
  {
    title: "想让朋友们看到什么样的你？",
    options: [
      { text: "可爱软萌的二次元风", style: "anime" },
      { text: "高级质感的艺术风", style: "oil painting" },
      { text: "清新自然的小清新风", style: "pastel painting" },
      { text: "时尚现代的简约风", style: "digital art" }
    ]
  },
  {
    title: "如果制作猫咪表情包，选什么画风？",
    options: [
      { text: "呆萌卡通风，超级可爱", style: "cartoon" },
      { text: "真实照片风，表情到位", style: "realistic photo" },
      { text: "手绘涂鸦风，随性自然", style: "color pencil drawing" },
      { text: "复古怀旧风，经典回忆", style: "art deco" }
    ]
  }
];

// 阶段4：场景构建问题库
export const stage4Questions: RandomQuestion[] = [
  {
    title: "你希望你的猫咪生活在什么样的环境中？",
    options: [
      { text: "温暖的家中，阳光透过窗户", environment: "cozy indoor", mood: "warm" },
      { text: "花园里，被鲜花包围", environment: "sunny garden", mood: "bright" },
      { text: "现代公寓，简约时尚", environment: "modern apartment", mood: "cool" },
      { text: "神秘森林，充满魔法", environment: "magical forest", mood: "mysterious" }
    ]
  },
  {
    title: "猫咪的你最想在哪里度过午后时光？",
    options: [
      { text: "海边沙滩，听着海浪声", environment: "beach sunset", mood: "peaceful" },
      { text: "复古书房，书香满屋", environment: "vintage room", mood: "nostalgic" },
      { text: "雪景窗台，看雪花飞舞", environment: "snowy winter", mood: "dreamy" },
      { text: "秋日公园，落叶纷飞", environment: "autumn leaves", mood: "nostalgic" }
    ]
  },
  {
    title: "理想的猫咪摄影背景是什么？",
    options: [
      { text: "温馨客厅，柔软沙发", environment: "cozy indoor", mood: "warm" },
      { text: "阳光花园，绿意盎然", environment: "sunny garden", mood: "energetic" },
      { text: "星空下的露台", environment: "night sky", mood: "mysterious" },
      { text: "樱花树下的春日", environment: "cherry blossoms", mood: "dreamy" }
    ]
  },
  {
    title: "如果猫咪的你要拍MV，选什么场景？",
    options: [
      { text: "现代都市，霓虹闪烁", environment: "modern city", mood: "energetic" },
      { text: "梦幻城堡，童话世界", environment: "fantasy castle", mood: "dreamy" },
      { text: "宁静湖边，水波荡漾", environment: "peaceful lake", mood: "peaceful" },
      { text: "复古咖啡厅，文艺范儿", environment: "vintage cafe", mood: "nostalgic" }
    ]
  },
  {
    title: "猫咪的你想要什么样的专属空间？",
    options: [
      { text: "舒适卧室，软绵绵的床", environment: "cozy bedroom", mood: "warm" },
      { text: "艺术工作室，创意无限", environment: "art studio", mood: "bright" },
      { text: "图书馆角落，安静读书", environment: "library corner", mood: "peaceful" },
      { text: "屋顶花园，俯瞰城市", environment: "rooftop garden", mood: "cool" }
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