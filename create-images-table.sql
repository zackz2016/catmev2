-- 创建生成图片表
CREATE TABLE IF NOT EXISTS generated_images (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    cloudinary_public_id TEXT NOT NULL UNIQUE,
    cloudinary_url TEXT NOT NULL,
    prompt TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON generated_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_public ON generated_images(is_public) WHERE is_public = true;

-- 添加触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_images_updated_at
    BEFORE UPDATE ON generated_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加外键约束（如果有用户表的话）
-- ALTER TABLE generated_images 
-- ADD CONSTRAINT fk_generated_images_user_id 
-- FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 为测试添加一些示例数据（可选）
-- INSERT INTO generated_images (user_id, cloudinary_public_id, cloudinary_url, prompt) VALUES
-- ('user_test_1', 'catme/generated-cats/sample_1', 'https://res.cloudinary.com/sample/image/upload/sample_1.jpg', 'A cute sitting cat'),
-- ('user_test_2', 'catme/generated-cats/sample_2', 'https://res.cloudinary.com/sample/image/upload/sample_2.jpg', 'A playful jumping cat'); 