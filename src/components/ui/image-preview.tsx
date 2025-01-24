"use client"

import * as React from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
  src: string
  alt?: string
  className?: string
  imageClassName?: string
  aspectRatio?: "square" | "video"
  width?: number
  height?: number
}

export function ImagePreview({
  src,
  alt,
  className,
  imageClassName,
  aspectRatio = "square",
  width,
  height,
}: ImagePreviewProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div 
          className={cn(
            "relative overflow-hidden rounded-md cursor-pointer",
            aspectRatio === "square" ? "aspect-square" : "aspect-video",
            className
          )}
          style={{ width, height }}
        >
          <Image
            src={src}
            alt={alt || ""}
            fill
            className={cn(
              "object-cover hover:scale-105 transition-transform",
              imageClassName
            )}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-screen-lg">
        <div className="relative aspect-[16/9]">
          <Image
            src={src}
            alt={alt || ""}
            fill
            className="object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 