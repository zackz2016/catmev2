declare module 'creem' {
  export interface CreemOptions {
    serverURL?: string;
  }

  export interface CreateCheckoutRequest {
    amount: number;
    currency: string;
    metadata?: Record<string, any>;
    success_url: string;
    cancel_url: string;
    description?: string;
  }

  export interface CheckoutOptions {
    xApiKey: string;
    createCheckoutRequest: CreateCheckoutRequest;
  }

  export interface CheckoutResult {
    url: string;
    success_url: string;
    id: string;
    status: string;
    metadata?: Record<string, any>;
  }

  export class Creem {
    constructor(options: CreemOptions);
    createCheckout(options: CheckoutOptions): Promise<CheckoutResult>;
    retrieveCheckout(options: { checkoutId: string; xApiKey: string }): Promise<CheckoutResult>;
  }
} 