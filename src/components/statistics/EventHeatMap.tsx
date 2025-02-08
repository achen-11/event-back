"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import * as React from "react"
import "./styles.css"

interface DailyStats {
  date: string
  count: number
  contentLength: number
}

interface EventHeatMapProps {
  data: DailyStats[]
}

interface CalendarHeatmapValue {
  date: string
  count: number
  contentLength?: number
}

export function EventHeatMap({ data }: EventHeatMapProps) {
  const isMobile = useIsMobile()
  const today = new Date()
  const [openTooltip, setOpenTooltip] = React.useState<string | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  // 根据设备类型确定显示的天数
  const daysToShow = isMobile ? 90 : 365 // 移动端90天，桌面端365天
  
  // 计算开始日期
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - daysToShow + 1)
  
  // 处理数据
  const values = data
    .filter(day => {
      const dayDate = new Date(day.date)
      const diffTime = today.getTime() - dayDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= daysToShow
    })
    .map(day => ({
      date: day.date,
      count: day.count,
      contentLength: day.contentLength
    }))

  // 处理移动端触摸事件
  const handleTouch = React.useCallback((date: string | null) => {
    if (isMobile) {
      setOpenTooltip(prev => prev === date ? null : date)
    }
  }, [isMobile])

  // 点击其他区域关闭 tooltip
  React.useEffect(() => {
    if (isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpenTooltip(null)
        }
      }
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobile])

  return (
    <div className="w-full relative" ref={containerRef}>
      <TooltipProvider delayDuration={100}>
        <CalendarHeatmap
          startDate={startDate}
          endDate={today}
          values={values}
          classForValue={(value: CalendarHeatmapValue | null) => {
            if (!value || value.count === 0) {
              return 'color-empty'
            }
            // 根据记录数量返回不同的颜色等级
            if (value.count === 1) return 'color-scale-1'
            if (value.count <= 3) return 'color-scale-2'
            if (value.count <= 5) return 'color-scale-3'
            return 'color-scale-4'
          }}
          transformDayElement={(element: React.ReactElement, value: CalendarHeatmapValue | null) => {
            if (!value) return element

            const elementWithTouch = React.cloneElement(element, {
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation()
                handleTouch(value.date)
              }
            })

            return (
              <Tooltip 
                key={value.date}
                open={isMobile ? openTooltip === value.date : undefined}
              >
                <TooltipTrigger asChild>
                  {elementWithTouch}
                </TooltipTrigger>
                <TooltipContent className="tooltip-content">
                  <div>
                    <div className="date font-medium">
                      {format(new Date(value.date), 'yyyy年MM月dd日', { locale: zhCN })}
                    </div>
                    <div className="text-muted-foreground">
                      {value.count} 条记录 · {value.contentLength || 0} 字
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          }}
          showWeekdayLabels={true}
          weekdayLabels={['日', '一', '二', '三', '四', '五', '六']}
          gutterSize={isMobile ? 2 : 3}
        />
      </TooltipProvider>
    </div>
  )
}