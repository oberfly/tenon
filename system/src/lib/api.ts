/**
 * Tenon System — API Client
 */

import type {
  ApiResponse,
  Module,
  ModuleFormData,
  Field,
  FieldFormData,
  Content,
  ContentFormData,
  Setting,
  PaginatedData,
} from "./types"

const BASE = "/api/admin"

function getToken(): string {
  return localStorage.getItem("tenon_token") || "tenon-dev"
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

// ---- Modules ----
export async function getModules() {
  return request<Module[]>("GET", "/modules")
}

export async function getModule(id: string) {
  return request<Module>("GET", `/modules/${id}`)
}

export async function createModule(data: ModuleFormData) {
  return request<Module>("POST", "/modules", data)
}

export async function updateModule(id: string, data: Partial<ModuleFormData>) {
  return request<Module>("PUT", `/modules/${id}`, data)
}

export async function deleteModule(id: string) {
  return request("DELETE", `/modules/${id}`)
}

// ---- Fields ----
export async function getFields(moduleId: string) {
  return request<Field[]>("GET", `/fields?moduleId=${moduleId}`)
}

export async function createField(data: FieldFormData) {
  return request<Field>("POST", "/fields", data)
}

export async function updateField(id: string, data: Partial<FieldFormData>) {
  return request<Field>("PUT", `/fields/${id}`, data)
}

export async function deleteField(id: string) {
  return request("DELETE", `/fields/${id}`)
}

// ---- Contents ----
export async function getContents(moduleId: string, page = 1, pageSize = 20) {
  return request<PaginatedData<Content>>(
    "GET",
    `/contents?moduleId=${moduleId}&page=${page}&pageSize=${pageSize}`
  )
}

export async function getContent(id: string) {
  return request<Content>("GET", `/contents/${id}`)
}

export async function createContent(data: ContentFormData) {
  return request<Content>("POST", "/contents", data)
}

export async function updateContent(id: string, data: Partial<ContentFormData>) {
  return request<Content>("PUT", `/contents/${id}`, data)
}

export async function deleteContent(id: string) {
  return request("DELETE", `/contents/${id}`)
}

// ---- Settings ----
export async function getSettings() {
  return request<Setting[]>("GET", "/settings")
}

export async function updateSettings(data: Record<string, string>) {
  return request<Setting[]>("PUT", "/settings", data)
}
