import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth-options';
import { listAgentsBasic } from '@/lib/db/users';
import AccessTable from './AccessTable';

function isAdminRole(role: unknown): boolean {
  return String(role ?? '').toLowerCase() === 'admin';
}

export default async function AdminToegangPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect('/login');
  }

  // ✅ robuuste admin check (werkt voor 'admin', 'ADMIN', etc.)
  const sessionRole = (session.user as any)?.role;
  if (!isAdminRole(sessionRole)) {
    redirect('/');
  }

  const users = await listAgentsBasic();

  /**
   * listAgentsBasic levert al:
   * { id, name, email, role, features }
   * → exact wat AccessTable verwacht
   */
  const rows = users.map((u) => ({
    id: u.id,
    name: u.name || u.email || u.id,
    email: u.email,
    role: u.role || 'agent',
    features: u.features,
  }));

  return (
    <div className="max-w-6xl">
      <h1 className="text-xl font-semibold">Toegang per makelaar</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Zet per gebruiker modules aan of uit.
      </p>

      <div className="mt-6">
        <AccessTable rows={rows} />
      </div>
    </div>
  );
}
