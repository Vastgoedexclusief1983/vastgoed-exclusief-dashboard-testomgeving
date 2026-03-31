'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Calculator,
  Users,
  Shield,
  Bot,
  Gauge,
  Megaphone,
  Globe,
  Image as ImageIcon,
  FileSearch,
  PlusCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { UserRole } from '@/types/auth';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import { DashboardHelpDialog } from '@/components/help/DashboardHelpDialog';

interface SidebarProps {
  role: UserRole;
}

type NavItem = {
  href: string;
  label: string;
  icon: any;
};

function NavLink({ href, label, icon: Icon, active }: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
        'hover:bg-white/10 hover:text-white',
        active ? 'bg-white text-[#102c54]' : 'text-white/90'
      )}
    >
      <Icon className={cn('h-5 w-5', active ? 'text-[#102c54]' : 'text-white/90')} />
      <span>{label}</span>
    </Link>
  );
}

function PrimaryActionLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold shadow-md transition-all',
        active
          ? 'border-white bg-white text-[#102c54]'
          : 'border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition',
          active
            ? 'bg-[#102c54]/10 text-[#102c54]'
            : 'bg-white/15 text-white group-hover:bg-white/20'
        )}
      >
        <PlusCircle className="h-5 w-5" />
      </div>

      <div className="flex flex-col">
        <span>{label}</span>
        <span
          className={cn(
            'text-[11px]',
            active ? 'text-[#102c54]/70' : 'text-white/70'
          )}
        >
          Start direct met invoeren
        </span>
      </div>
    </Link>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const roleNormalized = String(role ?? '').toLowerCase();
  const isAdmin = roleNormalized === 'admin';

  const ROUTES = {
    dashboard: isAdmin ? '/admin/dashboard' : '/dashboard',

    aiAsk: '/ai-vraag',
    properties: '/properties',
    propertyNew: '/properties/new', // ✅ juiste route
    valuation: '/property-valuation',

    aiAnalysis: '/ai-assistent',

    aiMultimedia: '/ai-multimedia',
    presentatiePromotie: '/presentatie-promotie',

    website: '/website',

    adminAgents: '/admin/agents',
    adminAccess: '/admin/toegang',
    adminAiUsage: '/admin/ai-usage',
  } as const;

  const overviewItems: NavItem[] = [
    { href: ROUTES.dashboard, label: t('dashboard'), icon: LayoutDashboard },
  ];

  const waardebepalingItems: NavItem[] = [
    { href: ROUTES.aiAsk, label: 'Basisprijs', icon: Bot },
    { href: ROUTES.properties, label: t('properties'), icon: Building2 },
    { href: ROUTES.valuation, label: t('valuation'), icon: Calculator },
  ];

  const multimediaItems: NavItem[] = [
    { href: ROUTES.aiMultimedia, label: 'Woning restylen', icon: ImageIcon },
    { href: ROUTES.presentatiePromotie, label: 'Presentatie & Promotie', icon: Megaphone },
  ];

  const marktanalyseItems: NavItem[] = [
    { href: ROUTES.aiAnalysis, label: 'Waarde & Positionering', icon: FileSearch },
  ];

  const websiteItems: NavItem[] = [
    { href: ROUTES.website, label: 'Website beheer', icon: Globe },
  ];

  const adminItems: NavItem[] = [
    { href: ROUTES.adminAgents, label: 'Makelaars beheren', icon: Users },
    { href: ROUTES.adminAccess, label: 'Toegang & Features', icon: Shield },
    { href: ROUTES.adminAiUsage, label: 'AI-credits (maand)', icon: Gauge },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside className="flex h-screen w-[270px] flex-col bg-[#102c54] text-white shadow-lg">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white">
            <Image
              src="/logo.png"
              alt="Vastgoed Exclusief"
              fill
              className="object-contain p-1"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Vastgoed Exclusief</div>
            <div className="text-xs text-white/70">
              {isAdmin ? 'Beheerportaal' : 'Dashboard'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">

        {/* 🔥 NIEUWE TOP BUTTON */}
        <div className="mb-5">
          <PrimaryActionLink
            href={ROUTES.propertyNew}
            label="Woning aanmelden"
            active={isActive(ROUTES.propertyNew)}
          />
        </div>

        {/* OVERZICHT */}
        <div className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Overzicht
        </div>
        <div className="mt-2 space-y-1">
          {overviewItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* WAARDEBEPALING */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Waardebepaling
        </div>
        <div className="mt-2 space-y-1">
          {waardebepalingItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* MULTIMEDIA */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Multimedia
        </div>
        <div className="mt-2 space-y-1">
          {multimediaItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* MARKTANALYSE */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Marktanalyse
        </div>
        <div className="mt-2 space-y-1">
          {marktanalyseItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* WEBSITE */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          Website
        </div>
        <div className="mt-2 space-y-1">
          {websiteItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>

        {/* HELP */}
        <div className="mt-6 px-2 space-y-1">
          <DashboardHelpDialog />
          <DisclaimerDialog />
        </div>

        {/* ADMIN */}
        {isAdmin && (
          <>
            <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/60">
              Platform beheer
            </div>
            <div className="mt-2 space-y-1">
              {adminItems.map((item) => (
                <NavLink key={item.href} {...item} active={isActive(item.href)} />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-4 py-4 text-xs text-white/60">
        Vastgoed Exclusief
        <div className="text-white/40">Version 1.0.0</div>
      </div>
    </aside>
  );
}
