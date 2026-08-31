import type { Metadata } from "next"
import { Fraunces, Manrope } from "next/font/google"

import { cn } from "@/lib/utils"
import { QueryProvider } from "@/lib/query/query-provider"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz", "SOFT", "WONK"],
})

export const metadata: Metadata = {
  title: "coins-platform",
  description: "Painel da MRCOIN como dona da plataforma de loyalty coins",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={cn("font-sans", manrope.variable, fraunces.variable)}>
      <body className="antialiased">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
