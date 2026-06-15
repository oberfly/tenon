/**
 * Tenon Route — 内容查询工具（轻量版）
 *
 * 基于单一 tenon 集合的查询辅助。不再有硬编码的内容类型函数。
 */

import { getCollection } from "astro:content";

/** 获取指定模块的已发布内容，按日期降序 */
export async function getModuleEntries(module: string) {
	const entries = await getCollection("tenon", ({ data }) => {
		if (data.module !== module) return false;
		// draft 通过 status 字段体现（但 schema 里 status 是 passthrough）
		return true;
	});

	return entries.sort(
		(a, b) => b.data.published.getTime() - a.data.published.getTime(),
	);
}
