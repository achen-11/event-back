
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { CategoryManager } from "@/components/categories/CategoryManager"
import { AccountSettings } from "@/components/account/AccountSettings"
import { SessionProvider } from "next-auth/react"

export default function AccountPage() {
  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">账户设置</TabsTrigger>
          <TabsTrigger value="categories">分类管理</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <SessionProvider>
            <AccountSettings />
          </SessionProvider>

        </TabsContent>

        <TabsContent value="categories">
          {/* <CategoryManager /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
} 