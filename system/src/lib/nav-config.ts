import {
  LayoutDashboard,
  Blocks,
  FileText,
  Settings2,
  Puzzle,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
}

export const navItems: NavItem[] = [
  {
    title: "仪表盘",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "模块管理",
    href: "/modules",
    icon: Blocks,
  },
  {
    title: "内容管理",
    href: "/contents",
    icon: FileText,
  },
  {
    title: "字段管理",
    href: "/fields",
    icon: Puzzle,
  },
  {
    title: "配置中心",
    href: "/settings",
    icon: Settings2,
  },
]
