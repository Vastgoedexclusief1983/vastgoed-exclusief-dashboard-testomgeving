import type { UserRole } from '@/types/auth';

function norm(role: unknown) {
  return String(role ?? '').toLowerCase();
}

export function isAdmin(role: UserRole | string | undefined | null): boolean {
  return norm(role) === 'admin';
}

export function isAgent(role: UserRole | string | undefined | null): boolean {
  return norm(role) === 'agent';
}

// Alleen admin mag agents beheren
export function canManageAgents(role: UserRole | string | undefined | null): boolean {
  return isAdmin(role);
}

// Admin ziet alles, agent ziet alleen eigen (dat doen we via filter, zie hieronder)
export function canViewAllProperties(role: UserRole | string | undefined | null): boolean {
  return isAdmin(role);
}

