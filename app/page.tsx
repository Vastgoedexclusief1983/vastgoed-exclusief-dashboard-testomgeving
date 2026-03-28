import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';

export default async function Home() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userRole = session.user.role;

  if (userRole === 'admin') {
    redirect('/admin/dashboard');
  } else {
    redirect('/dashboard');
  }
}
