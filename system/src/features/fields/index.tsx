import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function Fields() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">字段管理</h1>
          <p className="text-sm text-muted-foreground">
            为模块配置动态字段，字段变更实时反映到内容编辑表单
          </p>
        </div>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          新增字段
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">字段列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            选择一个模块以查看和管理其字段
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
