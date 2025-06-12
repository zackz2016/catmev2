// 问题类型定义
export interface Question {
  id: number;
  title: string;
  options: Option[];
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

// 生成图片的Prompt类型定义
export interface CatPrompt {
  pose: string;
  personality: string;
  breed: string;
  expression: string;
  style: string;
} 