'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Crown,
  Instagram,
  Send,
  Sparkles,
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
      'Interesse in professionele woningfotografie.',
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
    subtitle: 'Extra bereik via Instagram en campagnes',
    description:
      'Vergroot bereik en zichtbaarheid buiten het platform via social media.',
    priceLabel: 'Instagram + campagne',
    highlight: 'Bereik via 18K+ volgers',
    bullets: [
      'Meer exposure buiten platform',
      'Sterke merkbeleving',
      'Perfect voor lancering',
    ],
    autoNotes:
      'Interesse in social media campagne.',
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
      'Prominente plaatsing op de homepage.',
    priceLabel: 'Prominente plaatsing',
    highlight: 'Meer zichtbaarheid',
    bullets: [
      'Direct zichtbaar',
      'Sterkere positionering',
      'Meer aandacht',
    ],
    autoNotes:
      'Interesse in homepage-uitlichting.',
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
    subtitle: 'Luxe presentatie',
    description:
      'Voor woningen met extra uitstraling.',
    priceLabel: 'High-end presentatie',
    highlight: 'Meer allure',
    bullets: [
      'Luxe uitstraling',
      'Sterkere positionering',
      'Meer onderscheid',
    ],
    autoNotes:
      'Interesse in premium presentatie.',
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
    notes: '',
  });

  const selectedService =
    SERVICES.find((s) => s.key === selectedServiceKey) ?? SERVICES[0];

  // 🔥 PREMIUM METRICS (aangepast)
  const serviceMetrics = useMemo(
    () => [
      {
        label: 'Instagram bereik',
        value: '18K+',
        sub: 'Volgers & zichtbaarheid',
        icon: Instagram,
        tone:
          'from-fuchsia-700 via-pink-600 to-orange-500 text-white shadow-[0_20px_60px_rgba(255,0,120,0.35)]',
      },
      {
        label: 'Positionering',
        value: 'Premium',
        sub: 'Hoger segment',
        icon: Crown,
        tone:
          'from-[#102c54] to-[#1e4d88] text-white',
      },
      {
        label: 'Doel',
        value: 'Meer bereik',
        sub: 'Meer aandacht',
        icon: Target,
        tone:
          'from-blue-600 to-cyan-500 text-white',
      },
    ],
    []
  );

  function applyService(service: PromotionService) {
    setSelectedServiceKey(service.key);
    setForm((prev) => ({
      ...prev,
      preferredService: service.title,
      notes: service.autoNotes,
    }));
  }

  return (
    <div className="space-y-8">

      {/* HERO */}
      <section className="rounded-[32px] bg-gradient-to-br from-[#0c2342] via-[#102c54] to-[#1a4c87] text-white p-10">
        <div className="grid lg:grid-cols-[1.3fr_420px] gap-8">

          <div>
            <h1 className="text-5xl font-semibold leading-tight">
              Vergroot de zichtbaarheid van exclusieve woningen
            </h1>

            <p className="mt-4 text-white/80">
              Kies een promotievorm en bereik de juiste doelgroep sneller.
            </p>
          </div>

          {/* 🔥 METRICS */}
          <div className="space-y-4">
            {serviceMetrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.label}
                  className={`rounded-[28px] p-6 bg-gradient-to-br ${metric.tone} border border-white/10`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="rounded-xl bg-white/20 p-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm opacity-90">
                      {metric.label}
                    </span>
                  </div>

                  <div className="text-4xl font-bold">
                    {metric.value}
                  </div>

                  <div className="text-sm opacity-80 mt-1">
                    {metric.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const active = selectedServiceKey === service.key;

          return (
            <button
              key={service.key}
              onClick={() => applyService(service)}
              className={[
                'rounded-[30px] p-6 transition-all',
                active
                  ? `bg-gradient-to-br ${service.accentClass} text-white shadow-xl`
                  : 'bg-white border border-slate-200 hover:shadow-lg',
              ].join(' ')}
            >
              <div className="flex justify-between items-start">

                <div>
                  <h3 className="text-xl font-semibold">
                    {service.title}
                  </h3>
                  <p className="text-sm opacity-80 mt-2">
                    {service.subtitle}
                  </p>
                </div>

                {/* 🔥 ICON FIX */}
                <div className="rounded-xl bg-white/10 p-3 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>

              </div>

              <div className="mt-6 flex items-center text-sm font-semibold">
                Kies dienst
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>
          );
        })}
      </section>

      {/* ❌ WAAROM BLOKKEN VOLLEDIG VERWIJDERD */}

      {/* FORM */}
      <section className="rounded-[30px] bg-white p-8 border shadow">
        <h2 className="text-3xl font-semibold text-[#102c54]">
          Aanvraag
        </h2>

        <button className="mt-6 bg-[#102c54] text-white px-6 py-4 rounded-xl">
          <Send className="inline mr-2 h-4 w-4" />
          Aanvraag verzenden
        </button>
      </section>
    </div>
  );
}
