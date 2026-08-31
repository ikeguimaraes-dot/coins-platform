"use client"

import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { PlatformAdminProfile } from "@/lib/api/platform-auth"

export function Header({ admin }: { admin: PlatformAdminProfile }) {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/platform-auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  const initials = admin.name.slice(0, 2).toUpperCase()

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <p className="text-sm font-medium">Painel MRCOIN</p>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-muted">
          <Avatar className="size-7">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{admin.name}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
