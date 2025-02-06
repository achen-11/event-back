"use client"

import * as React from "react"
// import { signIn } from "@/lib/auth"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Github } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "sonner"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符")
})

function SignInContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          ...values,
          redirect: false
        })
        console.log("result", result);
        
        if (result?.error) {
          toast.error("登录失败，请检查邮箱和密码")
        } else {
          window.location.href = callbackUrl
        }
      } catch(e) {
        console.log(e);
        
        toast.error("登录失败，请稍后重试")
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">登录</h1>
        <p className="text-muted-foreground mt-2">
          登录以继续使用事件记录系统
        </p>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("github", { callbackUrl })}
        >
          <Github className="mr-2 h-4 w-4" />
          使用 GitHub 登录
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              或使用邮箱登录
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>密码</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "登录中..." : "登录"}
            </Button>
          </form>
        </Form>
      </div>

      <div className="text-center text-sm">
        还没有账号？{" "}
        <Link
          href="/auth/register"
          className="text-primary hover:underline"
        >
          立即注册
        </Link>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <React.Suspense fallback={
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">登录</h1>
          <p className="text-muted-foreground mt-2">加载中...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </React.Suspense>
  )
} 