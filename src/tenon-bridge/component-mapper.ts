/**
 * Tenon Bridge — ComponentMapper
 *
 * 按 D1 ui_component 字段在主题目录匹配 Astro 组件。
 * 无匹配 → 降级 DefaultCard.astro。
 *
 * 阶段 1 用静态映射表（Tenon Theme 还没建）。
 * 阶段 3 升级为 import.meta.glob 扫描 src/tenon-theme/。
 */

import DefaultCard from "./DefaultCard.astro";

/** 目前已知的组件映射（fuwari 遗留 UI，阶段 3 替换） */
const componentMap: Record<string, any> = {
	DefaultCard,
};

// TODO: 阶段 3 用 import.meta.glob 动态扫描
// const themeComponents = import.meta.glob('/src/tenon-theme/**/*.astro');
// const componentMap = Object.fromEntries(
//   Object.entries(themeComponents).map(([path, mod]) => {
//     const name = path.split('/').pop()?.replace('.astro', '') || '';
//     return [name, mod];
//   })
// );

/** 按 ui_component 名查找组件，未匹配则返回降级 DefaultCard */
export function resolveComponent(uiComponent: string) {
	return componentMap[uiComponent] || DefaultCard;
}
