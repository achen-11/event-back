import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id }
    })
    const clearCategories = categories.map((category) => {
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      }
    })

    return NextResponse.json(clearCategories)
  } catch (error) {
    console.error('Error in categories API:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}