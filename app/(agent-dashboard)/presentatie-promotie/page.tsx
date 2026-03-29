'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Crown,
  Globe,
  Instagram,
  Newspaper,
  Send,
  Sparkles,
  TrendingUp,
  Video,
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
    accentClass:
      'from-[#0f172a] via-[#102c54] to-[#2563eb] border-white/10',
    badgeClass:
      'border border-white/15 bg-white/10 text-white',
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
      'Interesse in het High-end mediapakket voor deze woning. Graag planning, voorstel en verdere afstemming.',
  },
  {
    key: 'homepage-banner-socials',
    title: 'Homepage banner groot + socials',
    shortTitle: 'Banner + socials',
    priceLabel: '€249 p/m per woning',
    description:
      'Maximale zichtbaarheid op de homepagebanner inclusief logo, directe doorklik en extra social media exposure.',
    icon: TrendingUp,
    accentClass:
      'from-[#0f172a] via-[#1d4ed8] to-[#22c55e] border-cyan-300/20',
    badgeClass:
      'border border-white/15 bg-white/10 text-white',
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
    accentClass:
      'from-[#0f172a] via-[#7c3aed] to-[#ec4899] border-fuchsia-300/20',
    badgeClass:
      'border border-white/15 bg-white/10 text-white',
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
    accentClass:
      'from-fuchsia-700 via-pink-600 to-orange-500 border-pink-300/20',
    badgeClass:
      'border border-white/15 bg-white/10 text-white',
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
    accentClass:
      'from-[#052e16] via-[#166534] to-[#0ea5e9] border-emerald-300/20',
    badgeClass:
      'border border-white/15 bg-white/10 text-white',
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

  const selectedService =
    SERVICES.find((service) => service.key === selectedServiceKey) ?? SERVICES[0];

  const makelaarNaam = [sessionUser.firstName, sessionUser.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const kantoorNaam = sessionUser.companyName || sessionUser.officeName || '';

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    preferredService: selectedService.title,
    notes: selectedService.autoNotes,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      contactName: prev.contactName || makelaarNaam,
      companyName: prev.companyName || kantoorNaam,
      email: prev.email || sessionUser.email || '',
    }));
  }, [makelaarNaam, kantoorNaam, sessionUser.email]);

  const heroMetrics = useMemo(
    () => [
      {
        label: 'Instagram bereik',
        value: '18K+',
        sub: 'Volgers & zichtbaarheid',
        icon: Instagram,
        cardClass:
          'from-fuchsia-700 via-pink-600 to-orange-500 text-white shadow-[0_24px_70px_rgba(236,72,153,0.35)]',
        iconWrapClass: 'bg-white/20 text-white',
      },
      {
        label: 'Promotievormen',
        value: '5',
        sub: 'Direct aan te vragen',
        icon: Sparkles,
        cardClass:
          'from-[#0f172a] via-[#102c54] to-[#2563eb] text-white shadow-[0_24px_70px_rgba(37,99,235,0.28)]',
        iconWrapClass: 'bg-white/15 text-[#dbeafe]',
      },
      {
        label: 'Doel',
        value: 'Meer bereik',
        sub: 'Meer aandacht voor exclusieve woningen',
        icon: Globe,
        cardClass:
          'from-[#111827] via-[#7c3aed] to-[#ec4899] text-white shadow-[0_24px_70px_rgba(124,58,237,0.28)]',
        iconWrapClass: 'bg-white/15 text-[#f5d0fe]',
      },
    ],
    []
  );

  function updateField(name: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function applyService(service: PromotionService) {
    setSelectedServiceKey(service.key);
    setForm((prev) => ({
      ...prev,
      preferredService: service.title,
      notes:
        prev.notes.trim() === '' ||
        prev.notes === selectedService.autoNotes ||
        prev.preferredService === selectedService.title
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

    try {
      const response = await fetch('/api/promotion-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          propertyAddress: form.address,
          city: form.city,
          packageType: selectedService.title,
          packageKey: selectedService.key,
          packagePrice: selectedService.priceLabel,
          packageBullets: selectedService.bullets,
          notes: form.notes,
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
        address: '',
        city: '',
        notes: selectedService.autoNotes,
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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[34px] border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-700 via-pink-600 to-orange-500 text-white shadow-[0_32px_90px_rgba(236,72,153,0.28)]">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.3fr_430px] lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/95 backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4 text-[#fff1b8]" />
              Multimedia • Presentatie & Promotie
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              Promotie & zichtbaarheid
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">
              Kies een pakket en vergroot direct het bereik van uw woning. De
              geselecteerde dienst wordt direct meegestuurd naar
              info@vastgoedexclusief.nl, inclusief makelaarsgegevens,
              woninggegevens en pakketinhoud.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/95">
                Luxe presentatie
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/95">
                Instagram campagnes
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/95">
                Directe aanvraagflow
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {heroMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={`rounded-[28px] border border-white/10 bg-gradient-to-br p-6 backdrop-blur ${metric.cardClass}`}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.iconWrapClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-white/85">
                      {metric.label}
                    </span>
                  </div>

                  <div className="text-4xl font-semibold">{metric.value}</div>
                  <div className="mt-2 text-base text-white/85">{metric.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#102c54]">
            Kies een promotiepakket
          </h2>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Klik op een pakket om direct de juiste aanvraag voor te vullen. Zo
            zien jullie intern meteen welke makelaar welke dienst aanvraagt, met
            de juiste prijs en exacte pakketinhoud.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            const active = selectedServiceKey === service.key;

            return (
              <button
                key={service.key}
                type="button"
                onClick={() => applyService(service)}
                className={[
                  'group rounded-[30px] border p-6 text-left transition-all duration-200',
                  'shadow-[0_12px_35px_rgba(16,44,84,0.08)]',
                  active
                    ? `bg-gradient-to-br ${service.accentClass} text-white shadow-[0_24px_70px_rgba(16,44,84,0.22)]`
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(16,44,84,0.14)]',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
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
                </div>

                <h3
                  className={[
                    'mt-6 text-[2rem] font-semibold leading-tight',
                    active ? 'text-white' : 'text-[#102c54]',
                  ].join(' ')}
                >
                  {service.title}
                </h3>

                <p
                  className={[
                    'mt-4 text-base leading-7',
                    active ? 'text-white/88' : 'text-slate-600',
                  ].join(' ')}
                >
                  {service.description}
                </p>

                <ul className="mt-5 space-y-3">
                  {service.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className={[
                        'flex items-start gap-3 text-sm leading-6',
                        active ? 'text-white/92' : 'text-slate-700',
                      ].join(' ')}
                    >
                      <BadgeCheck
                        className={[
                          'mt-0.5 h-4 w-4 shrink-0',
                          active ? 'text-[#fff1b8]' : 'text-[#102c54]',
                        ].join(' ')}
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className={[
                    'mt-6 inline-flex items-center text-sm font-semibold',
                    active ? 'text-white' : 'text-[#102c54]',
                  ].join(' ')}
                >
                  Kies dit pakket
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(16,44,84,0.08)] lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_420px]">
          <div>
            <div className="inline-flex rounded-full bg-[#102c54]/6 px-4 py-2 text-sm font-semibold text-[#102c54]">
              Aanvraagformulier
            </div>

            <h2 className="mt-5 text-4xl font-semibold text-[#102c54]">
              Vraag direct een promotiedienst aan
            </h2>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              De aanvraag wordt verzonden naar info@vastgoedexclusief.nl met
              daarin de naam van de makelaar, het kantoor, e-mailadres,
              woningadres, gekozen pakket, prijs en pakketinhoud.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Naam makelaar"
                  placeholder="Bijv. Raisa Geschiere"
                  value={form.contactName}
                  onChange={(value) => updateField('contactName', value)}
                />
                <Field
                  label="Kantoornaam"
                  placeholder="Bijv. Vastgoed Exclusief Partner"
                  value={form.companyName}
                  onChange={(value) => updateField('companyName', value)}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
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

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Woningadres"
                  placeholder="Straat + huisnummer"
                  value={form.address}
                  onChange={(value) => updateField('address', value)}
                />
                <Field
                  label="Plaats"
                  placeholder="Bijv. Bloemendaal"
                  value={form.city}
                  onChange={(value) => updateField('city', value)}
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
                  className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 text-base text-[#102c54] outline-none transition focus:border-[#102c54]"
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
                  placeholder="Beschrijf kort de woning, timing en wensen voor deze promotiedienst."
                  rows={6}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-base text-[#102c54] outline-none transition focus:border-[#102c54]"
                />
              </div>

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  De aanvraag is succesvol verzonden naar info@vastgoedexclusief.nl.
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded-2xl bg-[#102c54] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#0c2342] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Bezig met verzenden...' : 'Aanvraag verzenden'}
                </button>

                <button
                  type="button"
                  onClick={() => applyService(selectedService)}
                  className="inline-flex items-center rounded-2xl border border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 via-pink-50 to-orange-50 px-6 py-4 text-base font-semibold text-[#9d174d] transition hover:from-fuchsia-100 hover:via-pink-100 hover:to-orange-100"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Pakket opnieuw invullen
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Geselecteerd pakket
              </div>

              <h3 className="mt-3 text-3xl font-semibold text-[#102c54]">
                {selectedService.title}
              </h3>

              <div className="mt-3 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-[#102c54]">
                {selectedService.priceLabel}
              </div>

              <p className="mt-4 text-base leading-7 text-slate-600">
                {selectedService.description}
              </p>

              <ul className="mt-5 space-y-3">
                {selectedService.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                  >
                    <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#102c54]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[30px] border border-fuchsia-200 bg-gradient-to-br from-fuchsia-700 via-pink-600 to-orange-500 p-6 text-white shadow-[0_24px_70px_rgba(236,72,153,0.24)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white/85">
                    Instagram & campagnes
                  </div>
                  <div className="text-xl font-semibold">18K+ bereik</div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-white/92">
                Ideaal voor extra zichtbaarheid, merkbeleving, gerichte exposure
                buiten het reguliere platform en krachtige promotie voor makelaars
                in het hogere segment.
              </p>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_25px_rgba(16,44,84,0.06)]">
              <h4 className="text-2xl font-semibold text-[#102c54]">
                Wat ontvangen jullie per mail?
              </h4>

              <div className="mt-5 space-y-4">
                {[
                  'Naam van de makelaar',
                  'Kantoornaam en e-mailadres',
                  'Telefoonnummer',
                  'Woningadres en plaats',
                  'Gekozen pakket + prijs',
                  'Volledige pakketinhoud',
                  'Extra toelichting van de makelaar',
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700"
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
        className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-5 text-base text-[#102c54] outline-none transition focus:border-[#102c54]"
      />
    </div>
  );
}
