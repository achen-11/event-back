'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import type { Event, Category } from "@/types"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createEvent, updateEvent, type CreateEventInput } from "@/lib/http"
import { MarkdownEditor } from "@/components/ui/markdown-editor"

interface EventFormDialogProps {
  event?: Event
  open?: boolean
  onOpenChange?: (open: boolean) => void
  categories: Category[]
}
const eventSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().optional(),
  timestamp: z.date(),
  isImportant: z.boolean().default(false),
  images: z.array(z.object({
    id: z.string(),
    url: z.string()
  })).default([]),
  mainImage: z.string().optional().nullable(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([])
})

type FormValues = z.infer<typeof eventSchema>

export function EventDialog({ event, open, onOpenChange, categories }: EventFormDialogProps) {
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      content: event?.content || "",
      timestamp: event?.timestamp ? new Date(event.timestamp) : new Date(),
      isImportant: event?.isImportant || false,
      images: event?.images || [],
      mainImage: event?.mainImage,
      categories: event?.categories?.map(c => c.id) || [],
      tags: event?.tags || []
    }
  })

  // 重置表单
  useEffect(() => {
    if (open) {
      form.reset({
        title: event?.title || "",
        content: event?.content || "",
        timestamp: event?.timestamp ? new Date(event.timestamp) : new Date(),
        isImportant: event?.isImportant || false,
        images: event?.images || [],
        mainImage: event?.mainImage,
        categories: event?.categories?.map(c => c.id) || [],
        tags: event?.tags || []
      })
      setSelectedTags(event?.tags || [])
    }
  }, [open, event, form])
  const queryClient = useQueryClient()
  const { mutate: submitEvent, isPending } = useMutation({
    mutationFn: async (values: FormValues) => {
      const eventData: CreateEventInput = {
        title: values.title,
        content: values.content || "",
        timestamp: values.timestamp,
        isImportant: values.isImportant || false,
        images: values.images || [],
        categories: values.categories || [],
        tags: values.tags || [],
        ...(values.mainImage ? { mainImage: values.mainImage } : {})
      }

      if (event?.id) {
        return updateEvent(event.id, eventData)
      } else {
        return createEvent(eventData)
      }
    },
    onSuccess: () => {
      toast.success(event ? "事件已更新" : "事件已创建")
      queryClient.invalidateQueries({ queryKey: ['events'] })
      onOpenChange?.(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "操作失败")
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0">
        {/* 头部 */}
        <DialogHeader className="">
          <DialogTitle className="text-left">{event ? "编辑事件" : "新建事件"}</DialogTitle>
          <DialogDescription className="text-left">
            {event ? "修改事件的详细信息" : "添加一个新的事件记录"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <Form {...form}>
            <form className="space-y-4 pr-2 text-sm">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>内容</FormLabel>
                    <FormControl>
                      <MarkdownEditor 
                        value={field.value || ''} 
                        onChange={(value) => field.onChange(value || '')}
                        className="text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}