-- 修改 profiles 表以支持 Clerk 用户ID
-- 如果您希望在数据库中也存储用户信息

-- 1. 修改 profiles 表，支持 Clerk 用户ID
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey,
ALTER COLUMN id SET DATA TYPE TEXT,
ALTER COLUMN id SET DEFAULT NULL;

-- 重命名现有的 id 列为 clerk_user_id 以更清晰
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') THEN
        ALTER TABLE profiles RENAME COLUMN id TO clerk_user_id;
    END IF;
END $$;

-- 添加新的 UUID 主键
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_id UUID DEFAULT gen_random_uuid();
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (profile_id);

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
    -- 忽略错误，可能约束已存在
    NULL;
END $$;

-- 2. 创建用户同步函数
CREATE OR REPLACE FUNCTION sync_user_profile(
  p_clerk_user_id TEXT,
  p_email TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_avatar_url TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  profile_id UUID;
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
  RETURNING profile_id INTO profile_id;

  RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- 3. 创建获取用户资料的函数
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

-- 4. 验证表结构
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position; 