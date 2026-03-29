'use client';

import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Crown,
  Instagram,
  Newspaper,
  Send,
  Sparkles,
  TrendingUp,
  Video,
} from 'lucide-react';

type Service = {
  key: string;
  title: string;
  price: string;
  gradient: string;
  icon: any;
  description: string;
  bullets: string[];
};

const SERVICES: Service[] = [
  {
    key: 'high-end',
    title: 'High-end mediapakket',
    price: '€1.995 per woning',
    gradient: 'from-[#0c2342] via-[#102c54] to-[#1a4c87]',
    icon: Camera,
    description:
      'Complete high-end presentatie voor exclusieve woningen.',
    bullets: [
      'High-end fotografie + bewerking',
      'Drone fotografie & video',
      'Woningvideo (max 60 sec)',
      'Social media teaser',
      '1 maand homepage uitgelicht',
    ],
  },
  {
    key: 'banner',
    title: 'Homepage banner + socials',
    price: '€249 p/m per woning',
    gradient: 'from-[#102c54] to-[#1e4d88]',
    icon: TrendingUp,
    description:
      'Maximale zichtbaarheid op homepage + social media.',
    bullets: [
      'Homepage banner met logo',
      'Directe doorklik naar website',
      'Social media exposure',
    ],
  },
  {
    key: 'homepage',
    title: 'Uitgelichte woning homepage',
    price: '€99 p/m per woning',
    gradient: 'from-[#0d1f3a] to-[#183d73]',
    icon: Crown,
    description:
      'Prominente plaatsing op de homepage.',
    bullets: [
      'Meer zichtbaarheid',
      'Sneller opvallen',
      'Meer leads',
    ],
  },
  {
    key: 'social',
    title: 'Social media campagne',
    price: '€159 per 14 dagen',
    gradient:
      'from-fuchsia-700 via-pink-600 to-orange-500',
    icon: Instagram,
    description:
      'Gerichte Instagram campagne voor maximale zichtbaarheid.',
    bullets: [
      'Volledig advertentiebudget ingezet',
      'Gerichte doelgroep targeting',
      'Meer bereik buiten platform',
    ],
  },
  {
    key: 'magazine',
    title: 'Online magazine vermelding',
    price: '€249 per plaatsing',
    gradient: 'from-[#102c54] to-[#1e4d88]',
    icon: Newspaper,
    description:
      'Exclusieve vermelding in online magazine.',
    bullets: [
      'Bereik high-end doelgroep',
      'Extra branding',
      'Langere zichtbaarheid',
    ],
  },
];

export default function Page() {
  const [selected, setSelected] = useState(SERVICES[0]);

  return (
    <div className="space-y-10">

      {/* HERO */}
      <section className="rounded-[32px] bg-gradient-to-br from-[#0c2342] via-[#102c54] to-[#1a4c87] text-white p-10">
        <h1 className="text-5xl font-semibold">
          Promotie & zichtbaarheid
        </h1>
        <p className="mt-4 text-white/80">
          Kies een pakket en vergroot direct het bereik van uw woning.
        </p>
      </section>

      {/* SERVICES */}
      <section className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">

        {SERVICES.map((service) => {
          const Icon = service.icon;
          const active = selected.key === service.key;

          return (
            <button
              key={service.key}
              onClick={() => setSelected(service)}
              className={`rounded-[28px] p-6 text-left transition ${
                active
                  ? `bg-gradient-to-br ${service.gradient} text-white shadow-xl`
                  : 'bg-white border hover:shadow-lg'
              }`}
            >
              {/* ICON */}
              <div className="flex justify-between mb-4">
                <div className="text-sm opacity-80">
                  {service.price}
                </div>

                <div className="bg-white/20 p-2 rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {/* TITLE */}
              <h3 className="text-2xl font-semibold">
                {service.title}
              </h3>

              {/* DESC */}
              <p className="mt-2 text-sm opacity-80">
                {service.description}
              </p>

              {/* BULLETS */}
              <ul className="mt-4 space-y-2">
                {service.bullets.map((b) => (
                  <li key={b} className="flex gap-2 text-sm">
                    <BadgeCheck className="h-4 w-4 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-6 flex items-center font-semibold text-sm">
                Kies dit pakket
                <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </button>
          );
        })}
      </section>

      {/* FORM */}
      <section className="bg-white rounded-[30px] p-8 shadow border">
        <h2 className="text-3xl font-semibold text-[#102c54]">
          Aanvraag
        </h2>

        <div className="mt-4 p-4 rounded-xl bg-[#f5f7fa]">
          <div className="text-sm text-slate-500">
            Geselecteerd pakket
          </div>
          <div className="text-xl font-semibold text-[#102c54]">
            {selected.title}
          </div>
          <div className="text-sm text-slate-600">
            {selected.price}
          </div>
        </div>

        <button className="mt-6 bg-[#102c54] text-white px-6 py-4 rounded-xl">
          <Send className="inline mr-2 h-4 w-4" />
          Aanvraag verzenden
        </button>
      </section>
    </div>
  );
}
