'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  CheckCircle2,
  Crown,
  Instagram,
  Newspaper,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type ServiceKey =
  | 'high-end-mediapakket'
  | 'homepage-banner-socials'
  | 'uitgelichte-woning-homepage'
  | 'social-media-campagne'
  | 'vermelding-online-magazine';

type PromotionService = {
  key: ServiceKey;
  title: string;
  shortTitle: string;
  priceLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  badgeClass: string;
  bullets: string[];
  autoNotes: string;
};

type SessionUserLike = {
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  officeName?: string;
  role?: string;
};

const SERVICES: PromotionService[] = [
  {
    key: 'high-end-mediapakket',
    title: 'High-end mediapakket',
    shortTitle: 'Mediapakket',
    priceLabel: '€1.995 per woning',
    description:
      'Volledige high-end presentatie voor exclusieve woningen met fotografie, video, dronebeelden, socials en homepage-uitlichting.',
    icon: Camera,
    accentClass: 'from-[#0f172a] via-[#102c54] to-[#2563eb] border-white/10',
    badgeClass: 'border border-white/15 bg-white/10 text-white',
    bullets: [
      'High-end fotografie incl. bewerking',
      'Avondfotografie',
      "360 graden foto's in hoge kwaliteit",
      'Dronefotografie',
      'Woningvideo + dronebeelden (max. 60 sec)',
      'Social teaser reel (verticaal)',
      'Promotie via social media & VastgoedExclusief.nl',
      '1 maand uitgelicht op de homepage',
      'Op aanvraag aanpasbaar',
      'Excl. btw / reiskosten ex Utrecht €0,35 per km',
    ],
    autoNotes:
      'Interesse in het High-end mediapakket. Graag planning, voorstel en verdere afstemming.',
  },
  {
    key: 'homepage-banner-socials',
    title: 'Homepage banner groot + socials',
    shortTitle: 'Banner + socials',
    priceLabel: '€249 p/m per woning',
    description:
      'Maximale zichtbaarheid op de homepagebanner inclusief logo, directe doorklik en extra social media exposure.',
    icon: TrendingUp,
    accentClass: 'from-[#1e3a8a] via-[#2563eb] to-[#06b6d4] border-cyan-300/20',
    badgeClass: 'border border-white/15 bg-white/10 text-white',
    bullets: [
      'Maximale zichtbaarheid bij kopers in het hogere segment',
      'Uitgelichte woning op de homepagebanner',
      'Inclusief jouw logo',
      'Directe doorlink naar jouw website',
      'Woning wordt extra uitgelicht op social media',
    ],
    autoNotes:
      'Interesse in Homepage banner groot + socials. Graag deze woning prominent inzetten op homepage en social media.',
  },
  {
    key: 'uitgelichte-woning-homepage',
    title: 'Uitgelichte woning homepage',
    shortTitle: 'Homepage',
    priceLabel: '€99 p/m per woning',
    description:
      'Een krachtige extra plaatsing op de homepage voor meer attentiewaarde en snellere zichtbaarheid binnen het exclusieve segment.',
    icon: Crown,
    accentClass: 'from-[#581c87] via-[#7c3aed] to-[#ec4899] border-fuchsia-300/20',
    badgeClass: 'border border-white/15 bg-white/10 text-white',
    bullets: [
      'Maximale zichtbaarheid bij kopers in het hogere segment',
      'Woning uitgelicht op de homepage',
      'Sterkere attentiewaarde op het platform',
    ],
    autoNotes:
      'Interesse in Uitgelichte woning homepage. Graag deze woning extra zichtbaar maken op de homepage.',
  },
  {
    key: 'social-media-campagne',
    title: 'Social media campagne',
    shortTitle: 'Social campagne',
    priceLabel: '€159 per 14 dagen per advertentie',
    description:
      'Gerichte Instagram campagne via Vastgoed Exclusief met advertentiebudget, doelgroep targeting en extra zichtbaarheid buiten het platform.',
    icon: Instagram,
    accentClass: 'from-fuchsia-700 via-pink-600 to-orange-500 border-pink-300/20',
    badgeClass: 'border border-white/15 bg-white/10 text-white',
    bullets: [
      'Betaalde campagne via Instagram @vastgoedexclusief.nl',
      'Bereik via doelgroep geïnteresseerd in exclusief vastgoed',
      'Volledige bedrag wordt ingezet als advertentiebudget bij Instagram (Meta)',
      'Gericht targeten op regio en relevante doelgroep',
      'Vergrote zichtbaarheid bij potentiële kopers in het hogere segment',
    ],
    autoNotes:
      'Interesse in Social media campagne. Graag deze woning promoten via Instagram en gerichte doelgroepcampagne.',
  },
  {
    key: 'vermelding-online-magazine',
    title: 'Vermelding online magazine',
    shortTitle: 'Online magazine',
    priceLabel: '€249 per woning per vermelding',
    description:
      'Exclusieve vermelding in het online magazine van Vastgoed Exclusief voor extra zichtbaarheid binnen het hogere segment.',
    icon: Newspaper,
    accentClass: 'from-[#052e16] via-[#166534] to-[#0ea5e9] border-emerald-300/20',
    badgeClass: 'border border-white/15 bg-white/10 text-white',
    bullets: [
      'Maximale zichtbaarheid bij kopers in het hogere segment',
      'Woning uitgelicht in online magazine',
      'Magazine verschijnt minimaal 2 keer per jaar',
      'Sterke branding en exclusieve uitstraling',
    ],
    autoNotes:
      'Interesse in Vermelding online magazine. Graag deze woning opnemen in het online magazine van Vastgoed Exclusief.',
  },
];

