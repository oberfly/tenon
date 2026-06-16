import { useState, useEffect } from "react"
import { getModules } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Blocks, Plus, Pencil, Trash2 } from "lucide-react"
import type { Module } from "@/lib/types"
import { toast } from "sonner"

export default function Modules() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
  }, [])

  async function loadModules() {
    const res = await getModules()
    if (res.success && res.data) setModules(res.data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">模块管理</h1>
          <p className="text-sm text-muted-foreground">
            管理内容模块类型，每个模块可配置独立字段
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          新增模块
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">名称</th>
                  <th className="text-left p-3 font-medium">Slug</th>
                  <th className="text-left p-3 font-medium">组件</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr
                    key={mod.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="p-3 font-medium">{mod.name}</td>
                    <td className="p-3 text-muted-foreground">{mod.slug}</td>
                    <td className="p-3 text-muted-foreground">
                      {mod.ui_component || "DefaultCard"}
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={mod.is_enabled ? "default" : "secondary"}
                      >
                        {mod.is_enabled ? "启用" : "禁用"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {modules.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground"
                    >
                      暂无模块，点击"新增模块"创建第一个
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
