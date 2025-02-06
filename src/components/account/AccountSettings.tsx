'use client'

import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"
export function AccountSettings() {
  const { data: session } = useSession()
  return (

    <div>
      <h1>Account Settings</h1>
      <div>
        <h2>个人信息</h2>
        <div>
          <p>姓名: {session?.user?.name}</p>
          <p>邮箱: {session?.user?.email}</p>
        </div>
        <Button
          variant="destructive"
          onClick={() => signOut({ redirectTo: '/auth/signin' })}
        >
          退出登录
        </Button>
      </div>
    </div>

  )
}