"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchStatistics } from "@/lib/http"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { TIME_RANGES } from "@/lib/constants"
import { Loader2, CalendarDays, BookText, Hash, Clock } from "lucide-react"
import { EventHeatMap } from "./EventHeatMap"
import { CategoryPieChart } from "./CategoryPieChart"
import { formatDate } from "@/lib/utils"


export function StatisticsView() {
  const [timeRange, setTimeRange] = React.useState<string>(TIME_RANGES.MONTH)



  // 获取统计数据
  const { data: statistics, isLoading } = useQuery({
    queryKey: ['statistics', timeRange],
    queryFn: () => fetchStatistics({ timeRange }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }
  return (
    <div>
      {/* 时间范围选择器 */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TIME_RANGES.WEEK}>最近一周</SelectItem>
            <SelectItem value={TIME_RANGES.MONTH}>最近一月</SelectItem>
            <SelectItem value={TIME_RANGES.YEAR}>最近一年</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* 总体统计 */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mt-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 lg:px-6">
            <CardTitle className="text-sm font-medium">总事件数</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            <div className="text-2xl font-bold">{statistics?.total.events || 0}</div>
            <p className="text-xs text-muted-foreground">
              平均每天 {(statistics?.total.events / +timeRange).toFixed(2) || 0} 条
            </p>
          </CardContent>
        </Card>
        {/* 总字数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 lg:px-6">
            <CardTitle className="text-sm font-medium">总字数</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            <div className="text-2xl font-bold">{statistics?.total.contentLength || 0}</div>
            <p className="text-xs text-muted-foreground">
              平均每条 {Math.round(statistics?.total.contentLength / statistics?.total.events || 0)} 字
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 lg:px-6">
            <CardTitle className="text-sm font-medium">使用分类</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          {/* 分类情况 */}
          <CardContent className="px-4 lg:px-6">
            <div className="text-2xl font-bold">{statistics?.categories.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              最多：{statistics?.categories[0]?.name || "无"}（{statistics?.categories[0]?.count || 0}条）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 lg:px-6">
            <CardTitle className="text-sm font-medium">记录时长</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-4 lg:px-6">
            <div className="text-2xl font-bold">
              {Math.round((Date.now() - new Date(statistics?.daily[0]?.date).getTime()) / (1000 * 60 * 60 * 24)) || 0} 天
            </div>
            <p className="text-xs text-muted-foreground">
              自 {formatDate(statistics?.first_day, "YYYY年MM月DD日")}
            </p>
          </CardContent>
        </Card>
      </div>
      {/* 热力图 */}
      <div className="mt-4">
        <Tabs defaultValue="heatmap" className="space-y-6">
          <TabsList>
            <TabsTrigger value="heatmap">活跃度</TabsTrigger>
            <TabsTrigger value="category">分类统计</TabsTrigger>
          </TabsList>
          <TabsContent value="heatmap">
            <Card>
              <CardHeader className="lg:p-6 p-4">
                <CardTitle>活跃度热力图</CardTitle>
              </CardHeader>
              <CardContent className="lg:p-6 p-4 !pl-0 pr-6">
                <EventHeatMap data={statistics?.daily || []} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="category">
            <Card>
              <CardHeader className="lg:p-6 p-4">
                <CardTitle>分类分布情况</CardTitle>
              </CardHeader>
              <CardContent className="lg:p-6 p-4">
                <CategoryPieChart data={statistics?.categories || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

}