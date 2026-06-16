import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save } from "lucide-react"

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">配置中心</h1>
        <p className="text-sm text-muted-foreground">
          站点配置、布局选择、主题选择与主题参数配置
        </p>
      </div>

      {/* Site Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">站点配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="site-name">站点名称</Label>
              <Input id="site-name" placeholder="My Tenon Site" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-url">站点 URL</Label>
              <Input id="site-url" placeholder="https://example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-desc">站点描述</Label>
            <Textarea
              id="site-desc"
              placeholder="一个基于 Tenon 引擎的内容站点"
            />
          </div>
        </CardContent>
      </Card>

      {/* Layout & Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">布局与主题</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>布局（网站类型）</Label>
              <Select defaultValue="blog">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">博客 (blog)</SelectItem>
                  <SelectItem value="music">音乐 (music)</SelectItem>
                  <SelectItem value="movie">电影 (movie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>主题（视觉样式）</Label>
              <Select defaultValue="fuwari">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fuwari">Fuwari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            布局决定页面骨架，主题决定视觉样式。同一布局可搭配不同主题。
          </p>
        </CardContent>
      </Card>

      {/* Theme Config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">主题参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            当前主题 Fuwari 的自定义参数
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-url">Banner 图片 URL</Label>
              <Input id="banner-url" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar-url">头像 URL</Label>
              <Input id="avatar-url" placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme-hue">色调 (Hue)</Label>
            <Input id="theme-hue" type="number" placeholder="250" />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-1 h-4 w-4" />
          保存配置
        </Button>
      </div>
    </div>
  )
}
