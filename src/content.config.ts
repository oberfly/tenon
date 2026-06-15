/**
 * Tenon Content — Astro Content Collections 配置
 *
 * 单一 tenon 集合，d1Loader 读取所有 module 的内容。
 * 新增内容类型只需 D1 配置一条 module 记录，零代码改动。
 */

import { defineCollection, z } from "astro:content";
import { d1Loader } from "./tenon-content/d1-loader";

const tenonCollection = defineCollection({
	loader: d1Loader(),

	schema: z.object({
		// === 核心固定字段（所有 module 共有）===
		title: z.string(),
		module: z.string(), // module slug，如 "posts"
		moduleId: z.string(), // module UUID
		ui_component: z.string().optional().default("DefaultCard"),

		// 时间
		published: z.date(),
		updated: z.date().optional(),

		// 状态与媒体
		status: z.string().optional().default("published"),
		cover: z.string().optional().default(""),
		body_md: z.string().optional().default(""),

		// === prev/next 导航 ===
		prevSlug: z.string().default(""),
		prevTitle: z.string().default(""),
		nextSlug: z.string().default(""),
		nextTitle: z.string().default(""),
	}).passthrough(), // 允许各 module 的自定义字段自由透传（如 tags/description/lang 等）
});

export const collections = {
	tenon: tenonCollection,
};
