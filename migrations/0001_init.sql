-- Tenon D1 Schema v1 — 最小集，够 d1Loader POC 跑通
-- 后续通过 migrations 增量演进，不在 CF 控制台手动改

-- ========== 1. tenon_modules 内容模块表 ==========
-- 定义内容类型（博客、影评、读书笔记...），替代原项目硬编码的 config.ts
CREATE TABLE IF NOT EXISTS tenon_modules (
  id          TEXT PRIMARY KEY,           -- UUID，主键
  name        TEXT NOT NULL,              -- 显示名（如"博客"）
  slug        TEXT NOT NULL UNIQUE,       -- 路由前缀 + Astro 集合名（如 posts/books/movies）
  icon        TEXT DEFAULT '',            -- 模块图标（material-symbols 名）
  ui_component TEXT DEFAULT 'DefaultCard',-- 渲染时匹配的主题组件名（D1 与 Theme 唯一契约）
  is_enabled  INTEGER NOT NULL DEFAULT 1, -- 1=启用 0=禁用（SQLite 用 INTEGER 存布尔）
  sort_order  INTEGER NOT NULL DEFAULT 0, -- 后台展示排序
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== 2. tenon_fields 字段定义表 ==========
-- 动态字段定义，构建时据此生成 Zod schema 校验 custom_data
CREATE TABLE IF NOT EXISTS tenon_fields (
  id            TEXT PRIMARY KEY,
  module_id     TEXT NOT NULL,            -- 关联 tenon_modules.id
  name          TEXT NOT NULL,            -- 字段名（custom_data JSON 里的 key）
  label         TEXT DEFAULT '',          -- 后台表单显示名
  field_type    TEXT NOT NULL DEFAULT 'text', -- text/number/date/select/image/relation 等
  default_value TEXT DEFAULT '',           -- 默认值
  validations   TEXT DEFAULT '{}',        -- JSON：Zod 校验规则（如 {required:true,min:1,max:200}）
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (module_id) REFERENCES tenon_modules(id) ON DELETE CASCADE
);

-- ========== 3. tenon_contents 内容宽表（唯一真相源）==========
-- 所有内容存这里，custom_data 用 JSON 宽表承接任意自定义字段
CREATE TABLE IF NOT EXISTS tenon_contents (
  id          TEXT PRIMARY KEY,           -- UUID
  module_id   TEXT NOT NULL,              -- 关联 tenon_modules.id
  title       TEXT NOT NULL,              -- 标题
  slug        TEXT NOT NULL,              -- URL slug（模块内唯一）
  date        TEXT NOT NULL,              -- 发布时间 ISO 字符串
  status      TEXT NOT NULL DEFAULT 'published', -- published/draft/archived
  cover       TEXT DEFAULT '',            -- 封面图 URL（R2 持久化地址）
  body_md     TEXT DEFAULT '',            -- Markdown 正文（直接入库，不生成文件）
  custom_data TEXT DEFAULT '{}',          -- JSON：所有自定义字段值（宽进）
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (module_id) REFERENCES tenon_modules(id) ON DELETE CASCADE
);

-- 索引：构建时按模块批量拉取，按日期排序
CREATE INDEX IF NOT EXISTS idx_contents_module ON tenon_contents(module_id);
CREATE INDEX IF NOT EXISTS idx_contents_module_date ON tenon_contents(module_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON tenon_contents(module_id, slug);

-- ========== 初始数据：posts 模块 ==========
-- 先建一个 posts 模块，让 d1Loader 有东西可读
INSERT INTO tenon_modules (id, name, slug, icon, ui_component, is_enabled, sort_order)
VALUES ('mod_posts', '博客', 'posts', 'material-symbols:article', 'PostCard', 1, 1);

-- posts 模块的基础自定义字段示例（对应原项目 frontmatter 里的字段）
INSERT INTO tenon_fields (id, module_id, name, label, field_type, default_value, validations, sort_order) VALUES
  ('fld_posts_tags',    'mod_posts', 'tags',        '标签',   'text',   '[]',  '{"type":"array"}',                    1),
  ('fld_posts_desc',    'mod_posts', 'description', '摘要',   'text',   '',    '{"type":"string","max":500}',         2),
  ('fld_posts_lang',    'mod_posts', 'lang',        '语言',   'select', 'zh-CN','{"type":"enum","values":["zh-CN","en"]}', 3),
  ('fld_posts_pinned',  'mod_posts', 'pinned',      '置顶',   'text',   'false','{"type":"boolean"}',                  4);

-- 一条测试文章（验证 d1Loader 能读到数据并渲染）
INSERT INTO tenon_contents (id, module_id, title, slug, date, status, cover, body_md, custom_data)
VALUES (
  'cnt_test_001',
  'mod_posts',
  'D1 直驱测试文章',
  'd1-poc-test',
  '2026-06-15T10:00:00',
  'published',
  '',
  '# 你好，Tenon\n\n这是来自 **D1 数据库** 的第一篇文章。\n\n如果能在浏览器看到这段话，说明 d1Loader 跑通了。',
  '{"tags":["测试"],"description":"d1Loader POC 验证文章","lang":"zh-CN","pinned":false}'
);
