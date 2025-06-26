// 问题类型定义
export interface Question {
  id: number;
  title: string;
  options: QuizOption[];
  stage?: number; // 问题阶段（1-4）
  theme?: string; // 问题主题
}

// 选项类型定义
export interface Option {
  id: string;
  text: string;
  attributes: CatAttributes;
}

// 猫的属性类型定义
export interface CatAttributes {
  pose?: string;      // 姿态
  personality?: string; // 性格
  breed?: string;     // 品种
  expression?: string; // 表情
  style?: string;     // 风格
}

// 用户答案类型定义
export interface UserAnswer {
  questionId: number;
  optionId: string;
}

// 问卷选项类型（扩展支持更多属性）
export interface QuizOption {
  id: string;
  text: string;
  attributes: {
    // 原有属性
    pose?: string;
    personality?: string;
    breed?: string;
    expression?: string;
    style?: string;
    // 新增属性
    environment?: string;
    mood?: string;
    color?: string;
    accessory?: string;
  };
}

// 随机生成的问题选项类型
export interface RandomQuizOption {
  text: string;
  // 根据不同阶段，包含不同的属性
  personality?: string;
  pose?: string;
  breed?: string;
  expression?: string;
  style?: string;
  environment?: string;
  mood?: string;
}

// 随机生成的问题类型
export interface RandomQuestion {
  title: string;
  options: RandomQuizOption[];
}

// API响应类型
export interface QuizGenerationResponse {
  success: boolean;
  question: RandomQuestion;
  stage: number;
  theme: string;
}

// 生成图片的Prompt类型定义（扩展版）
export interface CatPrompt {
  // 原有属性
  pose: string;
  personality: string;
  breed: string;
  expression: string;
  style: string;
  // 新增属性
  environment?: string;
  mood?: string;
  color?: string;
  accessory?: string;
}

// 问卷状态类型
export interface QuizState {
  currentStage: number;
  questions: RandomQuestion[];
  answers: UserAnswer[];
  isLoading: boolean;
  isGenerating: boolean;
  generatedImage: string | null;
  catDescription: string | null;
} 