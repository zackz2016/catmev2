-- 优化生成图片表与用户系统的关联
-- 基于现有的 profiles 表结构进行集成

-- 1. 首先检查现有表结构
SELECT 'Current generated_images structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'generated_images' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 确保 user_id 列与 profiles.clerk_user_id 类型一致
-- (都是 TEXT 类型，这样可以直接关联 Clerk 用户ID)

-- 3. 添加更多有用的字段来增强功能
DO $$
BEGIN
    -- 添加用户评分字段（可选）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'user_rating'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5);
    END IF;

    -- 添加下载次数统计
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'download_count'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;

    -- 添加分享次数统计
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'share_count'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN share_count INTEGER DEFAULT 0;
    END IF;

    -- 添加图片类型/风格字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'image_style'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN image_style TEXT;
    END IF;

    -- 添加图片宽高信息
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'width'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN width INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'height'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN height INTEGER;
    END IF;

    -- 添加文件大小字段
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_images' AND column_name = 'file_size'
    ) THEN
        ALTER TABLE generated_images ADD COLUMN file_size INTEGER; -- 以字节为单位
    END IF;

END $$;

-- 4. 创建外键约束，关联到 profiles 表
DO $$
BEGIN
    -- 检查 profiles 表是否存在 clerk_user_id 列
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'clerk_user_id'
    ) THEN
        -- 删除可能存在的旧外键约束
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_generated_images_user_id') THEN
            ALTER TABLE generated_images DROP CONSTRAINT fk_generated_images_user_id;
        END IF;
        
        -- 添加新的外键约束
        ALTER TABLE generated_images 
        ADD CONSTRAINT fk_generated_images_user_id 
        FOREIGN KEY (user_id) REFERENCES profiles(clerk_user_id) ON DELETE CASCADE;
        
        RAISE NOTICE '外键约束已成功添加：generated_images.user_id -> profiles.clerk_user_id';
    ELSE
        RAISE NOTICE '警告：profiles 表中没有找到 clerk_user_id 列，跳过外键约束创建';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '创建外键约束时出错: %', SQLERRM;
END $$;

-- 5. 优化索引
CREATE INDEX IF NOT EXISTS idx_generated_images_user_style ON generated_images(user_id, image_style);
CREATE INDEX IF NOT EXISTS idx_generated_images_public_created ON generated_images(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_generated_images_rating ON generated_images(user_rating) WHERE user_rating IS NOT NULL;

-- 6. 创建统计函数
CREATE OR REPLACE FUNCTION get_user_image_stats(p_user_id TEXT)
RETURNS TABLE(
    total_images INTEGER,
    public_images INTEGER,
    private_images INTEGER,
    total_downloads INTEGER,
    total_shares INTEGER,
    avg_rating NUMERIC(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_images,
        COUNT(*) FILTER (WHERE is_public = true)::INTEGER as public_images,
        COUNT(*) FILTER (WHERE is_public = false)::INTEGER as private_images,
        COALESCE(SUM(download_count), 0)::INTEGER as total_downloads,
        COALESCE(SUM(share_count), 0)::INTEGER as total_shares,
        ROUND(AVG(user_rating), 2) as avg_rating
    FROM generated_images 
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 7. 创建获取用户图片的增强函数
CREATE OR REPLACE FUNCTION get_user_images_with_profile(
    p_user_id TEXT DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_limit INTEGER DEFAULT 12,
    p_public_only BOOLEAN DEFAULT false,
    p_include_profile BOOLEAN DEFAULT true
)
RETURNS TABLE(
    id INTEGER,
    user_id TEXT,
    cloudinary_public_id TEXT,
    cloudinary_url TEXT,
    prompt TEXT,
    image_style TEXT,
    user_rating INTEGER,
    download_count INTEGER,
    share_count INTEGER,
    is_public BOOLEAN,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    -- 用户信息
    user_email TEXT,
    user_full_name TEXT,
    user_avatar_url TEXT
) AS $$
DECLARE
    offset_val INTEGER := (p_page - 1) * p_limit;
BEGIN
    RETURN QUERY
    SELECT 
        gi.id,
        gi.user_id,
        gi.cloudinary_public_id,
        gi.cloudinary_url,
        gi.prompt,
        gi.image_style,
        gi.user_rating,
        gi.download_count,
        gi.share_count,
        gi.is_public,
        gi.width,
        gi.height,
        gi.file_size,
        gi.created_at,
        gi.updated_at,
        -- 用户信息（如果需要）
        CASE WHEN p_include_profile THEN p.email ELSE NULL END as user_email,
        CASE WHEN p_include_profile THEN p.full_name ELSE NULL END as user_full_name,
        CASE WHEN p_include_profile THEN p.avatar_url ELSE NULL END as user_avatar_url
    FROM generated_images gi
    LEFT JOIN profiles p ON gi.user_id = p.clerk_user_id
    WHERE 
        (p_user_id IS NULL OR gi.user_id = p_user_id)
        AND (NOT p_public_only OR gi.is_public = true)
    ORDER BY gi.created_at DESC
    LIMIT p_limit OFFSET offset_val;
END;
$$ LANGUAGE plpgsql;

-- 8. 创建更新图片统计的函数
CREATE OR REPLACE FUNCTION update_image_stats(
    p_image_id INTEGER,
    p_action TEXT, -- 'download', 'share', 'rate'
    p_rating INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    CASE p_action
        WHEN 'download' THEN
            UPDATE generated_images 
            SET download_count = download_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = p_image_id;
        WHEN 'share' THEN
            UPDATE generated_images 
            SET share_count = share_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = p_image_id;
        WHEN 'rate' THEN
            IF p_rating IS NOT NULL AND p_rating BETWEEN 1 AND 5 THEN
                UPDATE generated_images 
                SET user_rating = p_rating,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = p_image_id;
            ELSE
                RETURN FALSE;
            END IF;
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 9. 验证表结构
SELECT 'Updated generated_images structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'generated_images' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. 验证外键约束
SELECT 
    'Foreign key constraints:' as info,
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conname LIKE '%generated_images%' AND contype = 'f';

-- 11. 测试函数（可选）
-- SELECT * FROM get_user_image_stats('test_user_id');
-- SELECT * FROM get_user_images_with_profile(NULL, 1, 5, true, true);

-- 12. 完成提示
DO $$
BEGIN
    RAISE NOTICE '生成图片表已成功优化并与用户系统集成！';
END $$; 