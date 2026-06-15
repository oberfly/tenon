/**
 * Tenon Bridge — ComponentMapper
 *
 * 按 D1 ui_component 字段在主题目录匹配 Astro 组件。
 * 阶段 2 升级：使用 import.meta.glob 扫描组件目录，
 * 不再需要手动维护静态映射表。
 */

import DefaultCard from "./DefaultCard.astro";

/** 扫描 Tenon Theme 目录（阶段 3 激活后生效） */
const themeComponents = import.meta.glob(
	"/src/tenon-theme/**/*.astro",
) as Record<string, () => Promise<{ default: any }>>;

/** 扫描旧组件目录（阶段 3 过渡期间保留，迁移完成后移除） */
const legacyComponents = import.meta.glob(
	"/src/components/**/*.astro",
) as Record<string, () => Promise<{ default: any }>>;

/** 合并所有可扫描组件 */
const allComponents: Record<string, () => Promise<{ default: any }>> = {
	...legacyComponents,
	...themeComponents, // Tenon Theme 优先覆盖同名旧组件
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
