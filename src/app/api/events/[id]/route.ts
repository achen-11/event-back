import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { CryptoService } from "@/lib/crypto"

// 确保环境变量中有主密钥
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set')
}

const cryptoService = CryptoService.getInstance(process.env.ENCRYPTION_KEY)

const eventUpdateSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  timestamp: z.string().optional(),
  isImportant: z.boolean().optional(),
  mainImage: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    thumbnail: z.string().optional()
  })).optional()
})

type EventParams = {
  id: string
}

interface EventUpdateData {
  title?: string
  content?: string | null
  timestamp?: Date
  isImportant?: boolean
  mainImage?: string | null
  tags?: string
  categories?: {
    create: Array<{
      category: {
        connect: { id: string }
      }
    }>
  }
  images?: {
    connect: Array<{ id: string }>
  }
}

export async function GET(
  req: Request,
  props: { params: EventParams }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const event = await prisma.event.findUnique({
      where: { id: props.params.id },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: true
      }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (event.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // 解密内容
    return NextResponse.json({
      ...event,
      title: cryptoService.decrypt(event.title),
      content: event.content ? cryptoService.decrypt(event.content) : null
    })
  } catch (error) {
    console.error('Failed to fetch event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function PUT(
  req: Request,
  props: { params: EventParams }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const json = await req.json()
    const body = eventUpdateSchema.parse(json)
    const eventId = props.params.id

    // 首先获取现有事件
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        categories: true,
        images: true
      }
    })

    if (!existingEvent) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (existingEvent.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // 准备更新数据
    const updateData: EventUpdateData = {
      ...(body.title && { title: cryptoService.encrypt(body.title) }),
      ...(body.content !== undefined && { content: body.content ? cryptoService.encrypt(body.content) : null }),
      ...(body.timestamp && { timestamp: new Date(body.timestamp) }),
      ...(body.isImportant !== undefined && { isImportant: body.isImportant }),
      ...(body.mainImage !== undefined && { mainImage: body.mainImage }),
      ...(body.tags && { tags: JSON.stringify(body.tags) })
    }

    // 如果更新包含分类
    if (body.categories) {
      // 删除现有的分类关联
      await prisma.categoriesOnEvents.deleteMany({
        where: { eventId }
      })
      
      // 添加新的分类关联
      updateData.categories = {
        create: body.categories.map(categoryId => ({
          category: {
            connect: { id: categoryId }
          }
        }))
      }
    }

    // 如果更新包含图片
    if (body.images) {
      // 断开现有的图片关联
      await prisma.image.updateMany({
        where: { eventId },
        data: { eventId: null }
      })

      // 建立新的图片关联
      updateData.images = {
        connect: body.images.map(image => ({ id: image.id }))
      }
    }

    // 执行更新
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
      include: {
        categories: {
          include: {
            category: true
          }
        },
        images: true
      }
    })

    // 返回解密后的数据
    return NextResponse.json({
      ...updatedEvent,
      title: body.title || cryptoService.decrypt(updatedEvent.title),
      content: body.content !== undefined 
        ? body.content 
        : (updatedEvent.content ? cryptoService.decrypt(updatedEvent.content) : null),
      tags: JSON.parse(updatedEvent.tags),
      categories: updatedEvent.categories.map(category => category.category)
    })
  } catch (error) {
    console.error('Failed to update event:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  props: { params: EventParams }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const eventId = props.params.id
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return new NextResponse('Event not found', { status: 404 })
    }

    if (event.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    await prisma.event.delete({
      where: { id: eventId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Failed to delete event:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 