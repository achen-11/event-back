import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { z } from 'zod'
import { prisma } from "@/lib/prisma"

const accountSchema = z.object({
  name: z.string().min(2, '名称至少2个字符').optional(),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  image: z.string().optional()
})

export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    const json = await request.json()
    const { name, email, image } = accountSchema.parse(json)
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, email, image }
    })
    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to update event:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}