"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Inbox, LayoutDashboard, Store, Tag } from "lucide-react"

import { cn } from "@/lib/utils"
import { BRAND, BRAND_ACTION, BRAND_TINT } from "@/lib/dashboard/theme"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: false },
  { href: "/pedidos", label: "Pedidos", icon: Inbox, disabled: false },
  { href: "/empresas", label: "Empresas", icon: Building2, disabled: false },
  { href: "/parceiros", label: "Parceiros", icon: Store, disabled: false },
  { href: "/ofertas", label: "Ofertas", icon: Tag, disabled: false },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-6 border-r bg-background p-4">
      <div className="px-2">
        <p className="font-serif text-lg font-semibold leading-tight">MRCOIN</p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Platform</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon

          if (item.disabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-2.5 rounded-md border-l-[3px] border-transparent px-3 py-2 text-sm font-medium text-muted-foreground/60"
              >
                <Icon className="h-[17px] w-[17px]" />
                {item.label}
                <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                  Em breve
                </span>
              </div>
            )
          }

          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md border-l-[3px] px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "border-transparent text-muted-foreground hover:bg-muted"
              )}
              style={
                isActive
                  ? { borderLeftColor: BRAND, backgroundColor: BRAND_TINT }
                  : undefined
              }
            >
              <Icon className="h-[17px] w-[17px]" style={isActive ? { color: BRAND_ACTION } : undefined} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
