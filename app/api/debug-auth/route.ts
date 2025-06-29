// Google Cloud 认证诊断 API
// 在Next.js服务器环境中检查认证配置

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  let results = '';
  
  function log(message: string) {
    results += message + '\n';
    console.log(message);
  }

  try {
    log('🔍 Google Cloud 认证诊断开始...\n');

    // 1. 检查环境变量
    log('📋 环境变量检查:');
    log(`GOOGLE_CLOUD_PROJECT_ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID || '❌ 未设置'}`);
    log(`GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || '❌ 未设置'}`);
    log(`GOOGLE_CLOUD_LOCATION: ${process.env.GOOGLE_CLOUD_LOCATION || '⚠️ 未设置 (将使用默认值)'}`);

    // 2. 检查密钥文件
    log('\n📁 密钥文件检查:');
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json';
    const resolvedPath = path.resolve(credentialsPath);

    log(`配置路径: ${credentialsPath}`);
    log(`解析路径: ${resolvedPath}`);

    try {
      if (fs.existsSync(resolvedPath)) {
        log('✅ 密钥文件存在');
        
        // 读取并验证JSON格式
        const credentialsContent = fs.readFileSync(resolvedPath, 'utf8');
        const credentials = JSON.parse(credentialsContent);
        
        log('✅ JSON格式有效');
        log(`服务账号邮箱: ${credentials.client_email || '❌ 缺少client_email'}`);
        log(`项目ID: ${credentials.project_id || '❌ 缺少project_id'}`);
        log(`密钥ID: ${credentials.private_key_id ? '✅ 存在' : '❌ 缺少private_key_id'}`);
        log(`私钥: ${credentials.private_key ? '✅ 存在' : '❌ 缺少private_key'}`);
        
        // 检查项目ID匹配
        if (process.env.GOOGLE_CLOUD_PROJECT_ID && credentials.project_id) {
          if (process.env.GOOGLE_CLOUD_PROJECT_ID === credentials.project_id) {
            log('✅ 项目ID匹配');
          } else {
            log('❌ 项目ID不匹配:');
            log(`  环境变量: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
            log(`  密钥文件: ${credentials.project_id}`);
          }
        }
        
      } else {
        log('❌ 密钥文件不存在');
        log(`请确保文件路径正确: ${resolvedPath}`);
      }
    } catch (error) {
      log(`❌ 读取密钥文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }

    // 3. 测试Google Auth Library
    log('\n🔐 认证库测试:');
    try {
      const { GoogleAuth } = await import('google-auth-library');
      
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform']
      });
      
      log('✅ GoogleAuth初始化成功');
      
      try {
        // 尝试获取项目ID
        const projectId = await auth.getProjectId();
        log(`✅ 项目ID获取成功: ${projectId}`);
        
        // 尝试获取访问令牌
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        log(`✅ 访问令牌获取成功: ${accessToken.token ? '有效' : '无效'}`);
        
      } catch (authError) {
        const errorMessage = authError instanceof Error ? authError.message : '未知错误';
        log(`❌ 认证测试失败: ${errorMessage}`);
        
        if (errorMessage.includes('ENOENT')) {
          log('💡 建议: 检查密钥文件路径');
        } else if (errorMessage.includes('invalid_grant')) {
          log('💡 建议: 密钥可能已过期或无效，重新下载密钥文件');
        } else if (errorMessage.includes('access_denied')) {
          log('💡 建议: 检查服务账号权限配置');
        } else if (errorMessage.includes('Project Id')) {
          log('💡 建议: 检查GOOGLE_CLOUD_PROJECT_ID环境变量');
        }
      }
      
    } catch (importError) {
      log(`❌ 无法导入google-auth-library: ${importError instanceof Error ? importError.message : '未知错误'}`);
    }

    // 4. 测试Vertex AI连接
    log('\n🎨 Vertex AI 连接测试:');
    try {
      const { VertexAI } = await import('@google-cloud/vertexai');
      
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
      
      if (!projectId) {
        log('❌ 无法测试: 缺少GOOGLE_CLOUD_PROJECT_ID');
      } else {
        const vertexAI = new VertexAI({
          project: projectId,
          location: location,
        });
        
        log('✅ VertexAI实例创建成功');
        log(`项目ID: ${projectId}`);
        log(`地区: ${location}`);
        
        // 尝试获取模型（这不会产生费用）
        const model = vertexAI.getGenerativeModel({
          model: 'imagen-3.0-generate-001'
        });
        
        log('✅ 模型实例创建成功');
      }
      
    } catch (importError) {
      log(`❌ 无法导入@google-cloud/vertexai: ${importError instanceof Error ? importError.message : '未知错误'}`);
    }

    log('\n✨ 诊断完成!');
    log('\n💡 如果所有检查都通过但仍有问题，可能需要:');
    log('1. 重新下载服务账号密钥文件');
    log('2. 检查Google Cloud项目计费状态');
    log('3. 确认Vertex AI API已启用');
    log('4. 检查服务账号权限是否完整');

    return NextResponse.json({ 
      success: true, 
      results 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '诊断过程发生未知错误';
    log(`\n❌ 诊断失败: ${errorMessage}`);
    
    return NextResponse.json({ 
      success: false, 
      error: results + `\n❌ 诊断失败: ${errorMessage}` 
    });
  }
} 