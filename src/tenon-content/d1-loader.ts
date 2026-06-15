/**
 * Tenon Content — D1 Loader（Build-time）
 *
 * Astro 6 Content Layer 自定义 loader。构建时从 D1 读取所有 module 的所有内容，
 * 经 Zod 校验 + Markdown 渲染后注入 Astro 集合。渲染出的 HTML 是纯静态的，访客零 D1 查询。
 *
 * 连接方式：getPlatformProxy（wrangler）模拟 CF 运行时。
 * wrangler.jsonc 里 remote:true 时连远程 D1。
 */

import type { Loader } from "astro/loaders";
import { createRequire } from "node:module";
import { resolve } from "node:path";

// ---- 动态字段校验规则 ----

interface FieldValidationRules {
	type?: string;
	required?: boolean;
	min?: number;
	max?: number;
	values?: string[];
}

interface TenonField {
	id: string;
	module_id: string;
	name: string;
	field_type: string;
	default_value: string;
	validations: string | FieldValidationRules;
}

/** 针对一条字段的校验规则，验证一个 custom_data 值 */
function validateField(
	value: unknown,
	rules: FieldValidationRules,
): { valid: boolean; error?: string } {
	if (value === undefined || value === null) {
		if (rules.required) return { valid: false, error: "必填" };
		return { valid: true };
	}

	const t = rules.type || "text";

	switch (t) {
		case "string":
		case "text": {
			if (typeof value !== "string")
				return { valid: false, error: `应为字符串` };
			if (rules.min !== undefined && value.length < rules.min)
				return { valid: false, error: `最小 ${rules.min} 字符` };
			if (rules.max !== undefined && value.length > rules.max)
				return { valid: false, error: `最大 ${rules.max} 字符` };
			return { valid: true };
		}
		case "number": {
			const n = Number(value);
			if (isNaN(n)) return { valid: false, error: "应为数字" };
			if (rules.min !== undefined && n < rules.min)
				return { valid: false, error: `最小 ${rules.min}` };
			if (rules.max !== undefined && n > rules.max)
				return { valid: false, error: `最大 ${rules.max}` };
			return { valid: true };
		}
		case "boolean": {
			if (typeof value === "boolean") return { valid: true };
			if (value === "true" || value === "false" || value === 1 || value === 0)
				return { valid: true };
			return { valid: false, error: "应为布尔值" };
		}
		case "array": {
			if (!Array.isArray(value)) return { valid: false, error: "应为数组" };
			return { valid: true };
		}
		case "enum":
		case "select": {
			if (!rules.values?.includes(String(value)))
				return {
					valid: false,
					error: `应为 ${rules.values?.join("/")} 之一`,
				};
			return { valid: true };
		}
		default:
			return { valid: true }; // 未知类型宽进
	}
}

/** 解析字段的 validations JSON */
function parseRules(field: TenonField): FieldValidationRules {
	if (!field.validations) return {};
	if (typeof field.validations === "string") {
		try {
			return JSON.parse(field.validations);
		} catch {
			return {};
		}
	}
	return field.validations;
}

export interface D1LoaderOptions {
	/** D1 binding 名称（对应 wrangler.jsonc 里的 binding），默认 "tenon_db" */
	binding?: string;
}

