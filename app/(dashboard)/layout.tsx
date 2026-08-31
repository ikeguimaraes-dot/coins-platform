import { redirect } from "next/navigation"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentPlatformAdmin } from "@/lib/auth/session"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const admin = await getCurrentPlatformAdmin()

  if (!admin) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header admin={admin} />
        <main className="flex-1 bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  )
}
