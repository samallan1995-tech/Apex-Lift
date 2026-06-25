import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { OnlineIndicator } from '@/components/layout/online-indicator'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 pb-16 lg:pb-0">
        {children}
      </main>
      <BottomNav />
      <OnlineIndicator />
    </div>
  )
}
