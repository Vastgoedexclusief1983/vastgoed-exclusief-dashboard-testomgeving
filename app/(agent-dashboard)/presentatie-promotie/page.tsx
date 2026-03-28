'use client';

import { useState } from 'react';
import {
  Camera,
  Megaphone,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Users,
  Home,
  BadgeEuro,
  Send,
  Crown,
  Star,
} from 'lucide-react';

type ServiceCardProps = {
  title: string;
  description: string;
  points: string[];
  badge?: string;
  icon: React.ReactNode;
};

type InfoCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function ServiceCard({ title, description, points, badge, icon }: ServiceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-[#1f3b63] bg-gradient-to-br from-[#0f2342] via-[#112b52] to-[#183764] p-6 text-white shadow-[0_20px_60px_rgba(7,23,47,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(7,23,47,0.30)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_32%)]" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#f3e7b3]">
            {icon}
          </div>

          {badge ? (
            <span className="rounded-full border border-[#d4af37]/30 bg-[#d4af37]/12 px-3 py-1 text-xs font-semibold text-[#f3e7b3]">
              {badge}
            </span>
          ) : null}
        </div>

        <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/78">{description}</p>

        <ul className="mt-5 space-y-3">
          {points.map((point, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-2.5 text-sm text-white/86">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#f3e7b3]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InfoCard({ title, description, icon }: InfoCardProps) {
  return (
    <div className="rounded-[26px] border border-[#d7deea] bg-white p-5 shadow-[0_10px_30px_rgba(16,44,84,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(16,44,84,0.12)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3fb] text-[#102c54]">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-[#102c54]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function Input({
  label,
  placeholder,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  placeholder: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#102c54]">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-[#d7deea] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/10"
      />
    </div>
  );
}

export default function PresentatiePromotiePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const form = new FormData(e.currentTarget);

    const data = {
      propertyAddress: form.get('propertyAddress'),
      city: form.get('city'),
      packageType: form.get('packageType'),
      notes: form.get('notes'),
    };

    try {
      const res = await fetch('/api/promotion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        setError(json?.error || 'Er ging iets mis bij het verzenden van de aanvraag.');
        return;
      }

      setSuccess(true);
      e.currentTarget.reset();
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <section className="relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#081a33] via-[#0d2648] to-[#133763] text-white shadow-[0_25px_80px_rgba(6,21,44,0.28)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_25%)]" />

        <div className="relative grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-[#f3e7b3]">
              Multimedia • Presentatie & Promotie
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Vergroot de zichtbaarheid van exclusieve woningen
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/78 md:text-base">
              Zet een woning extra in de markt via professionele woningfotografie, social media promotie,
              homepage-uitlichting en premium presentatie via Vastgoed Exclusief.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
                Gericht op exclusief vastgoed
              </div>
              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/12 px-4 py-3 text-sm font-medium text-[#f3e7b3]">
                Premium uitstraling
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/90">
                16.000+ volgers op Instagram
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Users className="h-4 w-4 text-[#f3e7b3]" />
                Social bereik
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">16K+</div>
              <div className="mt-1 text-sm text-white/75">Volgers op Instagram</div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Crown className="h-4 w-4 text-[#f3e7b3]" />
                Positionering
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">Premium</div>
              <div className="mt-1 text-sm text-white/75">Voor het hogere segment</div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm text-white/65">
                <Star className="h-4 w-4 text-[#f3e7b3]" />
                Doel
              </div>
              <div className="mt-2 text-3xl font-semibold text-white">Meer</div>
              <div className="mt-1 text-sm text-white/75">Bereik, uitstraling en zichtbaarheid</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5">
          <h2 className="text-3xl font-semibold tracking-tight text-[#102c54]">Diensten</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kies een dienst die aansluit bij de woning, doelgroep en gewenste zichtbaarheid.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          <ServiceCard
            title="Woningfotografie pakket"
            description="Professionele fotografie voor een hoogwaardige eerste indruk en een sterkere woningpresentatie."
            badge="Op aanvraag"
            icon={<Camera className="h-5 w-5" />}
            points={[
              'Geschikt voor exclusieve woningen',
              'Sterkere presentatie op platform en socials',
              'Meer beleving en hogere attentiewaarde',
            ]}
          />

          <ServiceCard
            title="Instagram promotie"
            description="Laat een woning extra zichtbaar maken via krachtige social media content en presentatie."
            badge="Populair"
            icon={<Megaphone className="h-5 w-5" />}
            points={[
              'Extra bereik buiten reguliere woningzoekers',
              'Sterk voor merkbeleving en exposure',
              'Inzetbaar via jullie kanaal met 16K+ volgers',
            ]}
          />

          <ServiceCard
            title="Homepage uitlichting"
            description="Geef een woning prominente zichtbaarheid op de homepage van Vastgoed Exclusief."
            badge="Premium"
            icon={<Home className="h-5 w-5" />}
            points={[
              'Prominente plaatsing op het platform',
              'Meer aandacht voor geselecteerde woningen',
              'Versterkt positionering en exclusiviteit',
            ]}
          />

          <ServiceCard
            title="Premium presentatie"
            description="Een krachtigere presentatievorm voor woningen die extra uitstraling en onderscheid nodig hebben."
            badge="Exclusief"
            icon={<Sparkles className="h-5 w-5" />}
            points={[
              'Luxe presentatie en extra zichtbaarheid',
              'Sterkere commerciële positionering',
              'Ideaal in een competitieve markt',
            ]}
          />
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5">
          <h2 className="text-3xl font-semibold tracking-tight text-[#102c54]">Waarom extra promotie inzetten?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Extra zichtbaarheid kan bijdragen aan een sterkere presentatie, meer bereik en betere positionering van de woning.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            title="Waarom op de homepage staan?"
            description="Een prominente homepage-positie geeft een woning direct meer attentiewaarde en helpt om sneller op te vallen binnen het exclusieve segment."
            icon={<TrendingUp className="h-5 w-5" />}
          />

          <InfoCard
            title="Waarom op social media?"
            description="Social media vergroot het bereik buiten het reguliere woningplatform en versterkt de beleving rond een woningpresentatie."
            icon={<Users className="h-5 w-5" />}
          />

          <InfoCard
            title="Waarom professionele content?"
            description="Sterke fotografie en presentatie zorgen voor een betere eerste indruk, hogere waargenomen kwaliteit en meer betrokkenheid."
            icon={<ImageIcon className="h-5 w-5" />}
          />

          <InfoCard
            title="Waarom via Vastgoed Exclusief?"
            description="Vastgoed Exclusief richt zich op het hogere segment en biedt een omgeving die past bij de uitstraling van exclusieve woningen."
            icon={<Sparkles className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="mt-12 rounded-[34px] border border-[#d7deea] bg-gradient-to-br from-white via-[#fbfcff] to-[#f3f7fd] p-6 shadow-[0_18px_50px_rgba(16,44,84,0.10)]">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center rounded-full bg-[#eef3fb] px-3 py-1 text-xs font-semibold text-[#102c54]">
              Aanvraagformulier
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#102c54]">
              Vraag een promotiedienst aan
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Dien hieronder eenvoudig een aanvraag in voor woningfotografie, social media promotie,
              homepage-uitlichting of premium presentatie.
            </p>

            {success && (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Aanvraag succesvol verzonden.
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Naam makelaar" placeholder="Bijv. Raisa Geschiere" name="agentName" />
                <Input label="Kantoornaam" placeholder="Bijv. Vastgoed Exclusief Partner" name="officeName" />
                <Input label="E-mailadres" placeholder="naam@kantoor.nl" name="email" type="email" />
                <Input label="Telefoonnummer" placeholder="Bijv. 06 12345678" name="phone" />
                <Input label="Woningadres" placeholder="Straat + huisnummer" name="propertyAddress" required />
                <Input label="Plaats" placeholder="Bijv. Bloemendaal" name="city" required />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-[#102c54]">Gewenste dienst</label>
                <select
                  name="packageType"
                  required
                  className="w-full rounded-2xl border border-[#d7deea] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/10"
                >
                  <option value="">Maak een keuze</option>
                  <option value="fotografie">Woningfotografie pakket</option>
                  <option value="instagram">Instagram promotie</option>
                  <option value="homepage">Homepage uitlichting</option>
                  <option value="compleet">Premium presentatie / compleet pakket</option>
                </select>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-[#102c54]">Toelichting</label>
                <textarea
                  name="notes"
                  rows={5}
                  placeholder="Beschrijf kort de woning, gewenste promotie en eventuele wensen of timing."
                  className="w-full rounded-2xl border border-[#d7deea] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#102c54] focus:ring-2 focus:ring-[#102c54]/10"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#102c54] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(16,44,84,0.20)] transition hover:bg-[#0c2342] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Aanvraag verzenden...' : 'Aanvraag verzenden'}
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/12 px-5 py-3 text-sm font-semibold text-[#8a6a08] transition hover:bg-[#d4af37]/20"
                >
                  <BadgeEuro className="mr-2 h-4 w-4" />
                  Prijsinformatie opvragen
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-[28px] border border-[#dbe4f2] bg-white/90 p-5 shadow-[0_12px_35px_rgba(16,44,84,0.08)]">
            <h3 className="text-xl font-semibold text-[#102c54]">Waarom deze pagina waardevol is</h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-[#e3eaf5] bg-[#f8fbff] p-4">
                <div className="text-sm font-semibold text-[#102c54]">Homepage-uitlichting</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Een plaatsing op de homepage geeft een woning meer zichtbaarheid, versterkt exclusiviteit en trekt sneller de aandacht van bezoekers op het platform.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e3eaf5] bg-[#f8fbff] p-4">
                <div className="text-sm font-semibold text-[#102c54]">Social media promotie</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Met een bereik van 16.000+ volgers op Instagram kan social media bijdragen aan extra exposure, merkbeleving en aanvullend bereik buiten traditionele woningzoekers.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e3eaf5] bg-[#f8fbff] p-4">
                <div className="text-sm font-semibold text-[#102c54]">Professionele presentatie</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Sterke beelden en een premium presentatie verhogen de kwaliteit van de eerste indruk en ondersteunen de positionering van exclusieve woningen.
                </p>
              </div>

              <div className="rounded-2xl border border-[#e3eaf5] bg-[#f8fbff] p-4">
                <div className="text-sm font-semibold text-[#102c54]">Commerciële meerwaarde</div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Deze module maakt het voor makelaars eenvoudig om aanvullende promotiediensten direct binnen het dashboard aan te vragen, zonder externe tools of losse formulieren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
