-- 检查和补充现有数据库结构
-- 这个脚本用于检查现有表是否缺少约束、索引或函数

-- 1. 检查并添加缺失的约束
-- user_points 表的唯一约束
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_points_user_id_key'
    ) THEN
        ALTER TABLE user_points ADD CONSTRAINT user_points_user_id_key UNIQUE (user_id);
    END IF;
END $$;

-- points_transactions 表的类型检查约束
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'points_transactions_type_check'
    ) THEN
        ALTER TABLE points_transactions ADD CONSTRAINT points_transactions_type_check CHECK (type IN ('EARN', 'SPEND'));
    END IF;
END $$;

-- payment_transactions 表的唯一约束（防重复支付）
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_transactions_checkout_id_key'
    ) THEN
        ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_checkout_id_key UNIQUE (checkout_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'payment_transactions_order_id_key'
    ) THEN
        ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_order_id_key UNIQUE (order_id);
    END IF;
END $$;

-- 2. 检查并创建缺失的索引
-- user_points 表索引
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);

-- points_transactions 表索引
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at DESC);

-- payment_transactions 表索引
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_checkout_id ON payment_transactions(checkout_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- 3. 检查并创建缺失的数据库函数
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
  -- 验证类型
  IF p_type NOT IN ('EARN', 'SPEND') THEN
    RAISE EXCEPTION '无效的积分类型: %', p_type;
  END IF;

  -- 插入或更新用户积分
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
  WHERE user_points.points + 
    CASE 
      WHEN p_type = 'SPEND' THEN -p_amount
      ELSE p_amount
    END >= 0; -- 确保积分不会变为负数

  -- 检查是否成功更新（积分不足时会失败）
  GET DIAGNOSTICS new_points = ROW_COUNT;
  IF new_points = 0 AND p_type = 'SPEND' THEN
    RAISE EXCEPTION '积分不足';
  END IF;

  -- 记录交易
  INSERT INTO points_transactions (user_id, amount, type, reason)
  VALUES (p_user_id, p_amount, p_type, p_reason);

  -- 获取更新后的积分
  SELECT points INTO new_points 
  FROM user_points 
  WHERE user_id = p_user_id;

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

-- 4. 检查数据完整性
-- 为现有用户创建默认积分记录（如果不存在）
DO $$
BEGIN
  -- 这里假设您的用户数据在 profiles 表中
  -- 如果用户只存在于 Clerk 中，则可以跳过这一步
  INSERT INTO user_points (user_id, points)
  SELECT 
    p.id::text, 
    1 -- 默认给新用户1积分
  FROM profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM user_points up WHERE up.user_id = p.id::text
  );
EXCEPTION WHEN others THEN
  -- 如果 profiles 表不存在或结构不同，忽略错误
  RAISE NOTICE '无法为现有用户创建积分记录: %', SQLERRM;
END $$;

-- 5. 验证函数是否可用
SELECT 
  'update_user_points' as function_name,
  COUNT(*) > 0 as exists
FROM pg_proc 
WHERE proname = 'update_user_points'
UNION ALL
SELECT 
  'process_payment_success' as function_name,
  COUNT(*) > 0 as exists
FROM pg_proc 
WHERE proname = 'process_payment_success'; 