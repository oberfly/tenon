/**
 * Tenon Route — 列表页 getStaticPaths 辅助
 */

import { getCollection } from "astro:content";

export interface ModuleRoute {
	slug: string;
	title: string;
	count: number;
}

/** 为每个有已发布内容的 module 生成列表路由 */
export async function getModuleRoutes(): Promise<ModuleRoute[]> {
	const entries = await getCollection("tenon");

	const moduleMap = new Map<string, { count: number; sampleEntry: (typeof entries)[number] }>();
	for (const entry of entries) {
		const mod = entry.data.module;
		if (!moduleMap.has(mod)) {
			moduleMap.set(mod, { count: 0, sampleEntry: entry });
		}
		moduleMap.get(mod)!.count++;
	}

	const routes: ModuleRoute[] = [];
	for (const [slug, info] of moduleMap) {
		routes.push({
			slug,
			title: slug, // TODO: 从 tenon_modules.name 获取中文名（需查 D1）
			count: info.count,
		});
	}

	return routes.sort((a, b) => a.slug.localeCompare(b.slug));
}
