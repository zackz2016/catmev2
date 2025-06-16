export interface UserPoints {
  userId: string;
  points: number;
  updatedAt: Date;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'EARN' | 'SPEND';
  reason: string;
  createdAt: Date;
}

export interface PointsResponse {
  success: boolean;
  points?: number;
  error?: string;
} 