import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { getLocale } from '@/lib/actions/locale';

function normRole(role: unknown) {
  return String(role ?? '').toLowerCase().trim();
}

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (!user) {
    redirect('/login');
  }

  // ✅ Role normaliseren (voorkomt ADMIN/Admin issues)
  const role = normRole(user.role);

  // ✅ Alleen admin (optioneel: superadmin)
  const isAdmin = role === 'admin' || role === 'superadmin';

  if (!isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col min-h-0">
        <Navbar user={user} locale={locale} />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}

