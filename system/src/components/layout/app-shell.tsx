import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "./sidebar"
import { TopBar } from "./topbar"
import { useTheme } from "@/hooks/use-theme"
import { useSidebar } from "@/hooks/use-sidebar"
import { Outlet } from "react-router-dom"

export function AppShell() {
  useTheme()
  const { collapsed, toggle } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          <Sidebar collapsed={collapsed} onToggle={toggle} />
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onMenuClick={toggle}
            collapsed={collapsed}
            onToggleSidebar={toggle}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
