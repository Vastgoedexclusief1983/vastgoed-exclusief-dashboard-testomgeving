import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

function normRole(role: unknown) {
  return String(role ?? '').toLowerCase();
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = normRole(token?.role);

    const isAdmin = role === 'admin';
    const isAgent = role === 'agent';

    const path = req.nextUrl.pathname;

    // ✅ Alleen /admin routes zijn écht admin-only
    if (path.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // ✅ /properties is voor agent + admin (dus NIET naar /login sturen)
    // Hier hoef je niks te doen.

    return NextResponse.next();
  },
  {
    callbacks: {
      // ✅ Alleen ingelogd = authorized
      authorized: ({ token }) => !!token,
    },
  }
);

// ✅ Middleware alleen op beveiligde routes laten draaien
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/properties/:path*',
    '/property-valuation/:path*',
    '/ai/:path*',
    '/admin/:path*',
  ],
};
