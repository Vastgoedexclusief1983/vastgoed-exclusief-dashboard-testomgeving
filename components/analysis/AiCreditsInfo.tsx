'use client';

import * as React from 'react';
import { Info } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Props = {
  remaining: number;
  limit: number;
  label?: string;
  iconOnly?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function AiCreditsInfo({
  remaining,
  limit,
  label = 'AI-credits',
  iconOnly = false,
}: Props) {
  const used = clamp(limit - Math.max(0, remaining), 0, limit);

  const Trigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
      aria-label="Informatie over AI-credits"
    >
      <Info className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {iconOnly ? Trigger : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium tabular-nums">
              {remaining}/{limit}
            </span>
            {Trigger}
          </div>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            AI-credits & aanvullende bundels
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <div>
            <p>
              Binnen Vastgoed Exclusief werken we met <strong>AI-credits</strong>. Credits vormen een interne
              reken-eenheid voor het gebruik van AI-functionaliteiten zoals woninganalyses,
              positioneringsadvies en visuele upgrades.
            </p>
            <p className="mt-2">
              Per AI-actie wordt automatisch een vastgesteld aantal credits afgeschreven.
              Het verbruik kan per functionaliteit verschillen.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="font-medium text-slate-900">Jouw huidige status</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Resterend: <strong>{remaining}</strong> credit{remaining === 1 ? '' : 's'}
              </li>
              <li>
                Verbruikt: <strong>{used}</strong> credit{used === 1 ? '' : 's'}
              </li>
              <li>
                Maandlimiet: <strong>{limit}</strong> credits
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="font-medium text-slate-900">Aanvullende creditbundels</p>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>250 extra credits</span>
                <span className="font-medium">€69 per maand</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>500 extra credits</span>
                <span className="font-medium">€119 per maand</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <span>Hogere bundels</span>
                <span className="font-medium">Op aanvraag</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Jaarbetaling: <strong>10% korting</strong>. Prijzen zijn indicatief en kunnen worden aangepast.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            AI-uitkomsten zijn automatisch gegenereerd op basis van ingevoerde gegevens en beschikbare marktinformatie.
            Vastgoed Exclusief geeft geen garanties ten aanzien van juistheid, volledigheid of actualiteit.
            Credits vertegenwoordigen geen wettelijke valuta en hebben geen zelfstandige geldwaarde.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
