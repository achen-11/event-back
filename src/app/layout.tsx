import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Toaster } from "sonner"
import { MainLayout } from '@/components/layout/layout'

export const metadata: Metadata = {
  title: "Event Back",
  description: "Event Back",
}

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <>
      <html>
        <body>
          <MainLayout >
            {children}
            <Toaster />
          </MainLayout>
        </body>
      </html>
    </>
  )
}