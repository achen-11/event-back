import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { CryptoService } from "@/lib/crypto"

// 确保环境变量中有主密钥
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set')
}

const cryptoService = CryptoService.getInstance(process.env.ENCRYPTION_KEY)

function calcEventWords(content: string): number {
  if (!content) return 0
  
  // 解密内容
  const decryptedContent = cryptoService.decrypt(content)
  
  return decryptedContent
    .replace(/<[^>]+>/g, '') // 移除HTML标签
    .replace(/\n/g, '') // 移除换行
    .replace(/\s/g, '') // 移除所有空白字符（包括空格、制表符等）
    .length
}
interface CategoryStats {
  id: string
  name: string
  color: string
  count: number
  // contentLength: number
}


export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange')
    const dateFilter = timeRange ? new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000) : null

    // 获取所有事件
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        timestamp: true,
        content: true,
        categories: { include: { category: true } }
      },
    })
    const filteredEvents = dateFilter ?
      events.filter(event => new Date(event.timestamp) >= dateFilter) :
      events

    // 计算事件数量 & 字数
    const basicStats = {
      count: filteredEvents.length,
      content_length: filteredEvents.reduce((acc, event) => {
        acc += calcEventWords(event?.content || "")
        return acc
      }, 0)
    }

    // 计算分类统计（移除活跃度统计）
    const categoryStats = filteredEvents.reduce((acc, event) => {
      event.categories.forEach(({ category }) => {
        if (!acc[category.id]) {
          acc[category.id] = {
            id: category.id,
            name: category.name,
            color: category.color,
            count: 0,
            // contentLength: 0
          }
        }
        acc[category.id].count++
        // acc[category.id].contentLength += event.content?.length || 0
      })
      return acc
    }, {} as Record<string, CategoryStats>)

    const dailyStats = events.reduce((acc, event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          contentLength: 0
        }
      }
      acc[date].count++
      acc[date].contentLength += calcEventWords(event?.content || "")
      return acc
    }, {} as Record<string, { date: string, count: number, contentLength: number }>)
    const sortedDailyStats = Object.values(dailyStats).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const firstEvent = await prisma.event.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        timestamp: 'asc'
      }
    })
    return NextResponse.json({
      total: {
        events: basicStats.count,
        contentLength: basicStats.content_length,
        real_total: events.length
      },
      categories: Object.values(categoryStats),
      daily: Object.values(sortedDailyStats),
      first_day: firstEvent?.timestamp
    })


  } catch (error) {
    console.error('Statistics API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}