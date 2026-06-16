/**
 * Tenon System — Type Definitions
 */

// ---- Modules ----
export interface Module {
  id: string
  name: string
  slug: string
  icon?: string
  ui_component: string
  archive_mode: string
  is_enabled: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ModuleFormData {
  name: string
  slug: string
  icon?: string
  ui_component: string
  archive_mode?: string
  is_enabled?: boolean
  sort_order?: number
}

// ---- Fields ----
export interface Field {
  id: string
  module_id: string
  field_key: string
  label: string
  field_type: "text" | "number" | "date" | "select" | "textarea" | "boolean" | "json"
  required: boolean
  sort_order: number
  options?: string // JSON string for select options
  validations?: string // JSON string for validation rules
  created_at: string
  updated_at: string
}

export interface FieldFormData {
  module_id: string
  field_key: string
  label: string
  field_type: Field["field_type"]
  required?: boolean
  sort_order?: number
  options?: string
  validations?: string
}

// ---- Contents ----
export interface Content {
  id: string
  module_id: string
  title: string
  slug: string
  body_md?: string
  status: "published" | "draft" | "archived"
  custom_data: Record<string, unknown>
  date: string
  created_at: string
  updated_at: string
}

export interface ContentFormData {
  module_id: string
  title: string
  slug: string
  body_md?: string
  status: Content["status"]
  custom_data?: Record<string, unknown>
}

// ---- Settings ----
export interface Setting {
  key: string
  value: string
  updated_at: string
}

export interface SiteConfig {
  site_name: string
  site_url: string
  site_description: string
  active_layout: string
  active_theme: string
  theme_config: Record<string, unknown>
}

// ---- API Response ----
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// ---- Pagination ----
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
