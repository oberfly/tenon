/**
 * Tenon D1 Loader — Astro 6 Content Layer 自定义 loader
 *
 * 构建时从 Cloudflare D1 读取 tenon_contents 数据，经 Zod 校验后注入 Astro 集合。
 * 渲染出的 HTML 是纯静态的，访客访问时零 D1 查询。
 *
 * 连接方式：getPlatformProxy（wrangler）模拟 CF 运行时，拿到 env.tenon_db。
 * wrangler.jsonc 里 remote:true 时连远程 D1，否则用本地 miniflare D1。
 */

import type { Loader } from "astro/loaders";
import { createRequire } from "node:module";
import { resolve } from "node:path";

export interface D1LoaderOptions {
	/** 模块 slug（对应 tenon_modules.slug，如 'posts'） */
	module: string;
	/** D1 binding 名称（对应 wrangler.jsonc 里的 binding） */
	binding?: string;
}

// D1 查出来的原始行结构
interface TenonContentRow {
	id: string;
	module_id: string;
	title: string;
	slug: string;
	date: string;
	status: string;
	cover: string;
	body_md: string;
	custom_data: string; // JSON 字符串
}

export function d1Loader(opts: D1LoaderOptions): Loader {
	const bindingName = opts.binding ?? "tenon_db";

	return {
		name: "tenon-d1-loader",
		async load(ctx) {
			const { store, logger, parseData, renderMarkdown, generateDigest } = ctx;

			// getPlatformProxy 在 Node 构建环境中模拟 CF 运行时
			// 用 createRequire 绕过 Vite 的 ESM 解析（pnpm 下 wrangler 在 .pnpm store 里）
			const require = createRequire(import.meta.url);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { getPlatformProxy }: any = require("wrangler");

			// configPath 用绝对路径，兼容 Windows（避免 URL pathname 产生 /G:/ 开头）
			const configPath = resolve(process.cwd(), "wrangler.jsonc");
			const proxy = await getPlatformProxy({ configPath });

			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const db = (proxy.env as any)[bindingName];

				if (!db) {
					throw new Error(
						`d1Loader: D1 binding "${bindingName}" not found. Check wrangler.jsonc.`,
					);
				}

				// 1. 按 module slug 查 tenon_modules 拿 module_id
				const moduleResult = await db
					.prepare("SELECT id FROM tenon_modules WHERE slug = ? AND is_enabled = 1")
					.bind(opts.module)
					.first<{ id: string }>();

				if (!moduleResult) {
					logger.warn(
						`d1Loader: module "${opts.module}" not found or disabled, loading 0 entries`,
					);
					store.clear();
					return;
				}

				// 2. 查该模块下所有已发布内容
				const { results } = await db
					.prepare(
						`SELECT id, module_id, title, slug, date, status, cover, body_md, custom_data
						 FROM tenon_contents
						 WHERE module_id = ? AND status = 'published'
						 ORDER BY date DESC`,
					)
					.bind(moduleResult.id)
					.all<TenonContentRow>();

				logger.info(
					`d1Loader: loaded ${results.length} entries from D1 for module "${opts.module}"`,
				);

				// 3. 逐条处理：解析 custom_data → Zod 校验 → 渲染 Markdown → 存储
				store.clear();

				// 先排序（按日期降序），填充 prev/next 导航
				const sorted = [...results].sort((a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime(),
				);

				for (let i = 0; i < sorted.length; i++) {
					const row = sorted[i];

					// 解析 custom_data JSON（宽进）
					let customData: Record<string, unknown> = {};
					try {
						customData = row.custom_data ? JSON.parse(row.custom_data) : {};
					} catch {
						logger.warn(
							`d1Loader: invalid custom_data JSON for "${row.slug}", using empty`,
						);
					}

					// 构建原始数据对象（对齐现有 posts schema）
					const rawData: Record<string, unknown> = {
						title: row.title,
						published: new Date(row.date),
						// custom_data 里的自定义字段
						description: "",
						image: row.cover || "",
						tags: [],
						lang: "zh-CN",
						translationKey: "",
						pinned: false,
						...customData,
						// 始终从文件覆盖的字段
						draft: false,
						notionSync: false,
						notionPageId: "",
						// prev/next 导航（排序后填充）
						prevSlug: i < sorted.length - 1 ? sorted[i + 1].slug : "",
						prevTitle: i < sorted.length - 1 ? sorted[i + 1].title : "",
						nextSlug: i > 0 ? sorted[i - 1].slug : "",
						nextTitle: i > 0 ? sorted[i - 1].title : "",
					};

					// Zod 严出校验（走 collection schema）
					const data = await parseData({ id: row.slug, data: rawData });

					// 渲染 Markdown → HTML（走 Astro 配置的 remark/rehype 管线）
					const rendered = await renderMarkdown(row.body_md || "");

					store.set({
						id: row.slug,
						data,
						body: row.body_md,
						rendered,
						digest: generateDigest({
							title: row.title,
							date: row.date,
							body_md: row.body_md,
							custom_data: row.custom_data,
						}),
					});
				}
			} finally {
				// 必须清理 workerd 进程，否则 astro build 会挂起
				await proxy.dispose();
			}
		},
	};
}
