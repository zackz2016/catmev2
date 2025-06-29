// Google Cloud 认证诊断页面
// 在Next.js环境中检查认证配置

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDiagnosis = async () => {
    setLoading(true);
    setResults('🔍 开始诊断...\n');
    
    try {
      const response = await fetch('/api/debug-auth', {
        method: 'POST',
      });
      
      const data = await response.json();
      setResults(data.results || data.error || '诊断失败');
    } catch (error) {
      setResults(`❌ 请求失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Google Cloud 认证诊断</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={runDiagnosis} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? '诊断中...' : '开始诊断'}
            </Button>
          </div>
          
          {results && (
            <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {results}
            </div>
          )}
          
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>本工具将检查：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>环境变量是否正确加载</li>
              <li>Google凭据文件是否存在和有效</li>
              <li>Google认证库连接测试</li>
              <li>Vertex AI SDK初始化测试</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 