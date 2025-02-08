"use client"

import * as React from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X, Star } from "lucide-react"

export interface ImageUploadProps {
  value: Array<{
    id: string
    url: string
    thumbnail?: string
  }>
  onChange: (value: ImageUploadProps['value']) => void
  onRemove: (index: number) => void
  mainImage?: string
  onSetMainImage?: (image: ImageUploadProps['value'][0]) => void
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove,
  mainImage,
  onSetMainImage
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  // 检测是否为移动设备
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setIsUploading(true)
        const formData = new FormData()
        acceptedFiles.forEach((file) => {
          formData.append('files', file)
        })

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('上传失败')
        }

        const data = await response.json()
        onChange([...value, ...data])
        toast.success('上传成功')
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('上传失败')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    }
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors
          ${isDragActive ? 'border-primary' : 'border-muted-foreground/25'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          {isDragActive ? (
            <p>拖放文件到这里 ...</p>
          ) : (
            <p>点击或拖放图片到这里上传</p>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {value.map((image, index) => (
            <div 
              key={image.id} 
              className="relative group"
              onClick={() => isMobile && setSelectedImage(selectedImage === image.id ? null : image.id)}
            >
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={image.url}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 25vw, 16.666vw"
                />
                {image.url === mainImage && (
                  <div className="absolute top-1 right-1 bg-black/40 p-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  </div>
                )}
                {/* PC端悬停菜单 */}
                {!isMobile && onSetMainImage && image.url !== mainImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-white hover:text-white hover:bg-black/60"
                      onClick={() => onSetMainImage(image)}
                    >
                      设为主图
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-white hover:text-white hover:bg-black/60"
                      onClick={() => onRemove(index)}
                    >
                      删除
                    </Button>
                  </div>
                )}
                {/* 移动端选中状态 */}
                {isMobile && selectedImage === image.id && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1 bg-black/60">
                    {onSetMainImage && image.url !== mainImage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-white hover:text-white hover:bg-black/60"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSetMainImage(image)
                          setSelectedImage(null)
                        }}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-white hover:text-white hover:bg-black/60"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemove(index)
                        setSelectedImage(null)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 