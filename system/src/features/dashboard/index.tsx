import { useState, useEffect } from "react"
import { getModules, getContents } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Blocks, FileText, Puzzle, Activity } from "lucide-react"
import type { Module } from "@/lib/types"

export default function Dashboard() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const modRes = await getModules()
      if (modRes.success && modRes.data) setModules(modRes.data)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    )
  }

  const stats = [
    {
      title: "模块数",
      value: modules.length,
      icon: Blocks,
      description: "已启用 " + modules.filter((m) => m.is_enabled).length,
    },
    {
      title: "内容数",
      value: "-",
      icon: FileText,
      description: "所有模块内容合计",
    },
    {
      title: "字段数",
      value: "-",
      icon: Puzzle,
      description: "动态字段合计",
    },
    {
      title: "数据源",
      value: "-",
      icon: Activity,
      description: "已接入插件数",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-sm text-muted-foreground">
          Tenon 内容引擎管理概览
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">模块概览</CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无模块</p>
          ) : (
            <div className="space-y-2">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">{mod.name}</div>
                    <div className="text-xs text-muted-foreground">
                      slug: {mod.slug}
                      {mod.ui_component && ` · 组件: ${mod.ui_component}`}
                    </div>
                  </div>
                  <div
                    className={
                      mod.is_enabled
                        ? "text-xs font-medium text-green-600"
                        : "text-xs text-muted-foreground"
                    }
                  >
                    {mod.is_enabled ? "启用" : "禁用"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
