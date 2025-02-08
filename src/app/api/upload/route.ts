import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuid } from 'uuid'

interface FormDataFile extends File {
  readonly size: number
  readonly type: string
  arrayBuffer(): Promise<ArrayBuffer>
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as FormDataFile[]
    if (files.length === 0) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      )
    }

    // 确保上传目录存在
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create upload directory:', error)
      return NextResponse.json(
        { error: '服务器配置错误' },
        { status: 500 }
      )
    }

    const uploadedImages = await Promise.all(
      files.map(async (file: FormDataFile) => {
        try {
          // 检查文件类型
          if (!file.type.startsWith('image/')) {
            throw new Error('只支持上传图片文件')
          }

          // 检查文件大小（例如：限制为 5MB）
          const maxSize = 5 * 1024 * 1024 // 5MB
          if (file.size > maxSize) {
            throw new Error('图片大小不能超过 5MB')
          }

          // 生成文件名和路径
          const id = uuid()
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
          const fileName = `${id}.${ext}`
          const relativePath = `/uploads/${fileName}`
          const absolutePath = join(uploadDir, fileName)

          // 保存文件
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          await writeFile(absolutePath, buffer)

          // 创建临时图片记录
          const image = await prisma.image.create({
            data: {
              id,
              url: relativePath,
              userId: session?.user?.id || '',
              eventId: null // 明确设置为 null
            }
          })

          return {
            id: image.id,
            url: image.url,
            thumbnail: image.thumbnail
          }
        } catch (error) {
          console.error('Error processing file:', file.name, error)
          throw error
        }
      })
    )

    return NextResponse.json(uploadedImages)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传失败' },
      { status: 500 }
    )
  }
} 