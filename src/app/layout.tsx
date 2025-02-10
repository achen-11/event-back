import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from "sonner"
import { Providers } from "@/components/providers/prodviders"

export const metadata: Metadata = {
  title: "Event Back",
  description: "Event Back",
  icons: {
    icon: "/logo.svg",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}