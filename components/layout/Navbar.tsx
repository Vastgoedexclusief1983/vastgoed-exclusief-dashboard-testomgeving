'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/types/auth';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Locale } from '@/i18n/config';
import { useTranslations } from 'next-intl';

// ✅ Credits widget (makelaars)
import { CreditsWidget } from '@/components/analysis/CreditsWidget';

interface NavbarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  locale: Locale;
}

export function Navbar({ user, locale }: NavbarProps) {
  const router = useRouter();
  const t = useTranslations('nav');

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/login' });
  };

  const handleProfile = () => {
    router.push(user.role === 'admin' ? '/admin/profile' : '/profile');
  };

  return (
    <nav className="border-b border-white/10 bg-[#102c54] shadow-sm shrink-0">
      <div className="flex h-16 items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">
            {t('welcome')}, {user.firstName}
          </h1>
        </div>

        {/* Right side - credits + language switcher and user menu */}
        <div className="flex items-center gap-3">
          {/* ✅ Toon credits voor agents (niet voor admin) */}
          {user.role !== 'admin' && <CreditsWidget />}

          <LanguageSwitcher currentLocale={locale} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-3 h-auto py-2 px-3 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#102c54] font-semibold text-sm shadow-md">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <p className="text-sm font-semibold leading-none text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0 h-4 bg-white/20 text-white capitalize"
                    >
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="hidden md:block h-4 w-4 text-white/60" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102c54] text-white font-semibold text-sm">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold leading-none text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-gray-500 mt-1 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs leading-none text-gray-500">{user.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <User className="mr-2 h-4 w-4 text-gray-500" />
                <span>{t('profile')}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-[#FF0000] focus:text-[#FF0000] focus:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
