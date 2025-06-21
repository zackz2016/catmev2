import { Creem } from 'creem';

// 扩展 CreateCheckoutRequest 类型
declare module 'creem' {
  interface CreateCheckoutRequest {
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
    success_url: string;
    cancel_url: string;
    request_id?: string;
    description?: string;
    productId: string;
  }

  // 扩展 CheckoutResult 类型
  interface CheckoutResult {
    id: string;
    checkoutUrl: string;
    status: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
    request_id?: string;
    mode: string;
    object: string;
    product: any;
    units: number;
    order?: {
      id: string;
      amount: number;
      currency: string;
      status: string;
    };
    subscription?: any;
    customer?: any;
  }
} 