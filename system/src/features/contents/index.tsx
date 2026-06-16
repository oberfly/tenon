import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Plus, Pencil, Trash2 } from "lucide-react"
import type { Module, Content } from "@/lib/types"

// Placeholder data — will be replaced with real API calls
export default function Contents() {
  const [selectedModule, setSelectedModule] = useState<string>("")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">内容管理</h1>
          <p className="text-sm text-muted-foreground">
            管理各模块下的内容，表单根据模块字段动态生成
          </p>
        </div>
        <Button size="sm" disabled={!selectedModule}>
          <Plus className="mr-1 h-4 w-4" />
          新增内容
        </Button>
      </div>

      {/* Module selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">选择模块：</span>
        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="选择模块" />
          </SelectTrigger>
          <SelectContent>
            {/* Dynamic module options will be loaded from API */}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">标题</th>
                  <th className="text-left p-3 font-medium">日期</th>
                  <th className="text-left p-3 font-medium">状态</th>
                  <th className="text-left p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {!selectedModule ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      请先选择一个模块
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      加载内容中...
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
