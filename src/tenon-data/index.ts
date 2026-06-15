/**
 * Tenon Data — Drizzle ORM 工厂
 *
 * 单工厂函数，构建时（d1Loader）和运行时（Hono API）共用。
 * 两处传入的 d1 对象不同（本地 proxy vs 线上 binding），
 * 但都满足 D1Database 接口，Drizzle 不关心来源。
 */

import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/** 从 D1 binding 创建 Drizzle ORM 实例 */
export function createDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

/** 导出类型：createDb 的返回值类型，方便消费方标注 */
export type TenonDb = ReturnType<typeof createDb>;

/** 导出 schema，消费方可按需 import 表定义 */
export { schema };
