'use client'
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { NavItem } from "@/components/layout/layout"

export function MenuButton({ item }: { item: NavItem }) {
  const pathname = usePathname()
  return (
    <SidebarMenuButton isActive={item.href === pathname}>
    <a href={item.href} className="flex items-center gap-2">
      {item.icon}
      <span>{item.title}</span>
    </a>
  </SidebarMenuButton>
  )
}