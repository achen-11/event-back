import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem
} from "@/components/ui/sidebar"

import { NavItem } from "@/components/layout/layout"
export function AppSidebar({ items }: { items: NavItem[] }) {
  return (
    <Sidebar title="🫎 Event Feedback">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <h2 className="text-[18px] font-[600] flex justify-center">🫎 Event Feedback</h2>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.href}>
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

    </Sidebar>
  )
}
