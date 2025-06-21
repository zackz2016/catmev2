'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, CreditCard, History, Trophy, Plus, Minus, User } from 'lucide-react';
import type { TransactionsResponse, PaymentTransaction, PointsTransaction } from '@/types/transactions';
import type { PointsResponse } from '@/types/points';

type TransactionData = {
  paymentTransactions: PaymentTransaction[];
  pointsTransactions: PointsTransaction[];
  allTransactions: (PaymentTransaction | PointsTransaction)[];
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [points, setPoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionData>({
    paymentTransactions: [],
    pointsTransactions: [],
    allTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchPoints = async () => {
    try {
      const pointsResponse = await fetch('/api/points');
      const pointsData: PointsResponse = await pointsResponse.json();
      if (pointsData.success && pointsData.points !== undefined) {
        setPoints(pointsData.points);
      }
    } catch (e) {
      console.error('Failed to fetch points', e);
      setError(prev => prev + ' Failed to load points.');
    }
  };

  const fetchTransactions = useCallback(async (type: 'all' | 'payments' | 'points') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/transactions?type=${type}`);
      const data: TransactionsResponse = await res.json();
      if (data.success && data.data) {
        const { paymentTransactions, pointsTransactions } = data.data;
        setTransactions(prev => {
          // Filter out points transactions that are from a purchase, as they are redundant
          const nonPurchasePointsTransactions = pointsTransactions.filter(
            pt => !pt.reason?.startsWith('Purchase:') && !pt.reason?.startsWith('购买计划:')
          );

          const newAll = [...paymentTransactions, ...nonPurchasePointsTransactions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          if (type === 'all') {
            // For 'all', we still want the full, unfiltered lists for the other tabs if needed later
            return { allTransactions: newAll, paymentTransactions, pointsTransactions };
          }
          if (type === 'payments') {
            return { ...prev, paymentTransactions: paymentTransactions };
          }
          if (type === 'points') {
            // For the points tab, we show all points transactions
            return { ...prev, pointsTransactions: pointsTransactions };
          }
          return prev;
        });
      } else {
        setError(data.error || 'Failed to load transactions.');
      }
    } catch (e) {
      console.error(`Failed to fetch ${type} transactions`, e);
      setError(`Failed to load ${type} transactions.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchPoints();
      fetchTransactions('all');
    }
  }, [isLoaded, user, fetchTransactions]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'payments' && transactions.paymentTransactions.length === 0) {
      fetchTransactions('payments');
    } else if (tab === 'points' && transactions.pointsTransactions.length === 0) {
      fetchTransactions('points');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const getPlanDisplayName = (planId: string) => {
    const plans: Record<string, string> = {
      'lite': 'Lite Plan',
      'pro': 'Pro Plan',
      'super': 'Super Plan'
    };
    return plans[planId] || planId;
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {user.imageUrl && (
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full border-4 border-gray-200"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">
                {user.fullName || user.firstName || 'User'}
              </h1>
              <p className="text-muted-foreground text-lg">
                {user.primaryEmailAddress?.emailAddress || 'No email'}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage your account and view your activity
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Points</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : points.toLocaleString()}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                Use points to generate cat images
              </p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  transactions?.paymentTransactions.length || 0
                )}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                Successful payments
              </p> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.createdAt ? formatDate(user.createdAt.toISOString()).split(',')[0] : 'Unknown'}
              </div>
              {/* <p className="text-xs text-muted-foreground">
                Account creation date
              </p> */}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            {/* <CardDescription>
              View your payment and points transaction history
            </CardDescription> */}
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <Tabs defaultValue="all" onValueChange={handleTabChange}>
                {/* <TabsList className="grid w-full grid-cols-3 flex-row justify-center">
                  <TabsTrigger value="all" className="flex flex-col gap-1 h-16 items-center justify-center">
                    <span>All</span>
                    <span className="text-xs text-muted-foreground">
                      {transactions.allTransactions.length} records
                    </span>
                  </TabsTrigger>

                  <TabsTrigger value="payments" className="flex flex-col gap-1 h-16 items-center justify-center">
                    <span>Payments</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatAmount(transactions.paymentTransactions.reduce((sum, t) => sum + t.amount, 0))}
                    </span>
                  </TabsTrigger>

                  <TabsTrigger value="points" className="flex flex-col gap-1 h-16 items-center justify-center">
                    <span>Points</span>
                    <span className="text-sm font-bold text-blue-600">
                      +{transactions.pointsTransactions
                        .filter(t => t.type === 'EARN')
                        .reduce((sum, t) => sum + (t.points || t.amount), 0)
                        .toLocaleString()
                      }
                    </span>
                  </TabsTrigger>

                </TabsList> */}

                <TabsContent value="all" className="space-y-4 pt-4">
                  {transactions.allTransactions.length > 0 ? (
                    transactions.allTransactions.map((item) => (
                      'plan_id' in item ? (
                        <PaymentTransactionItem key={`payment-${item.id}`} transaction={item as PaymentTransaction} />
                      ) : (
                        <PointsTransactionItem key={`points-${item.id}`} transaction={item as PointsTransaction} />
                      )
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No transactions found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 pt-4">
                  {transactions.paymentTransactions.length > 0 ? (
                    transactions.paymentTransactions.map((transaction) => (
                      <PaymentTransactionItem key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No payment transactions found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="points" className="space-y-4 pt-4">
                  {transactions.pointsTransactions.length > 0 ? (
                    transactions.pointsTransactions.map((transaction) => (
                      <PointsTransactionItem key={transaction.id} transaction={transaction} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No points transactions found</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Separate components for transaction items for clarity

function PaymentTransactionItem({ transaction }: { transaction: PaymentTransaction }) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const getPlanDisplayName = (planId: string) => ({ 'lite': 'Lite Plan', 'pro': 'Pro Plan', 'super': 'Super Plan' }[planId] || planId);
  const formatAmount = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-full">
          <CreditCard className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-grow">
          <p className="font-semibold">Purchase: {getPlanDisplayName(transaction.plan_id)}</p>
          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge className="bg-green-500 text-white">
          {formatAmount(transaction.amount, transaction.currency)}
        </Badge>
        <p className="text-sm text-muted-foreground mt-1">
          +{transaction.points_awarded} points
        </p>
      </div>
    </div>
  );
}

function PointsTransactionItem({ transaction }: { transaction: PointsTransaction }) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const isEarn = transaction.type === 'EARN';
  
  // Use points field if available, otherwise fall back to amount
  const pointAmount = transaction.points || transaction.amount;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${isEarn ? 'bg-blue-100' : 'bg-orange-100'}`}>
          {isEarn ? <Plus className="h-5 w-5 text-blue-600" /> : <Minus className="h-5 w-5 text-orange-600" />}
        </div>
        <div>
          <p className="font-semibold">{transaction.reason || 'Points Transaction'}</p>
          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
        </div>
      </div>
      <Badge className={isEarn ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}>
        {isEarn ? '+' : '-'} {pointAmount.toLocaleString()} points
      </Badge>
    </div>
  );
} 