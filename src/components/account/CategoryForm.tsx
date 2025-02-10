"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createCategory, updateCategory, type Category } from "@/lib/http"

const formSchema = z.object({
  name: z.string().min(2, "名称至少2个字符"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "请输入有效的颜色值"),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      color: category?.color || "#000000"
    }
  })

  const { mutate: submitCategory, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      if (category?.id) {
        return updateCategory(category.id, values)
      } else {
        return createCategory(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(category ? "更新成功" : "创建成功")
      onSuccess?.()
    },
    onError: (error) => {
      console.error("Form error:", error)
      toast.error(error instanceof Error ? error.message : "操作失败")
    }
  })

  const onSubmit = (values: FormValues) => {
    submitCategory(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl> <Input {...field} /> </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>颜色</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input {...field} type="color" className="w-12 h-12 p-1" />
                  <Input {...field} className="font-mono" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "提交中..." : (category?.id ? "更新" : "创建")}
        </Button>
      </form>
    </Form>
  )
} 