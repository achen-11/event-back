import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from "sonner"

export const metadata: Metadata = {
  title: "Event Back",
  description: "Event Back",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}