export function d1Loader(opts: D1LoaderOptions = {}): Loader {
	const bindingName = opts.binding ?? "tenon_db";

	return {
		name: "tenon-d1-loader",

		async load(ctx) {
			const { store, logger, parseData, renderMarkdown, generateDigest } = ctx;

			// getPlatformProxy 在 Node 构建环境中模拟 CF 运行时
			const require = createRequire(import.meta.url);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { getPlatformProxy }: any = require("wrangler");

			const configPath = resolve(process.cwd(), "wrangler.jsonc");
			const proxy = await getPlatformProxy({ configPath });

			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const db = (proxy.env as any)[bindingName] as D1Database;
				if (!db) {
					throw new Error(
						`d1Loader: D1 binding "${bindingName}" not found. Check wrangler.jsonc.`,
					);
					}

				// 1. 读取所有启用的 module（Drizzle 的 eq() 在 D1 驱动下有问题，用 raw SQL）
				const allModules = await db
					.prepare("SELECT * FROM tenon_modules WHERE is_enabled = 1")
					.all<{
						id: string;
						name: string;
						slug: string;
						ui_component: string;
					}>();

				const moduleMap = new Map<string, (typeof allModules.results)[number]>();
				for (const mod of allModules.results) {
					moduleMap.set(mod.id, mod);
				}

				if (moduleMap.size === 0) {
					logger.warn("d1Loader: no enabled modules found, loading 0 entries");
					store.clear();
					return;
				}

				// 1.5. 读取所有模块的字段定义 → 动态校验规则
					const allFields = await db
						.prepare("SELECT * FROM tenon_fields ORDER BY sort_order")
						.all<TenonField>();

					// module_id → fields[] 映射表
					const fieldsByModule = new Map<string, TenonField[]>();
					for (const f of allFields.results) {
						if (!fieldsByModule.has(f.module_id)) {
							fieldsByModule.set(f.module_id, []);
						}
						fieldsByModule.get(f.module_id)!.push(f);
					}

					logger.info(
						`d1Loader: ${allFields.results.length} field definitions loaded for ${fieldsByModule.size} modules`,
					);

					// 2. 读取所有已发布内容（不限模块）
				const allContents = await db
					.prepare(
						`SELECT id, module_id, title, slug, date, status, cover, body_md, custom_data
						 FROM tenon_contents
						 WHERE status = 'published'`,
					)
					.all<{
						id: string;
						module_id: string;
						title: string;
						slug: string;
						date: string;
						status: string;
						cover: string;
						body_md: string;
						custom_data: string | Record<string, unknown>;
					}>();

				logger.info(
					`d1Loader: loaded ${allContents.results.length} entries across ${moduleMap.size} modules`,
				);

				// 3. 按日期降序排序，填充 prev/next 导航
				const sorted = [...allContents.results].sort(
					(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
				);

				store.clear();

				for (let i = 0; i < sorted.length; i++) {
					const row = sorted[i];
					const mod = moduleMap.get(row.module_id);

					// 跳过无效 module 的内容（数据完整性保护）
					if (!mod) {
						logger.warn(
							`d1Loader: skipping entry "${row.slug}" — module_id "${row.module_id}" not found`,
						);
						continue;
					}

					// custom_data 从 D1 返回是 JSON 字符串，需手动解析
					let customData: Record<string, unknown> = {};
					try {
						customData = row.custom_data
							? typeof row.custom_data === "string"
								? JSON.parse(row.custom_data)
								: (row.custom_data as Record<string, unknown>)
							: {};
					} catch {
						logger.warn(
							`d1Loader: invalid custom_data JSON for "${row.slug}", using empty`,
						);
					}

						// 动态 Zod 严出：根据 tenon_fields 校验 custom_data
						const moduleFields = fieldsByModule.get(row.module_id) || [];
						for (const field of moduleFields) {
							const rules = parseRules(field);
							const val = customData[field.name];
							const result = validateField(val, rules);
							if (!result.valid) {
								logger.warn(
									`d1Loader: "${row.slug}" field "${field.name}" = ${JSON.stringify(val)} — ${result.error}`,
								);
								customData[field.name] = undefined; // 清除不合规值
							}
						}

						// 构建 flat entry data（固定字段 + custom_data 展开）
					const rawData: Record<string, unknown> = {
						// 核心固定字段
						title: row.title,
						module: mod.slug,
						moduleId: row.module_id,
						ui_component: mod.ui_component || "DefaultCard",
						published: new Date(row.date),
						status: row.status,
						cover: row.cover || "",
						body_md: row.body_md || "",
						// 常用自定义字段（从 custom_data 提取默认值）
						tags: customData.tags ?? [],
						description: customData.description ?? "",
						lang: customData.lang ?? "zh-CN",
						// 展开其余 custom_data 字段（可能覆盖上面默认值，但用 ?? 保护）
						...customData,
						// prev/next 导航（排序后填充）
						prevSlug: "",
						prevTitle: "",
						nextSlug: "",
						nextTitle: "",
					};

					// prev/next 基于本模块内排序
					// TODO: stage 2 升级为 per-module sorting
					if (i < sorted.length - 1) {
						rawData.prevSlug = sorted[i + 1].slug;
						rawData.prevTitle = sorted[i + 1].title;
					}
					if (i > 0) {
						rawData.nextSlug = sorted[i - 1].slug;
						rawData.nextTitle = sorted[i - 1].title;
					}

					// 命名空间化 entry ID：${moduleSlug}/${contentSlug}
					const namespacedId = `${mod.slug}/${row.slug}`;

					// Zod 严出校验（走 collection schema）
					const data = await parseData({ id: namespacedId, data: rawData });

					// 渲染 Markdown → HTML（走 Astro 配置的 remark/rehype 管线）
					const rendered = await renderMarkdown(row.body_md || "");

					store.set({
						id: namespacedId,
						data,
						body: row.body_md,
						rendered,
						digest: generateDigest({
							title: row.title,
							date: row.date,
							module: mod.slug,
							body_md: row.body_md,
						}),
					});
				}
			} finally {
				await proxy.dispose();
			}
		},
	};
}
