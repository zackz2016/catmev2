'use client';

import { useState, useEffect } from 'react';
import { RandomQuestion, UserAnswer, CatPrompt, QuizGenerationResponse } from '@/types/quiz';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { usePoints } from '@/hooks/use-points';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export default function CatQuiz() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { points, updatePoints, refreshPoints } = usePoints();
  const { toast } = useToast();
  
  // 问卷状态
  const [currentStage, setCurrentStage] = useState(1);
  const [questions, setQuestions] = useState<RandomQuestion[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [catDescription, setCatDescription] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);

  // 组件加载时生成第一个问题
  useEffect(() => {
    if (isSignedIn) {
      generateQuestion(1);
    }
  }, [isSignedIn]);

  // 生成随机问题
  const generateQuestion = async (stage: number) => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });

      if (!response.ok) {
        throw new Error('生成问题失败');
      }

      const data: QuizGenerationResponse = await response.json();
      
      if (data.success) {
        const newQuestions = [...questions];
        newQuestions[stage - 1] = data.question;
        setQuestions(newQuestions);
        
        // 如果是重新生成当前问题，显示提示
        if (stage === currentStage && questions[stage - 1]) {
          toast({
            title: "问题已刷新",
            description: "为你准备了新的选项！",
          });
        }
      } else {
        throw new Error('问题生成失败');
      }
    } catch (error) {
      console.error('生成问题错误:', error);
      toast({
        title: "问题生成失败",
        description: "请刷新页面重试",
        variant: "destructive",
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // 重新生成当前问题
  const regenerateCurrentQuestion = async () => {
    if (isLoadingQuestions) return;
    await generateQuestion(currentStage);
  };

  const handleAnswer = async (optionIndex: number) => {
    // 检查积分是否足够
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "您需要至少1积分才能生成猫咪图片",
      });
      router.push('/pricing');
      return;
    }

    const newAnswers = [...answers, { 
      questionId: currentStage, 
      optionId: `${currentStage}-${optionIndex}` 
    }];
    setAnswers(newAnswers);

    if (currentStage < 4) {
      // 移动到下一阶段
      const nextStage = currentStage + 1;
      setCurrentStage(nextStage);
      
      // 如果下一个问题还没生成，则生成它
      if (!questions[nextStage - 1]) {
        await generateQuestion(nextStage);
      }
    } else {
      // 完成所有问题，开始生成图片
      setQuizCompleted(true);
      await generateCatImage(newAnswers, optionIndex);
    }
  };

  const generateCatImage = async (finalAnswers: UserAnswer[], lastOptionIndex: number) => {
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "请先充值",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setImageSaved(false);
    
    try {
      const prompt = buildPrompt(finalAnswers, lastOptionIndex);
      const promptText = `Generate a ${prompt.style} style illustration of a ${prompt.breed} cat that is ${prompt.pose} with a ${prompt.expression} expression, showing a ${prompt.personality} personality${prompt.environment ? ` in a ${prompt.environment} setting` : ''}${prompt.mood ? ` with a ${prompt.mood} atmosphere` : ''}.`;
      setCurrentPrompt(promptText);
      
      // 构建猫咪描述文字
      const breedName = prompt.breed.includes('/') ? prompt.breed.split('/')[0] : prompt.breed;
      const description = `You are a ${prompt.personality} ${breedName} cat.`;
      setCatDescription(description);
      
      const response = await fetch('/api/generate-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        toast({
          title: "需要登录",
          description: "请先登录您的账户",
          variant: "destructive",
        });
        return;
      }
      
      if (response.status === 402) {
        toast({
          title: "积分不足",
          description: data.error || "您需要至少1积分来生成猫咪图片",
          variant: "destructive",
        });
        refreshPoints();
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        refreshPoints();
        toast({
          title: "生成成功",
          description: `图片已生成，剩余积分：${data.pointsRemaining || (points - 1)}`,
        });
      } else {
        throw new Error('No image returned from API');
      }
    } catch (error) {
      console.error('Error generating cat image:', error);
      toast({
        title: "生成失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 根据问卷答案构建Prompt
  const buildPrompt = (finalAnswers: UserAnswer[], lastOptionIndex: number): CatPrompt => {
    const attributes: any = {};
    
    // 处理前3个问题的答案
    finalAnswers.slice(0, -1).forEach((answer, index) => {
      const question = questions[index];
      if (question) {
        const optionIndex = parseInt(answer.optionId.split('-')[1]);
        const option = question.options[optionIndex];
        if (option) {
          Object.assign(attributes, option);
        }
      }
    });
    
    // 处理最后一个问题的答案
    const lastQuestion = questions[3];
    if (lastQuestion) {
      const lastOption = lastQuestion.options[lastOptionIndex];
      if (lastOption) {
        Object.assign(attributes, lastOption);
      }
    }
    
    return {
      pose: attributes.pose || 'sitting',
      personality: attributes.personality || 'calm',
      breed: attributes.breed || 'mixed breed',
      expression: attributes.expression || 'neutral',
      style: attributes.style || 'watercolor',
      environment: attributes.environment || 'cozy indoor',
      mood: attributes.mood || 'warm',
    };
  };

  const saveImageToGallery = async () => {
    if (!generatedImage || !currentPrompt) {
      toast({
        title: "保存失败",
        description: "没有可保存的图片",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const prompt = buildPrompt(answers, parseInt(answers[answers.length - 1].optionId.split('-')[1]));
      const imageStyle = prompt.style || 'watercolor';
      
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: generatedImage,
          prompt: catDescription,
          imageStyle: imageStyle,
          isPublic: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save image');
      }

      setImageSaved(true);
      toast({
        title: "保存成功",
        description: "图片已保存到画廊",
      });
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "保存失败",
        description: "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestart = async () => {
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "您的积分已用完，请前往充值",
      });
      router.push('/pricing');
      return;
    }

    // 重置所有状态
    setCurrentStage(1);
    setQuestions([]);
    setAnswers([]);
    setGeneratedImage(null);
    setQuizCompleted(false);
    setCurrentPrompt(null);
    setCatDescription(null);
    setImageSaved(false);
    
    // 生成新的第一个问题
    await generateQuestion(1);
  };

  // 如果用户未登录，显示登录提示
  if (!isSignedIn) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="w-[512px] h-[512px] mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 overflow-hidden">
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              登录以开始测试
            </h2>
            <p className="text-gray-600">
              登录后即可开始AI随机问卷测试，每次都是全新体验！
            </p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white rounded-xl hover:from-purple-500/80 hover:to-pink-500/80 transition-all duration-200 shadow-md hover:shadow-lg">
                立即登录
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStage - 1];

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和进度条 */}
        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-bold text-white text-center">
              {!quizCompleted ? 
                (currentQuestion ? currentQuestion.title : '正在生成问题...') : 
                (isGenerating ? '生成专属猫咪中...' : "🎨 你的专属猫咪")}
            </h2>
          </div>
          
          {!quizCompleted && (
            <div className="w-full max-w-[512px] mx-auto">
              <div className="w-full bg-purple-100/30 h-2 rounded-full">
                <div
                  className="bg-gradient-to-r from-purple-400/80 to-pink-400/80 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStage / 4) * 100}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="text-white/70 text-sm">
                  第 {currentStage} 步，共 4 步
                </div>
                {/* 重新生成问题按钮 */}
                {currentQuestion && !isLoadingQuestions && (
                  <button
                    onClick={regenerateCurrentQuestion}
                    className="flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors duration-200"
                    title="重新生成问题"
                  >
                    <RefreshCw className="w-3 h-3" />
                    换一组
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 猫咪描述文字 */}
        {quizCompleted && !isGenerating && catDescription && (
          <div className="w-[512px] mx-auto text-center animate-fade-in">
            <div className="bg-gradient-to-r from-purple-50/90 to-pink-50/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200/50 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center justify-center mb-2">
                <span className="text-2xl">🐱</span>
              </div>
              <p className="text-xl font-semibold text-gray-800 italic leading-relaxed">
                "{catDescription}"
              </p>
              <div className="mt-2 w-16 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
            </div>
          </div>
        )}

        {/* 主容器 */}
        <div className="w-[512px] h-[512px] mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 overflow-hidden">
          {!quizCompleted ? (
            // 问卷选项
            <div className="w-full h-full p-6">
              {isLoadingQuestions ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-purple-100/30"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                    </div>
                    <p className="text-gray-600">正在生成有趣的问题...</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="grid grid-cols-2 gap-4 h-full">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-100/30 rounded-xl text-left hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-gray-700 hover:text-gray-900 flex items-center justify-center text-center"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-600">问题加载中...</p>
                </div>
              )}
              
              {points < 1 && (
                <div className="absolute bottom-6 left-6 right-6 text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 shadow-lg">
                  <p className="text-gray-800 font-medium mb-2">
                    需要1积分才能生成猫咪图片
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    充值后即可获得专属于你的猫咪形象
                  </p>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-2 bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white rounded-lg hover:from-purple-500/80 hover:to-pink-500/80 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    立即充值
                  </button>
                </div>
              )}
            </div>
          ) : (
            // 生成结果展示
            <div className="w-full h-full flex items-center justify-center">
              {isGenerating ? (
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-100/30"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 animate-spin"></div>
                </div>
              ) : (
                generatedImage && (
                  <img
                    src={generatedImage}
                    alt="Generated cat"
                    className="w-full h-full object-contain"
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {quizCompleted && !isGenerating && generatedImage && (
          <div className="w-[512px] mx-auto flex flex-col items-center gap-4 p-4">
            <div className="flex gap-4 w-full max-w-[400px]">
              <button
                onClick={saveImageToGallery}
                disabled={isSaving || imageSaved}
                className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg ${
                  imageSaved 
                    ? 'bg-green-500/80 text-white cursor-default' 
                    : isSaving
                    ? 'bg-gray-400/80 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-400/80 to-cyan-400/80 text-white hover:from-blue-500/80 hover:to-cyan-500/80'
                }`}
              >
                {isSaving ? '保存中...' : imageSaved ? '已保存' : '保存到画廊'}
              </button>
              <button
                onClick={handleRestart}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white rounded-xl hover:from-purple-500/80 hover:to-pink-500/80 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {points < 1 ? '前往充值' : '重新开始'}
              </button>
            </div>
            {points < 1 && (
              <div className="w-full text-center bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50">
                <p className="text-gray-600">
                  您的积分已用完，充值后即可继续体验全新的AI问卷测试
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 