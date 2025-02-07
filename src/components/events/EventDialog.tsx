'use client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownEditor } from "@/components/ui/markdown-editor"

import type { Event, Category, EventQuery } from "@/types"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createEvent, updateEvent, type CreateEventInput } from "@/lib/http"

import { cn, formatDate } from "@/lib/utils"

import { CategorySelect } from "./CategorySelect"
import { TagInput } from "./TagInput"

interface EventFormDialogProps {
  event?: Event
  open?: boolean
  onOpenChange?: (open: boolean) => void
  categories: Category[]
  searchQuery?: EventQuery
}

interface InfiniteQueryData {
  pages: Array<{
    events: Event[]
    pagination: {
      page: number
      totalPages: number
    }
  }>
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

export function EventDialog({ event, open, onOpenChange, categories, searchQuery}: EventFormDialogProps) {

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
    onSuccess: (newEvent: Event) => {
      // 更新事件列表缓存
      queryClient.setQueryData(['events', searchQuery], (old: InfiniteQueryData | undefined) => {
        // 确保事件的categories包含完整信息
        const eventWithFullCategories: Event = {
          ...newEvent,
          categories: (newEvent.categories || []).map((categoryId: string | Category) => {
            if (typeof categoryId !== 'string') return categoryId
            const category = categories.find(c => c.id === categoryId)
            return category || { id: categoryId, name: '未知分类', color: '#000000' }
          })
        }

        if (!old) {
          return { 
            pages: [{ 
              events: [eventWithFullCategories], 
              pagination: { page: 1, totalPages: 1 } 
            }] 
          }
        }
        
        // 更新第一页的数据
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              events: [eventWithFullCategories, ...old.pages[0].events]
            },
            ...old.pages.slice(1)
          ]
        }
      })
      
      toast.success(event ? "事件已更新" : "事件已创建")
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
            <form className="space-y-4 pr-2 text-sm"
              onSubmit={form.handleSubmit(
                (values) => {
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
                  submitEvent(eventData)
                },
                (errors: Record<string, { message?: string }>) => {
                  Object.entries(errors).forEach(([field, error]) => {
                    if (error?.message) {
                      toast.error(`${field}: ${error.message}`)
                    }
                  })
                }
              )} >
              <FormField control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input className="text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormLabel>内容</FormLabel>
                  <FormControl>
                    <MarkdownEditor value={field.value || ''} className="text-sm"
                      onChange={(value) => field.onChange(value || '')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="timestamp" render={({ field }) => (
                <FormItem>
                  <FormLabel>时间</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? formatDate(field.value, "YYYY-MM-DD HH:mm") : "选择日期"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isImportant" render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">标记为重要</FormLabel>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <CategorySelect
                    categories={categories}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="mt-4">
          <Button
            type="submit"
            disabled={isPending}
            onClick={form.handleSubmit(
              (values) => {
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
                submitEvent(eventData)
              },
              (errors: Record<string, { message?: string }>) => {
                Object.entries(errors).forEach(([field, error]) => {
                  if (error?.message) {
                    toast.error(`${field}: ${error.message}`)
                  }
                })
              }
            )}
          >
            {isPending && (
              <span className="mr-2 h-4 w-4 animate-spin" />
            )}
            {event ? "更新" : "创建"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}