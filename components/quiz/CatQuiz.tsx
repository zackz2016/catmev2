'use client';

import { useState } from 'react';
import { questions } from '@/data/quizData';
import { UserAnswer, CatPrompt } from '@/types/quiz';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { usePoints } from '@/hooks/use-points';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CatQuiz() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { points, updatePoints, refreshPoints } = usePoints();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [catDescription, setCatDescription] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);

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
              登录后即可开始测试，生成专属于你的猫咪形象！
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

  const handleAnswer = async (optionId: string) => {
    // 检查积分是否足够
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "您需要至少1积分才能生成猫咪图片",
      });
      // 跳转到充值页面
      router.push('/pricing');
      return;
    }

    const newAnswers = [...answers, { questionId: currentQuestion + 1, optionId }];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      await generateCatImage(newAnswers);
    }
  };

  const generateCatImage = async (finalAnswers: UserAnswer[]) => {
    // 检查积分是否足够
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "请先充值",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setImageSaved(false); // 重置保存状态
    try {
      const prompt = buildPrompt(finalAnswers);
      const promptText = `Generate a ${prompt.style} style illustration of a ${prompt.breed} cat that is ${prompt.pose} with a ${prompt.expression} expression, showing a ${prompt.personality} personality.`;
      setCurrentPrompt(promptText); // 保存当前提示词
      
      // 构建并保存猫咪描述文字
      // 处理品种名称（取第一个品种）
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
        // 刷新积分显示
        refreshPoints();
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        // 刷新积分显示（API已经自动扣减了积分）
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
  const buildPrompt = (finalAnswers: UserAnswer[]): CatPrompt => {
    const attributes = finalAnswers.reduce((acc, answer) => {
      const question = questions.find(q => q.id === answer.questionId);
      const option = question?.options.find(o => o.id === answer.optionId);
      return { ...acc, ...option?.attributes };
    }, {} as CatPrompt);

    
    return {
      pose: attributes.pose || 'sitting',
      personality: attributes.personality || 'calm',
      breed: attributes.breed || 'mixed breed',
      expression: attributes.expression || 'neutral',
      style: attributes.style || 'watercolor',
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
      // 从当前答案中获取选择的图片风格
      const prompt = buildPrompt(answers);
      const imageStyle = prompt.style || 'watercolor';
      
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageUrl: generatedImage,
          prompt: catDescription, // 将猫咪描述作为prompt保存，这样图库会显示友好的描述而不是技术提示词
          imageStyle: imageStyle, // 根据测试结果设置风格
          isPublic: true, // 默认公开
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

  const handleRestart = () => {
    if (points < 1) {
      toast({
        title: "积分不足",
        description: "您的积分已用完，请前往充值",
      });
      // 跳转到充值页面
      router.push('/pricing');
      return;
    }

    setCurrentQuestion(0);
    setAnswers([]);
    setGeneratedImage(null);
    setQuizCompleted(false);
    setCurrentPrompt(null);
    setCatDescription(null);
    setImageSaved(false);
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和进度条 */}
        <div className="space-y-4">
          <div className="flex justify-center items-center">
            <h2 className="text-2xl font-bold text-white text-center">
              {!quizCompleted ? questions[currentQuestion].title : 
                (isGenerating ? '生成专属猫咪中...' : "🎨 你的专属猫咪")}
            </h2>
          </div>
          
          {!quizCompleted && (
            <div className="w-full max-w-[512px] mx-auto">
              <div className="w-full bg-purple-100/30 h-2 rounded-full">
                <div
                  className="bg-gradient-to-r from-purple-400/80 to-pink-400/80 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 猫咪描述文字 - 在图片上方显示 */}
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

        {/* 固定尺寸的主容器 */}
        <div className="w-[512px] h-[512px] mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100/50 overflow-hidden">
          {!quizCompleted ? (
            // 问卷选项
            <div className="w-full h-full p-6">
              <div className="grid grid-cols-3 gap-4 h-full">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className="aspect-square p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border border-purple-100/30 rounded-xl text-left hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] text-gray-700 hover:text-gray-900 flex items-center justify-center text-center"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
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
                  {/* <div className="absolute inset-4 rounded-full border-4 border-pink-100/30"></div>
                  <div className="absolute inset-4 rounded-full border-4 border-t-pink-500 animate-spin animation-delay-150"></div> */}
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

        {/* 保存按钮和重新测试按钮 */}
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
                  您的积分已用完，充值后即可继续生成专属猫咪形象
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
} 