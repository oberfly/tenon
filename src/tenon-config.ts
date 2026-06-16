/**
 * Tenon Theme — Site Configuration
 */

export const siteConfig = {
	title: "Tenon",
	description: "极致纯粹、动静绝对分离的现代动态内容引擎",
	language: "zh-CN",
	/** 主题色相 (0-360)，影响全站 oklch 主色 — 与 theme.css --hue 同步 */
	themeHue: 250,
	/** 当前启用的主题（footer "Theme by" 显示用；未来由后台主题切换器写入） */
	theme: {
		name: "Fuwari",
		url: "https://github.com/saicaca/fuwari",
	},
};

export const profileConfig = {
	name: "Tenon",
	avatar: "",
	bio: "多内容形态引擎 · 极简、纯粹",
	links: [
		{ name: "GitHub", url: "https://github.com/oberfly/tenon" },
	],
};
