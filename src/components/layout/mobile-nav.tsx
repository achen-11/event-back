'use client'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}
export function MobileNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t bg-background/80 backdrop-blur-md z-[39]">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className="flex-1">
          <span
            className={cn(
              "flex flex-col items-center gap-1 py-3 text-xs",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {item.icon}
            {item.title}
          </span>
        </Link>
      ))}
    </nav>
  )
}