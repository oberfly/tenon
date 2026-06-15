/**
 * Tenon System — API Client
 */

const BASE = "/api/admin";
const TOKEN = localStorage.getItem("tenon_token") || "tenon-dev";

async function request<T = any>(
	method: string,
	path: string,
	body?: unknown,
): Promise<{ success: boolean; data?: T; error?: string }> {
	const res = await fetch(`${BASE}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			"x-admin-token": TOKEN,
		},
		body: body ? JSON.stringify(body) : undefined,
	});
	return res.json();
}

// ---- Modules ----
export async function getModules() {
	return request<any[]>("GET", "/modules");
}

export async function createModule(data: any) {
	return request("POST", "/modules", data);
}

export async function updateModule(id: string, data: any) {
	return request("PUT", `/modules/${id}`, data);
}

// ---- Contents ----
export async function getContents(moduleId: string) {
	return request<any[]>("GET", `/contents?moduleId=${moduleId}`);
}

export async function createContent(data: any) {
	return request("POST", "/contents", data);
}

export async function updateContent(id: string, data: any) {
	return request("PUT", `/contents/${id}`, data);
}

export async function deleteContent(id: string) {
	return request("DELETE", `/contents/${id}`);
}

// ---- Fields ----
export async function getFields(moduleId: string) {
	return request<any[]>("GET", `/fields?moduleId=${moduleId}`);
}
