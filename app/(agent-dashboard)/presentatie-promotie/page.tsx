'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Crown,
  Image as ImageIcon,
  Instagram,
  Megaphone,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';

type ServiceKey =
  | 'fotografie'
  | 'social-campagne'
  | 'homepage-uitlichting'
  | 'premium-presentatie';

type PromotionService = {
  key: ServiceKey;
  title: string;
  shortTitle: string;
  accentClass: string;
  badgeClass: string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle: string;
  description: string;
  priceLabel: string;
  highlight: string;
  bullets: string[];
  autoNotes: string;
};

const SERVICES: PromotionService[] = [
  {
    key: 'fotografie',
    title: 'Professionele woningfotografie',
    shortTitle: 'Fotografie',
    accentClass:
      'from-slate-900 via-[#123766] to-[#214f8d] border-white/10',
    badgeClass:
      'bg-white/10 text-white border border-white/10',
    icon: Camera,
    subtitle: 'Sterke eerste indruk voor exclusieve woningen',
    description:
      'Professionele fotografie verhoogt de kwaliteit van de presentatie en zorgt voor meer vertrouwen, klikgedrag en attentiewaarde.',
    priceLabel: 'Premium basispakket',
    highlight: 'Geschikt voor hoogwaardige woningpresentatie',
    bullets: [
      'Sterkere eerste indruk op het platform',
      'Meer vertrouwen en hogere kwaliteitsbeleving',
      'Ideaal als basis voor verdere promotiecampagnes',
    ],
    autoNotes:
      'Interesse in professionele woningfotografie voor een exclusieve presentatie. Graag voorstel voor planning, beeldstijl en oplevering.',
  },
  {
    key: 'social-campagne',
    title: 'Social media campagne',
    shortTitle: 'Social campagne',
    accentClass:
      'from-fuchsia-700 via-pink-600 to-orange-500 border-pink-300/20',
    badgeClass:
      'bg-gradient-to-r from-pink-500/20 to-orange-400/20 text-white border border-white/10',
    icon: Instagram,
    subtitle: 'Extra bereik via Instagram en social campagnes',
    description:
      'Zet een woning extra krachtig in de markt via social media promotie, visuele advertenties en extra exposure buiten reguliere woningzoekers.',
    priceLabel: 'Instagram + campagne',
    highlight: 'Bereik via 18K+ volgers en extra zichtbaarheid',
    bullets: [
      'Meer exposure buiten het reguliere platformverkeer',
      'Sterk voor merkbeleving, aandacht en exclusiviteit',
      'Geschikt voor lancering, nieuwe listing of prijsmoment',
    ],
    autoNotes:
      'Interesse in een social media campagne voor deze woning, inclusief Instagram-zichtbaarheid en extra bereik richting relevante doelgroep.',
  },
  {
    key: 'homepage-uitlichting',
    title: 'Homepage-uitlichting',
    shortTitle: 'Homepage',
    accentClass:
      'from-[#0c2342] via-[#102c54] to-[#1e4d88] border-[#d4af37]/20',
    badgeClass:
      'bg-[#d4af37]/15 text-[#f3df9b] border border-[#d4af37]/20',
    icon: TrendingUp,
    subtitle: 'Meer zichtbaarheid op het platform',
    description:
      'Geef een woning een prominente plaatsing op de homepage van Vastgoed Exclusief en vergroot de kans op extra aandacht van bezoekers.',
    priceLabel: 'Prominente plaatsing',
    highlight: 'Meer zichtbaarheid op het juiste moment',
    bullets: [
      'Direct zichtbaarder voor bezoekers op het platform',
      'Versterkt positionering en exclusieve uitstraling',
      'Zeer geschikt voor nieuwe of onderscheidende woningen',
    ],
    autoNotes:
      'Interesse in homepage-uitlichting om deze woning prominenter zichtbaar te maken op Vastgoed Exclusief.',
  },
  {
    key: 'premium-presentatie',
    title: 'Premium presentatie',
    shortTitle: 'Premium',
    accentClass:
      'from-[#0d1f3a] via-[#183d73] to-[#2d5fa6] border-[#c7a74a]/30',
    badgeClass:
      'bg-[#c7a74a]/15 text-[#f2e0a3] border border-[#c7a74a]/30',
    icon: Crown,
    subtitle: 'Luxe presentatie voor woningen met extra uitstraling',
    description:
      'Een uitgebreidere en luxere presentatievorm voor woningen die meer onderscheid, commerciële kracht en exclusieve positionering verdienen.',
    priceLabel: 'High-end presentatie',
    highlight: 'Meer allure, meer aandacht, sterker onderscheid',
    bullets: [
      'Luxe uitstraling passend bij het hogere segment',
      'Sterkere commerciële positionering',
      'Ideaal voor woningen met unieke architectuur of ligging',
    ],
    autoNotes:
      'Interesse in een premium presentatie met extra luxe uitstraling, sterkere positionering en aanvullende zichtbaarheid.',
  },
];

