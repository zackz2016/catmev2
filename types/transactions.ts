export interface PaymentTransaction {
  id: string;
  user_id: string;
  checkout_id: string;
  order_id: string;
  plan_id: string;
  amount: number;
  currency: string;
  points_awarded: number;
  status: string;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'EARN' | 'SPEND';
  reason?: string;
  points?: number;
  reference_id?: string;
  created_at: string;
}

export interface TransactionsResponse {
  success: boolean;
  data?: {
    paymentTransactions: PaymentTransaction[];
    pointsTransactions: PointsTransaction[];
    pagination: {
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  error?: string;
} 