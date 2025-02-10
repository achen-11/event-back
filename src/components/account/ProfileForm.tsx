"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
// import { Button } from "@/components/ui/button"
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
import { useSession } from "next-auth/react"
import { useMutation } from "@tanstack/react-query"
import { updateProfile } from "@/lib/http"

const formSchema = z.object({
  name: z.string().min(2, "名称至少2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  image: z.array(z.object({
    id: z.string(),
    url: z.string()
  })).optional()
})

type FormValues = z.infer<typeof formSchema>

export function ProfileForm() {
  const { data: session, update } = useSession()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      image: session?.user?.image ? [{
        id: "avatar",
        url: session.user.image
      }] : []
    }
  })

  const { mutate: submitProfile, } = useMutation({
    mutationFn: (values: FormValues) => {
      return updateProfile({
        name: values.name,
        email: values.email,
        image: values.image?.[0]?.url
      })
    },
    onSuccess: async () => {
      // 更新 session
      await update({
        name: form.getValues('name'),
        email: form.getValues('email'),
        image: form.getValues('image')?.[0]?.url
      })
      toast.success("更新成功")
    },
    onError: (error) => {
      console.error("Update error:", error)
      toast.error(error instanceof Error ? error.message : "更新失败")
    }
  })

  const onSubmit = (values: FormValues) => {
    submitProfile(values)
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>名称</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>邮箱</FormLabel>
                <FormControl>
                  <Input {...field} type="email" disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <Button type="submit" disabled={isPending}>
            {isPending ? "更新中..." : "更新信息"}
          </Button> */}
        </form>
      </Form>
    </div>
  )
} 