/**
 * Tenon Data — Drizzle ORM Schema 定义
 *
 * 映射已有 D1 表（migrations/0001_init.sql），不生成新表。
 * 表结构变更走 wrangler d1 migrations，不走 Drizzle Kit。
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ===== tenon_modules 内容模块表 =====
export const tenonModules = sqliteTable("tenon_modules", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	icon: text("icon").default(""),
	ui_component: text("ui_component").default("DefaultCard"),
	is_enabled: integer("is_enabled").notNull().default(1),
	// SQLite 没有原生布尔，用 INTEGER 0/1 存
	sort_order: integer("sort_order").notNull().default(0),
	archive_mode: text("archive_mode").notNull().default("published"),
	created_at: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`),
});

// ===== tenon_fields 字段定义表 =====
export const tenonFields = sqliteTable("tenon_fields", {
	id: text("id").primaryKey(),
	module_id: text("module_id")
		.notNull()
		.references(() => tenonModules.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	label: text("label").default(""),
	field_type: text("field_type").notNull().default("text"),
	default_value: text("default_value").default(""),
	// validations 是 JSON 字符串，Drizzle text({ mode:'json' }) 自动 parse/stringify
	validations: text("validations", { mode: "json" }).default({}),
	sort_order: integer("sort_order").notNull().default(0),
	created_at: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`),
});

// ===== tenon_contents 内容宽表 =====
export const tenonContents = sqliteTable("tenon_contents", {
	id: text("id").primaryKey(),
	module_id: text("module_id")
		.notNull()
		.references(() => tenonModules.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	slug: text("slug").notNull(),
	date: text("date").notNull(),
	status: text("status").notNull().default("published"),
	cover: text("cover").default(""),
	body_md: text("body_md").default(""),
	// custom_data 是 JSON 字符串，Drizzle mode:'json' 自动处理
	custom_data: text("custom_data", { mode: "json" }).default({}),
	created_at: text("created_at")
		.notNull()
		.default(sql`(datetime('now'))`),
	updated_at: text("updated_at")
		.notNull()
		.default(sql`(datetime('now'))`),
});
