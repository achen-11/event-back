"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/account/ProfileForm"
import { CategoryManager } from "@/components/account/CategoryManager"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function AccountPage() {
  return (
    <div className="container space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">账户设置</h3>
          <p className="text-muted-foreground text-sm">管理您的账户设置和偏好</p>
        </div>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
          <TabsTrigger value="profile">个人信息</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card className="p-3 md:p-6 ">
            <ProfileForm />
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>
      </Tabs>
      <Button
        variant="destructive"
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="w-full"
      >
        <LogOut className="h-4 w-4" />
        退出登录
      </Button>
    </div>
  )
} 