import { Question } from '../types/quiz';

export const questions: Question[] = [
  {
    id: 1,
    title: "你最理想的周末状态是？",
    options: [
      {
        id: "1A",
        text: "宅家追剧、躺平一整天",
        attributes: {
          pose: "lying down",
          personality: "lazy"
        }
      },
      {
        id: "1B",
        text: "出门探店 / 运动放风",
        attributes: {
          pose: "jumping",
          personality: "energetic"
        }
      },
      {
        id: "1C",
        text: "安静做点手工 / 看书",
        attributes: {
          pose: "sitting",
          personality: "calm"
        }
      },
      {
        id: "1D",
        text: "约朋友聚会聊天",
        attributes: {
          pose: "playing",
          personality: "social"
        }
      },
      {
        id: "1E",
        text: "独自探索新地方",
        attributes: {
          pose: "exploring",
          personality: "adventurous"
        }
      },
      {
        id: "1F",
        text: "整理房间 / 做家务",
        attributes: {
          pose: "cleaning",
          personality: "organized"
        }
      },
      {
        id: "1G",
        text: "学习新技能",
        attributes: {
          pose: "studying",
          personality: "curious"
        }
      },
      {
        id: "1H",
        text: "打游戏 / 刷手机",
        attributes: {
          pose: "relaxing",
          personality: "playful"
        }
      },
      {
        id: "1I",
        text: "户外徒步 / 亲近自然",
        attributes: {
          pose: "walking",
          personality: "nature-loving"
        }
      }
    ]
  },
  {
    id: 2,
    title: "朋友会怎么形容你？",
    options: [
      {
        id: "2A",
        text: "表面高冷，熟了超疯",
        attributes: {
          breed: "Ragdoll/Siamese"
        }
      },
      {
        id: "2B",
        text: "乖巧安静好相处",
        attributes: {
          breed: "British Shorthair/American Shorthair"
        }
      },
      {
        id: "2C",
        text: "常常搞怪出其不意",
        attributes: {
          breed: "Tabby/Orange Cat"
        }
      },
      {
        id: "2D",
        text: "温柔体贴善解人意",
        attributes: {
          breed: "Persian/Maine Coon"
        }
      },
      {
        id: "2E",
        text: "活泼开朗自来熟",
        attributes: {
          breed: "Abyssinian/Bengal"
        }
      },
      {
        id: "2F",
        text: "独立自主有主见",
        attributes: {
          breed: "Norwegian Forest Cat"
        }
      },
      {
        id: "2G",
        text: "优雅大方有气质",
        attributes: {
          breed: "Russian Blue/Balinese"
        }
      },
      {
        id: "2H",
        text: "古灵精怪爱冒险",
        attributes: {
          breed: "Sphynx/Devon Rex"
        }
      },
      {
        id: "2I",
        text: "沉稳可靠值得信赖",
        attributes: {
          breed: "Scottish Fold/Birman"
        }
      }
    ]
  },
  {
    id: 3,
    title: "今天的你最接近哪种状态？",
    options: [
      {
        id: "3A",
        text: "快乐似个二傻子",
        attributes: {
          expression: "smiling"
        }
      },
      {
        id: "3B",
        text: "有点emo不想说话",
        attributes: {
          expression: "half-closed eyes"
        }
      },
      {
        id: "3C",
        text: "想翻个白眼走人",
        attributes: {
          expression: "pouting"
        }
      },
      {
        id: "3D",
        text: "充满干劲和活力",
        attributes: {
          expression: "excited"
        }
      },
      {
        id: "3E",
        text: "困倦想睡觉",
        attributes: {
          expression: "sleepy"
        }
      },
      {
        id: "3F",
        text: "好奇探索新事物",
        attributes: {
          expression: "curious"
        }
      },
      {
        id: "3G",
        text: "专注认真工作",
        attributes: {
          expression: "focused"
        }
      },
      {
        id: "3H",
        text: "悠闲自在放松",
        attributes: {
          expression: "relaxed"
        }
      },
      {
        id: "3I",
        text: "有点小紧张",
        attributes: {
          expression: "nervous"
        }
      }
    ]
  },
  {
    id: 4,
    title: "你更喜欢哪种图片风格？",
    options: [
      {
        id: "4A",
        text: "可爱卡通风格",
        attributes: {
          style: "cartoon"
        }
      },
      {
        id: "4B",
        text: "真实摄影风格",
        attributes: {
          style: "realistic"
        }
      },
      {
        id: "4C",
        text: "水彩手绘风格",
        attributes: {
          style: "watercolor"
        }
      },
      {
        id: "4D",
        text: "油画艺术风格",
        attributes: {
          style: "oil-painting"
        }
      },
      {
        id: "4E",
        text: "简约线条风格",
        attributes: {
          style: "minimalist"
        }
      },
      {
        id: "4F",
        text: "复古怀旧风格",
        attributes: {
          style: "vintage"
        }
      },
      {
        id: "4G",
        text: "梦幻仙境风格",
        attributes: {
          style: "fantasy"
        }
      },
      {
        id: "4H",
        text: "日系动漫风格",
        attributes: {
          style: "anime"
        }
      },
      {
        id: "4I",
        text: "黑白素描风格",
        attributes: {
          style: "sketch"
        }
      }
    ]
  }
]; 