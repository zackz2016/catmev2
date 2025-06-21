-- 简化版本：创建支付交易表和必要函数
-- 适配现有的 points_history 和 user_points 表

-- 1. 创建 payment_transactions 表
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

-- 2. 创建索引
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_checkout_id ON payment_transactions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_history_user_id ON points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_points_history_created_at ON points_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- 3. 分步添加约束
-- 添加唯一约束（如果不存在）
DO $$ 
BEGIN
    -- payment_transactions checkout_id 唯一约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_transactions_checkout_id_key'
    ) THEN
        ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_checkout_id_key UNIQUE (checkout_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- 忽略错误，可能约束已存在
    NULL;
END $$;

DO $$ 
BEGIN
    -- payment_transactions order_id 唯一约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_transactions_order_id_key'
    ) THEN
        ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_order_id_key UNIQUE (order_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    -- user_points user_id 唯一约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_points_user_id_key'
    ) THEN
        ALTER TABLE user_points ADD CONSTRAINT user_points_user_id_key UNIQUE (user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$ 
BEGIN
    -- points_history 类型检查约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'points_history_type_check'
    ) THEN
        ALTER TABLE points_history ADD CONSTRAINT points_history_type_check CHECK (type IN ('EARN', 'SPEND'));
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 4. 创建函数：更新用户积分
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id TEXT,
  p_amount INTEGER,
  p_type TEXT,
  p_reason TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_points INTEGER;
  current_points INTEGER := 0;
BEGIN
  -- 验证类型
  IF p_type NOT IN ('EARN', 'SPEND') THEN
    RAISE EXCEPTION '无效的积分类型: %', p_type;
  END IF;

  -- 获取当前积分
  SELECT points INTO current_points 
  FROM user_points 
  WHERE user_id = p_user_id;
  
  -- 如果用户不存在，设置当前积分为0
  IF current_points IS NULL THEN
    current_points := 0;
  END IF;

  -- 计算新积分
  IF p_type = 'EARN' THEN
    new_points := current_points + p_amount;
  ELSE -- SPEND
    new_points := current_points - p_amount;
    -- 检查积分是否足够
    IF new_points < 0 THEN
      RAISE EXCEPTION '积分不足，当前积分: %, 尝试消费: %', current_points, p_amount;
    END IF;
  END IF;

  -- 插入或更新用户积分
  INSERT INTO user_points (user_id, points)
  VALUES (p_user_id, new_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    points = new_points,
    updated_at = CURRENT_TIMESTAMP;

  -- 记录积分历史（使用 points_history 表）
  INSERT INTO points_history (user_id, type, amount, reason, points)
  VALUES (p_user_id, p_type, p_amount, p_reason, new_points);

  RETURN new_points;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建函数：处理支付成功
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
    RAISE EXCEPTION '支付记录已存在: checkout_id=% order_id=%', p_checkout_id, p_order_id;
  END IF;

  -- 开始事务处理
  BEGIN
    -- 创建支付交易记录
    INSERT INTO payment_transactions (
      user_id, checkout_id, order_id, plan_id, 
      amount, currency, points_awarded, status
    ) VALUES (
      p_user_id, p_checkout_id, p_order_id, p_plan_id,
      p_amount, p_currency, p_points, 'completed'
    );

    -- 更新用户积分
    SELECT update_user_points(
      p_user_id, 
      p_points, 
      'EARN', 
      '购买计划: ' || p_plan_id
    ) INTO new_points;

    RETURN jsonb_build_object(
      'success', true,
      'points', new_points,
      'points_added', p_points,
      'transaction_id', (SELECT id FROM payment_transactions WHERE checkout_id = p_checkout_id)
    );
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION '处理支付失败: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql;

-- 6. 创建兼容性视图
DROP VIEW IF EXISTS points_transactions;
CREATE OR REPLACE VIEW points_transactions AS
SELECT 
  id,
  user_id,
  amount,
  type,
  reason,
  CAST(NULL AS TEXT) as reference_id,
  created_at
FROM points_history;

-- 7. 验证创建结果
SELECT 'payment_transactions table' as item, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_transactions') 
            THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL
SELECT 'update_user_points function' as item,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_user_points') 
            THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL
SELECT 'process_payment_success function' as item,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_payment_success') 
            THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL
SELECT 'points_transactions view' as item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'points_transactions') 
            THEN 'EXISTS' ELSE 'NOT EXISTS' END as status; 