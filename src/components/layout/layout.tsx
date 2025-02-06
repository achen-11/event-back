import { Calendar, Clock, BarChart2, User } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"

import { MobileNav } from "@/components/layout/mobile-nav"


export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { title: "事件", href: "/", icon: <Clock />, },
  { title: "日历", href: "/calendar", icon: <Calendar />, },
  { title: "统计", href: "/statistics", icon: <BarChart2 />, },
  { title: "账户", href: "/account", icon: <User /> },
]


export function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen flex">
      {/* PC 端侧边栏 */}
      <SidebarProvider>
        <AppSidebar items={navItems} />
        <main>
          {/* Main */}
          <div className="flex-1 flex flex-col min-h-screen overflow-y-hidden w-full">
            {/* <SidebarTrigger /> */}
            {/* 主内容区 */}
            {children}
            {/* 底部导航 */}
            <MobileNav items={navItems} />
          </div>
        </main>
      </SidebarProvider>
    </div>
  )
}