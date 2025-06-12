'use client';

import { useState } from 'react';
import { questions } from '@/data/quizData';
import { UserAnswer, CatPrompt } from '@/types/quiz';

export default function CatQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswer = async (optionId: string) => {
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
    setIsGenerating(true);
    try {
      const prompt = buildPrompt(finalAnswers);
      const response = await fetch('/api/generate-cat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
    } catch (error) {
      console.error('Error generating cat image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
      style: 'watercolor',
    };
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题和进度条 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white-800 text-center">
            {!quizCompleted ? questions[currentQuestion].title : 
              (isGenerating ? 'Generating your own cat...' : "🎨 Your cat's personality ")}
          </h2>
          
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

        {/* 重新测试按钮 */}
        {quizCompleted && !isGenerating && generatedImage && (
          <div className="text-center">
            <button
              onClick={() => {
                setCurrentQuestion(0);
                setAnswers([]);
                setGeneratedImage(null);
                setQuizCompleted(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-400/80 to-pink-400/80 text-white rounded-xl hover:from-purple-500/80 hover:to-pink-500/80 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Restart
            </button>
          </div>
        )}
      </div>
    </>
  );
} 