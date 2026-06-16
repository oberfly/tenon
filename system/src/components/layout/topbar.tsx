import { Moon, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"
import { useTheme } from "@/hooks/use-theme"

interface TopBarProps {
  onMenuClick: () => void
  collapsed: boolean
  onToggleSidebar: () => void
}

export function TopBar({ onMenuClick, collapsed, onToggleSidebar }: TopBarProps) {
  const { setTheme } = useTheme()

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">切换菜单</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[17.5rem] p-0">
          <Sidebar collapsed={false} onToggle={() => {}} />
        </SheetContent>
      </Sheet>

      {/* Breadcrumb area */}
      <div className="flex-1">
        <h2 className="text-sm font-medium text-muted-foreground">
          Tenon 管理面板
        </h2>
      </div>

      {/* Theme toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            亮色
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            暗色
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            const isDark = document.documentElement.classList.contains("dark")
            setTheme(isDark ? "light" : "dark")
          }}>
            跟随系统
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
