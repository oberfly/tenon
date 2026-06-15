/**
 * Tenon System — Admin API（Cloudflare Pages Function）
 *
 * Hono 路由，catch-all 模式匹配 /api/admin/*
 * 鉴权：x-admin-token header 对比 env.ADMIN_TOKEN
 * 数据访问：通过 Drizzle ORM + env.tenon_db binding
 */

import { Hono } from "hono/tiny";
import { handle } from "hono/cloudflare-pages";
import { createDb, schema } from "../../../src/tenon-data";
import { eq } from "drizzle-orm";

const app = new Hono();

// ---- 鉴权中间件 ----
app.use("/api/admin/*", async (c, next) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const env = (c.env as any) || {};
	const token = c.req.header("x-admin-token");
	const expected = env.ADMIN_TOKEN || "tenon-dev"; // TODO: 生产环境走环境变量
	if (token !== expected) {
		return c.json({ success: false, error: "Unauthorized" }, 401);
	}
	await next();
});

// ---- 数据库工厂 ----
function getDb(c: { env: Record<string, unknown> }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return createDb((c.env as any).tenon_db as D1Database);
}

// ===== Modules =====

app.get("/api/admin/modules", async (c) => {
	const db = getDb(c);
	const rows = await db.query.tenonModules.findMany();
	rows.sort((a, b) => a.sort_order - b.sort_order);
	return c.json({ success: true, data: rows });
});

app.post("/api/admin/modules", async (c) => {
	const db = getDb(c);
	const body = await c.req.json();
	await db.insert(schema.tenonModules).values({
		id: body.id || crypto.randomUUID(),
		name: body.name,
		slug: body.slug,
		icon: body.icon || "",
		ui_component: body.ui_component || "DefaultCard",
		is_enabled: 1,
		sort_order: body.sort_order || 0,
		archive_mode: body.archive_mode || "published",
	});
	return c.json({ success: true });
});

app.put("/api/admin/modules/:id", async (c) => {
	const db = getDb(c);
	const id = c.req.param("id");
	const body = await c.req.json();
	await db
		.update(schema.tenonModules)
		.set({
			name: body.name,
			slug: body.slug,
			icon: body.icon,
			ui_component: body.ui_component,
			is_enabled: body.is_enabled ?? 1,
			archive_mode: body.archive_mode,
			updated_at: new Date().toISOString(),
		})
		.where(eq(schema.tenonModules.id, id));
	return c.json({ success: true });
});

// ===== Contents =====

app.get("/api/admin/contents", async (c) => {
	const db = getDb(c);
	const moduleId = c.req.query("moduleId");
	const rows = await db.query.tenonContents.findMany({
		where: moduleId ? eq(schema.tenonContents.module_id, moduleId) : undefined,
	});
	rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return c.json({ success: true, data: rows });
});

app.post("/api/admin/contents", async (c) => {
	const db = getDb(c);
	const body = await c.req.json();
	await db.insert(schema.tenonContents).values({
		id: body.id || crypto.randomUUID(),
		module_id: body.module_id,
		title: body.title,
		slug: body.slug,
		date: body.date || new Date().toISOString(),
		status: body.status || "published",
		cover: body.cover || "",
		body_md: body.body_md || "",
		custom_data: body.custom_data || {},
	});
	return c.json({ success: true });
});

app.put("/api/admin/contents/:id", async (c) => {
	const db = getDb(c);
	const id = c.req.param("id");
	const body = await c.req.json();
	await db
		.update(schema.tenonContents)
		.set({
			title: body.title,
			slug: body.slug,
			body_md: body.body_md,
			custom_data: body.custom_data,
			status: body.status,
			cover: body.cover,
			date: body.date,
			updated_at: new Date().toISOString(),
		})
		.where(eq(schema.tenonContents.id, id));
	return c.json({ success: true });
});

// 物理删除 — 对应 roadmap "没有后悔药"
app.delete("/api/admin/contents/:id", async (c) => {
	const db = getDb(c);
	const id = c.req.param("id");
	await db.delete(schema.tenonContents).where(eq(schema.tenonContents.id, id));
	return c.json({ success: true });
});

// ===== Fields =====

app.get("/api/admin/fields", async (c) => {
	const db = getDb(c);
	const moduleId = c.req.query("moduleId");
	const rows = await db.query.tenonFields.findMany({
		where: moduleId
			? eq(schema.tenonFields.module_id, moduleId)
			: undefined,
	});
	rows.sort((a, b) => a.sort_order - b.sort_order);
	return c.json({ success: true, data: rows });
});

app.post("/api/admin/fields", async (c) => {
	const db = getDb(c);
	const body = await c.req.json();
	await db.insert(schema.tenonFields).values({
		id: body.id || crypto.randomUUID(),
		module_id: body.module_id,
		name: body.name,
		label: body.label || "",
		field_type: body.field_type || "text",
		default_value: body.default_value || "",
		validations: body.validations || {},
		sort_order: body.sort_order || 0,
	});
	return c.json({ success: true });
});

export const onRequest = handle(app);
