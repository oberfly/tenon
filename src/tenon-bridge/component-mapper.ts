/**
 * Tenon Bridge — ComponentMapper
 *
 * 按 D1 ui_component 字段在主题目录匹配 Astro 组件。
 * 阶段 2 升级：使用 import.meta.glob 扫描组件目录，
 * 不再需要手动维护静态映射表。
 */

import DefaultCard from "./DefaultCard.astro";

/** 扫描 Tenon Theme 目录 */
const themeComponents = import.meta.glob(
	"/src/tenon-theme/**/*.astro",
) as Record<string, () => Promise<{ default: any }>>;

/** 合并所有可扫描组件（tenon-theme 优先） */
const allComponents: Record<string, () => Promise<{ default: any }>> = {
	...themeComponents,
};

/** 从 glob 路径提取组件名（如 /src/tenon-theme/PostCard.astro → PostCard） */
function componentNameFromPath(globPath: string): string {
	const fileName = globPath.split("/").pop() || "";
	return fileName.replace(/\.astro$/, "");
}

/**
 * 按 ui_component 名查找组件。
 * 优先级：Tenon Theme > legacy > DefaultCard 降级
 */
export async function resolveComponent(
	uiComponent: string,
): Promise<{ default: any }> {
	// 在 glob 结果中查找匹配的组件
	for (const [path, loader] of Object.entries(allComponents)) {
		if (componentNameFromPath(path) === uiComponent) {
			return loader();
		}
	}

	// 降级
	return { default: DefaultCard };
}
