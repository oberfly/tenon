-- Tenon 阶段 2 — 补全 tenon_modules 字段

-- 归档模式：published（直接展示）/ archive（仅归档页可见）/ hidden（完全不展示）
ALTER TABLE tenon_modules ADD COLUMN archive_mode TEXT NOT NULL DEFAULT 'published';

-- 现有模块保持 published（向后兼容）
UPDATE tenon_modules SET archive_mode = 'published';
