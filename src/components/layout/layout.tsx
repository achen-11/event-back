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
  { title: "事件", href: "/", icon: <Clock className="w-4 h-4" />, },
  { title: "日历", href: "/calendar", icon: <Calendar className="w-4 h-4" />, },
  { title: "统计", href: "/statistics", icon: <BarChart2 className="w-4 h-4" />, },
  { title: "账户", href: "/account", icon: <User className="w-4 h-4" /> },
]


export function MainLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen flex">
      {/* PC 端侧边栏 */}
      <SidebarProvider>
        <AppSidebar items={navItems} />
        <main className="w-full flex-1">
          {/* Main */}
          <div className="flex-1 flex flex-col min-h-screen overflow-y-hidden w-full mb-[68px]">
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