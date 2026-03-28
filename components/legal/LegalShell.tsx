// components/legal/LegalShell.tsx
import * as React from 'react';
import Link from 'next/link';

export function LegalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <header className="border-b border-slate-200 pb-5">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p> : null}

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link className="text-slate-600 underline hover:text-slate-900" href="/legal/voorwaarden">
              Algemene voorwaarden
            </Link>
            <Link className="text-slate-600 underline hover:text-slate-900" href="/legal/privacy">
              Privacyverklaring
            </Link>
            <Link className="text-slate-600 underline hover:text-slate-900" href="/legal/verwerkersovereenkomst">
              Verwerkersovereenkomst
            </Link>
          </div>
        </header>

        <article className="prose prose-slate mt-6 max-w-none">
          {/* Prose (Tailwind Typography) werkt als je plugin hebt; anders is het nog steeds netjes door basis-classes. */}
          {children}
        </article>

        <footer className="mt-8 border-t border-slate-200 pt-5">
          <p className="text-xs leading-relaxed text-slate-500">
            Vastgoed Exclusief (handelsnaam van Vastgoed Nederland) — Dashboard documentatie. Versie: {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
