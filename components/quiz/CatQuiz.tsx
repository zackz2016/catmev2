'use client';

import { useState, useEffect } from 'react';
import { RandomQuestion, UserAnswer, CatPrompt, QuizGenerationResponse } from '@/types/quiz';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { usePoints } from '@/hooks/use-points';
import { useGuestTrial } from '@/hooks/use-guest-trial';
import { useUserPlan } from '@/hooks/use-user-plan';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { buildUserFriendlyPrompt } from '@/lib/prompt-builder';
import { RefreshCw, Gift, X, ZoomIn, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CatQuiz() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { points, updatePoints, refreshPoints } = usePoints();
  const guestTrial = useGuestTrial();
  const userPlan = useUserPlan();
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
  const [showHighResModal, setShowHighResModal] = useState(false);

  // 组件加载时生成第一个问题
  useEffect(() => {
    generateQuestion(1);
  }, []);

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
      // 完成所有问题，在生成图片前检查权限
      // 检查是否可以生成图片（注册用户检查积分，访客检查试用次数）
      if (isSignedIn) {
        if (points < 1) {
          toast({
            title: "积分不足",
            description: "您需要至少1积分才能生成猫咪图片",
          });
          router.push('/pricing');
          return;
        }
      } else {
        if (!guestTrial.canUse) {
          toast({
            title: "免费体验已用完",
            description: "注册后可获得3次免费生成机会",
          });
          return;
        }
      }
      
      // 完成所有问题，开始生成图片
      setQuizCompleted(true);
      await generateCatImage(newAnswers, optionIndex);
    }
  };

  const generateCatImage = async (finalAnswers: UserAnswer[], lastOptionIndex: number) => {
    // 对于访客，消费试用次数
    if (!isSignedIn) {
      const success = guestTrial.consumeTrial();
      
      if (!success) {
        toast({
          title: "免费体验已用完",
          description: "注册后可获得更多生成机会",
          variant: "destructive",
        });
        return;
      }
    }

    setIsGenerating(true);
    setImageSaved(false);
    
    try {
      const prompt = buildPrompt(finalAnswers, lastOptionIndex);
      
      const promptText = buildUserFriendlyPrompt(prompt);
      setCurrentPrompt(promptText);
      
      // 构建猫咪描述文字
      const breedName = prompt.breed.includes('/') ? prompt.breed.split('/')[0] : prompt.breed;
      const description = `You are a ${prompt.personality} ${breedName} cat.`;
      setCatDescription(description);
      
      // 根据用户套餐选择API端点
      const apiEndpoint = userPlan.shouldUseNewAPI 
        ? '/api/generate-cat/power'   // Standard/Super用户使用新的测试API
        : '/api/generate-cat/free';       // 免费用户/访客使用原有API
      
      console.log(`🎯 API选择: ${userPlan.plan}套餐 - ${userPlan.reason} - 使用端点: ${apiEndpoint}`);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      
      if (response.status === 429) {
        toast({
          title: "免费体验已用完",
          description: data.error || "注册后可获得更多生成机会",
          variant: "destructive",
        });
        return;
      }
      
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
        
        // 日志显示API使用情况
        console.log(`✅ 图片生成成功: API=${data.apiUsed || 'unknown'}, 套餐=${data.plan || 'unknown'}, 测试版本=${data.testVersion || false}`);
        
        if (data.isGuestMode) {
          toast({
            title: "生成成功！",
            description: "免费体验已使用，注册后可获得更多次数",
          });
        } else {
          refreshPoints();
          const apiInfo = data.testVersion ? ' (新版测试API)' : '';
          toast({
            title: "生成成功" + apiInfo,
            description: `图片已生成，剩余积分：${data.pointsRemaining || (points - 1)}`,
          });
        }
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
    finalAnswers.forEach((answer, index) => {
      const question = questions[index];
      if (question) {
        const selectedOption = question.options[parseInt(answer.optionId.split('-')[1])];
        // RandomQuizOption直接包含属性，不是嵌套在attributes中
        Object.assign(attributes, selectedOption);
      }
    });
    
    // 处理第4个问题的答案
    const lastQuestion = questions[3];
    if (lastQuestion) {
      const selectedOption = lastQuestion.options[lastOptionIndex];
      Object.assign(attributes, selectedOption);
    }
    
    return attributes as CatPrompt;
  };

  // 保存图片到图库
  const saveImageToGallery = async () => {
    if (!generatedImage || !currentPrompt || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: generatedImage,
          prompt: currentPrompt,
          isPublic: true
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setImageSaved(true);
        toast({
          title: "保存成功",
          description: "图片已保存到您的图库",
        });
      } else {
        throw new Error(data.error || 'Failed to save image');
      }
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

  // 重新开始测试
  const handleRestart = async () => {
    setCurrentStage(1);
    setQuestions([]);
    setAnswers([]);
    setGeneratedImage(null);
    setQuizCompleted(false);
    setCurrentPrompt(null);
    setCatDescription(null);
    setImageSaved(false);
    
    await generateQuestion(1);
  };

  // 未注册用户的状态提示
  const renderGuestStatus = () => {
    if (isSignedIn) return null;
    
    if (!guestTrial.canUse) {
      return (
        <Alert className="mb-6 bg-red-500/10 border-red-500/20">
          <Gift className="h-4 w-4" />
          <AlertDescription>
            <span className="font-medium">免费体验已用完：</span>
            <span className="text-red-400">剩余 {guestTrial.remaining} 次</span>
            <span className="ml-2 text-gray-400">
              · 注册后可获得3次免费生成机会
            </span>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mb-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <Gift className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">免费体验：</span>
          <span className="text-green-400">还可以生成 {guestTrial.remaining} 次</span>
          <span className="ml-2 text-gray-400">
            · 注册后可获得3次免费生成机会
          </span>
        </AlertDescription>
      </Alert>
    );
  };

  // 下载图片
  const handleDownload = async (imageUrl: string, filename: string, imageId: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // 更新下载统计
      try {
        await fetch('/api/images/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, action: 'download' }),
        })
      } catch (statsError) {
        console.error('Failed to update download stats:', statsError)
      }
      
      toast({
        title: "下载成功",
        description: "图片已保存到本地",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "下载失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 分享图片
  const handleShare = async (imageUrl: string, imageId: number, prompt?: string) => {
    try {
      // 验证URL格式是否有效
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return url.startsWith('http://') || url.startsWith('https://')
        } catch {
          return false
        }
      }

      if (navigator.share && isValidUrl(imageUrl)) {
        await navigator.share({
          title: 'AI生成的猫咪图片',
          text: prompt || '看看这只可爱的AI猫咪！',
          url: imageUrl,
        })
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(imageUrl)
        toast({
          title: "链接已复制",
          description: "图片链接已复制到剪贴板",
        })
      }
      
      // 更新分享统计
      try {
        await fetch('/api/images/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, action: 'share' }),
        })
      } catch (statsError) {
        console.error('Failed to update share stats:', statsError)
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') { // 用户取消分享不算错误
        console.error('Share error:', error)
        toast({
          title: "分享失败",
          description: "无法复制链接",
          variant: "destructive",
        })
      }
    }
  }

  // 如果是已注册用户但没有积分，显示购买提示
  if (isSignedIn && points < 1 && !isGenerating && !generatedImage) {
    return (
      <section className="max-w-4xl mx-auto p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">积分不足</h2>
          <p className="text-gray-400 mb-6">您需要至少1积分才能生成猫咪图片</p>
          <Button 
            onClick={() => router.push('/pricing')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            获取积分
          </Button>
        </div>
      </section>
    );
  }

  // 如果是未注册用户且没有试用次数，显示注册提示
  if (!isSignedIn && !guestTrial.canUse && !isGenerating && !generatedImage) {
    return (
      <section className="max-w-4xl mx-auto p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">免费体验已用完</h2>
          <p className="text-gray-400 mb-6">注册后可获得3次免费生成机会</p>
          <SignInButton mode="modal">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              立即注册
            </Button>
          </SignInButton>
        </div>
      </section>
    );
  }

  return (
    <>
    <section className="max-w-4xl mx-auto p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 ">
      {/* {renderGuestStatus()} */}
      
      {/* 显示积分或试用状态 */}
      {!(isSignedIn && points < 1) && !quizCompleted && !generatedImage && (
        <div className="text-center mb-6 pb-10">
   
          {/* 进度条 */}
          <div className="max-w mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm text-gray-400">{currentStage}/4</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStage / 4) * 100}%` }}
              ></div>
            </div>
 
          </div>
        </div>
      )}

      {/* 测试完成后显示结果 */}
      {quizCompleted && generatedImage && (
        <div className="text-center mb-8">
          {catDescription && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🐱</span>
                <h3 className="text-lg font-semibold text-white">Your Cat Personality</h3>
              </div>
              <p className="text-purple-300 text-base font-medium">{catDescription}</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mt-3 rounded-full"></div>
            </div>
          )}
          
          <div className="mb-6">
            {/* 图片容器 - 付费用户可点击查看高清 */}
            {userPlan.shouldUseNewAPI ? (
              <div 
                className="relative group cursor-pointer"
                onClick={() => setShowHighResModal(true)}
              >
                <img 
                  src={generatedImage} 
                  alt="Generated Cat" 
                  className="max-w-full h-auto rounded-lg shadow-lg mx-auto animate-fade-in group-hover:opacity-90 transition-opacity"
                  style={{ maxHeight: '500px' }}
                />
                {/* 付费用户悬停提示 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-gray-800 font-medium">
                    <ZoomIn className="w-4 h-4" />
                    {/* <span>点击查看高清图</span> */}
                  </div>
                </div>
              </div>
            ) : (
              <img 
                src={generatedImage} 
                alt="Generated Cat" 
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto animate-fade-in"
                style={{ maxHeight: '500px' }}
              />
            )}
          </div>
          
          <div className="flex gap-4 justify-center flex-wrap">
            {isSignedIn && (
              <Button
                onClick={saveImageToGallery}
                disabled={isSaving || imageSaved}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-500/10 text-purple-500 hover:text-white disabled:text-gray-300"
              >
                {isSaving ? "Saving..." : imageSaved ? "Saved" : "Save to Gallery"}
              </Button>
            )}
            
            <Button
              onClick={handleRestart}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Take Another Test
            </Button>

            {!isSignedIn && (
              <SignInButton mode="modal">
                <Button variant="outline" className="border-green-500/50 text-purple-500 hover:bg-green-500/10">
                  Sign Up for More
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      )}

      {/* 生成中状态 */}
      {isGenerating && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-lg">Generating your cat personality...</span>
          </div>
          <p className="text-gray-400">This may take a few moments</p>
        </div>
      )}

      {/* 问题显示 */}
      {!quizCompleted && !isGenerating && questions[currentStage - 1] && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold mb-3 text-white text-center">
                {questions[currentStage - 1].title}
              </h3>
            </div>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {questions[currentStage - 1].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="p-4 text-left bg-gray-700/30 hover:bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-purple-500/50 transition-all duration-200 group"
              >
                <div className="font-medium text-white group-hover:text-purple-300 transition-colors">
                  {option.text}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoadingQuestions && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading questions...</span>
          </div>
        </div>
      )}
    </section>

    {/* 高清图片Modal - 仅付费用户 */}
    {userPlan.shouldUseNewAPI && generatedImage && (
      <Dialog open={showHighResModal} onOpenChange={setShowHighResModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden"> 
          <div className="relative">
            <img 
              src={generatedImage} 
              alt="High Resolution Cat" 
              className="w-full h-auto max-h-[80vh] object-contain mt-10 mb-10"
            />
            {/* 下载和分享按钮 */}
            <div className="absolute top-4 right-4 flex gap-2">
                             <Button
                 size="sm"
                 variant="secondary"
                 className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                 onClick={() => handleDownload(generatedImage, 'catme-hd.jpg', 0)}
               >
                 <Download className="w-4 h-4 mr-2" />
                 Download
               </Button>
               <Button
                 size="sm"
                 variant="secondary"
                 className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                 onClick={() => handleShare(generatedImage, 0, currentPrompt || undefined)}
               >
                 <Share2 className="w-4 h-4 mr-2" />
                 Share
               </Button>
            </div>    
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
} 