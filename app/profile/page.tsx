'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  CreditCard, 
  History, 
  Trophy, 
  Plus, 
  Minus, 
  User, 
  ImageIcon,
  BarChart3,
  Package
} from 'lucide-react';
import type { TransactionsResponse, PaymentTransaction, PointsTransaction } from '@/types/transactions';
import type { PointsResponse } from '@/types/points';
import type { ImagesApiResponse, GeneratedImage } from '@/types/images';

type TransactionData = {
  paymentTransactions: PaymentTransaction[];
  pointsTransactions: PointsTransaction[];
  allTransactions: (PaymentTransaction | PointsTransaction)[];
};

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [points, setPoints] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionData>({
    paymentTransactions: [],
    pointsTransactions: [],
    allTransactions: [],
  });
  const [userImages, setUserImages] = useState<GeneratedImage[]>([]);
  const [imagesPagination, setImagesPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const [loading, setLoading] = useState(true);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [error, setError] = useState<string>('');

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

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions?type=all');
      const data: TransactionsResponse = await res.json();
      if (data.success && data.data) {
        const { paymentTransactions, pointsTransactions } = data.data;
        setTransactions({
          paymentTransactions,
          pointsTransactions,
          allTransactions: [...paymentTransactions, ...pointsTransactions].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        });
      } else {
        setError(data.error || 'Failed to load transactions.');
      }
    } catch (e) {
      console.error('Failed to fetch transactions', e);
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserImages = useCallback(async (page = 1) => {
    if (!user?.id) return;
    
    try {
      setImagesLoading(true);
      const res = await fetch(`/api/images?userId=${user.id}&page=${page}&limit=12`);
      const data: ImagesApiResponse = await res.json();
      
      if (data.success) {
        if (page === 1) {
          setUserImages(data.images);
        } else {
          setUserImages(prev => [...prev, ...data.images]);
        }
        setImagesPagination(data.pagination);
      }
    } catch (e) {
      console.error('Failed to fetch user images', e);
    } finally {
      setImagesLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchPoints();
      fetchTransactions();
      fetchUserImages();
    }
  }, [isLoaded, user, fetchTransactions, fetchUserImages]);

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

  const loadMoreImages = () => {
    if (imagesPagination.hasMore && !imagesLoading) {
      fetchUserImages(imagesPagination.page + 1);
    }
  };

  // 菜单配置
  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      description: 'Account overview and statistics'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: Package,
      description: 'Purchase history and plans'
    },
    {
      id: 'credits',
      label: 'My Credits',
      icon: Coins,
      description: 'Points transactions and history'
    },
    {
      id: 'assets',
      label: 'My Assets',
      icon: ImageIcon,
      description: 'Generated images gallery'
    }
  ];

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-[500px] w-full max-w-6xl mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertDescription>
            Please sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500/30 text-red-300">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-6">
            {/* 左侧导航 */}
            <div className="w-80 shrink-0">
              {/* 用户账户信息 */}
              <Card className="mb-4 bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base text-white">
                    <User className="h-4 w-4 text-purple-400" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center space-x-3">
                    {user?.imageUrl && (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full border-2 border-purple-500/30"
                      />
                    )}
                                         <div className="space-y-1 flex-1 min-w-0">
                       <div>
                         <p className="text-xs text-gray-400">Full Name</p>
                         <p className="text-sm font-medium text-white">{user?.fullName || user?.firstName || 'Not set'}</p>
                       </div>
                       <div>
                         <p className="text-xs text-gray-400">Email Address</p>
                         <p className="text-sm font-medium text-white break-all">{user?.primaryEmailAddress?.emailAddress || 'No email'}</p>
                       </div>
                      <div>
                        <p className="text-xs text-gray-400">Member Since</p>
                        <p className="text-sm font-medium text-white">
                          {user?.createdAt ? new Date(user.createdAt.toISOString()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 导航菜单 */}
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-2">
                  <nav className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="mr-3 h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* 右侧内容区域 */}
            <div className="flex-1 min-w-0">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <OverviewSection 
                  user={user}
                  points={points}
                  totalPurchases={transactions.paymentTransactions.length}
                  totalImages={userImages.length}
                  loading={loading}
                />
              )}

              {/* My Orders Section */}
              {activeSection === 'orders' && (
                <OrdersSection 
                  transactions={transactions.paymentTransactions}
                  loading={loading}
                  formatDate={formatDate}
                  formatAmount={formatAmount}
                  getPlanDisplayName={getPlanDisplayName}
                />
              )}

              {/* My Credits Section */}
              {activeSection === 'credits' && (
                <CreditsSection 
                  transactions={transactions.pointsTransactions}
                  currentPoints={points}
                  loading={loading}
                  formatDate={formatDate}
                />
              )}

              {/* My Assets Section */}
              {activeSection === 'assets' && (
                <AssetsSection 
                  images={userImages}
                  pagination={imagesPagination}
                  loading={imagesLoading}
                  onLoadMore={loadMoreImages}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview组件
function OverviewSection({ 
  user, 
  points, 
  totalPurchases, 
  totalImages, 
  loading 
}: { 
  user: any; 
  points: number; 
  totalPurchases: number; 
  totalImages: number; 
  loading: boolean; 
}) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Overview</h2>
          <p className="text-sm text-gray-400">Your account summary and statistics</p>
        </div>
        <Button 
          onClick={() => router.push('/pricing')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          size="sm"
        >
          <Coins className="h-4 w-4 mr-2" />
          Recharge
        </Button>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white">Available Points</CardTitle>
            <Coins className="h-3 w-3 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">
              {loading ? <Skeleton className="h-6 w-12 bg-gray-700" /> : points.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400">Credits balance</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white">Total Purchases</CardTitle>
            <CreditCard className="h-3 w-3 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">
              {loading ? <Skeleton className="h-6 w-12 bg-gray-700" /> : totalPurchases}
            </div>
            <p className="text-xs text-gray-400">Completed orders</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white">Generated Images</CardTitle>
            <ImageIcon className="h-3 w-3 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">
              {loading ? <Skeleton className="h-6 w-12 bg-gray-700" /> : totalImages}
            </div>
            <p className="text-xs text-gray-400">Created assets</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-white">Quiz Completed</CardTitle>
            <Trophy className="h-3 w-3 text-purple-400" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg font-bold text-white">
              {loading ? <Skeleton className="h-6 w-12 bg-gray-700" /> : totalImages}
            </div>
            <p className="text-xs text-gray-400">Personality tests</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Orders组件
function OrdersSection({ 
  transactions, 
  loading, 
  formatDate, 
  formatAmount, 
  getPlanDisplayName 
}: { 
  transactions: PaymentTransaction[]; 
  loading: boolean; 
  formatDate: (date: string) => string; 
  formatAmount: (amount: number, currency?: string) => string; 
  getPlanDisplayName: (planId: string) => string; 
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">My Orders</h2>
        <p className="text-sm text-gray-400">Your purchase history and subscription plans</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Package className="h-4 w-4 text-purple-400" />
            Purchase History
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            View all your completed purchases and subscription plans
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full bg-gray-700" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-500/20 rounded-full">
                      <CreditCard className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{getPlanDisplayName(transaction.plan_id)}</p>
                      <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                      <p className="text-xs text-gray-500">Order ID: {transaction.order_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-gradient-to-r from-green-500 to-green-400 text-white mb-1 text-xs">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </Badge>
                    <p className="text-xs text-gray-400">
                      +{transaction.points_awarded} points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No purchase history found</p>
              <p className="text-xs text-gray-500">Your completed orders will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Credits组件
function CreditsSection({ 
  transactions, 
  currentPoints, 
  loading, 
  formatDate 
}: { 
  transactions: PointsTransaction[]; 
  currentPoints: number; 
  loading: boolean; 
  formatDate: (date: string) => string; 
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">My Credits</h2>
        <p className="text-sm text-gray-400">Track your points balance and transaction history</p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Coins className="h-4 w-4 text-purple-400" />
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {loading ? <Skeleton className="h-8 w-20 bg-gray-700" /> : `${currentPoints.toLocaleString()} credits`}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Available for generating images
          </p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <History className="h-4 w-4 text-purple-400" />
            Transaction History
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Complete log of your points transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full bg-gray-700" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isEarn = transaction.type === 'EARN';
                const pointAmount = transaction.points || transaction.amount;
                
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${isEarn ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
                        {isEarn ? <Plus className="h-4 w-4 text-blue-400" /> : <Minus className="h-4 w-4 text-orange-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{transaction.reason || 'Points Transaction'}</p>
                        <p className="text-xs text-gray-400">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${isEarn ? 'bg-gradient-to-r from-blue-500 to-blue-400 text-white' : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white'}`}>
                      {isEarn ? '+' : '-'} {pointAmount.toLocaleString()} credits
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Coins className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No credit transactions found</p>
              <p className="text-xs text-gray-500">Your points history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Assets组件
function AssetsSection({ 
  images, 
  pagination, 
  loading, 
  onLoadMore 
}: { 
  images: GeneratedImage[]; 
  pagination: any; 
  loading: boolean; 
  onLoadMore: () => void; 
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">My Assets</h2>
        <p className="text-sm text-gray-400">Your generated images and creative assets</p>
      </div>

      <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <ImageIcon className="h-4 w-4 text-purple-400" />
            Generated Images
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            Browse and manage your AI-generated cat images
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          {loading && images.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg bg-gray-700" />
              ))}
            </div>
          ) : images.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="group relative overflow-hidden rounded-lg border border-gray-600/30 bg-gray-700/20">
                    <img
                      src={image.url}
                      alt={image.prompt || 'Generated image'}
                      className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {image.prompt || 'Generated Cat Image'}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-white/80 text-xs">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.hasMore && (
                <div className="text-center mt-4">
                  <Button 
                    onClick={onLoadMore} 
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  >
                    {loading ? 'Loading...' : 'Load More Images'}
                  </Button>
                </div>
              )}

              <div className="text-center text-xs text-gray-400 mt-3">
                Showing {images.length} of {pagination.total} images
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No images generated yet</p>
              <p className="text-xs text-gray-500">Start creating your first cat image!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 