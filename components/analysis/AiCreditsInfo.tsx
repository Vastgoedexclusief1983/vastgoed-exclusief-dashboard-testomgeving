'use client';

import * as React from 'react';
import { Check, Info, Mail, Loader2, Sparkles } from 'lucide-react';

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

type PlanKey = 'professional' | 'premium' | 'custom';
type BillingCycle = 'monthly' | 'yearly';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatEuro(amount: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function getPlanMeta(plan: PlanKey) {
  if (plan === 'professional') {
    return {
      key: 'professional' as const,
      name: 'Professional',
      monthlyLimit: 250,
      monthlyPriceExVat: 69,
      yearlyPriceExVat: 69 * 12 * 0.9,
      description: 'Tot 250 credits per maand, inclusief 50 kosteloze credits.',
    };
  }

  if (plan === 'premium') {
    return {
      key: 'premium' as const,
      name: 'Premium',
      monthlyLimit: 500,
      monthlyPriceExVat: 119,
      yearlyPriceExVat: 119 * 12 * 0.9,
      description: 'Tot 500 credits per maand, inclusief 50 kosteloze credits.',
    };
  }

  return {
    key: 'custom' as const,
    name: 'Maatwerk',
    monthlyLimit: null,
    monthlyPriceExVat: null,
    yearlyPriceExVat: null,
    description: 'Hogere maandlimieten en maatwerk op aanvraag.',
  };
}

export default function AiCreditsInfo({
  remaining,
  limit,
  label = 'AI-credits',
  iconOnly = false,
}: Props) {
  const safeRemaining = Math.max(0, remaining);
  const safeLimit = Math.max(0, limit);
  const used = clamp(safeLimit - safeRemaining, 0, safeLimit);
  const usedPercent = safeLimit > 0 ? Math.min((used / safeLimit) * 100, 100) : 0;

  const isBasePlan = safeLimit <= 50;
  const isProfessionalPlan = safeLimit > 50 && safeLimit <= 250;
  const isPremiumPlan = safeLimit > 250 && safeLimit <= 500;
  const isCustomPlan = safeLimit > 500;

  const [selectedPlan, setSelectedPlan] = React.useState<PlanKey | null>(null);
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly');
  const [companyName, setCompanyName] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitState, setSubmitState] = React.useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = React.useState('');

  const selectedPlanMeta = selectedPlan ? getPlanMeta(selectedPlan) : null;

  const resetFormFeedback = () => {
    setSubmitState('idle');
    setSubmitMessage('');
  };

  const openPlanForm = (plan: PlanKey) => {
    setSelectedPlan(plan);
    setBillingCycle('monthly');
    resetFormFeedback();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPlanMeta) {
      setSubmitState('error');
      setSubmitMessage('Selecteer eerst een pakket.');
      return;
    }

    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      setSubmitState('error');
      setSubmitMessage('Vul minimaal bedrijfsnaam, naam en e-mailadres in.');
      return;
    }

    setIsSubmitting(true);
    resetFormFeedback();

    try {
      const response = await fetch('/api/ai-credits-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLimit: safeLimit,
          remainingCredits: safeRemaining,
          usedCredits: used,
          requestedPlan: selectedPlanMeta.key,
          requestedPlanName: selectedPlanMeta.name,
          requestedMonthlyLimit: selectedPlanMeta.monthlyLimit,
          billingCycle,
          monthlyPriceExVat: selectedPlanMeta.monthlyPriceExVat,
          yearlyPriceExVat: selectedPlanMeta.yearlyPriceExVat,
          companyName: companyName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Er ging iets mis bij het versturen van de aanvraag.');
      }

      setSubmitState('success');
      setSubmitMessage('Aanvraag succesvol verstuurd. Wij nemen zo spoedig mogelijk contact met je op.');

      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setSelectedPlan(null);
      setBillingCycle('monthly');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Er ging iets mis bij het versturen van de aanvraag.';
      setSubmitState('error');
      setSubmitMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        {iconOnly ? (
          Trigger
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-medium tabular-nums">
              {safeRemaining}/{safeLimit}
            </span>
            {Trigger}
          </div>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[760px] p-0">
        <div className="flex max-h-[85vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="text-base sm:text-lg">
              AI-credits & maandbundels
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto px-6 py-5">
            <div className="space-y-6 text-sm leading-relaxed text-slate-700">
              <div>
                <p>
                  Binnen Vastgoed Exclusief werken we met <strong>AI-credits</strong>. Credits vormen
                  een interne rekeneenheid voor het gebruik van AI-functionaliteiten zoals
                  woninganalyses, positioneringsadvies en visuele upgrades.
                </p>
                <p className="mt-2">
                  Iedere makelaar ontvangt standaard <strong>50 credits kosteloos per maand</strong>.
                  Voor intensiever gebruik kan het maandlimiet worden uitgebreid naar een hoger pakket.
                </p>
                <p className="mt-2">
                  Per AI-actie wordt automatisch een vastgesteld aantal credits afgeschreven. Het
                  verbruik kan per functionaliteit verschillen.
                </p>
              </div>

              <div className="rounded-xl border bg-white p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-slate-100 p-2">
                    <Sparkles className="h-4 w-4 text-slate-700" />
                  </div>

                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Jouw huidige status</p>

                    <ul className="mt-3 list-disc space-y-1 pl-5">
                      <li>
                        Resterend: <strong>{safeRemaining}</strong> credit{safeRemaining === 1 ? '' : 's'}
                      </li>
                      <li>
                        Verbruikt: <strong>{used}</strong> credit{used === 1 ? '' : 's'}
                      </li>
                      <li>
                        Huidig maandlimiet: <strong>{safeLimit}</strong> credits
                      </li>
                    </ul>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${usedPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-white p-5">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-slate-900">Beschikbare bundels</p>
                  <p className="text-sm text-slate-600">
                    Standaard zijn <strong>50 credits per maand inbegrepen</strong>. De onderstaande
                    bundels verhogen het totale maandlimiet.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div
                    className={`rounded-xl border p-4 ${
                      isBasePlan ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900">Basis</p>
                          {isBasePlan && (
                            <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                              Actief
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          50 credits per maand inbegrepen
                        </p>
                      </div>

                      <div className="text-sm font-medium text-slate-900">Gratis</div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      isProfessionalPlan ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">Professional</p>
                          {isProfessionalPlan && (
                            <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                              Actief
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Tot <strong>250 credits per maand</strong>, inclusief 50 kosteloze credits
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Jaarbetaling mogelijk met 10% korting
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <div className="text-sm font-medium text-slate-900">€69 p/m excl. btw</div>
                        <Button type="button" size="sm" onClick={() => openPlanForm('professional')}>
                          <Mail className="mr-2 h-4 w-4" />
                          Aanvragen
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      isPremiumPlan ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">Premium</p>
                          {isPremiumPlan && (
                            <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                              Actief
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Tot <strong>500 credits per maand</strong>, inclusief 50 kosteloze credits
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Jaarbetaling mogelijk met 10% korting
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <div className="text-sm font-medium text-slate-900">€119 p/m excl. btw</div>
                        <Button type="button" size="sm" onClick={() => openPlanForm('premium')}>
                          <Mail className="mr-2 h-4 w-4" />
                          Aanvragen
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${
                      isCustomPlan ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">Maatwerk</p>
                          {isCustomPlan && (
                            <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
                              Actief
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Hogere maandlimieten en maatwerk op aanvraag
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                        <div className="text-sm font-medium text-slate-900">Op aanvraag</div>
                        <Button type="button" variant="outline" size="sm" onClick={() => openPlanForm('custom')}>
                          <Mail className="mr-2 h-4 w-4" />
                          Aanvragen
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-slate-700" />
                    <p>
                      Prijzen zijn <strong>exclusief btw</strong>. Bij jaarbetaling geldt
                      <strong> 10% korting</strong>. Na aanvraag nemen wij contact op voor bevestiging en verwerking.
                    </p>
                  </div>
                </div>
              </div>

              {selectedPlanMeta && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-slate-900">Bundel aanvragen</p>
                    <p className="text-sm text-slate-600">
                      Vul hieronder je gegevens in en kies het gewenste pakket.
                    </p>
                  </div>

                  <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="companyName" className="mb-1 block text-sm font-medium text-slate-900">
                          Bedrijfsnaam
                        </label>
                        <input
                          id="companyName"
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          placeholder="Bijv. Makelaarskantoor X"
                        />
                      </div>

                      <div>
                        <label htmlFor="contactName" className="mb-1 block text-sm font-medium text-slate-900">
                          Naam contactpersoon
                        </label>
                        <input
                          id="contactName"
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          placeholder="Voor- en achternaam"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-900">
                          E-mailadres
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          placeholder="naam@bedrijf.nl"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-900">
                          Telefoonnummer
                        </label>
                        <input
                          id="phone"
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                          placeholder="Optioneel"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="selectedPlan" className="mb-1 block text-sm font-medium text-slate-900">
                          Pakket
                        </label>
                        <select
                          id="selectedPlan"
                          value={selectedPlan}
                          onChange={(e) => {
                            setSelectedPlan(e.target.value as PlanKey);
                            resetFormFeedback();
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                        >
                          <option value="professional">Professional — 250 credits</option>
                          <option value="premium">Premium — 500 credits</option>
                          <option value="custom">Maatwerk — op aanvraag</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="billingCycle" className="mb-1 block text-sm font-medium text-slate-900">
                          Facturatie
                        </label>
                        <select
                          id="billingCycle"
                          value={billingCycle}
                          onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                        >
                          <option value="monthly">Maandelijks</option>
                          <option value="yearly">Jaarlijks (10% korting)</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                      <p className="font-medium text-slate-900">Geselecteerd pakket</p>
                      <p className="mt-1">{selectedPlanMeta.description}</p>

                      {selectedPlanMeta.key !== 'custom' && (
                        <p className="mt-2">
                          {billingCycle === 'monthly'
                            ? `${formatEuro(selectedPlanMeta.monthlyPriceExVat || 0)} per maand excl. btw`
                            : `${formatEuro(selectedPlanMeta.yearlyPriceExVat || 0)} per jaar excl. btw`}
                        </p>
                      )}

                      {selectedPlanMeta.key === 'custom' && (
                        <p className="mt-2">Prijs op aanvraag</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-900">
                        Toelichting
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900"
                        placeholder="Eventuele toelichting of specifieke wens"
                      />
                    </div>

                    {submitState !== 'idle' && (
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          submitState === 'success'
                            ? 'border border-green-200 bg-green-50 text-green-700'
                            : 'border border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        {submitMessage}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Versturen...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Aanvraag versturen
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedPlan(null);
                          resetFormFeedback();
                        }}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              <p className="text-xs text-slate-500">
                AI-uitkomsten zijn automatisch gegenereerd op basis van ingevoerde gegevens en beschikbare
                marktinformatie. Vastgoed Exclusief geeft geen garanties ten aanzien van juistheid,
                volledigheid of actualiteit. Credits vertegenwoordigen geen wettelijke valuta en hebben
                geen zelfstandige geldwaarde.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
