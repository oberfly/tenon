/**
 * Tenon Route — 详情页 getStaticPaths 辅助
 */

import { getCollection } from "astro:content";

export interface DetailRoute {
	module: string;
	slug: string;
}

/** 为所有 tenon 集合的 entry 生成详情路由 */
export async function getDetailRoutes(): Promise<DetailRoute[]> {
	const entries = await getCollection("tenon");

	return entries.map((entry) => {
		// entry.id = "moduleSlug/contentSlug"
		const slashIndex = entry.id.indexOf("/");
		const module = entry.id.substring(0, slashIndex);
		const slug = entry.id.substring(slashIndex + 1);

		return { module, slug };
	});
}
