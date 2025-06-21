-- 删除旧的、重复的积分视图
DROP VIEW IF EXISTS points_transactions;

-- 用户积分表
CREATE TABLE IF NOT EXISTS user_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 先删除可能已存在的旧表，以便重建
DROP TABLE IF EXISTS points_history;

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND')),
  reason TEXT,
  points INTEGER, -- 交易后的积分余额
  reference_id TEXT, -- 可以关联支付订单等
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 支付交易记录表
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  checkout_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  points_awarded INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_checkout_id ON payment_transactions(checkout_id);

-- 更新用户积分的函数
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id TEXT,
  p_amount INTEGER,
  p_type TEXT,
  p_reason TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_points INTEGER;
BEGIN
  -- 插入或更新用户积分，并返回更新后的积分
  INSERT INTO user_points (user_id, points)
  VALUES (p_user_id, 
    CASE 
      WHEN p_type = 'EARN' THEN p_amount
      WHEN p_type = 'SPEND' THEN -p_amount
      ELSE 0
    END
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = user_points.points + 
      CASE 
        WHEN p_type = 'EARN' THEN p_amount
        WHEN p_type = 'SPEND' THEN -p_amount
        ELSE 0
      END,
    updated_at = CURRENT_TIMESTAMP
  RETURNING points INTO new_points;

  -- 记录交易，包含交易后的积分余额
  INSERT INTO points_history (user_id, amount, type, reason, points)
  VALUES (p_user_id, p_amount, p_type, p_reason, new_points);

  -- 返回更新后的积分
  RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- 处理支付成功的函数
CREATE OR REPLACE FUNCTION process_payment_success(
  p_user_id TEXT,
  p_checkout_id TEXT,
  p_order_id TEXT,
  p_plan_id TEXT,
  p_amount DECIMAL,
  p_currency TEXT,
  p_points INTEGER
) RETURNS JSONB AS $$
DECLARE
  transaction_exists BOOLEAN;
  new_points INTEGER;
BEGIN
  -- 检查是否已经处理过这个支付
  SELECT EXISTS(
    SELECT 1 FROM payment_transactions 
    WHERE checkout_id = p_checkout_id OR order_id = p_order_id
  ) INTO transaction_exists;

  IF transaction_exists THEN
    RAISE EXCEPTION '支付记录已存在';
  END IF;

  -- 创建支付交易记录
  INSERT INTO payment_transactions (
    user_id, checkout_id, order_id, plan_id, 
    amount, currency, points_awarded
  ) VALUES (
    p_user_id, p_checkout_id, p_order_id, p_plan_id,
    p_amount, p_currency, p_points
  );

  -- 更新用户积分
  SELECT update_user_points(
    p_user_id, 
    p_points, 
    'EARN', 
    'Purchase: ' || p_plan_id
  ) INTO new_points;

  RETURN jsonb_build_object(
    'success', true,
    'points', new_points,
    'points_added', p_points
  );
END;
$$ LANGUAGE plpgsql; 