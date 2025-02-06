import { MainLayout } from '@/components/layout/layout'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'


export default async function MainAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <MainLayout>{children}</MainLayout> 
} 