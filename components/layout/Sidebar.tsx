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
  HelpCircle,
  ShieldAlert,
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

function LuxuryNavLink({
  href,
  label,
  icon: Icon,
  active,
  subtitle = 'Open onderdeel',
}: NavItem & { active: boolean; subtitle?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold shadow-md transition-all',
        active
          ? 'border-white bg-white text-[#102c54]'
          : 'border-white/15 bg-white/[0.08] text-white hover:border-white/25 hover:bg-white/[0.12]'
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl transition',
          active
            ? 'bg-[#102c54]/10 text-[#102c54]'
            : 'bg-white/12 text-white group-hover:bg-white/18'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{label}</span>
        <span
          className={cn(
            'text-[11px]',
            active ? 'text-[#102c54]/70' : 'text-white/65'
          )}
        >
          {subtitle}
        </span>
      </div>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{label}</span>
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

function UtilityCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: any;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-3 shadow-md backdrop-blur-sm">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-white">{title}</div>
          <div className="text-[11px] text-white/65">{subtitle}</div>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function UtilityButtonWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="sidebar-utility-button [&>*]:w-full [&>button]:flex [&>button]:w-full [&>button]:items-center [&>button]:justify-start [&>button]:rounded-xl [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/[0.06] [&>button]:px-3 [&>button]:py-2.5 [&>button]:text-left [&>button]:text-sm [&>button]:font-medium [&>button]:text-white [&>button]:transition [&>button:hover]:bg-white/[0.1]">
      {children}
    </div>
  );
}

function UtilityLegalLink({
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
        'flex w-full items-center rounded-xl border px-3 py-2.5 text-sm font-medium transition',
        active
          ? 'border-white bg-white text-[#102c54]'
          : 'border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]'
      )}
    >
      <span className="truncate">{label}</span>
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
    propertyNew: '/properties/new',
    valuation: '/property-valuation',

    aiAnalysis: '/ai-assistent',

    aiMultimedia: '/ai-multimedia',
    presentatiePromotie: '/presentatie-promotie',

    website: '/website',

    legalTerms: '/legal/voorwaarden',
    legalPrivacy: '/legal/privacy',
    legalDpa: '/legal/verwerkersovereenkomst',

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

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

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
        {/* Top button */}
        <div className="mb-5">
          <PrimaryActionLink
            href={ROUTES.propertyNew}
            label="Woning aanmelden"
            active={isActive(ROUTES.propertyNew)}
          />
        </div>

        {/* Overzicht */}
        <div className="px-2 pt-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Overzicht
        </div>
        <div className="mt-2 space-y-2">
          {overviewItems.map((item) => (
            <LuxuryNavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Waardebepaling */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Waardebepaling
        </div>
        <div className="mt-2 space-y-2">
          {waardebepalingItems.map((item) => (
            <LuxuryNavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Multimedia */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Multimedia
        </div>
        <div className="mt-2 space-y-2">
          {multimediaItems.map((item) => (
            <LuxuryNavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Marktanalyse */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Marktanalyse
        </div>
        <div className="mt-2 space-y-2">
          {marktanalyseItems.map((item) => (
            <LuxuryNavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Website */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Website
        </div>
        <div className="mt-2 space-y-2">
          {websiteItems.map((item) => (
            <LuxuryNavLink
              key={item.href}
              {...item}
              active={isActive(item.href)}
            />
          ))}
        </div>

        {/* Help & Legal */}
        <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          Hulp & informatie
        </div>
        <div className="mt-2 space-y-3">
          <UtilityCard
            icon={HelpCircle}
            title="Dashboard hulp"
            subtitle="Uitleg en ondersteuning"
          >
            <UtilityButtonWrap>
              <DashboardHelpDialog />
            </UtilityButtonWrap>
          </UtilityCard>

          <UtilityCard
            icon={ShieldAlert}
            title="Belangrijk"
            subtitle="Disclaimer en voorwaarden"
          >
            <div className="space-y-2">
              <UtilityButtonWrap>
                <DisclaimerDialog />
              </UtilityButtonWrap>

              <div className="space-y-2 pt-1">
                <UtilityLegalLink
                  href={ROUTES.legalTerms}
                  label="Algemene voorwaarden"
                  active={isActive(ROUTES.legalTerms)}
                />
                <UtilityLegalLink
                  href={ROUTES.legalPrivacy}
                  label="Privacyverklaring"
                  active={isActive(ROUTES.legalPrivacy)}
                />
                <UtilityLegalLink
                  href={ROUTES.legalDpa}
                  label="Verwerkersovereenkomst"
                  active={isActive(ROUTES.legalDpa)}
                />
              </div>
            </div>
          </UtilityCard>
        </div>

        {/* Admin */}
        {isAdmin && (
          <>
            <div className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
              Platform beheer
            </div>
            <div className="mt-2 space-y-2">
              {adminItems.map((item) => (
                <LuxuryNavLink
                  key={item.href}
                  {...item}
                  active={isActive(item.href)}
                />
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
