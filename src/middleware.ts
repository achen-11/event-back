import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

async function authMiddleware(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}

export default authMiddleware

// 需要认证的路径
export const config = {
  matcher: [
    // 主要页面
    '/',
    '/events/:path*',
    '/timeline/:path*',
    '/statistics/:path*',
    '/account/:path*',
    // API 路由
    '/api/((?!auth).)*',
  ]
} 