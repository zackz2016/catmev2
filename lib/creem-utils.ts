import crypto from 'crypto';

export interface CreemRedirectParams {
  request_id?: string | null;
  checkout_id?: string | null;
  order_id?: string | null;
  customer_id?: string | null;
  subscription_id?: string | null;
  product_id?: string | null;
}

/**
 * 生成 Creem 签名
 * 根据官方文档：https://docs.creem.io/learn/checkout-session/return-url
 */
export function generateCreemSignature(params: CreemRedirectParams, apiKey: string): string {
  const data = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined) // 过滤空值
    .map(([key, value]) => `${key}=${value}`)
    .concat(`salt=${apiKey}`)
    .join('|');
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 验证 Creem 签名
 */
export function verifyCreemSignature(
  params: CreemRedirectParams, 
  signature: string, 
  apiKey: string
): boolean {
  const expectedSignature = generateCreemSignature(params, apiKey);
  return expectedSignature === signature;
}

/**
 * 从 URL 搜索参数中提取 Creem 返回参数
 */
export function extractCreemParams(searchParams: URLSearchParams): {
  params: CreemRedirectParams;
  signature: string | null;
} {
  return {
    params: {
      request_id: searchParams.get('request_id'),
      checkout_id: searchParams.get('checkout_id'),
      order_id: searchParams.get('order_id'),
      customer_id: searchParams.get('customer_id'),
      subscription_id: searchParams.get('subscription_id'),
      product_id: searchParams.get('product_id'),
    },
    signature: searchParams.get('signature')
  };
} 