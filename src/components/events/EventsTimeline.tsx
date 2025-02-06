'use client'

import { EventQuery, Event } from "@/types"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { Loader2, Star } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"


const fetchEvents = async (searchQuery: EventQuery, page: number) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  try {
    // 构建查询参数
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: '5',
      ...(searchQuery.keyword && { keyword: searchQuery.keyword }),
      ...(searchQuery.category && { category: searchQuery.category })
    })

    const res = await fetch(`${baseUrl}/api/events?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', },
      credentials: 'include'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch events')
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching events:', error)
    return {
      items: [],
      total: 0,
      hasMore: false
    }
  }
}

export function EventsTimeline({ searchQuery }: { searchQuery: EventQuery }) {
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)

  // 加载更多数据
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const { events: newEvents, pagination } = await fetchEvents(searchQuery, page + 1)
      setEvents(prev => [...prev, ...newEvents])
      setHasMore(pagination.page < pagination.totalPages)
      setPage(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, searchQuery, page])

  // 设置 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [loadMore])

  // 搜索条件改变时重置并重新加载
  useEffect(() => {
    const initLoad = async () => {
      setLoading(true)
      try {
        const { events, pagination } = await fetchEvents(searchQuery, 1)
        setEvents(events)
        setHasMore(pagination.page < pagination.totalPages)
        setPage(1)
      } finally {
        setLoading(false)
      }
    }
    
    setEvents([])
    setPage(1)
    initLoad()
  }, [searchQuery])

  const groupedEvents = useMemo(() => {
    const groups = events.reduce((acc, event) => {
      const date = formatDate(event.timestamp as Date, "YYYY-MM-DD")
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(event)
      return acc
    }, {} as Record<string, Event[]>)

    return Object.entries(groups).sort((a, b) =>
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    )
  }, [events])

  return (
    <div className="relative">
      {/* 时间轴线 - 移动端和桌面端使用不同的位置 */}
      <div className="absolute md:left-24 left-4 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-8">
        {groupedEvents.map(([date, dateEvents]) => (
          <div key={date}>
            {/* 日期行 - 桌面端显示 */}
            <div className="hidden md:flex items-center mb-4">
              <div className="w-24 text-sm font-medium">
                {formatDate(new Date(date), "MM月DD日")}
              </div>
              <div className="absolute left-24 w-3 h-3 rounded-full border-2 border-primary bg-background -translate-x-1/2" />
            </div>

            {/* 事件列表 */}
            <div className={`space-y-4 pl-8 md:pl-32`}>
              {/* 移动端日期显示 */}
              <div className="md:hidden flex items-center">
                <div className="absolute left-4 w-3 h-3 rounded-full border-2 border-primary bg-background -translate-x-1/2" />
                <div className="text-sm font-medium text-muted-foreground ml-2">
                  {formatDate(new Date(date), "MM月DD日")}
                </div>
              </div>

              {dateEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.title}</h3>
                          {event.isImportant && (
                            <Star className="h-4 w-4 fill-primary text-primary" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {event.categories?.map((category) => (
                            <Badge
                              key={category.id}
                              variant="outline"
                              style={{
                                backgroundColor: `${category.color}10`,
                                borderColor: category.color,
                                color: category.color
                              }}
                            >
                              {category.name}
                            </Badge>
                          ))}
                          {event.tags?.map((tag, index) => (
                            <Badge
                              key={`tag-${index}`}
                              variant="secondary"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <time className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp as Date, "HH:mm")}
                      </time>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div 
          ref={loaderRef}
          className="flex justify-center py-8"
        >
          {loading && <Loader2 className="h-6 w-6 animate-spin" />}
        </div>
      )}
    </div>
  )
}
