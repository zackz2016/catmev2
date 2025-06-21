-- 修改 profiles 表以支持 Clerk 用户ID（修复版）
-- 如果您希望在数据库中也存储用户信息

-- 1. 首先检查 profiles 表的当前结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 备份现有数据（可选，建议在生产环境中执行）
-- CREATE TABLE profiles_backup AS SELECT * FROM profiles;

-- 3. 修改 profiles 表结构
-- 删除可能存在的外键约束
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_fkey') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 修改 id 列的数据类型为 TEXT
DO $$
BEGIN
    -- 检查 id 列是否存在且不是 TEXT 类型
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'id' 
        AND data_type != 'text'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN id SET DATA TYPE TEXT;
        ALTER TABLE profiles ALTER COLUMN id DROP DEFAULT;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '修改 id 列类型时出错: %', SQLERRM;
END $$;

-- 重命名 id 列为 clerk_user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'clerk_user_id'
    ) THEN
        ALTER TABLE profiles RENAME COLUMN id TO clerk_user_id;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '重命名 id 列时出错: %', SQLERRM;
END $$;

-- 添加新的 UUID 主键列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN profile_id UUID DEFAULT gen_random_uuid();
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '添加 profile_id 列时出错: %', SQLERRM;
END $$;

-- 删除旧的主键约束并添加新的
DO $$
BEGIN
    -- 删除旧的主键约束
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_pkey') THEN
        ALTER TABLE profiles DROP CONSTRAINT profiles_pkey;
    END IF;
    
    -- 添加新的主键约束
    ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (profile_id);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '修改主键时出错: %', SQLERRM;
END $$;

-- 添加 Clerk 用户ID 的唯一约束
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_clerk_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_clerk_user_id_key UNIQUE (clerk_user_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '添加唯一约束时出错: %', SQLERRM;
END $$;

-- 4. 创建用户同步函数
CREATE OR REPLACE FUNCTION sync_user_profile(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  profile_uuid UUID;
BEGIN
  -- 插入或更新用户资料
  INSERT INTO profiles (clerk_user_id, email, full_name, avatar_url)
  VALUES (p_clerk_user_id, p_email, p_full_name, p_avatar_url)
  ON CONFLICT (clerk_user_id) 
  DO UPDATE SET 
    email = p_email,
    full_name = COALESCE(p_full_name, profiles.full_name),
    avatar_url = COALESCE(p_avatar_url, profiles.avatar_url),
    updated_at = CURRENT_TIMESTAMP
  RETURNING profile_id INTO profile_uuid;

  RETURN profile_uuid;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建获取用户资料的函数
CREATE OR REPLACE FUNCTION get_user_profile(p_clerk_user_id TEXT)
RETURNS TABLE(
  profile_id UUID,
  clerk_user_id TEXT,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.profile_id,
    p.clerk_user_id,
    p.email,
    p.full_name,
    p.avatar_url,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.clerk_user_id = p_clerk_user_id;
END;
$$ LANGUAGE plpgsql;

-- 6. 验证修改后的表结构
SELECT 
  'profiles table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. 验证函数是否创建成功
SELECT 
  'sync_user_profile function' as item,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'sync_user_profile') 
       THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL
SELECT 
  'get_user_profile function' as item,
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_profile') 
       THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- 8. 测试函数（可选）
-- SELECT sync_user_profile('test_user_123', 'test@example.com', 'Test User', 'https://example.com/avatar.jpg');
-- SELECT * FROM get_user_profile('test_user_123'); 