export default function PresentatiePromotiePage() {
  const [selectedServiceKey, setSelectedServiceKey] =
    useState<ServiceKey>('social-campagne');

  const [form, setForm] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    preferredService: 'Social media campagne',
    notes:
      'Interesse in een social media campagne voor deze woning, inclusief Instagram-zichtbaarheid en extra bereik richting relevante doelgroep.',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedService =
    SERVICES.find((service) => service.key === selectedServiceKey) ?? SERVICES[0];

  const serviceMetrics = useMemo(
    () => [
      {
        label: 'Instagram bereik',
        value: '18K+',
        sub: 'Volgers & zichtbaarheid',
        icon: Instagram,
        tone: 'from-pink-500/20 to-orange-400/20 text-white',
      },
      {
        label: 'Positionering',
        value: 'Premium',
        sub: 'Hogere segment woningen',
        icon: Crown,
        tone: 'from-[#d4af37]/15 to-[#d4af37]/5 text-white',
      },
      {
        label: 'Doel',
        value: 'Meer bereik',
        sub: 'Meer aandacht en uitstraling',
        icon: Target,
        tone: 'from-blue-500/20 to-cyan-400/20 text-white',
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
      notes: service.autoNotes,
    }));
    setSuccess(false);
    setError('');
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

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
          packageType: form.preferredService,
          notes: form.notes,
        }),
      });

      if (!response.ok) {
        const result = await response
          .json()
          .catch(() => ({ error: 'Er ging iets mis bij het verzenden.' }));
        throw new Error(result.error || 'Er ging iets mis bij het verzenden.');
      }

      setSuccess(true);
      setForm((prev) => ({
        ...prev,
        notes: selectedService.autoNotes,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-[32px] border border-[#163a69] bg-gradient-to-br from-[#0c2342] via-[#102c54] to-[#1a4c87] text-white shadow-[0_30px_80px_rgba(16,44,84,0.22)]">
        <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.3fr_420px] lg:px-10 lg:py-10">
          <div className="relative">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="mr-2 h-4 w-4 text-[#e7cc7a]" />
              Multimedia • Presentatie & Promotie
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
              Vergroot de zichtbaarheid van exclusieve woningen
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">
              Kies een promotievorm die past bij de woning, doelgroep en gewenste
              uitstraling. Vanuit deze pagina kan de makelaar direct een
              promotiedienst aanvragen met een luxere, slimmere en meer
              geautomatiseerde flow.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90">
                Exclusief vastgoed
              </span>
              <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-sm text-[#f3df9b]">
                Instagram 18K+
              </span>
              <span className="rounded-full border border-fuchsia-300/20 bg-fuchsia-500/10 px-4 py-2 text-sm text-white">
                Social media campagnes
              </span>
            </div>
          </div>

          <div className="grid gap-4">
            {serviceMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${metric.tone} p-6 backdrop-blur`}
                >
                  <div className="mb-3 flex items-center gap-3 text-white/80">
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="text-4xl font-semibold">{metric.value}</div>
                  <div className="mt-2 text-base text-white/80">{metric.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diensten */}
      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-semibold text-[#102c54]">Promotiediensten</h2>
          <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
            Klik op een dienst om direct de aanvraag slim voor te vullen. Zo hoeft
            de makelaar minder handmatig in te voeren en wordt de juiste promotievorm
            sneller gekozen.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
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
                    ? `bg-gradient-to-br ${service.accentClass} text-white shadow-[0_22px_60px_rgba(16,44,84,0.20)]`
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(16,44,84,0.12)]',
                ].join(' ')}
              >
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

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className={[
                        'text-2xl font-semibold leading-tight',
                        active ? 'text-white' : 'text-[#102c54]',
                      ].join(' ')}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={[
                        'mt-3 text-base leading-7',
                        active ? 'text-white/85' : 'text-slate-600',
                      ].join(' ')}
                    >
                      {service.subtitle}
                    </p>
                  </div>

                  <div
                    className={[
                      'rounded-2xl p-3',
                      active
                        ? 'bg-white/10 text-white'
                        : 'bg-[#102c54]/5 text-[#102c54]',
                    ].join(' ')}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <p
                  className={[
                    'mt-5 text-sm leading-7',
                    active ? 'text-white/80' : 'text-slate-600',
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
                        active ? 'text-white/90' : 'text-slate-700',
                      ].join(' ')}
                    >
                      <BadgeCheck
                        className={[
                          'mt-0.5 h-4 w-4 shrink-0',
                          active ? 'text-[#f3df9b]' : 'text-[#102c54]',
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
                  Kies deze dienst
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Waarde */}
      <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        {[
          {
            title: 'Waarom op de homepage staan?',
            text: 'Een prominente homepage-positie geeft een woning direct meer attentiewaarde en helpt om sneller op te vallen binnen het exclusieve segment.',
            icon: TrendingUp,
          },
          {
            title: 'Waarom op social media?',
            text: 'Social media vergroot het bereik buiten het reguliere woningplatform en versterkt de beleving rond een woningpresentatie.',
            icon: Instagram,
          },
          {
            title: 'Waarom professionele content?',
            text: 'Sterke fotografie en presentatie zorgen voor een betere eerste indruk, hogere waargenomen kwaliteit en meer betrokkenheid.',
            icon: ImageIcon,
          },
          {
            title: 'Waarom via Vastgoed Exclusief?',
            text: 'Vastgoed Exclusief richt zich op het hogere segment en biedt een omgeving die past bij de uitstraling van exclusieve woningen.',
            icon: Star,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(16,44,84,0.07)]"
            >
              <div className="mb-5 inline-flex rounded-2xl bg-[#102c54]/5 p-4 text-[#102c54]">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-semibold text-[#102c54]">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-slate-600">{item.text}</p>
            </div>
          );
        })}
      </section>

      {/* Form + slimme info */}
      <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-[0_14px_40px_rgba(16,44,84,0.08)] lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_420px]">
          <div>
            <div className="inline-flex rounded-full bg-[#102c54]/6 px-4 py-2 text-sm font-semibold text-[#102c54]">
              Aanvraagformulier
            </div>

            <h2 className="mt-5 text-4xl font-semibold text-[#102c54]">
              Vraag een promotiedienst aan
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
              Vul hieronder de gegevens in. De geselecteerde dienst zet automatisch
              de juiste richting en toelichting klaar. Zo werk je sneller en
              consistenter.
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
                  Gewenste dienst
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
                      {service.title}
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
                  placeholder="Beschrijf kort de woning, gewenste promotie en eventuele wensen of timing."
                  rows={6}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-4 text-base text-[#102c54] outline-none transition focus:border-[#102c54]"
                />
              </div>

              {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  De aanvraag is succesvol verzonden.
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
                  className="inline-flex items-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-6 py-4 text-base font-semibold text-[#8e6a00] transition hover:bg-[#d4af37]/20"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Dienstdetails opnieuw invullen
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Geselecteerde dienst
              </div>
              <h3 className="mt-3 text-3xl font-semibold text-[#102c54]">
                {selectedService.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-slate-600">
                {selectedService.description}
              </p>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_10px_25px_rgba(16,44,84,0.06)]">
              <h4 className="text-2xl font-semibold text-[#102c54]">
                Waarom deze pagina waardevoller is
              </h4>

              <div className="mt-5 space-y-4">
                {[
                  {
                    title: 'Minder dubbele informatie',
                    text: 'De uitleg is samengebracht in duidelijke dienstkeuzes en voordeelblokken, zodat de pagina rustiger en sterker leest.',
                  },
                  {
                    title: 'Meer automatisering',
                    text: 'Bij het kiezen van een dienst wordt de aanvraag automatisch voorgevuld met de juiste dienst en bijpassende toelichting.',
                  },
                  {
                    title: 'Social media campagne toegevoegd',
                    text: 'Naast fotografie, homepage-uitlichting en premium presentatie is nu ook een campagne-optie toegevoegd voor makelaars.',
                  },
                  {
                    title: 'Sterkere premium uitstraling',
                    text: 'Door kleuraccenten, duidelijke hiërarchie en compactere blokken oogt de pagina luxer en professioneler.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <div className="text-lg font-semibold text-[#102c54]">
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-pink-200 bg-gradient-to-br from-pink-50 via-white to-orange-50 p-6">
              <div className="flex items-center gap-3 text-[#102c54]">
                <Instagram className="h-6 w-6 text-pink-600" />
                <div className="text-lg font-semibold">Instagram & campagnes</div>
              </div>
              <div className="mt-4 text-4xl font-semibold text-[#102c54]">
                18K+
              </div>
              <p className="mt-2 text-base leading-7 text-slate-600">
                In te zetten voor extra zichtbaarheid, merkbeleving, bereik buiten
                reguliere woningzoekers en campagnegerichte promotie voor makelaars.
              </p>
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
