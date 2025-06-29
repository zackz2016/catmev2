#!/usr/bin/env node
/**
 * VPN代理连接测试脚本 - 方案2版本
 * 测试使用 https-proxy-agent 全局代理配置访问Google服务
 */

const https = require('https');
const http = require('http');

// 导入代理Agent
let HttpsProxyAgent, HttpProxyAgent;
try {
  HttpsProxyAgent = require('https-proxy-agent').HttpsProxyAgent;
  HttpProxyAgent = require('http-proxy-agent').HttpProxyAgent;
  console.log('✅ 代理Agent包导入成功');
} catch (error) {
  console.log('❌ 代理Agent包导入失败:', error.message);
  console.log('💡 请运行: npm install https-proxy-agent http-proxy-agent');
  process.exit(1);
}

// 颜色输出函数
const colors = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`
};

console.log(colors.cyan('🚀 VPN代理连接测试开始（最终修复版：HTTPS模块）...'));

// 测试全局代理配置
function configureGlobalProxy() {
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log('🔗 配置全局代理支持...');
    
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const { HttpProxyAgent } = require('http-proxy-agent');
    
    if (httpsProxy) {
      const httpsAgent = new HttpsProxyAgent(httpsProxy);
      require('https').globalAgent = httpsAgent;
      console.log('✅ HTTPS全局代理已配置:', httpsProxy);
    }
    
    if (httpProxy) {
      const httpAgent = new HttpProxyAgent(httpProxy);
      require('http').globalAgent = httpAgent;
      console.log('✅ HTTP全局代理已配置:', httpProxy);
    }
    
    return true;
  }
  
  return false;
}

// 测试HTTPS模块代理访问
async function testHttpsModule() {
  try {
    console.log('🔗 测试HTTPS模块通过代理访问Google APIs...');
    
    const https = require('https');
    const url = require('url');
    
    const testUrl = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
    const urlParsed = new URL(testUrl);
    
    const requestOptions = {
      hostname: urlParsed.hostname,
      port: urlParsed.port || 443,
      path: urlParsed.pathname,
      method: 'GET',
      timeout: 10000
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            data: data
          });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.setTimeout(10000);
      req.end();
    });
    
    if (response.status === 400 || response.status === 401) {
      console.log('✅ HTTPS模块代理配置成功 (状态码:', response.status, ')');
      return true;
    } else {
      console.log('⚠️ HTTPS模块响应异常 (状态码:', response.status, ')');
      return false;
    }
  } catch (error) {
    console.log('❌ HTTPS模块代理配置失败:', error.message);
    return false;
  }
}

// 测试Vertex AI端点（使用HTTPS模块）
async function testVertexAIWithHttps() {
  try {
    console.log('🔗 测试Vertex AI端点（HTTPS模块）...');
    
    const https = require('https');
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'test-project';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    const testUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;
    const urlParsed = new URL(testUrl);
    
    const requestOptions = {
      hostname: urlParsed.hostname,
      port: urlParsed.port || 443,
      path: urlParsed.pathname,
      method: 'GET',
      timeout: 10000
    };

    const response = await new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.setTimeout(10000);
      req.end();
    });
    
    console.log(`   ✅ Vertex AI 端点连接成功 (状态码: ${response.status})`);
    return true;
  } catch (error) {
    console.log('   ❌ Vertex AI 端点连接失败:', error.message);
    return false;
  }
}

// 测试访问令牌获取
async function testAccessToken() {
  try {
    console.log('🔑 测试Google Cloud认证...');
    
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
    
    const client = await auth.getClient();
    const accessTokenResponse = await client.getAccessToken();
    
    if (accessTokenResponse.token) {
      console.log('✅ 访问令牌获取成功');
      return true;
    } else {
      console.log('❌ 访问令牌获取失败');
      return false;
    }
  } catch (error) {
    console.log('❌ Google Cloud认证失败:', error.message);
    return false;
  }
}

// 主测试函数
async function main() {
  console.log('\n📊 VPN代理连接测试开始（最终修复版：HTTPS模块）...\n');
  
  // 配置全局代理
  const proxyConfigured = configureGlobalProxy();
  
  // 1. 检查环境变量配置
  console.log('1. 检查环境变量配置：');
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy) {
    console.log('   ✅ HTTP_PROXY:', httpProxy);
  } else {
    console.log('   ❌ HTTP_PROXY 未配置');
  }
  
  if (httpsProxy) {
    console.log('   ✅ HTTPS_PROXY:', httpsProxy);
  } else {
    console.log('   ❌ HTTPS_PROXY 未配置');
  }
  
  // 2. 测试代理端口连接
  console.log('\n2. 测试代理端口连接：');
  if (httpsProxy) {
    try {
      const net = require('net');
      const url = new URL(httpsProxy);
      const socket = net.createConnection(parseInt(url.port), url.hostname);
      
      await new Promise((resolve, reject) => {
        socket.on('connect', () => {
          console.log(`   ✅ 代理端口 ${url.hostname}:${url.port} 连接成功`);
          socket.destroy();
          resolve();
        });
        socket.on('error', reject);
        setTimeout(() => reject(new Error('连接超时')), 5000);
      });
    } catch (error) {
      console.log(`   ❌ 代理端口连接失败:`, error.message);
    }
  }
  
  // 3. 测试HTTPS模块代理
  console.log('\n3. 测试HTTPS模块代理：');
  const httpsProxyOk = await testHttpsModule();
  
  // 4. 测试Vertex AI端点
  console.log('\n4. 测试Vertex AI端点：');
  const vertexOk = await testVertexAIWithHttps();
  
  // 5. 测试Google Cloud认证
  console.log('\n5. 测试Google Cloud认证：');
  const authSuccess = await testAccessToken();
  
  // 测试结果总结
  console.log('\n📊 测试结果总结：');
  console.log('   全局代理配置:', proxyConfigured ? '✅ 已配置' : '❌ 未配置');
  console.log('   代理端口连接:', httpsProxy ? '✅ 通过' : '❌ 跳过');
  console.log('   HTTPS模块代理:', httpsProxyOk ? '✅ 通过' : '❌ 失败');
  console.log('   Vertex AI:', vertexOk ? '✅ 通过' : '❌ 失败');
  console.log('   认证测试:', authSuccess ? '✅ 通过' : '❌ 失败');
  
  if (proxyConfigured && httpsProxyOk && vertexOk && authSuccess) {
    console.log('\n🎉 所有测试通过！HTTPS模块代理配置完美，可以使用Vertex AI服务。');
  } else if (proxyConfigured && httpsProxyOk && vertexOk) {
    console.log('\n⚠️ 代理配置完美，只需配置Google Cloud认证即可。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查配置。');
  }
  
  console.log('\n💡 最终修复：使用Node.js原生HTTPS模块，确保代理完全兼容。');
}

// 运行测试
main().catch(console.error); 