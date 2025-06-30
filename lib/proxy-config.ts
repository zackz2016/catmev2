// 全局代理配置模块
// 统一管理项目中所有HTTP/HTTPS请求的代理设置，包括Vertex AI、Gemini API等服务

import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpProxyAgent } from 'http-proxy-agent';

// 代理配置状态
let proxyConfigured = false;

/**
 * 配置全局代理设置
 * 为所有HTTP/HTTPS请求设置代理，包括Google Cloud服务、Gemini API等
 * @returns boolean - 是否成功配置代理
 */
export function configureGlobalProxy(): boolean {
  // 如果已经配置过，直接返回状态
  if (proxyConfigured) {
    return true;
  }

  // 检查是否启用代理（环境变量控制）
  const enableProxy = process.env.ENABLE_PROXY;
  if (enableProxy && enableProxy.toLowerCase() === 'false') {
    console.log('🚫 代理已被环境变量禁用 (ENABLE_PROXY=false)');
    return false;
  }

  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  if (httpProxy || httpsProxy) {
    console.log('🔗 配置全局代理支持...');
    
    try {
      // 为Google Cloud请求配置全局代理
      const originalHttpsGlobalAgent = require('https').globalAgent;
      const originalHttpGlobalAgent = require('http').globalAgent;
      
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
      
      // 确保Google Cloud认证库和其他服务使用代理
      process.env.GRPC_PROXY = httpsProxy || httpProxy;
      process.env.HTTPS_PROXY = httpsProxy || httpProxy;
      process.env.HTTP_PROXY = httpProxy || httpsProxy;
      
      proxyConfigured = true;
      console.log('🎉 全局代理配置完成');
      return true;
    } catch (error) {
      console.error('❌ 全局代理配置失败:', error);
      return false;
    }
  }
  
  console.log('ℹ️ 未检测到代理配置环境变量');
  return false;
}

/**
 * 获取代理配置状态
 * @returns boolean - 是否已配置代理
 */
export function isProxyConfigured(): boolean {
  return proxyConfigured;
}

/**
 * 获取当前代理设置信息
 * @returns object - 代理配置信息
 */
export function getProxyInfo() {
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  
  return {
    configured: proxyConfigured,
    httpProxy: httpProxy || null,
    httpsProxy: httpsProxy || null,
    grpcProxy: process.env.GRPC_PROXY || null
  };
}

/**
 * 创建带代理的HTTP(S)请求配置
 * @param url - 请求URL
 * @returns object - 请求配置对象
 */
export function createProxyRequestConfig(url: string) {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
  
  const urlObj = new URL(url);
  const isHttps = urlObj.protocol === 'https:';
  
  const config: any = {
    hostname: urlObj.hostname,
    port: urlObj.port || (isHttps ? 443 : 80),
    path: urlObj.pathname + urlObj.search,
    headers: {}
  };
  
  // 如果配置了代理，添加代理信息到请求配置
  if (isHttps && httpsProxy) {
    console.log('🔗 使用HTTPS代理:', httpsProxy);
  } else if (!isHttps && httpProxy) {
    console.log('🔗 使用HTTP代理:', httpProxy);
  }
  
  return config;
}

/**
 * 初始化代理配置
 * 在模块导入时自动执行
 */
export function initializeProxy(): boolean {
  if (!proxyConfigured) {
    return configureGlobalProxy();
  }
  return true;
}

// 在模块加载时自动初始化代理配置
const autoInitResult = initializeProxy();
const enableProxy = process.env.ENABLE_PROXY;
const proxyStatus = enableProxy 
  ? `环境变量控制: ${enableProxy.toUpperCase()}` 
  : '自动检测';

console.log('🚀 代理配置模块加载完成');
console.log(`📋 代理控制模式: ${proxyStatus}`);
console.log(`🔗 代理配置结果: ${autoInitResult ? '✅ 已启用' : '❌ 已禁用'}`); 