import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import * as z from "zod"
import { CryptoService } from "@/lib/crypto"

// 确保环境变量中有主密钥
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set')
}

const cryptoService = CryptoService.getInstance(process.env.ENCRYPTION_KEY)

const eventSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
  isImportant: z.boolean(),
  mainImage: z.string().optional(),
  timestamp: z.string(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    thumbnail: z.string().optional()
  })),
})

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('keyword')
    const sortBy = searchParams.get('sortBy') || 'newest'

    const where = {
      userId: session.user.id,
      // 分类
      ...(category && category !== 'all' ? {
        categories: { some: { categoryId: category } }
      } : {}
      ),
    }

    // 获取后进行筛选
    const allEvents = await prisma.event.findMany({
      where,
      include: {
        categories: {
          include: {
            category: {
              select: {
                id: true, name: true,
                color: true, icon: true
              }
            }
          }
        },
        images: true
      }
    })
    // 遍历筛选
    let filteredEvents = allEvents.map(event => ({
      ...event,
      tags: JSON.parse(event.tags),
      title: cryptoService.decrypt(event.title),
      content: event.content ? cryptoService.decrypt(event.content) : null,
      categories: event.categories.map(c => ({
        ...c.category
      }))
    }))

    // 在解密后的数据中进行搜索
    if (search) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        (event.content && event.content.toLowerCase().includes(search.toLowerCase()))
      )
    }

    // 排序
    filteredEvents.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime()
      const bTime = new Date(b.timestamp).getTime()
      return sortBy === 'newest' ? bTime - aTime : aTime - bTime
    })

    // 分页
    const total = filteredEvents.length
    const paginatedEvents = filteredEvents.slice((page - 1) * pageSize, page * pageSize)


    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // 鉴权
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await request.json()
    const body = eventSchema.parse(json)

    // 加密敏感数据
    const encryptedTitle = cryptoService.encrypt(body.title)
    const encryptedContent = body.content ? cryptoService.encrypt(body.content) : null

    // 创建事件
    const event = await prisma.event.create({
      data: {
        title: encryptedTitle,
        content: encryptedContent,
        timestamp: new Date(body.timestamp),
        isImportant: body.isImportant,
        mainImage: body.mainImage,
        categories: {
          create: body.categories.map(categoryId => ({
            category: {
              connect: { id: categoryId }
            }
          }))
        },
        tags: JSON.stringify(body.tags),
        user: {
          connect: { id: session.user.id },
        },
        images: {
          connect: body.images.map(image => ({ id: image.id }))
        }
      },
      include: {
        categories: { include: { category: true } },
        images: true
      }
    })

    // 返回解密后的内容
    return NextResponse.json({
      ...event,
      tags: JSON.parse(event.tags),
      title: body.title,
      content: body.content,
      categories: event.categories.map(c => ({
        ...c.category
      }))
    })
  } catch (error) {
    console.error('Failed to create event:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}