export default function PresentatiePromotiePage() {
  const { data: session } = useSession();
  const sessionUser = (session?.user ?? {}) as SessionUserLike;

  const [selectedServiceKey, setSelectedServiceKey] =
    useState<ServiceKey>('social-media-campagne');

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    notes:
      'Interesse in Social media campagne. Graag deze woning promoten via Instagram en gerichte doelgroepcampagne.',
    agreedToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedService =
    SERVICES.find((service) => service.key === selectedServiceKey) ?? SERVICES[0];

  const makelaarNaam = [sessionUser.firstName, sessionUser.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const kantoorNaam = sessionUser.companyName || sessionUser.officeName || '';

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      contactName: prev.contactName || makelaarNaam,
      companyName: prev.companyName || kantoorNaam,
      email: prev.email || sessionUser.email || '',
    }));
  }, [kantoorNaam, makelaarNaam, sessionUser.email]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      notes:
        prev.notes.trim() === '' ||
        prev.notes ===
          (SERVICES.find((service) => service.key === selectedServiceKey)?.autoNotes ??
            '')
          ? selectedService.autoNotes
          : prev.notes,
    }));
  }, [selectedService.autoNotes, selectedServiceKey]);

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function applyService(service: PromotionService) {
    setSelectedServiceKey(service.key);
    setForm((prev) => ({
      ...prev,
      notes:
        prev.notes.trim() === '' || prev.notes === selectedService.autoNotes
          ? service.autoNotes
          : prev.notes,
    }));
    setSuccess(false);
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!form.contactName.trim()) {
      setError('Naam makelaar is verplicht.');
      setLoading(false);
      return;
    }

    if (!form.companyName.trim()) {
      setError('Kantoornaam is verplicht.');
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setError('E-mailadres is verplicht.');
      setLoading(false);
      return;
    }

    if (!form.agreedToTerms) {
      setError(
        'Akkoord met de algemene voorwaarden en privacyverklaring is verplicht.',
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/promotion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          propertyAddress: 'Niet van toepassing - promotieaanvraag',
          city: 'Niet van toepassing',
          packageType: selectedService.key,
          packageKey: selectedService.key,
          packageTitle: selectedService.title,
          packagePrice: selectedService.priceLabel,
          packageBullets: selectedService.bullets,
          notes: form.notes,
          agreed: form.agreedToTerms,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || 'Er ging iets mis bij het verzenden.');
      }

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        phone: '',
        notes: selectedService.autoNotes,
        agreedToTerms: false,
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Onbekende fout bij het verzenden.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-[#07111f] shadow-[0_26px_80px_rgba(8,15,30,0.22)]">
        <div className="relative min-h-[520px] overflow-hidden">
          <Image
            src="/01-Duinvilla-Bosch-en-Duin-IMG_6625-2-2048x1366.jpg"
            alt="Luxe villa avondfotografie"
            fill
            priority
            className="object-cover"
          />

          <div className="relative z-10 grid min-h-[520px] gap-8 px-7 py-7 lg:grid-cols-[1.1fr_340px] lg:px-10 lg:py-10">
            <div className="flex flex-col justify-center">
              <div>
                <div className="inline-flex items-center rounded-full border border-white/25 bg-black/15 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                  <Sparkles className="mr-2 h-4 w-4 text-[#f3df9b]" />
                  Multimedia • Presentatie & Promotie
                </div>

                <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_8px_22px_rgba(0,0,0,0.28)] md:text-6xl">
                  Promotie & zichtbaarheid
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-white/92 drop-shadow-[0_4px_14px_rgba(0,0,0,0.22)] md:text-lg">
                  Kies een pakket en verzend direct een zakelijke aanvraag.
                  Professionele fotografie, social campagnes en premium
                  zichtbaarheid voor exclusieve woningen.
                </p>
              </div>
            </div>

            <div className="grid auto-rows-fr gap-4 lg:justify-end">
              <div className="overflow-hidden rounded-[28px] border border-white/12 bg-black/10 backdrop-blur-sm">
                <div className="relative h-[180px]">
                  <Image
                    src="/High-end-real-estate-avondfotografie-IMG_0214-1280x720.jpg"
                    alt="Avondfotografie luxe woning"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      Avondfotografie
                    </div>
                    <div className="mt-3 text-xl font-semibold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                      High-end uitstraling
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/12 bg-black/10 backdrop-blur-sm">
                <div className="relative h-[180px]">
                  <Image
                    src="/High-end-real-estate-avondfotografie-IMG_5863-1280x720.jpg"
                    alt="Luxe interieur fotografie"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      Interieur
                    </div>
                    <div className="mt-3 text-xl font-semibold text-white drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                      Beleving & detail
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[28px] border border-white/12 bg-black/10 backdrop-blur-sm">
                <div className="relative h-[180px]">
                  <Image
                    src="/High-end-real-estate-avondfotografie-IMG_5652-1280x720.jpg"
                    alt="Instagram bereik luxe presentatie"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <div className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      Instagram bereik
                    </div>
                    <div className="mt-3 text-2xl font-semibold drop-shadow-[0_4px_14px_rgba(0,0,0,0.35)]">
                      18K+
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-3xl font-semibold text-[#102c54]">
            Kies een promotiepakket
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Compact overzicht met de prijs, inhoud en directe selectie van het
            juiste pakket.
          </p>
        </div>

        <div className="space-y-4">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const active = selectedServiceKey === service.key;

            return (
              <button
                key={service.key}
                type="button"
                onClick={() => applyService(service)}
                className={[
                  'group w-full rounded-[28px] border p-6 text-left transition-all duration-200',
                  active
                    ? `bg-gradient-to-br ${service.accentClass} text-white shadow-[0_22px_60px_rgba(16,44,84,0.18)]`
                    : 'border-slate-200 bg-white shadow-[0_10px_28px_rgba(16,44,84,0.07)] hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(16,44,84,0.12)]',
                ].join(' ')}
              >
                <div className="grid gap-6 lg:grid-cols-[320px_1fr_auto] lg:items-start">
                  <div>
                    <div
                      className={[
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        active
                          ? service.badgeClass
                          : 'border border-slate-200 bg-slate-50 text-slate-600',
                      ].join(' ')}
                    >
                      {service.priceLabel}
                    </div>

                    <h3
                      className={[
                        'mt-5 text-[2rem] font-semibold leading-tight',
                        active ? 'text-white' : 'text-[#102c54]',
                      ].join(' ')}
                    >
                      {service.title}
                    </h3>

                    <p
                      className={[
                        'mt-3 text-sm leading-7',
                        active ? 'text-white/88' : 'text-slate-600',
                      ].join(' ')}
                    >
                      {service.description}
                    </p>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2">
                    {service.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className={[
                          'flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm leading-6',
                          active
                            ? 'border-white/10 bg-white/8 text-white/92'
                            : 'border-slate-200 bg-slate-50 text-slate-700',
                        ].join(' ')}
                      >
                        <BadgeCheck
                          className={[
                            'mt-1 h-4 w-4 shrink-0',
                            active ? 'text-[#fff1b8]' : 'text-[#102c54]',
                          ].join(' ')}
                        />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-4 lg:items-end">
                    <div
                      className={[
                        'flex h-12 w-12 items-center justify-center rounded-2xl',
                        active
                          ? 'bg-white/12 text-white'
                          : 'bg-[#102c54]/5 text-[#102c54]',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div
                      className={[
                        'inline-flex items-center text-sm font-semibold',
                        active ? 'text-white' : 'text-[#102c54]',
                      ].join(' ')}
                    >
                      Kies dit pakket
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_14px_36px_rgba(16,44,84,0.07)] lg:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_380px]">
          <div>
            <div className="inline-flex rounded-full bg-[#102c54]/6 px-4 py-2 text-sm font-semibold text-[#102c54]">
              Zakelijke aanvraag
            </div>

            <h2 className="mt-4 text-3xl font-semibold text-[#102c54]">
              Vraag direct een promotiedienst aan
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Alleen de noodzakelijke bedrijfsgegevens worden gevraagd. De
              aanvraag wordt verzonden inclusief pakketkeuze, prijs en akkoord.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Naam makelaar"
                  placeholder="Bijv. Raisa Geschiere"
                  value={form.contactName}
                  onChange={(value) => updateField('contactName', value)}
                />
                <Field
                  label="Kantoornaam"
                  placeholder="Bijv. Vastgoed Nederland"
                  value={form.companyName}
                  onChange={(value) => updateField('companyName', value)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="E-mailadres"
                  type="email"
                  placeholder="naam@kantoor.nl"
                  value={form.email}
                  onChange={(value) => updateField('email', value)}
                />
                <Field
                  label="Telefoonnummer"
                  placeholder="Bijv. 06 12345678"
                  value={form.phone}
                  onChange={(value) => updateField('phone', value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102c54]">
                  Gekozen pakket
                </label>
                <select
                  value={selectedServiceKey}
                  onChange={(e) =>
                    applyService(
                      SERVICES.find((service) => service.key === e.target.value)!,
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-[#102c54] outline-none transition focus:border-[#102c54]"
                >
                  {SERVICES.map((service) => (
                    <option key={service.key} value={service.key}>
                      {service.title} — {service.priceLabel}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#102c54]">
                  Toelichting
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  placeholder="Beschrijf kort de gewenste inzet of planning."
                  rows={4}
                  className="w-full rounded-[22px] border border-slate-300 bg-white px-4 py-3 text-sm text-[#102c54] outline-none transition focus:border-[#102c54]"
                />
              </div>

              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <input
                    id="agreedToTerms"
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={(e) =>
                      updateField('agreedToTerms', e.target.checked)
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-[#102c54] focus:ring-[#102c54]"
                    required
                  />

                  <label
                    htmlFor="agreedToTerms"
                    className="text-sm leading-6 text-slate-700"
                  >
                    Ik verklaar bevoegd te zijn om namens het kantoor deze
                    aanvraag te doen en ga akkoord met de{' '}
                    <Link
                      href="/algemene-voorwaarden"
                      className="font-semibold text-[#102c54] underline underline-offset-2"
                    >
                      algemene voorwaarden
                    </Link>{' '}
                    en{' '}
                    <Link
                      href="/privacyverklaring"
                      className="font-semibold text-[#102c54] underline underline-offset-2"
                    >
                      privacyverklaring
                    </Link>
                    . Deze aanvraag geldt als zakelijke opdracht voor het
                    geselecteerde pakket en de bijbehorende kosten.
                  </label>
                </div>
              </div>

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  De aanvraag is succesvol verzonden naar
                  info@vastgoedexclusief.nl.
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-2xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c2342] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Bezig met verzenden...' : 'Aanvraag verzenden'}
                </button>

                <button
                  type="button"
                  onClick={() => applyService(selectedService)}
                  className="inline-flex items-center rounded-2xl border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-pink-50 to-orange-50 px-5 py-3 text-sm font-semibold text-[#9d174d] transition hover:from-fuchsia-100 hover:via-pink-100 hover:to-orange-100"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Pakket opnieuw invullen
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Geselecteerd pakket
              </div>

              <h3 className="mt-2 text-2xl font-semibold text-[#102c54]">
                {selectedService.title}
              </h3>

              <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-[#102c54]">
                {selectedService.priceLabel}
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {selectedService.description}
              </p>

              <ul className="mt-4 space-y-2.5">
                {selectedService.bullets.slice(0, 6).map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-2.5 text-sm leading-6 text-slate-700"
                  >
                    <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-[#102c54]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_10px_25px_rgba(16,44,84,0.05)]">
              <div className="flex items-center gap-2 text-[#102c54]">
                <CheckCircle2 className="h-5 w-5" />
                <h4 className="text-xl font-semibold">Per mail ontvangen</h4>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  'Naam van de makelaar',
                  'Kantoornaam',
                  'E-mailadres',
                  'Telefoonnummer',
                  'Gekozen pakket + prijs',
                  'Pakketinhoud',
                  'Akkoord op voorwaarden',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#102c54]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-[#102c54] outline-none transition focus:border-[#102c54]"
      />
    </div>
  );
}
