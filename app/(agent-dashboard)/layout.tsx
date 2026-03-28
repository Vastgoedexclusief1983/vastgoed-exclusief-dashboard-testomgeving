import { redirect } from 'next/navigation';

import { getCurrentUser } from '@/lib/auth/session';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { getLocale } from '@/lib/actions/locale';

export default async function AgentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (!user) {
    redirect('/login');
  }

  if (user.role === 'admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="sticky top-0 h-screen w-[280px] shrink-0 overflow-y-auto border-r bg-[#0f2b4e]">
        <Sidebar role={user.role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar user={user} locale={locale} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
