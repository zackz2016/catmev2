-- 创建访客试用记录表
CREATE TABLE IF NOT EXISTS guest_trials (
  id SERIAL PRIMARY KEY,
  client_ip TEXT NOT NULL,
  browser_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_guest_trials_ip_date ON guest_trials (client_ip, created_at);
CREATE INDEX IF NOT EXISTS idx_guest_trials_created_at ON guest_trials (created_at);

-- 添加注释
COMMENT ON TABLE guest_trials IS '访客试用记录表';
COMMENT ON COLUMN guest_trials.client_ip IS '客户端IP地址和User-Agent组合';
COMMENT ON COLUMN guest_trials.browser_fingerprint IS '浏览器指纹';
COMMENT ON COLUMN guest_trials.created_at IS '试用时间';

-- 自动清理超过30天的旧记录（可选）
-- CREATE OR REPLACE FUNCTION cleanup_old_guest_trials()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM guest_trials WHERE created_at < NOW() - INTERVAL '30 days';
-- END;
-- $$ LANGUAGE plpgsql; 