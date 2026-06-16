import { useState, useCallback } from "react"

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tenon-sidebar-collapsed") === "true"
    }
    return false
  })

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("tenon-sidebar-collapsed", String(next))
      return next
    })
  }, [])

  const expand = useCallback(() => {
    setCollapsed(false)
    localStorage.setItem("tenon-sidebar-collapsed", "false")
  }, [])

  return { collapsed, toggle, expand }
}
