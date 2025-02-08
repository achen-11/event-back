"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryData {
  id: string
  name: string
  color: string
  count: number
}

interface CategoryPieChartProps {
  data: CategoryData[]
}


export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const isMobile = useIsMobile()
  
  // 处理数据，计算百分比
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const chartData = data.map(item => ({
      ...item,
      value: item.count,
      percent: ((item.count / total) * 100).toFixed(1)
    }))

  return (
    <div className="w-full h-[300px] md:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 50 : 80}
            outerRadius={isMobile ? 80 : 120}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${percent}%`}
            labelLine={true}
          >
            {chartData.map((entry) => (
              <Cell 
                key={entry.id} 
                fill={entry.color} 
                className="stroke-background hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-popover text-popover-foreground px-3 py-2 rounded-md shadow-md border text-sm">
                    <div className="font-medium">{data.name}</div>
                    <div className="text-muted-foreground">
                      {data.count} 条记录 ({data.percent}%)
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
